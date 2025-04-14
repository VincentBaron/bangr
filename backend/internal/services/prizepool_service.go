package services

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/VincentBaron/bangr/backend/internal/config"
	"github.com/VincentBaron/bangr/backend/internal/models"
	"github.com/VincentBaron/bangr/backend/internal/repositories"
)

type PrizePoolService struct {
	userRepository *repositories.Repository[models.User]
}

func NewPrizePoolService(userRepo *repositories.Repository[models.User]) *PrizePoolService {
	return &PrizePoolService{
		userRepository: userRepo,
	}
}

type Supporter struct {
	SupportCreatedOn   customTime `json:"support_created_on"`
	SupportUpdatedOn   customTime `json:"support_updated_on"`
	SupporterName      string     `json:"supporter_name"`
	SupportCoffeePrice string     `json:"support_coffee_price"`
	SupportCurrency    string     `json:"support_currency"`
}

type customTime time.Time

func (ct *customTime) UnmarshalJSON(b []byte) error {
	s := string(b)
	// Remove quotes
	s = s[1 : len(s)-1]
	t, err := time.Parse("2006-01-02 15:04:05", s)
	if err != nil {
		return err
	}
	*ct = customTime(t)
	return nil
}

func (ct customTime) Time() time.Time {
	return time.Time(ct)
}

type BuyMeACoffeeResponse struct {
	CurrentPage int         `json:"current_page"`
	Data        []Supporter `json:"data"`
}

type PrizePool struct {
	CurrentMonth float64 `json:"current_month"`
	NextMonth    float64 `json:"next_month"`
}

func (s *PrizePoolService) GetPrizePool() (*PrizePool, error) {
	client := &http.Client{}
	req, err := http.NewRequest("GET", "https://developers.buymeacoffee.com/api/v1/supporters", nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+config.Conf.BuyMeACoffeeAPIKey)
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch supporters: %w", err)
	}
	defer resp.Body.Close()

	var response BuyMeACoffeeResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	now := time.Now()
	// Get the first day of last month
	lastMonthStart := time.Date(now.Year(), now.Month()-1, 1, 0, 0, 0, 0, time.UTC)
	// Get the last day of last month
	lastMonthEnd := lastMonthStart.AddDate(0, 1, -1)
	// Get the first day of this month
	thisMonthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)

	var currentMonthTotal, nextMonthTotal float64

	for _, supporter := range response.Data {
		// If the contribution was made between 1st and last day of last month
		if supporter.SupportCreatedOn.Time().After(lastMonthStart) && supporter.SupportCreatedOn.Time().Before(lastMonthEnd.AddDate(0, 0, 1)) {
			// Convert the coffee price string to float64
			var amount float64
			fmt.Sscanf(supporter.SupportCoffeePrice, "%f", &amount)
			currentMonthTotal += amount
		}
		// If the contribution was made from the 1st of this month onwards
		if supporter.SupportCreatedOn.Time().After(thisMonthStart) {
			// Convert the coffee price string to float64
			var amount float64
			fmt.Sscanf(supporter.SupportCoffeePrice, "%f", &amount)
			nextMonthTotal += amount
		}
	}

	return &PrizePool{
		CurrentMonth: currentMonthTotal,
		NextMonth:    nextMonthTotal,
	}, nil
}
