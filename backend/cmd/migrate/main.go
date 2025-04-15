package main

import (
	"log"

	"github.com/VincentBaron/bangr/backend/internal/config"
	"github.com/VincentBaron/bangr/backend/internal/models"
)

func main() {
	// Load environment variables
	config.LoadEnvVariables()

	// Connect to database
	config.ConnectToDb()

	// Run migrations
	log.Println("Running database migrations...")
	err := config.DB.AutoMigrate(
		&models.User{},
		&models.Set{},
		&models.SpotifyToken{},
		&models.Track{},
		&models.Like{},
		&models.Genre{},
	)
	if err != nil {
		log.Fatalf("Error during migration: %v", err)
	}
	log.Println("Database migrations completed successfully")
}
