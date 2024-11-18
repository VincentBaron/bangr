package services

import (
	"context"
	"strings"
	"time"

	"github.com/VincentBaron/bangr/backend/internal/config"
	"github.com/VincentBaron/bangr/backend/internal/dto"
	"github.com/VincentBaron/bangr/backend/internal/models"
	"github.com/VincentBaron/bangr/backend/internal/repositories"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/zmb3/spotify/v2"
)

type SetService struct {
	setRepository    *repositories.Repository[models.Set]
	tracksRepository *repositories.Repository[models.Track]
}

func NewSetService(setRepo *repositories.Repository[models.Set], tracksRepo *repositories.Repository[models.Track]) *SetService {
	return &SetService{
		setRepository:    setRepo,
		tracksRepository: tracksRepo,
	}
}

func (s *SetService) GetSets(c *gin.Context) ([]dto.GetSetResp, error) {
	setsResp := make([]dto.GetSetResp, 0)
	user := c.MustGet("user").(*models.User)

	// Get current user's genres
	var currentUser models.User
	if err := config.DB.Preload("Genres").First(&currentUser, user.ID).Error; err != nil {
		return nil, err
	}
	currentUserGenres := make(map[models.GenreName]bool)
	for _, genre := range currentUser.Genres {
		currentUserGenres[genre.Name] = true
	}

	// Get all users and their genres
	var users []models.User
	if err := config.DB.Preload("Genres").Find(&users).Error; err != nil {
		return nil, err
	}

	// Filter users with at least 50% genre match
	filteredUserIDs := make([]uuid.UUID, 0)
	for _, u := range users {
		if u.ID == user.ID {
			continue
		}
		matchingGenres := 0
		for _, genre := range u.Genres {
			if currentUserGenres[genre.Name] {
				matchingGenres++
			}
		}
		if float64(matchingGenres)/float64(len(currentUserGenres)) >= 0.5 {
			filteredUserIDs = append(filteredUserIDs, u.ID)
		}
	}

	// Get sets for filtered users
	sets, err := s.setRepository.FindAllByFilter(map[string]interface{}{"user_id": filteredUserIDs}, "Tracks", "User")
	if err != nil {
		return nil, err
	}

	// Get user likes
	var likes []models.Like
	config.DB.Model(&models.Like{}).Where("user_id = ?", user.ID).Find(&likes)
	tracksUserLikesMap := make(map[uuid.UUID]bool)
	for _, like := range likes {
		tracksUserLikesMap[like.TrackID] = true
	}

	// Calculate last Sunday at midnight
	now := time.Now()
	offset := int(time.Sunday - now.Weekday())
	if offset > 0 {
		offset = -6
	}
	lastSunday := time.Date(now.Year(), now.Month(), now.Day()+offset, 0, 0, 0, 0, now.Location())

	// Get likes for each track after last Sunday at midnight
	var trackLikes []models.Like
	config.DB.Model(&models.Like{}).Where("created_at >= ?", lastSunday).Find(&trackLikes)
	trackLikesCountMap := make(map[uuid.UUID]int)
	for _, like := range trackLikes {
		trackLikesCountMap[like.TrackID]++
	}

	for _, set := range sets {
		tracksResp := make([]dto.GetTrackResp, 0)
		for _, track := range set.Tracks {
			liked := false
			if _, ok := tracksUserLikesMap[track.ID]; ok {
				liked = true
			}
			tracksResp = append(tracksResp, dto.GetTrackResp{
				ID:     track.ID,
				URI:    track.URI,
				Name:   track.Name,
				Artist: track.Artist,
				Liked:  liked,
				Likes:  trackLikesCountMap[track.ID], // Total likes for the track
				ImgURL: track.ImgURL,
			})
		}
		setsResp = append(setsResp, dto.GetSetResp{
			ID:            set.ID,
			Link:          set.Link,
			Tracks:        tracksResp,
			Username:      set.User.Username,
			ProfilePicURL: set.User.ProfilePicURL,
		})
	}

	return setsResp, nil
}

func (s *SetService) ToggleLikeTrack(c *gin.Context, trackID uuid.UUID, params models.LikeQueryParams) error {
	user := c.MustGet("user").(*models.User)
	spotifyClient := c.MustGet("spotifyClient").(*spotify.Client)
	track, err := s.tracksRepository.FindByFilter(map[string]interface{}{"id": trackID}, "Likes")
	if err != nil {
		return err
	}
	trackSpotifyID := spotify.ID(strings.Split(track.URI, ":")[2])

	if params.Liked {
		// Add track to Spotify library and save like in the database
		err = spotifyClient.AddTracksToLibrary(c, trackSpotifyID)
		if err != nil {
			return err
		}
		like := models.Like{
			UserID:  user.ID,
			TrackID: track.ID,
		}
		if err := config.DB.Save(&like).Error; err != nil {
			return err
		}
	} else {
		// Remove track from Spotify library and delete like from the database
		err = spotifyClient.RemoveTracksFromLibrary(c, trackSpotifyID)
		if err != nil {
			return err
		}
		if err := config.DB.Where("user_id = ? AND track_id = ?", user.ID, track.ID).Delete(&models.Like{}).Error; err != nil {
			return err
		}
	}

	return nil
}

func (s *SetService) CreateSet(spotifyUserID string, set models.Set, spotifyClient *spotify.Client) (models.Set, error) {

	playlist, err := spotifyClient.CreatePlaylistForUser(context.Background(), spotifyUserID, "My Set 🔥", "Add your favorite song every 3 days to listen to other people's favorite songs!", false, false)
	if err != nil {
		return models.Set{}, err
	}
	set.Link = playlist.ID.String()

	// Save the set
	if err := s.setRepository.Save(&set); err != nil {
		return models.Set{}, err
	}
	return set, nil
}
