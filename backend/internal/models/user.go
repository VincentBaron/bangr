package models

import (
	"time"

	"github.com/google/uuid"
)

type GenreName string

const (
	Rock       GenreName = "Rock"
	Pop        GenreName = "Pop"
	HipHop     GenreName = "Hip-Hop"
	Jazz       GenreName = "Jazz"
	Classical  GenreName = "Classical"
	Electronic GenreName = "Electronic"
	RnB        GenreName = "R&B"
	Country    GenreName = "Country"
	Reggae     GenreName = "Reggae"
	Metal      GenreName = "Metal"
	Folk       GenreName = "Folk"
	Blues      GenreName = "Blues"
	Indie      GenreName = "Indie"
	Latin      GenreName = "Latin"
	Punk       GenreName = "Punk"
	Soul       GenreName = "Soul"
)

type User struct {
	ID                  uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4()"`
	CreatedAt           time.Time
	UpdatedAt           time.Time
	Username            string `json:"username" gorm:"unique"`
	Password            string `json:"password"`
	Sets                []Set  `gorm:"foreignKey:UserID"`
	SpotifyToken        SpotifyToken
	SpotifyUserID       string  `json:"spotify_user_id"`
	SpotifyPlaylistLink string  `json:"spotify_playlist_link"`
	ProfilePicURL       string  `json:"profilePicURL"`
	Genres              []Genre `gorm:"many2many:user_genres;" json:"genres"`
}

type Genre struct {
	Name      GenreName `json:"name" gorm:"primaryKey"`
	Users     []User    `gorm:"many2many:user_genres;" json:"users"`
	CreatedAt time.Time
	UpdatedAt time.Time
}
