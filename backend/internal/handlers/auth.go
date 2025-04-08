package handlers

import (
	"net/http"
	"os"

	"github.com/VincentBaron/bangr/backend/internal/dto"
	"github.com/VincentBaron/bangr/backend/internal/services"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService *services.AuthService
}

func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

func (h *AuthHandler) CallbackHandler(c *gin.Context) {
	code := c.Query("code")
	state := c.Query("state")

	if code == "" || state == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to read query params",
		})
		return
	}

	if err := h.authService.CallbackService(c); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}
	c.Redirect(http.StatusTemporaryRedirect, os.Getenv("FRONTEND_URL"))
}

func (h *AuthHandler) Login(c *gin.Context) {
	// Get email & pass off req body
	var body struct {
		Username string
		Password string
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to read body",
		})

		return
	}

	err := h.authService.Login(c, body.Username, body.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{})
}

func (h *AuthHandler) Signup(c *gin.Context) {
	// Get the email/pass off req Body
	var payload dto.PostUserReq

	if c.Bind(&payload) != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to read body",
		})
		return
	}

	url, err := h.authService.Signup(c, &payload)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}
	// // Respond
	c.JSON(http.StatusOK, gin.H{"url": url})
}
