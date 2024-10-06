package middlewares

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/VincentBaron/bangr/backend/internal/config"
	"github.com/VincentBaron/bangr/backend/internal/models"
	"github.com/VincentBaron/bangr/backend/internal/repositories"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/zmb3/spotify"
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
	tokenString, err := c.Cookie("Authorization")
	if err != nil {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	// Decode/validate it
	token, _ := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Don't forget to validate the alg is what you expect:
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		// hmacSampleSecret is a []byte containing your secret, e.g. []byte("my_secret_key")
		return []byte(os.Getenv("SECRET")), nil
	})

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		// Chec k the expiry date
		if float64(time.Now().Unix()) > claims["exp"].(float64) {
			c.AbortWithStatus(http.StatusUnauthorized)
		}

		// Find the user with token Subject
		user, err := m.userRepository.FindByFilter(map[string]interface{}{"id": claims["sub"]}, "SpotifyToken")
		if err != nil {
			c.AbortWithStatus(http.StatusUnauthorized)
		}

		if user.ID == 0 {
			c.AbortWithStatus(http.StatusUnauthorized)
		}

		// Assuming this is inside the middleware where you check if the spotifyToken has expired
		spotifyToken := oauth2.Token{
			AccessToken:  user.SpotifyToken.AccessToken,
			TokenType:    "Bearer",
			RefreshToken: user.SpotifyToken.RefreshToken,
			Expiry:       user.SpotifyToken.Expiry,
		}
		if user.SpotifyToken.Expiry.Before(time.Now()) {
			clientID := os.Getenv("SPOTIFY_CLIENT_ID")
			clientSecret := os.Getenv("SPOTIFY_CLIENT_SECRET")
			refreshToken := user.SpotifyToken.RefreshToken

			// Encode clientID and clientSecret
			encodedCredentials := base64.StdEncoding.EncodeToString([]byte(clientID + ":" + clientSecret))

			// Prepare the request body
			data := url.Values{}
			data.Set("grant_type", "refresh_token")
			data.Set("refresh_token", refreshToken)

			// Create the request
			req, err := http.NewRequest("POST", "https://accounts.spotify.com/api/token", strings.NewReader(data.Encode()))
			if err != nil {
				// Handle error
				c.AbortWithStatus(http.StatusInternalServerError)
				return
			}

			// Add headers
			req.Header.Add("Authorization", "Basic "+encodedCredentials)
			req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

			// Send the request
			client := &http.Client{}
			resp, err := client.Do(req)
			if err != nil {
				// Handle error
				c.AbortWithStatus(http.StatusInternalServerError)
				return
			}
			defer resp.Body.Close()

			if err := json.NewDecoder(resp.Body).Decode(&spotifyToken); err != nil {
				// Handle error
				c.AbortWithStatus(http.StatusInternalServerError)
				return
			}

			// Update the user's Spotify token details
			user.SpotifyToken.AccessToken = spotifyToken.AccessToken
			user.SpotifyToken.Expiry = spotifyToken.Expiry
			if spotifyToken.RefreshToken != "" {
				user.SpotifyToken.RefreshToken = spotifyToken.RefreshToken
			}

			// Save the updated token details to the database
			config.DB.Save(&user.SpotifyToken)
		}

		// Create a new Spotify client with the refreshed token
		// Note: Since you're not using the authenticator, you'll need to manually handle the client creation if necessary
		// For example, you might directly use the access token in your requests to the Spotify Web API

		// Continue with your middleware logic
		client := spotify.Authenticator{}.NewClient(&spotifyToken)
		c.Set("spotifyClient", client)

		// Attach the request
		c.Set("user", user)

		//Continue
		c.Next()
	} else {
		c.AbortWithStatus(http.StatusUnauthorized)
	}
}
