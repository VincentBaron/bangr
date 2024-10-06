package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID                  uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4()"`
	CreatedAt           time.Time
	UpdatedAt           time.Time
	Username            string `json:"username" gorm:"unique"`
	Email               string `json:"email" gorm:"unique"`
	Password            string `json:"password"`
	Sets                []Set  `gorm:"foreignKey:UserID"`
	SpotifyToken        SpotifyToken
	SpotifyUserID       string `json:"spotify_user_id"`
	SpotifyPlaylistLink string `json:"spotify_playlist_link"`
}
