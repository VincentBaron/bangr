package models

import "golang.org/x/oauth2"

type Config struct {
	Database struct {
		Host     string `yaml:"host"`
		Port     string `yaml:"port"`
		User     string `yaml:"user"`
		Password string `yaml:"password"`
		Name     string `yaml:"name"`
	} `yaml:"database"`
	YoutubeAPIKey       string   `yaml:"youtube_api_key"`
	SpotifyClientID     string   `yaml:"spotify_client_id"`
	SpotifyClientSecret string   `yaml:"spotify_client_secret"`
	SpotifyRedirectURL  string   `yaml:"spotify_redirect_url"`
	SpotifyScopes       []string `yaml:"spotify_scopes"`
}

type HandlerConfig struct {
	Oauth *oauth2.Config
	State string
}
