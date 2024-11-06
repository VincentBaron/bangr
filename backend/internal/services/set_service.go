package services

import (
	"context"
	"strings"

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
	// Get all sets
	sets, err := s.setRepository.FindAllByFilter(map[string]interface{}{}, "Tracks", "User")
	var likes []models.Like
	config.DB.Model(&models.Like{}).Where("user_id = ?", user.ID).Find(&likes)
	tracksUserLikesMap := make(map[uuid.UUID]bool)
	for _, like := range likes {
		tracksUserLikesMap[like.TrackID] = true
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
			})
		}
		setsResp = append(setsResp, dto.GetSetResp{
			ID:       set.ID,
			Link:     set.Link,
			Tracks:   tracksResp,
			Username: set.User.Username,
		})
	}

	if err != nil {
		return nil, err
	}
	return setsResp, nil
}

func (s *SetService) LikeTrack(c *gin.Context, trackID uuid.UUID) error {
	user := c.MustGet("user").(*models.User)
	spotifyCLient := c.MustGet("spotifyClient").(*spotify.Client)
	track, err := s.tracksRepository.FindByFilter(map[string]interface{}{"id": trackID}, "Likes")
	if err != nil {
		return err
	}
	trackSpotifyID := spotify.ID(strings.Split(track.URI, ":")[2])
	err = spotifyCLient.AddTracksToLibrary(c, trackSpotifyID)
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
