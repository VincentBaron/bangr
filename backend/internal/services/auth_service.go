package services

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/VincentBaron/bangr/backend/internal/config"
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
	userRepository *repositories.Repository[models.User]
}

func NewAuthService(userRepo *repositories.Repository[models.User]) *AuthService {
	return &AuthService{
		userRepository: userRepo,
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

func (s *AuthService) Signup(c *gin.Context, payload *models.User) (*string, error) {
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

	err = s.userRepository.Save(&user)
	if err != nil {
		log.Println(err.Error())
		return nil, fmt.Errorf("failed to save user: %w", err)
	}

	// Generate a unique state
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
	state := strconv.FormatUint(rng.Uint64(), 10)

	// Store the state to userID mapping
	stateToUserIDMap.Lock()
	stateToUserIDMap.m[state] = user.ID
	stateToUserIDMap.Unlock()

	// Redirect the user to the Spotify authorization page
	scopes := strings.Join(config.Conf.SpotifyScopes, " ")
	encodedScopes := url.QueryEscape(scopes)
	url := "https://accounts.spotify.com/authorize?response_type=code" +
		"&client_id=" + config.Conf.SpotifyClientID +
		"&scope=" + encodedScopes +
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

	// Respond
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("Authorization", tokenString, 3600*24*30, "", "", false, false)
	c.SetCookie("SpotifyAuthorization", user.SpotifyToken.AccessToken, 3600*24*30, "", "", false, false)
	return nil
}
