package models

import "gorm.io/gorm"

type Set struct {
	gorm.Model
	Link   string `json:"link"`
	UserID uint   `gorm:"not null"`
}

type SetDetails struct {
	Tracks []string `json:"tracks"`
}
