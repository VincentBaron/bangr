package services

import (
	"fmt"

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
		if params.URIs != nil {
			spotifyURIs := make([]spotify.URI, len(params.URIs))
			for i, uri := range params.URIs {
				spotifyURIs[i] = spotify.URI(uri)
			}
			options.URIs = spotifyURIs
		}
		if params.DeviceID != "" {
			options.DeviceID = &params.DeviceID
		}

		err = spotifyClient.PlayOpt(c, &options)
		if err != nil {
			c.Error(err)
			return nil, err
		}
	case models.PLayerActivate:
		err = spotifyClient.TransferPlayback(c, params.DeviceID, false)
		if err != nil {
			fmt.Println("yolo1")
			return nil, err
		}
	}
	return currentlyPlaying, nil
}
