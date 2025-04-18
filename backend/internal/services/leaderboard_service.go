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
	// Create a slice to store the results
	var results []struct {
		UserID        uuid.UUID
		Username      string
		ProfilePicURL string
		LikeCount     int
	}

	// Execute a SQL query that joins likes, tracks, sets, and users to count received likes per user
	if err := config.DB.Table("likes").
		Select("users.id as user_id, users.username, users.profile_pic_url, COUNT(likes.id) as like_count").
		Joins("JOIN tracks ON likes.track_id = tracks.id").
		Joins("JOIN set_tracks ON tracks.id = set_tracks.track_id").
		Joins("JOIN sets ON set_tracks.set_id = sets.id").
		Joins("JOIN users ON sets.user_id = users.id").
		Group("users.id, users.username, users.profile_pic_url").
		Scan(&results).Error; err != nil {
		log.Println(err)
		return nil, fmt.Errorf("failed to fetch leaderboard: %w", err)
	}

	// Convert the results to LeaderboardEntry slice
	leaderboard := make([]dto.LeaderboardEntry, len(results))
	for i, result := range results {
		leaderboard[i] = dto.LeaderboardEntry{
			UserID:        result.UserID,
			Username:      result.Username,
			ProfilePicURL: result.ProfilePicURL,
			Likes:         result.LikeCount,
		}
	}

	// Sort leaderboard by likes in descending order
	sort.Slice(leaderboard, func(i, j int) bool {
		return leaderboard[i].Likes > leaderboard[j].Likes
	})

	return leaderboard, nil
}
