package repositories

import (
	"github.com/VincentBaron/bangr/backend/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Repository[T any] struct {
	db *gorm.DB
}

func NewRepository[T any](db *gorm.DB) *Repository[T] {
	return &Repository[T]{db: db}
}

func (r *Repository[T]) FindByFilter(filter map[string]interface{}, preload ...string) (*T, error) {
	var entity T
	query := r.db.Where(filter)
	for _, p := range preload {
		query = query.Preload(p)
	}
	if err := query.First(&entity).Error; err != nil {
		return nil, err
	}
	return &entity, nil
}

func (r *Repository[T]) FindAllByFilter(filter map[string]interface{}, preload ...string) ([]T, error) {
	var entities []T
	query := r.db.Where(filter)
	for _, p := range preload {
		query = query.Preload(p)
	}
	if err := query.Find(&entities).Error; err != nil {
		return nil, err
	}
	return entities, nil
}

func (r *Repository[T]) Save(entity *T) error {
	return r.db.Save(entity).Error
}

func (r *Repository[T]) DeleteByID(id uuid.UUID) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Find the user
		var entity T
		if err := tx.Where("id = ?", id).First(&entity).Error; err != nil {
			return err
		}

		// Delete associated SpotifyToken
		if err := tx.Where("user_id = ?", id).Delete(&models.SpotifyToken{}).Error; err != nil {
			return err
		}

		// Delete associated genres (from the join table)
		if err := tx.Exec("DELETE FROM user_genres WHERE user_id = ?", id).Error; err != nil {
			return err
		}

		// Finally, delete the user
		if err := tx.Delete(&entity).Error; err != nil {
			return err
		}

		return nil
	})
}
