package services

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"os"
	"strconv"
	"sync"
	"time"

	"github.com/VincentBaron/bangr/backend/internal/config"
	"github.com/VincentBaron/bangr/backend/internal/dto"
	"github.com/VincentBaron/bangr/backend/internal/models"
	"github.com/VincentBaron/bangr/backend/internal/repositories"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/zmb3/spotify/v2"
	spotifyauth "github.com/zmb3/spotify/v2/auth"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	userRepository  *repositories.Repository[models.User]
	genreRepository *repositories.Repository[models.Genre]
}

func NewAuthService(userRepo *repositories.Repository[models.User], genreRepo *repositories.Repository[models.Genre]) *AuthService {
	return &AuthService{
		userRepository:  userRepo,
		genreRepository: genreRepo,
	}
}

// In-memory map to store state to userID mapping
var stateToUserIDMap = struct {
	sync.RWMutex
	m map[string]uuid.UUID
}{m: make(map[string]uuid.UUID)}

func (s *AuthService) CallbackService(c *gin.Context) error {
	state := c.Query("state")

	// Retrieve the userID using the state
	stateToUserIDMap.RLock()
	userID, exists := stateToUserIDMap.m[state]
	stateToUserIDMap.RUnlock()
	if !exists {
		log.Println("Invalid state parameter")
		return fmt.Errorf("invalid state parameter")
	}

	// Create a new authenticator
	auth := spotifyauth.New(spotifyauth.WithRedirectURL(config.Conf.SpotifyRedirectURL), spotifyauth.WithScopes(spotifyauth.ScopeUserReadPrivate), spotifyauth.WithClientID(config.Conf.SpotifyClientID), spotifyauth.WithClientSecret(config.Conf.SpotifyClientSecret))
	token, err := auth.Token(c, state, c.Request)
	if err != nil {
		log.Println(err)
		return fmt.Errorf("failed to get token: %w", err)
	}

	// Update the user record with the access token and refresh token
	user, err := s.userRepository.FindByFilter(map[string]interface{}{"id": userID})
	if err != nil {
		log.Println(err)
		return fmt.Errorf("failed to find user: %w", err)
	}

	httpClient := spotifyauth.New().Client(c, token)
	client := spotify.New(httpClient)
	spotifyUser, err := client.CurrentUser(c)
	if err != nil {
		log.Println(err)
		return fmt.Errorf("failed to get current user: %w", err)
	}

	playlist, err := client.CreatePlaylistForUser(context.Background(), spotifyUser.ID, user.Username+"'s Bangr", "Add your favorite song every 3 days to listen to other people's favorite songs!", false, false)
	if err != nil {
		log.Println(err)
		return fmt.Errorf("failed to create playlist: %w", err)
	}

	user.SpotifyToken.AccessToken = token.AccessToken
	user.SpotifyToken.RefreshToken = token.RefreshToken
	user.SpotifyToken.Expiry = token.Expiry
	user.SpotifyUserID = spotifyUser.ID
	user.SpotifyPlaylistLink = playlist.ID.String()
	if len(spotifyUser.Images) > 0 {
		user.ProfilePicURL = spotifyUser.Images[0].URL
	}

	if err := s.userRepository.Save(user); err != nil {
		log.Println(err)
		return fmt.Errorf("failed to save user: %w", err)
	}

	return nil
}

func (s *AuthService) Signup(c *gin.Context, payload *dto.PostUserReq) (*string, error) {
	// Hash the password
	hash, err := bcrypt.GenerateFromPassword([]byte(payload.Password), 10)
	if err != nil {
		log.Println(err)
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Create the user
	user := models.User{
		Username: payload.Username,
		Password: string(hash),
	}

	// Save the user
	err = s.userRepository.Save(&user)
	if err != nil {
		log.Println(err.Error())
		return nil, fmt.Errorf("failed to save user: %w", err)
	}

	// Find existing genres and associate them with the user
	var genres []models.Genre
	for _, genreName := range payload.Genres {
		var genre *models.Genre
		genre, err := s.genreRepository.FindByFilter(map[string]interface{}{"name": genreName})
		if err != nil {
			log.Println(err)
			return nil, fmt.Errorf("failed to find genre: %w", err)
		}
		genres = append(genres, *genre)
	}

	// Associate genres with user
	if err := config.DB.Model(&user).Association("Genres").Replace(genres); err != nil {
		log.Println(err)
		return nil, fmt.Errorf("failed to associate genres with user: %w", err)
	}

	// Generate a unique state
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
	state := strconv.FormatUint(rng.Uint64(), 10)

	// Store the state to userID mapping
	stateToUserIDMap.Lock()
	stateToUserIDMap.m[state] = user.ID
	stateToUserIDMap.Unlock()

	// Redirect the user to the Spotify authorization page
	url := "https://accounts.spotify.com/authorize?response_type=code" +
		"&client_id=" + config.Conf.SpotifyClientID +
		"&scope=" + config.Conf.SpotifyScopes +
		"&redirect_uri=" + config.Conf.SpotifyRedirectURL +
		"&state=" + state

	return &url, nil
}

func (s *AuthService) Login(c *gin.Context, username, password string) error {
	// Look up for requested user
	var user *models.User

	user, err := s.userRepository.FindByFilter(map[string]interface{}{"username": username}, "SpotifyToken")
	if err != nil {
		log.Println(err)
		return fmt.Errorf("failed to find user: %w", err)
	}

	if user.ID == uuid.Nil {
		log.Println("User not found")
		return fmt.Errorf("user not found")
	}

	// Compare sent in password with saved users password
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		log.Println("Password incorrect")
		return fmt.Errorf("password incorrect")
	}

	// Generate a JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": user.ID,
		"exp": time.Now().Add(time.Hour * 24 * 30).Unix(),
	})

	// Sign and get the complete encoded token as a string using the secret
	tokenString, err := token.SignedString([]byte(os.Getenv("SECRET")))

	if err != nil {
		log.Println(err)
		return fmt.Errorf("failed to sign token: %w", err)
	}

	SetTokens(c, tokenString, user.SpotifyToken.AccessToken, user.ID.String())
	return nil
}

func SetTokens(c *gin.Context, tokenString string, spotifyToken string, userID string) {
	// Add tokens to the response headers
	c.Header("Authorization", tokenString)
	c.Header("SpotifyAuthorization", spotifyToken)
	c.Header("UserID", userID)
}
