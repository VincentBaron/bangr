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
)

func init() {
	config.LoadEnvVariables()
	config.ConnectToDb()
	config.SyncDatabase()
}

// func LoadConfig(file string) (models.Config, error) {
// 	var config models.Config
// 	data, err := os.ReadFile(file)
// 	if err != nil {
// 		log.Printf("Config file not found, loading from environment variables...")
// 		config.YoutubeAPIKey = os.Getenv("YOUTUBE_API_KEY")
// 		config.SpotifyClientID = os.Getenv("SPOTIFY_CLIENT_ID")
// 		config.SpotifyClientSecret = os.Getenv("SPOTIFY_CLIENT_SECRET")
// 		config.SpotifyRedirectURL = os.Getenv("SPOTIFY_REDIRECT_URL")
// 		config.SpotifyScopes = os.Getenv("SPOTIFY_SCOPES")
// 		return config, nil
// 	}
// 	err = yaml.Unmarshal(data, &config)
// 	return config, err
// }

func main() {
	// Set up the Gin router
	r := gin.New()
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = []string{os.Getenv("FRONTEND_URL")}
	corsConfig.AllowCredentials = true
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	corsConfig.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization", "UserID"}
	corsConfig.ExposeHeaders = []string{"Authorization", "UserID", "SpotifyAuthorization"}

	r.Use(cors.New(corsConfig))

	// Initialize repositories
	userRepository := repositories.NewRepository[models.User](config.DB)
	setRepository := repositories.NewRepository[models.Set](config.DB)
	trackRepository := repositories.NewRepository[models.Track](config.DB)
	genreRepository := repositories.NewRepository[models.Genre](config.DB)
	likesRepository := repositories.NewRepository[models.Like](config.DB)

	// Initialize services
	authService := services.NewAuthService(userRepository, genreRepository)
	setService := services.NewSetService(setRepository, trackRepository)
	playerService := services.NewPlayerService()
	userService := services.NewUserService(userRepository, genreRepository)
	leaderboardService := services.NewLeaderboardService(trackRepository, likesRepository)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService)
	setHandler := handlers.NewSetHandler(setService)
	playerHandler := handlers.NewPlayerHandler(playerService)
	userHandler := handlers.NewUserHandler(userService)
	leaderBoardHandler := handlers.NewLeaderboardHandler(leaderboardService)

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
	r.GET("/me", middleware.RequireAuth, userHandler.GetMe)
	r.PATCH("/me", middleware.RequireAuth, userHandler.UpdateMe)
	r.GET("/genres", middleware.RequireAuth, userHandler.GetGenres)
	// Get leaderboard
	r.GET("/leaderboard", middleware.RequireAuth, leaderBoardHandler.GetLeaderboard)

	// r.GET("/status", handler.handleStatus)
	// r.POST("/store-token", storeTokenHandler)

	// Start the server
	log.Printf("Server started at http://localhost:8080...")
	log.Fatal(http.ListenAndServe("0.0.0.0:8080", r))
}
