package services

import (
	"fmt"
	"log"

	"github.com/VincentBaron/bangr/backend/internal/dto"
	"github.com/VincentBaron/bangr/backend/internal/models"
	"github.com/VincentBaron/bangr/backend/internal/repositories"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type UserService struct {
	userRepository  *repositories.Repository[models.User]
	genreRepository *repositories.Repository[models.Genre]
}

func NewUserService(userRepo *repositories.Repository[models.User], genreRepo *repositories.Repository[models.Genre]) *UserService {
	return &UserService{
		userRepository:  userRepo,
		genreRepository: genreRepo,
	}
}

func (s *UserService) Me(c *gin.Context) (*dto.GetUSerResp, error) {

	userID, err := c.Cookie("UserID")
	if err != nil {
		log.Println(err)
		return nil, fmt.Errorf("failed to get userID: %w", err)
	}

	user, err := s.userRepository.FindByFilter(map[string]interface{}{"id": userID}, "Genres")
	if err != nil {
		log.Println(err)
		return nil, fmt.Errorf("failed to find user: %w", err)
	}
	genres := make([]models.GenreName, 0)
	for _, genre := range user.Genres {
		genres = append(genres, genre.Name)
	}

	if user.ID == uuid.Nil {
		log.Println("User not found")
		return nil, fmt.Errorf("user not found")
	}

	userResp := dto.GetUSerResp{
		ID:            user.ID,
		Username:      user.Username,
		ProfilePicURL: user.ProfilePicURL,
		Genres:        genres,
	}

	return &userResp, nil
}

func (s *UserService) UpdateMe(c *gin.Context, params dto.PatchUserReq) (*dto.GetUSerResp, error) {
	userID, err := c.Cookie("UserID")
	if err != nil {
		log.Println(err)
		return nil, fmt.Errorf("failed to get userID: %w", err)
	}

	user, err := s.userRepository.FindByFilter(map[string]interface{}{"id": userID}, "Genres")
	if err != nil {
		log.Println(err)
		return nil, fmt.Errorf("failed to find user: %w", err)
	}

	user.Username = params.Username

	genres := make([]models.Genre, 0)
	for _, genre := range params.Genres {
		genres = append(genres, models.Genre{Name: genre})
	}
	user.Genres = genres

	if err := s.userRepository.Save(user); err != nil {
		log.Println(err)
		return nil, fmt.Errorf("failed to update user: %w", err)
	}

	genresNames := make([]models.GenreName, 0)
	for _, genre := range user.Genres {
		genresNames = append(genresNames, genre.Name)
	}

	userResp := dto.GetUSerResp{
		ID:            user.ID,
		Username:      user.Username,
		ProfilePicURL: user.ProfilePicURL,
		Genres:        genresNames,
	}

	return &userResp, nil
}

func (s *UserService) GetGenres(c *gin.Context) ([]models.GenreName, error) {
	genres, err := s.genreRepository.FindAllByFilter(map[string]interface{}{})
	if err != nil {
		log.Println(err)
		return nil, fmt.Errorf("failed to get genres: %w", err)
	}

	genresNames := make([]models.GenreName, 0)
	for _, genre := range genres {
		genresNames = append(genresNames, genre.Name)
	}

	return genresNames, nil
}
