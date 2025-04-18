package config

import (
	"log"
	"os"

	"github.com/VincentBaron/bangr/backend/internal/models"
)

func SyncDatabase() {
	env := os.Getenv("ENVIRONMENT")
	if env == "development" {
		log.Println("Running database migrations in development mode...")
		err := DB.AutoMigrate(&models.User{}, &models.Set{}, &models.SpotifyToken{}, &models.Track{}, &models.Like{}, &models.Genre{}, &models.Group{})
		if err != nil {
			log.Printf("Error during migration: %v", err)
		}
		log.Println("Database migrations completed")
	} else {
		log.Println("Skipping database migrations in production mode")
	}
}
