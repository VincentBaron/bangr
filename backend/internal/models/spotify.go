package models

import (
	"time"

	"github.com/google/uuid"
)

type SpotifyToken struct {
	ID           uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4()"`
	CreatedAt    time.Time
	UpdatedAt    time.Time
	UserID       uuid.UUID
	AccessToken  string    `json:"access_token"`
	RefreshToken string    `json:"refresh_token"`
	Expiry       time.Time `json:"expiry"`
}

type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}
