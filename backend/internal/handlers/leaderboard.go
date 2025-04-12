package handlers

import (
	"net/http"

	"github.com/VincentBaron/bangr/backend/internal/services"
	"github.com/gin-gonic/gin"
)

type LeaderboardHandler struct {
	leaderboardService *services.LeaderboardService
}

func NewLeaderboardHandler(leaderboardService *services.LeaderboardService) *LeaderboardHandler {
	return &LeaderboardHandler{
		leaderboardService: leaderboardService,
	}
}

func (h *LeaderboardHandler) GetLeaderboard(c *gin.Context) {
	leaderboard, err := h.leaderboardService.GetLeaderboard(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, leaderboard)
}
