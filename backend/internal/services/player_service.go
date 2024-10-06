package services

import (
	"log"

	"github.com/VincentBaron/bangr/backend/internal/models"
	"github.com/zmb3/spotify"
)

type PlayerService struct{}

func NewPlayerService() *PlayerService {
	return &PlayerService{}
}

func (s *PlayerService) HandlePlayer(spotifyClient spotify.Client, params models.HandlerPlayerQueryParams) (*spotify.CurrentlyPlaying, error) {
	var currentlyPlaying *spotify.CurrentlyPlaying
	var err error

	// Handle player actions
	switch params.Action {
	case models.PlayerActionCurr:
		currentlyPlaying, err = spotifyClient.PlayerCurrentlyPlaying()
		if err != nil {
			log.Fatalf("Error getting currently playing track: %v", err)
			return nil, err
		}
	case models.PlayerActionPlay:
		err = spotifyClient.Play()
		if err != nil {
			log.Fatalf("Error playing track: %v", err)
			return nil, err
		}
		currentlyPlaying, err = spotifyClient.PlayerCurrentlyPlaying()
		if err != nil {
			log.Fatalf("Error getting currently playing track after play: %v", err)
			return nil, err
		}
	case models.PlayerActionPause:
		err = spotifyClient.Pause()
		if err != nil {
			log.Fatalf("Error pausing track: %v", err)
			return nil, err
		}
		currentlyPlaying, err = spotifyClient.PlayerCurrentlyPlaying()
		if err != nil {
			log.Fatalf("Error getting currently playing track after pause: %v", err)
			return nil, err
		}
	default:
		log.Fatalf("Invalid action: %v", params)
		return nil, nil
	}
	return currentlyPlaying, nil
}
