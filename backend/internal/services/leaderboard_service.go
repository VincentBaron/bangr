package services

import (
	"fmt"
	"log"

	"github.com/VincentBaron/bangr/backend/internal/config"
	"github.com/VincentBaron/bangr/backend/internal/dto"
	"github.com/VincentBaron/bangr/backend/internal/models"
	"github.com/VincentBaron/bangr/backend/internal/repositories"
	"github.com/gin-gonic/gin"
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
	user := c.MustGet("user").(*models.User)
	// Fetch all tracks
	tracks, err := s.trackRepository.FindAllByFilter(map[string]interface{}{}, "Likes DESC")
	if err != nil {
		log.Println(err)
		return nil, fmt.Errorf("failed to fetch leaderboard: %w", err)
	}

	// Fetch likes for all tracks
	// Get user likes
	var likes []models.Like
	config.DB.Model(&models.Like{}).Where("user_id = ?", user.ID).Find(&likes)

	// Map track IDs to their like counts
	trackLikesCountMap := make(map[string]int)
	for _, like := range likes {
		trackLikesCountMap[like.TrackID.String()]++
	}

	// Map tracks to leaderboard entries
	leaderboard := make([]dto.LeaderboardEntry, 0)
	for _, track := range tracks {
		leaderboard = append(leaderboard, dto.LeaderboardEntry{
			TrackID:    track.ID,
			TrackName:  track.Name,
			ArtistName: track.Artist,
			Likes:      trackLikesCountMap[track.ID.String()], // Total likes for the track
		})
	}

	return leaderboard, nil
}

// func (s *LeaderboardService) UpdateLeaderboard(c *gin.Context, params dto.UpdateLeaderboardReq) (*dto.LeaderboardEntry, error) {
// 	// Find the track by ID
// 	track, err := s.trackRepository.FindByFilter(map[string]interface{}{"id": params.TrackID})
// 	if err != nil {
// 		log.Println(err)
// 		return nil, fmt.Errorf("failed to find track: %w", err)
// 	}

// 	// Update the track's likes
// 	track.Likes = params.Likes
// 	if err := s.trackRepository.Save(track); err != nil {
// 		log.Println(err)
// 		return nil, fmt.Errorf("failed to update leaderboard: %w", err)
// 	}

// 	// Return the updated leaderboard entry
// 	leaderboardEntry := dto.LeaderboardEntry{
// 		TrackID:    track.ID,
// 		TrackName:  track.Name,
// 		ArtistName: track.ArtistName,
// 		Likes:      track.Likes,
// 	}

// 	return &leaderboardEntry, nil
// }

func (s *LeaderboardService) GetTopTracks(c *gin.Context) ([]dto.LeaderboardEntry, error) {
	user := c.MustGet("user").(*models.User)
	// Fetch top 10 tracks sorted by likes in descending order
	tracks, err := s.trackRepository.FindAllByFilter(map[string]interface{}{})
	if err != nil {
		return nil, fmt.Errorf("error fetching existing tracks: %w", err)
	}

	// Get user likes
	var likes []models.Like
	config.DB.Model(&models.Like{}).Where("user_id = ?", user.ID).Find(&likes)

	// Map track IDs to their like counts
	trackLikesCountMap := make(map[string]int)
	for _, like := range likes {
		trackLikesCountMap[like.TrackID.String()]++
	}

	// Map tracks to leaderboard entries
	topTracks := make([]dto.LeaderboardEntry, 0)
	for _, track := range tracks {
		topTracks = append(topTracks, dto.LeaderboardEntry{
			TrackID:    track.ID,
			TrackName:  track.Name,
			ArtistName: track.Artist,
			Likes:      trackLikesCountMap[track.ID.String()], // Total likes for the track
		})
	}

	return topTracks, nil
}
