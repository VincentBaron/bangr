package models

import (
	"time"

	"github.com/google/uuid"
)

type Set struct {
	ID        uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4()" json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"-"`
	Name      string    `json:"name"`
	Link      string    `json:"link"`
	UserID    uuid.UUID `gorm:"not null" json:"-"`
	User      User      `json:"user"`
	Tracks    []Track   `json:"tracks"`
}

type Track struct {
	ID        uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4()" json:"id"`
	CreatedAt time.Time `json:"-"`
	UpdatedAt time.Time `json:"-"`
	SetID     uuid.UUID `json:"-"`
	Name      string    `json:"name"`
	Artist    string    `json:"artist"`
	URI       string    `json:"uri"`
	Likes     []Like    `json:"likes"`
}

type Like struct {
	ID      uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4()" json:"id"`
	UserID  uuid.UUID `json:"-" gorm:"uniqueIndex:idx_user_track"`
	TrackID uuid.UUID `json:"track_id" gorm:"uniqueIndex:idx_user_track"`
}

type SetDetails struct {
	Tracks []Track `json:"tracks"`
}
