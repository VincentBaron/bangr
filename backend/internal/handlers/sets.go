package handlers

import (
	"net/http"

	"github.com/VincentBaron/bangr/backend/internal/models"
	"github.com/VincentBaron/bangr/backend/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/zmb3/spotify/v2"
)

type SetHandler struct {
	setService *services.SetService
}

func NewSetHandler(setService *services.SetService) *SetHandler {
	return &SetHandler{
		setService: setService,
	}
}

func (h *SetHandler) GetSets(c *gin.Context) {
	sets, err := h.setService.GetSets(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return the list of playlist names
	c.JSON(http.StatusOK, gin.H{"sets": sets})
}

func (h *SetHandler) ToggleLikeTrack(c *gin.Context) {

	var queryParams models.LikeQueryParams
	if err := c.ShouldBindQuery(&queryParams); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// Get the track ID from the URL
	trackID := c.Param("id")
	id, err := uuid.Parse(trackID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid track ID"})
		return
	}

	err = h.setService.ToggleLikeTrack(c, id, queryParams)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Track liked successfully"})
}

func (h *SetHandler) CreateSet(c *gin.Context) {
	// Create a new set
	var set models.Set
	user, ok := c.MustGet("user").(*models.User)
	if !ok {
		// handle the error, e.g., return an error response
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user from context"})
		return
	}
	set.UserID = user.ID

	spotifyClient, ok := c.MustGet("spotifyClient").(*spotify.Client)
	if !ok {
		// handle the error, e.g., return an error response
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get Spotify client from context"})
		return
	}

	set, err := h.setService.CreateSet(user.SpotifyUserID, set, spotifyClient)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return the set
	c.JSON(http.StatusOK, gin.H{"set": set})
}
