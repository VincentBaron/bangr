package main

import (
	"log"
	"net/http"
	"os"

	"github.com/VincentBaron/bangr/backend/internal/config"
	"github.com/VincentBaron/bangr/backend/internal/handlers"
	"github.com/VincentBaron/bangr/backend/internal/middlewares"
	"github.com/VincentBaron/bangr/backend/internal/models"
	"github.com/VincentBaron/bangr/backend/internal/repositories"
	"github.com/VincentBaron/bangr/backend/internal/services"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gopkg.in/yaml.v2"
)

func init() {
	config.LoadEnvVariables()
	config.ConnectToDb()
	config.SyncDatabase()
}

func LoadConfig(file string) (models.Config, error) {
	var config models.Config
	data, err := os.ReadFile(file)
	if err != nil {
		return config, err
	}
	err = yaml.Unmarshal(data, &config)
	return config, err
}

func main() {
	// Set up the Gin router
	r := gin.New()
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = []string{"http://localhost:5173"}
	corsConfig.AllowCredentials = true

	r.Use(cors.New(corsConfig))

	// Initialize repositories
	userRepository := repositories.NewRepository[models.User](config.DB)
	setRepository := repositories.NewRepository[models.Set](config.DB)
	trackRepository := repositories.NewRepository[models.Track](config.DB)

	// Initialize services
	authService := services.NewAuthService(userRepository)
	setService := services.NewSetService(setRepository, trackRepository)
	playerService := services.NewPlayerService()

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService)
	setHandler := handlers.NewSetHandler(setService)
	playerHandler := handlers.NewPlayerHandler(playerService)

	// Initialize middlewares
	middleware := middlewares.NewMiddleware(userRepository)

	// Set up routes with handlers
	r.POST("/signup", authHandler.Signup)
	r.POST("/login", authHandler.Login)
	r.GET("/callback", authHandler.CallbackHandler)
	r.GET("/sets", middleware.RequireAuth, setHandler.GetSets)
	r.POST("/sets", middleware.RequireAuth, setHandler.CreateSet)
	r.GET("/player", middleware.RequireAuth, playerHandler.Player)
	r.PUT("/tracks/:id/like", middleware.RequireAuth, setHandler.ToggleLikeTrack)

	// r.GET("/status", handler.handleStatus)
	// r.POST("/store-token", storeTokenHandler)

	// Start the server
	log.Printf("Server started at http://localhost:8080...")
	log.Fatal(http.ListenAndServe("localhost:8080", r))
}
