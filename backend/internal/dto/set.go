package dto

import (
	"github.com/google/uuid"
)

type GetSetResp struct {
	ID            uuid.UUID      `json:"id"`
	Link          string         `json:"link"`
	Tracks        []GetTrackResp `json:"tracks"`
	Username      string         `json:"username"`
	ProfilePicURL string         `json:"profilePicURL"`
}

type GetTrackResp struct {
	ID       uuid.UUID `json:"id"`
	URI      string    `json:"uri"`
	Name     string    `json:"name"`
	Artist   string    `json:"artist"`
	Liked    bool      `json:"liked"`
	Likes    int       `json:"likes"`
	ImgURL   string    `json:"img_url"`
	FilePath string    `json:"file_path"`
}
