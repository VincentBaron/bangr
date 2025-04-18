package services

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log"

	"github.com/VincentBaron/bangr/backend/internal/config"
	"github.com/VincentBaron/bangr/backend/internal/models"
	"github.com/VincentBaron/bangr/backend/internal/repositories"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type GroupService struct {
	groupRepository *repositories.Repository[models.Group]
	userRepository  *repositories.Repository[models.User]
}

func NewGroupService(groupRepo *repositories.Repository[models.Group], userRepo *repositories.Repository[models.User]) *GroupService {
	return &GroupService{
		groupRepository: groupRepo,
		userRepository:  userRepo,
	}
}

func generateInviteCode() (string, error) {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

func (s *GroupService) CreateGroup(c *gin.Context, name string) (*models.Group, error) {
	user := c.MustGet("user").(*models.User)

	inviteCode, err := generateInviteCode()
	if err != nil {
		return nil, fmt.Errorf("failed to generate invite code: %w", err)
	}

	group := &models.Group{
		Name:       name,
		InviteCode: inviteCode,
		Users:      []models.User{*user},
	}

	if err := s.groupRepository.Save(group); err != nil {
		log.Printf("Failed to create group: %v", err)
		return nil, fmt.Errorf("failed to create group: %w", err)
	}

	return group, nil
}

func (s *GroupService) GetUserGroups(c *gin.Context) ([]models.Group, error) {
	user := c.MustGet("user").(*models.User)

	var groups []models.Group
	if err := config.DB.Model(user).Association("Groups").Find(&groups); err != nil {
		log.Printf("Failed to get user groups: %v", err)
		return nil, fmt.Errorf("failed to get user groups: %w", err)
	}

	return groups, nil
}

func (s *GroupService) JoinGroupByInviteCode(c *gin.Context, inviteCode string) error {
	user := c.MustGet("user").(*models.User)

	var group models.Group
	if err := config.DB.Where("invite_code = ?", inviteCode).First(&group).Error; err != nil {
		return fmt.Errorf("invalid invite code: %w", err)
	}

	// Check if user is already in the group
	var count int64
	if err := config.DB.Table("user_groups").
		Where("user_id = ? AND group_id = ?", user.ID, group.ID).
		Count(&count).Error; err != nil {
		return fmt.Errorf("failed to check group membership: %w", err)
	}

	if count > 0 {
		return fmt.Errorf("user is already a member of this group")
	}

	if err := config.DB.Model(&group).Association("Users").Append(user); err != nil {
		return fmt.Errorf("failed to add user to group: %w", err)
	}

	return nil
}

func (s *GroupService) GetGroupByInviteCode(c *gin.Context, inviteCode string) (*models.Group, error) {
	var group models.Group
	if err := config.DB.Where("invite_code = ?", inviteCode).First(&group).Error; err != nil {
		return nil, fmt.Errorf("invalid invite code: %w", err)
	}
	return &group, nil
}

func (s *GroupService) DeleteGroup(c *gin.Context, groupID uuid.UUID) error {
	if err := s.groupRepository.DeleteByID(groupID); err != nil {
		return fmt.Errorf("failed to delete group: %w", err)
	}

	return nil
}
