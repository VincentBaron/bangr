package handlers

import (
	"net/http"

	"github.com/VincentBaron/bangr/backend/internal/services"
	"github.com/gin-gonic/gin"
)

type GroupHandler struct {
	groupService *services.GroupService
}

func NewGroupHandler(groupService *services.GroupService) *GroupHandler {
	return &GroupHandler{
		groupService: groupService,
	}
}

type CreateGroupRequest struct {
	Name string `json:"name" binding:"required"`
}

type CreateGroupResponse struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	InviteCode string `json:"invite_code"`
}

func (h *GroupHandler) CreateGroup(c *gin.Context) {
	var req CreateGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	group, err := h.groupService.CreateGroup(c, req.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, CreateGroupResponse{
		ID:         group.ID.String(),
		Name:       group.Name,
		InviteCode: group.InviteCode,
	})
}

func (h *GroupHandler) GetUserGroups(c *gin.Context) {
	groups, err := h.groupService.GetUserGroups(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, groups)
}

func (h *GroupHandler) JoinGroup(c *gin.Context) {
	inviteCode := c.Param("inviteCode")
	if inviteCode == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invite code is required"})
		return
	}

	if err := h.groupService.JoinGroupByInviteCode(c, inviteCode); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Get the group details to return to the client
	group, err := h.groupService.GetGroupByInviteCode(c, inviteCode)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, group)
}
