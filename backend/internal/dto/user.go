package dto

import (
	"github.com/VincentBaron/bangr/backend/internal/models"
	"github.com/google/uuid"
)

type PostUserReq struct {
	Username string   `json:"username"`
	Password string   `json:"password"`
	Genres   []string `json:"genres"`
}

type GetUSerResp struct {
	ID            uuid.UUID          `json:"id"`
	Username      string             `json:"username"`
	Genres        []models.GenreName `json:"genres"`
	ProfilePicURL string             `json:"profile_pic_url"`
}

type PatchUserReq struct {
	Username string             `json:"username"`
	Genres   []models.GenreName `json:"genres"`
}
