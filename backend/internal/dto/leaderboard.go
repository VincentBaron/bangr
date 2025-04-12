package dto

import "github.com/google/uuid"

type LeaderboardEntry struct {
	TrackID    uuid.UUID `json:"track_id"`
	TrackName  string    `json:"track_name"`
	ArtistName string    `json:"artist_name"`
	Likes      int       `json:"likes"`
}

type UpdateLeaderboardReq struct {
	TrackID uuid.UUID `json:"track_id" binding:"required"`
	Likes   int       `json:"likes" binding:"required"`
}
