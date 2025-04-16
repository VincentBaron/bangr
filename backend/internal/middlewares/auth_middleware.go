package middlewares

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/VincentBaron/bangr/backend/internal/models"
	"github.com/VincentBaron/bangr/backend/internal/repositories"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
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

	// Create a new Spotify client with the refreshed token
	SetTokens(c, tokenString, user.ID.String())

	// Attach the request
	c.Set("user", user)

	// Continue
	c.Next()
}

func SetTokens(c *gin.Context, tokenString string, userID string) {
	// Add tokens to the response headers
	c.Header("Authorization", tokenString)
	c.Header("UserID", userID)
}
