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
	Tracks    []Track   `gorm:"many2many:set_tracks;" json:"tracks"`
	Dummy     bool      `json:"dummy"`
}

type Track struct {
	ID        uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4()" json:"id"`
	CreatedAt time.Time `json:"-"`
	UpdatedAt time.Time `json:"-"`
	Sets      []Set     `gorm:"many2many:set_tracks" json:"-"`
	Name      string    `json:"name"`
	Artist    string    `json:"artist"`
	URI       string    `json:"uri"`
	Likes     []Like    `json:"likes"`
	ImgURL    string    `json:"imgURL"`
}

type Like struct {
	ID        uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4()" json:"id"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	UserID    uuid.UUID `json:"-" gorm:"uniqueIndex:idx_user_track"`
	User      User      `json:"user"`
	TrackID   uuid.UUID `json:"track_id" gorm:"uniqueIndex:idx_user_track"`
}

type SetDetails struct {
	Tracks []Track `json:"tracks"`
}

type LikeQueryParams struct {
	Liked bool `form:"liked"`
}
