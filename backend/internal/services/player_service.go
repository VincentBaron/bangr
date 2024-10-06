package services

import (
	"github.com/VincentBaron/bangr/backend/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/zmb3/spotify/v2"
)

type PlayerService struct{}

func NewPlayerService() *PlayerService {
	return &PlayerService{}
}

func (s *PlayerService) HandlePlayer(c *gin.Context, spotifyClient *spotify.Client, params models.HandlerPlayerQueryParams) (*spotify.CurrentlyPlaying, error) {
	var currentlyPlaying *spotify.CurrentlyPlaying
	var err error

	// Handle player actions
	switch params.Action {
	case models.PlayerActionPlay:
		var options spotify.PlayOptions
		if params.Link != "" {
			options.PlaybackContext = (*spotify.URI)(&params.Link)
		}
		if params.DeviceID != "" {
			options.DeviceID = &params.DeviceID
		}

		err = spotifyClient.PlayOpt(c, &options)
		if err != nil {
			c.Error(err)
			return nil, err
		}
		currentlyPlaying, err = spotifyClient.PlayerCurrentlyPlaying(c)
		if err != nil {
			return nil, err
		}
	case models.PlayerActionPause:
		err = spotifyClient.Pause(c)
		if err != nil {
			return nil, err
		}
		currentlyPlaying, err = spotifyClient.PlayerCurrentlyPlaying(c)
		if err != nil {
			return nil, err
		}
	case models.PlayerActionNext:
		err = spotifyClient.Next(c)
		if err != nil {
			return nil, err
		}
		currentlyPlaying, err = spotifyClient.PlayerCurrentlyPlaying(c)
		if err != nil {
			return nil, err
		}
	case models.PlayerActionPrev:
		err = spotifyClient.Previous(c)
		if err != nil {
			return nil, err
		}
		currentlyPlaying, err = spotifyClient.PlayerCurrentlyPlaying(c)
		if err != nil {
			return nil, err
		}
	case models.PLayerActivate:
		err = spotifyClient.TransferPlayback(c, params.DeviceID, false)
		if err != nil {
			return nil, err
		}
		err = spotifyClient.PlayOpt(c, &spotify.PlayOptions{
			PlaybackContext: (*spotify.URI)(&params.PlaylistLink),
		})
		if err != nil {
			return nil, err
		}
	default:
		currentlyPlaying, err = spotifyClient.PlayerCurrentlyPlaying(c)
		if err != nil {
			return nil, err
		}
	}
	return currentlyPlaying, nil
}
