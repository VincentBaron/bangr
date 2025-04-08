package config

import (
	"os"

	"github.com/VincentBaron/bangr/backend/internal/models"
	"gopkg.in/yaml.v2"
)

var Conf models.Config

func LoadEnvVariables() {
	configsFile, err := os.ReadFile("configs.yml")
	if err != nil {
		Conf.YoutubeAPIKey = os.Getenv("YOUTUBE_API_KEY")
		Conf.SpotifyClientID = os.Getenv("SPOTIFY_CLIENT_ID")
		Conf.SpotifyClientSecret = os.Getenv("SPOTIFY_CLIENT_SECRET")
		Conf.SpotifyRedirectURL = os.Getenv("SPOTIFY_REDIRECT_URL")
		Conf.SpotifyScopes = os.Getenv("SPOTIFY_SCOPES")
	} else {
		// Unmarshal the configsFile data into a Config struct
		err = yaml.Unmarshal(configsFile, &Conf)
		if err != nil {
			// handle error
		}
	}
}
