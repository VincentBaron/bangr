package middlewares

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/VincentBaron/bangr/backend/internal/config"
	"github.com/VincentBaron/bangr/backend/internal/models"
	"github.com/VincentBaron/bangr/backend/internal/repositories"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/zmb3/spotify/v2"
	spotifyauth "github.com/zmb3/spotify/v2/auth"
	"golang.org/x/oauth2"
)

type Middleware struct {
	userRepository *repositories.Repository[models.User]
}

func NewMiddleware(userRepository *repositories.Repository[models.User]) *Middleware {
	return &Middleware{userRepository: userRepository}
}

func (m *Middleware) RequireAuth(c *gin.Context) {
	// Get the cookie off the request
	tokenString := c.GetHeader("Authorization")
	if tokenString == "" {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	// Remove "Bearer " prefix
	if len(tokenString) > 7 && tokenString[:7] == "Bearer " {
		tokenString = tokenString[7:] // Extract the token part
	} else {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	// Decode/validate the token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Validate the signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(os.Getenv("SECRET")), nil
	})
	if err != nil || !token.Valid {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || float64(time.Now().Unix()) > claims["exp"].(float64) {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	// Find the user with token Subject
	user, err := m.userRepository.FindByFilter(map[string]interface{}{"id": claims["sub"]}, "SpotifyToken")
	if err != nil || user.ID == uuid.Nil {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	// Check if the Spotify token has expired
	spotifyToken := oauth2.Token{
		AccessToken:  user.SpotifyToken.AccessToken,
		TokenType:    "Bearer",
		RefreshToken: user.SpotifyToken.RefreshToken,
		Expiry:       user.SpotifyToken.Expiry,
	}
	httpClient := spotifyauth.New().Client(c, &spotifyToken)
	client := spotify.New(httpClient)
	oauthConf := &oauth2.Config{
		ClientID:     config.Conf.SpotifyClientID,
		ClientSecret: config.Conf.SpotifyClientSecret,
		Endpoint: oauth2.Endpoint{
			TokenURL: spotifyauth.TokenURL,
		},
	}
	if spotifyToken.Expiry.Before(time.Now()) {
		src := oauthConf.TokenSource(c, &spotifyToken)
		token, err := src.Token()
		if err != nil {
			fmt.Printf("Couldn't refresh token: %v\n", err)
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		newSpotifyToken := models.SpotifyToken{
			AccessToken:  token.AccessToken,
			RefreshToken: token.RefreshToken,
			Expiry:       token.Expiry,
		}
		user.SpotifyToken = newSpotifyToken

		// Begin a transaction
		tx := config.DB.Begin()

		if err := tx.Model(&user).Association("SpotifyToken").Replace(&newSpotifyToken); err != nil {
			tx.Rollback()
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		tx.Model(&user).Save(&user)

		// Commit the transaction
		if err := tx.Commit().Error; err != nil {
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		httpClient = spotifyauth.New().Client(c, token)
		client = spotify.New(httpClient)
		SetTokens(c, tokenString, token.AccessToken, user.ID.String())
	}

	// Create a new Spotify client with the refreshed token

	c.Set("spotifyClient", client)

	// Attach the request
	c.Set("user", user)

	// Continue
	c.Next()
}

func SetTokens(c *gin.Context, tokenString string, spotifyToken string, userID string) {
	// Add tokens to the response headers
	c.Request.Header.Add("Authorization", tokenString)
	c.Request.Header.Add("SpotifyAuthorization", spotifyToken)
	c.Request.Header.Add("UserID", userID)
}
