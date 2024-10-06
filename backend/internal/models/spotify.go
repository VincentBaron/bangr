package models

import (
	"time"

	"gorm.io/gorm"
)

type SpotifyToken struct {
	gorm.Model
	UserID       uint      `gorm:"notnull;unique"` // Ensure uniqueness if one-to-one
	AccessToken  string    `json:"access_token"`
	RefreshToken string    `json:"refresh_token"`
	Expiry       time.Time `json:"expiry"`
}

type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}
