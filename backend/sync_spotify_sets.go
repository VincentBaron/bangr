package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/VincentBaron/bangr/backend/internal/config"
	"github.com/VincentBaron/bangr/backend/internal/models"
	"github.com/VincentBaron/bangr/backend/internal/repositories"
	"github.com/google/uuid"
	"github.com/robfig/cron/v3"
	"github.com/zmb3/spotify/v2"
	spotifyauth "github.com/zmb3/spotify/v2/auth"
	"golang.org/x/oauth2"
)

type cronHandler struct {
	userRepository  *repositories.Repository[models.User]
	setRepository   *repositories.Repository[models.Set]
	trackRepository *repositories.Repository[models.Track]
}

func NewCronHandler(userRepo *repositories.Repository[models.User], setRepo *repositories.Repository[models.Set], trackRepo *repositories.Repository[models.Track]) *cronHandler {
	return &cronHandler{
		userRepository:  userRepo,
		setRepository:   setRepo,
		trackRepository: trackRepo,
	}
}

func init() {
	config.LoadEnvVariables()
	config.ConnectToDb()
	config.SyncDatabase()
}

func main() {
	manualTrigger := flag.Bool("manual", false, "Manually trigger the cron job")
	autoSchedule := flag.String("auto", "", "Automatically trigger the cron job with the given schedule")
	flag.Parse()

	// Initialize repositories
	userRepo := repositories.NewRepository[models.User](config.DB)
	setRepo := repositories.NewRepository[models.Set](config.DB)
	trackRepo := repositories.NewRepository[models.Track](config.DB)

	// Initialize cron handler
	cronHandler := NewCronHandler(userRepo, setRepo, trackRepo)

	if *manualTrigger {
		err := cronHandler.syncSpotifySets()
		if err != nil {
			log.Printf("Error syncing Spotify sets: %v", err)
		}
		return
	}

	fmt.Println(*autoSchedule)

	if *autoSchedule != "" {
		c := cron.New(cron.WithLocation(time.FixedZone("UTC+1", 1*60*60)))
		c.AddFunc(*autoSchedule, func() {
			fmt.Println("Running cron job")
			err := cronHandler.syncSpotifySets()
			if err != nil {
				log.Printf("Error syncing Spotify sets: %v", err)
			}
		})
		c.Start()

		// Keep the program running
		select {}
	} else {
		log.Println("No schedule provided. Exiting.")
	}
}

func (h *cronHandler) syncSpotifySets() error {
	users, err := h.userRepository.FindAllByFilter(map[string]interface{}{}, "SpotifyToken")
	if err != nil {
		return fmt.Errorf("error fetching users: %w", err)
	}
	existingTracks, err := h.trackRepository.FindAllByFilter(map[string]interface{}{})
	if err != nil {
		return fmt.Errorf("error fetching existing tracks: %w", err)
	}
	existingTracksURIMap := make(map[string]models.Track)
	for _, track := range existingTracks {
		existingTracksURIMap[track.URI] = track
	}

	for _, user := range users {
		spotifyClient, err := h.initSpotifyClient(user)
		if err != nil {
			log.Printf("error initializing Spotify client for user %s: %v", user.ID, err)
			continue
		}
		playlist, err := spotifyClient.GetPlaylist(context.Background(), spotify.ID(user.SpotifyPlaylistLink))
		if err != nil {
			log.Printf("error fetching playlist %s: %v", user.SpotifyPlaylistLink, err)
			continue
		}
		set := models.Set{
			ID:     uuid.New(),
			Name:   playlist.Name,
			Link:   playlist.ExternalURLs["spotify"],
			UserID: user.ID,
		}
		err = h.setRepository.Save(&set)
		if err != nil {
			log.Printf("error saving set %s: %v", set.ID, err)
			continue
		}

		playlistItems, err := spotifyClient.GetPlaylistItems(context.Background(), spotify.ID(user.SpotifyPlaylistLink))
		if err != nil {
			log.Printf("error fetching tracks for playlist %s: %v", playlist.ID, err)
			continue
		}

		for i, item := range playlistItems.Items {
			if i >= 3 {
				break
			}
			trackURI := string(item.Track.Track.URI)
			track, exists := existingTracksURIMap[trackURI]
			if exists {
				// Track already exists, associate it with the new set
				err = config.DB.Model(&track).Association("Sets").Append(&set)
				if err != nil {
					log.Printf("error associating track %s with set %s: %v", track.URI, set.ID, err)
					continue
				}
			} else {
				// Track does not exist, create a new track and associate it with the set
				artistNames := make([]string, 0, len(item.Track.Track.Artists))
				for _, artist := range item.Track.Track.Artists {
					artistNames = append(artistNames, artist.Name)
				}
				track = models.Track{
					ID:     uuid.New(),
					Name:   item.Track.Track.Name,
					Artist: strings.Join(artistNames, ", "),
					URI:    trackURI,
					ImgURL: item.Track.Track.Album.Images[0].URL,
				}
				err = h.trackRepository.Save(&track)
				if err != nil {
					log.Printf("error saving track %s: %v", track.URI, err)
					continue
				}
				// Now associate the new track with the set
				err = config.DB.Model(&track).Association("Sets").Append(&set)
				if err != nil {
					log.Printf("error associating track %s with set %s: %v", track.URI, set.ID, err)
					continue
				}
				existingTracksURIMap[track.URI] = track
			}
		}
	}
	return nil
}

func (h *cronHandler) initSpotifyClient(user models.User) (*spotify.Client, error) {
	spotifyToken := oauth2.Token{
		AccessToken:  user.SpotifyToken.AccessToken,
		TokenType:    "Bearer",
		RefreshToken: user.SpotifyToken.RefreshToken,
		Expiry:       user.SpotifyToken.Expiry,
	}
	ctx := context.Background()
	httpClient := spotifyauth.New().Client(ctx, &spotifyToken)
	client := spotify.New(httpClient)
	oauthConf := &oauth2.Config{
		ClientID:     config.Conf.SpotifyClientID,
		ClientSecret: config.Conf.SpotifyClientSecret,
		Endpoint: oauth2.Endpoint{
			TokenURL: spotifyauth.TokenURL,
		},
	}
	if spotifyToken.Expiry.Before(time.Now()) {
		src := oauthConf.TokenSource(ctx, &spotifyToken)
		token, err := src.Token()
		if err != nil {
			fmt.Printf("Couldn't refresh token: %v\n", err)
			return nil, err
		}

		newSpotifyToken := models.SpotifyToken{
			AccessToken:  token.AccessToken,
			RefreshToken: token.RefreshToken,
			Expiry:       token.Expiry,
		}
		user.SpotifyToken = newSpotifyToken

		// Begin a transaction
		tx := config.DB.Begin()

		if err := tx.Model(&user).Association("SpotifyToken").Replace(&newSpotifyToken); err != nil {
			tx.Rollback()
			return nil, err
		}
		tx.Model(&user).Save(&user)

		// Commit the transaction
		if err := tx.Commit().Error; err != nil {
			return nil, err
		}

		httpClient = spotifyauth.New().Client(ctx, token)
		client = spotify.New(httpClient)
	}
	return client, nil
}
