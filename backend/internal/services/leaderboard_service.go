package services

import (
	"fmt"
	"log"
	"sort"

	"github.com/VincentBaron/bangr/backend/internal/config"
	"github.com/VincentBaron/bangr/backend/internal/dto"
	"github.com/VincentBaron/bangr/backend/internal/models"
	"github.com/VincentBaron/bangr/backend/internal/repositories"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type LeaderboardService struct {
	trackRepository *repositories.Repository[models.Track]
	likeRepository  *repositories.Repository[models.Like]
}

func NewLeaderboardService(trackRepo *repositories.Repository[models.Track], likeRepo *repositories.Repository[models.Like]) *LeaderboardService {
	return &LeaderboardService{
		trackRepository: trackRepo,
		likeRepository:  likeRepo,
	}
}

func (s *LeaderboardService) GetLeaderboard(c *gin.Context) ([]dto.LeaderboardEntry, error) {
	// Fetch all likes with user information
	var likes []models.Like
	if err := config.DB.Model(&models.Like{}).
		Preload("User").
		Find(&likes).Error; err != nil {
		log.Println(err)
		return nil, fmt.Errorf("failed to fetch likes: %w", err)
	}

	// Map user IDs to their like counts and user info
	userLikesMap := make(map[uuid.UUID]struct {
		Count int
		User  models.User
	})

	for _, like := range likes {
		entry := userLikesMap[like.UserID]
		entry.Count++
		entry.User = like.User
		userLikesMap[like.UserID] = entry
	}

	// Convert map to slice and sort by like count
	leaderboard := make([]dto.LeaderboardEntry, 0)
	for _, entry := range userLikesMap {
		leaderboard = append(leaderboard, dto.LeaderboardEntry{
			UserID:        entry.User.ID,
			Username:      entry.User.Username,
			ProfilePicURL: entry.User.ProfilePicURL,
			Likes:         entry.Count,
		})
	}

	// Sort leaderboard by likes in descending order
	sort.Slice(leaderboard, func(i, j int) bool {
		return leaderboard[i].Likes > leaderboard[j].Likes
	})

	return leaderboard, nil
}
