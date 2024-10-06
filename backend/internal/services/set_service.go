package services

import (
	"strconv"

	"github.com/VincentBaron/bangr/backend/internal/models"
	"github.com/VincentBaron/bangr/backend/internal/repositories"
	"github.com/gin-gonic/gin"
	"github.com/zmb3/spotify"
)

type SetService struct {
	setRepository *repositories.Repository[models.Set]
}

func NewSetService(setRepo *repositories.Repository[models.Set]) *SetService {
	return &SetService{
		setRepository: setRepo,
	}
}

func (s *SetService) GetSets() ([]models.Set, error) {

	// Get all sets
	sets, err := s.setRepository.FindAllByFilter(map[string]interface{}{})
	if err != nil {
		return nil, err
	}
	return sets, nil
}

func (s *SetService) GetSet(c *gin.Context, setID string) (*models.SetDetails, error) {
	tracks := make([]string, 0)

	id, err := strconv.ParseUint(setID, 10, 32)
	if err != nil {
		return &models.SetDetails{}, err
	}
	// Get the set
	set, err := s.setRepository.FindByFilter(map[string]interface{}{"id": id})
	if err != nil {
		return &models.SetDetails{}, err
	}
	spotifyClient := c.MustGet("spotifyClient").(spotify.Client)
	playlist, err := spotifyClient.GetPlaylist(spotify.ID(set.Link))
	if err != nil {
		return &models.SetDetails{}, err
	}
	for _, track := range playlist.Tracks.Tracks {
		tracks = append(tracks, track.Track.Endpoint)
	}
	return &models.SetDetails{
		Tracks: tracks,
	}, nil
}

func (s *SetService) CreateSet(spotifyUserID string, set models.Set, spotifyClient spotify.Client) (models.Set, error) {

	playlist, err := spotifyClient.CreatePlaylistForUser(spotifyUserID, "My Set 🔥", "Add your favorite song every 3 days to listen to other people's favorite songs!", false)
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
