package dto

import "github.com/google/uuid"

type LeaderboardEntry struct {
	UserID        uuid.UUID `json:"user_id"`
	Username      string    `json:"username"`
	ProfilePicURL string    `json:"profile_pic_url"`
	Likes         int       `json:"likes"`
}

type UpdateLeaderboardReq struct {
	TrackID uuid.UUID `json:"track_id" binding:"required"`
	Likes   int       `json:"likes" binding:"required"`
}
