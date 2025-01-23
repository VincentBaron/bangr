package models

import "github.com/zmb3/spotify/v2"

type PlayerAction string

const (
	PlayerActionPlay  PlayerAction = "play"
	PlayerActionPause PlayerAction = "pause"
	PlayerActionNext  PlayerAction = "next"
	PlayerActionPrev  PlayerAction = "prev"
	PlayerActionCurr  PlayerAction = "curr"
	PLayerActivate    PlayerAction = "activate"
)

type HandlerPlayerQueryParams struct {
	Action       PlayerAction `form:"action"`
	Link         string       `form:"link"`
	URIs         []string     `form:"uris"`
	PlaylistLink string       `form:"playlist_link"`
	DeviceID     spotify.ID   `form:"device_id"`
}
