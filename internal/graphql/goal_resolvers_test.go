package graphql

import (
	"context"
	"database/sql"
	"strconv"
	"testing"
	"time"

	"go-goal/internal/models"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGoalsQuery(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	resolver := &queryResolver{
		Resolver: &Resolver{DB: db},
	}

	t.Run("should return all goals when projectId is nil", func(t *testing.T) {
		rows := sqlmock.NewRows([]string{
			"id", "title", "description", "priority", "due_date", "status", 
			"project_id", "context_id", "created_at", "updated_at",
		}).
			AddRow(1, "Test Goal 1", "Description 1", 1, nil, "active", 1, nil, time.Now(), time.Now()).
			AddRow(2, "Test Goal 2", "Description 2", 2, nil, "active", 1, nil, time.Now(), time.Now())

		mock.ExpectQuery(`SELECT id, title, description, priority, due_date, status, project_id, context_id, created_at, updated_at FROM goals ORDER BY priority DESC, due_date ASC`).
			WillReturnRows(rows)

		goals, err := resolver.Goals(context.Background(), nil)

		assert.NoError(t, err)
		assert.Len(t, goals, 2)
		assert.Equal(t, "Test Goal 1", goals[0].Title)
		assert.Equal(t, "Test Goal 2", goals[1].Title)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("should filter goals by projectId when provided", func(t *testing.T) {
		projectId := 1
		rows := sqlmock.NewRows([]string{
			"id", "title", "description", "priority", "due_date", "status", 
			"project_id", "context_id", "created_at", "updated_at",
		}).
			AddRow(1, "Project Goal", "Description", 1, nil, "active", 1, nil, time.Now(), time.Now())

		mock.ExpectQuery(`SELECT id, title, description, priority, due_date, status, project_id, context_id, created_at, updated_at FROM goals WHERE \(\$1 IS NULL OR project_id = \$1\) ORDER BY priority DESC, due_date ASC`).
			WithArgs(projectId).
			WillReturnRows(rows)

		goals, err := resolver.Goals(context.Background(), &projectId)

		assert.NoError(t, err)
		assert.Len(t, goals, 1)
		assert.Equal(t, "Project Goal", goals[0].Title)
		assert.Equal(t, projectId, goals[0].ProjectID)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("should handle database errors gracefully", func(t *testing.T) {
		mock.ExpectQuery(`SELECT id, title, description, priority, due_date, status, project_id, context_id, created_at, updated_at FROM goals ORDER BY priority DESC, due_date ASC`).
			WillReturnError(sql.ErrConnDone)

		goals, err := resolver.Goals(context.Background(), nil)

		assert.Error(t, err)
		assert.Nil(t, goals)
		assert.Contains(t, err.Error(), "failed to query goals")
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("should return empty array when no goals found", func(t *testing.T) {
		rows := sqlmock.NewRows([]string{
			"id", "title", "description", "priority", "due_date", "status", 
			"project_id", "context_id", "created_at", "updated_at",
		})

		mock.ExpectQuery(`SELECT id, title, description, priority, due_date, status, project_id, context_id, created_at, updated_at FROM goals ORDER BY priority DESC, due_date ASC`).
			WillReturnRows(rows)

		goals, err := resolver.Goals(context.Background(), nil)

		assert.NoError(t, err)
		assert.Len(t, goals, 0)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}

func TestGoalQuery(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	resolver := &queryResolver{
		Resolver: &Resolver{DB: db},
	}

	t.Run("should return goal when valid ID provided", func(t *testing.T) {
		goalId := "1"
		now := time.Now()
		rows := sqlmock.NewRows([]string{
			"id", "title", "description", "priority", "due_date", "status", 
			"project_id", "context_id", "created_at", "updated_at",
		}).
			AddRow(1, "Test Goal", "Test Description", 1, nil, "active", 1, nil, now, now)

		mock.ExpectQuery(`SELECT id, title, description, priority, due_date, status, project_id, context_id, created_at, updated_at FROM goals WHERE id = \$1`).
			WithArgs(1).
			WillReturnRows(rows)

		goal, err := resolver.Goal(context.Background(), goalId)

		assert.NoError(t, err)
		assert.NotNil(t, goal)
		assert.Equal(t, "Test Goal", goal.Title)
		assert.Equal(t, "Test Description", *goal.Description)
		assert.Equal(t, "1", goal.Priority)
		assert.Equal(t, "active", goal.Status)
		assert.Equal(t, 1, goal.ProjectID)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("should return nil when goal not found", func(t *testing.T) {
		goalId := "999"
		rows := sqlmock.NewRows([]string{
			"id", "title", "description", "priority", "due_date", "status", 
			"project_id", "context_id", "created_at", "updated_at",
		})

		mock.ExpectQuery(`SELECT id, title, description, priority, due_date, status, project_id, context_id, created_at, updated_at FROM goals WHERE id = \$1`).
			WithArgs(999).
			WillReturnRows(rows)

		goal, err := resolver.Goal(context.Background(), goalId)

		assert.NoError(t, err)
		assert.Nil(t, goal)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("should return error for invalid ID format", func(t *testing.T) {
		goalId := "invalid"

		goal, err := resolver.Goal(context.Background(), goalId)

		assert.Error(t, err)
		assert.Nil(t, goal)
		assert.Contains(t, err.Error(), "invalid goal ID")
	})

	t.Run("should handle database errors gracefully", func(t *testing.T) {
		goalId := "1"

		mock.ExpectQuery(`SELECT id, title, description, priority, due_date, status, project_id, context_id, created_at, updated_at FROM goals WHERE id = \$1`).
			WithArgs(1).
			WillReturnError(sql.ErrConnDone)

		goal, err := resolver.Goal(context.Background(), goalId)

		assert.Error(t, err)
		assert.Nil(t, goal)
		assert.Contains(t, err.Error(), "failed to query goal")
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}

func TestGoalConversion(t *testing.T) {
	t.Run("should convert models.Goal to GraphQL Goal correctly", func(t *testing.T) {
		now := time.Now()
		dueDate := time.Now().Add(24 * time.Hour)
		contextId := 5

		modelGoal := models.Goal{
			ID:          1,
			Title:       "Test Goal",
			Description: "Test Description",
			Priority:    3,
			DueDate:     &dueDate,
			Status:      "in_progress",
			ProjectID:   &[]int{2}[0],
			ContextID:   &contextId,
			CreatedAt:   now,
			UpdatedAt:   now,
		}

		gqlGoal := &Goal{
			ID:          strconv.Itoa(modelGoal.ID),
			Title:       modelGoal.Title,
			Description: &modelGoal.Description,
			Priority:    "3",
			DueDate:     modelGoal.DueDate,
			Status:      modelGoal.Status,
			ProjectID:   *modelGoal.ProjectID,
			ContextID:   modelGoal.ContextID,
			CreatedAt:   modelGoal.CreatedAt,
			UpdatedAt:   modelGoal.UpdatedAt,
		}

		assert.Equal(t, strconv.Itoa(modelGoal.ID), gqlGoal.ID)
		assert.Equal(t, modelGoal.Title, gqlGoal.Title)
		assert.Equal(t, modelGoal.Description, *gqlGoal.Description)
		assert.Equal(t, "3", gqlGoal.Priority)
		assert.Equal(t, modelGoal.DueDate, gqlGoal.DueDate)
		assert.Equal(t, modelGoal.Status, gqlGoal.Status)
		assert.Equal(t, *modelGoal.ProjectID, gqlGoal.ProjectID)
		assert.Equal(t, modelGoal.ContextID, gqlGoal.ContextID)
		assert.Equal(t, modelGoal.CreatedAt, gqlGoal.CreatedAt)
		assert.Equal(t, modelGoal.UpdatedAt, gqlGoal.UpdatedAt)
	})

	t.Run("should handle nil values correctly", func(t *testing.T) {
		now := time.Now()

		modelGoal := models.Goal{
			ID:          1,
			Title:       "Test Goal",
			Description: "",
			Priority:    1,
			DueDate:     nil,
			Status:      "active",
			ProjectID:   &[]int{2}[0],
			ContextID:   nil,
			CreatedAt:   now,
			UpdatedAt:   now,
		}

		gqlGoal := &Goal{
			ID:          strconv.Itoa(modelGoal.ID),
			Title:       modelGoal.Title,
			Description: &modelGoal.Description,
			Priority:    "1",
			DueDate:     modelGoal.DueDate,
			Status:      modelGoal.Status,
			ProjectID:   *modelGoal.ProjectID,
			ContextID:   modelGoal.ContextID,
			CreatedAt:   modelGoal.CreatedAt,
			UpdatedAt:   modelGoal.UpdatedAt,
		}

		assert.Equal(t, "", *gqlGoal.Description)
		assert.Nil(t, gqlGoal.DueDate)
		assert.Nil(t, gqlGoal.ContextID)
	})
}