package models

type PlayerAction string

const (
	PlayerActionPlay  PlayerAction = "play"
	PlayerActionPause PlayerAction = "pause"
	PlayerActionNext  PlayerAction = "next"
	PlayerActionPrev  PlayerAction = "prev"
	PlayerActionCurr  PlayerAction = "curr"
)

type HandlerPlayerQueryParams struct {
	Action PlayerAction `form:"action"`
	Link   string       `form:"link"`
}
