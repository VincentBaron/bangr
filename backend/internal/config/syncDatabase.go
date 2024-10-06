package config

import "github.com/VincentBaron/bangr/backend/internal/models"

func SyncDatabase() {
	DB.AutoMigrate(&models.User{}, &models.Set{}, &models.SpotifyToken{}, &models.Track{}, &models.Like{})
}
