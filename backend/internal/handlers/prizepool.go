package handlers

import (
	"net/http"

	"github.com/VincentBaron/bangr/backend/internal/services"
	"github.com/gin-gonic/gin"
)

type PrizePoolHandler struct {
	prizePoolService *services.PrizePoolService
}

func NewPrizePoolHandler(prizePoolService *services.PrizePoolService) *PrizePoolHandler {
	return &PrizePoolHandler{
		prizePoolService: prizePoolService,
	}
}

func (h *PrizePoolHandler) GetPrizePool(c *gin.Context) {
	prizePool, err := h.prizePoolService.GetPrizePool()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, prizePool)
}
