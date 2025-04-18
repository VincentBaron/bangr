package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Set struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:uuid_generate_v4()"`
	UserID    uuid.UUID
	User      User
	Link      string
	Tracks    []Track `gorm:"many2many:set_tracks;"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
	Dummy     bool
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
	FilePath  string    `json:"filePath"`
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

type SetQueryParams struct {
	GroupID *uuid.UUID `form:"group_id"`
}

type LikeQueryParams struct {
	Liked bool `form:"liked"`
}
