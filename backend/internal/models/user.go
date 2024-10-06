package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Username      string       `json:"username" gorm:"unique"`
	Email         string       `json:"email" gorm:"unique"`
	Password      string       `json:"password"`
	Sets          []Set        `gorm:"foreignKey:UserID"`
	SpotifyToken  SpotifyToken `gorm:"references:ID"`
	SpotifyUserID string       `json:"spotify_user_id"`
}
