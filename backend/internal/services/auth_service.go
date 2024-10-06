package services

import (
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"time"

	"github.com/VincentBaron/bangr/backend/internal/config"
	"github.com/VincentBaron/bangr/backend/internal/models"
	"github.com/VincentBaron/bangr/backend/internal/repositories"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/zmb3/spotify"
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

func (s *AuthService) CallbackService(c *gin.Context) error {
	code := c.Query("code")
	state := c.Query("state")

	// Create a new authenticator
	auth := spotify.NewAuthenticator(config.Conf.SpotifyRedirectURL, spotify.ScopeUserReadPrivate)
	auth.SetAuthInfo(config.Conf.SpotifyClientID, config.Conf.SpotifyClientSecret)

	// Exchange the code for a token
	token, err := auth.Exchange(code)
	if err != nil {
		log.Println(err)
		return fmt.Errorf("failed to exchange code for token: %w", err)
	}

	// Convert the state parameter to a uint
	userID, err := strconv.ParseUint(state, 10, 64)
	if err != nil {
		log.Println(err)
		return fmt.Errorf("failed to parse state parameter: %w", err)
	}

	// Update the user record with the access token and refresh token
	user, err := s.userRepository.FindByFilter(map[string]interface{}{"id": userID})
	if err != nil {
		log.Println(err)
		return fmt.Errorf("failed to find user: %w", err)
	}

	client := spotify.Authenticator{}.NewClient(token)
	spotifyUser, err := client.CurrentUser()
	if err != nil {
		log.Println(err)
		return fmt.Errorf("failed to get current user: %w", err)
	}

	user.SpotifyToken.AccessToken = token.AccessToken
	user.SpotifyToken.RefreshToken = token.RefreshToken
	user.SpotifyToken.Expiry = token.Expiry
	user.SpotifyUserID = spotifyUser.ID

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
		Email:    payload.Email,
		Username: payload.Username,
		Password: string(hash),
	}

	err = s.userRepository.Save(&user)
	if err != nil {
		log.Println(err.Error())
		return nil, fmt.Errorf("failed to save user: %w", err)
	}

	state := strconv.FormatUint(uint64(user.ID), 10) // Convert the user's ID to a string
	// Redirect the user to the Spotify authorization page
	scopes := "playlist-modify-private user-read-currently-playing user-modify-playback-state user-read-playback-state"
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
		// handle error
	}

	if user.ID == 0 {
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
	c.SetCookie("Authorization", tokenString, 3600*24*30, "", "", false, true)
	c.SetCookie("SpotifyAuthorization", user.SpotifyToken.AccessToken, 3600*24*30, "", "", false, false)
	return nil
}
