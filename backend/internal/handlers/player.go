package handlers

import (
	"log"
	"net/http"

	"github.com/VincentBaron/bangr/backend/internal/models"
	"github.com/VincentBaron/bangr/backend/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/zmb3/spotify"
)

type PlayerHandler struct {
	playerService *services.PlayerService
}

func NewPlayerHandler(playerService *services.PlayerService) *PlayerHandler {
	return &PlayerHandler{
		playerService: playerService,
	}
}

func (h *PlayerHandler) Player(c *gin.Context) {
	spotifyClient, ok := c.MustGet("spotifyClient").(spotify.Client)
	if !ok {
		log.Fatalf("Error getting Spotify client from context")
	}

	var queryParams models.HandlerPlayerQueryParams
	if err := c.ShouldBindQuery(&queryParams); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	player, err := h.playerService.HandlePlayer(spotifyClient, queryParams)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, player)

}
