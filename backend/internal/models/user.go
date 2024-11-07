package models

import (
	"time"

	"github.com/google/uuid"
)

type Genre string

const (
	Rock       Genre = "Rock"
	Pop        Genre = "Pop"
	HipHop     Genre = "Hip-Hop"
	Jazz       Genre = "Jazz"
	Classical  Genre = "Classical"
	Electronic Genre = "Electronic"
	RnB        Genre = "R&B"
	Country    Genre = "Country"
	Reggae     Genre = "Reggae"
	Metal      Genre = "Metal"
	Folk       Genre = "Folk"
	Blues      Genre = "Blues"
	Indie      Genre = "Indie"
	Latin      Genre = "Latin"
	Punk       Genre = "Punk"
	Soul       Genre = "Soul"
)

type User struct {
	ID                  uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4()"`
	CreatedAt           time.Time
	UpdatedAt           time.Time
	Username            string `json:"username" gorm:"unique"`
	Password            string `json:"password"`
	Sets                []Set  `gorm:"foreignKey:UserID"`
	SpotifyToken        SpotifyToken
	SpotifyUserID       string   `json:"spotify_user_id"`
	SpotifyPlaylistLink string   `json:"spotify_playlist_link"`
	ProfilePicURL       string   `json:"profilePicURL"`
	Genres              []string `gorm:"type:text[]" json:"genres"`
}
