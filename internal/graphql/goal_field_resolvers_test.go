package graphql

import (
	"context"
	"database/sql"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGoalProjectResolver(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	resolver := &goalResolver{
		Resolver: &Resolver{DB: db},
	}

	t.Run("should return associated project when projectID exists", func(t *testing.T) {
		goal := &Goal{
			ID:        "1",
			Title:     "Test Goal",
			ProjectID: 2,
		}

		rows := sqlmock.NewRows([]string{
			"id", "title", "description", "status", "workspace_id", "created_at", "updated_at",
		}).
			AddRow(2, "Test Project", "Description", "active", 1, time.Now(), time.Now())

		mock.ExpectQuery(`SELECT id, title, description, status, workspace_id, created_at, updated_at FROM projects WHERE id = \$1`).
			WithArgs(2).
			WillReturnRows(rows)

		project, err := resolver.Project(context.Background(), goal)

		assert.NoError(t, err)
		assert.NotNil(t, project)
		assert.Equal(t, "2", project.ID)
		assert.Equal(t, "Test Project", project.Title)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("should return error when project not found", func(t *testing.T) {
		goal := &Goal{
			ID:        "1",
			Title:     "Test Goal",
			ProjectID: 999,
		}

		rows := sqlmock.NewRows([]string{
			"id", "title", "description", "status", "workspace_id", "created_at", "updated_at",
		})

		mock.ExpectQuery(`SELECT id, title, description, status, workspace_id, created_at, updated_at FROM projects WHERE id = \$1`).
			WithArgs(999).
			WillReturnRows(rows)

		project, err := resolver.Project(context.Background(), goal)

		assert.Error(t, err)
		assert.Nil(t, project)
		assert.Contains(t, err.Error(), "project with ID 999 not found")
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("should handle database errors gracefully", func(t *testing.T) {
		goal := &Goal{
			ID:        "1",
			Title:     "Test Goal",
			ProjectID: 2,
		}

		mock.ExpectQuery(`SELECT id, title, description, status, workspace_id, created_at, updated_at FROM projects WHERE id = \$1`).
			WithArgs(2).
			WillReturnError(sql.ErrConnDone)

		project, err := resolver.Project(context.Background(), goal)

		assert.Error(t, err)
		assert.Nil(t, project)
		assert.Contains(t, err.Error(), "failed to fetch project")
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}

func TestGoalFlowResolver(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	resolver := &goalResolver{
		Resolver: &Resolver{DB: db},
	}

	t.Run("should return associated flow when flowID exists", func(t *testing.T) {
		flowID := 3
		goal := &Goal{
			ID:     "1",
			Title:  "Test Goal",
			FlowID: &flowID,
		}

		rows := sqlmock.NewRows([]string{
			"id", "title", "description", "color", "status", "start_date", "end_date", 
			"parent_id", "workspace_id", "created_at", "updated_at",
		}).
			AddRow(3, "Test Flow", "Description", "#FF0000", "active", nil, nil, nil, 1, time.Now(), time.Now())

		mock.ExpectQuery(`SELECT id, title, description, color, status, start_date, end_date, parent_id, workspace_id, created_at, updated_at FROM flows WHERE id = \$1`).
			WithArgs(3).
			WillReturnRows(rows)

		flow, err := resolver.Flow(context.Background(), goal)

		assert.NoError(t, err)
		assert.NotNil(t, flow)
		assert.Equal(t, "3", flow.ID)
		assert.Equal(t, "Test Flow", flow.Title)
		assert.Equal(t, "#FF0000", flow.Color)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("should return nil when flowID is nil", func(t *testing.T) {
		goal := &Goal{
			ID:     "1",
			Title:  "Test Goal",
			FlowID: nil,
		}

		flow, err := resolver.Flow(context.Background(), goal)

		assert.NoError(t, err)
		assert.Nil(t, flow)
	})

	t.Run("should return nil when flow not found", func(t *testing.T) {
		flowID := 999
		goal := &Goal{
			ID:     "1",
			Title:  "Test Goal",
			FlowID: &flowID,
		}

		rows := sqlmock.NewRows([]string{
			"id", "title", "description", "color", "status", "start_date", "end_date", 
			"parent_id", "workspace_id", "created_at", "updated_at",
		})

		mock.ExpectQuery(`SELECT id, title, description, color, status, start_date, end_date, parent_id, workspace_id, created_at, updated_at FROM flows WHERE id = \$1`).
			WithArgs(999).
			WillReturnRows(rows)

		flow, err := resolver.Flow(context.Background(), goal)

		assert.NoError(t, err)
		assert.Nil(t, flow)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}

func TestGoalTasksResolver(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	resolver := &goalResolver{
		Resolver: &Resolver{DB: db},
	}

	t.Run("should return associated tasks ordered by priority and due date", func(t *testing.T) {
		goal := &Goal{
			ID:    "1",
			Title: "Test Goal",
		}

		rows := sqlmock.NewRows([]string{
			"id", "title", "description", "status", "priority", "due_date", 
			"goal_id", "project_id", "context_id", "created_at", "updated_at",
		}).
			AddRow(1, "Task 1", "Description 1", "pending", 1, nil, 1, 2, nil, time.Now(), time.Now()).
			AddRow(2, "Task 2", "Description 2", "in_progress", 2, nil, 1, 2, nil, time.Now(), time.Now())

		mock.ExpectQuery(`SELECT id, title, description, status, priority, due_date, goal_id, project_id, context_id, created_at, updated_at FROM tasks WHERE goal_id = \$1 ORDER BY priority DESC, due_date ASC`).
			WithArgs(1).
			WillReturnRows(rows)

		tasks, err := resolver.Tasks(context.Background(), goal)

		assert.NoError(t, err)
		assert.Len(t, tasks, 2)
		assert.Equal(t, "1", tasks[0].ID)
		assert.Equal(t, "Task 1", tasks[0].Title)
		assert.Equal(t, "2", tasks[1].ID)
		assert.Equal(t, "Task 2", tasks[1].Title)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("should return empty array when no tasks found", func(t *testing.T) {
		goal := &Goal{
			ID:    "1",
			Title: "Test Goal",
		}

		rows := sqlmock.NewRows([]string{
			"id", "title", "description", "status", "priority", "due_date", 
			"goal_id", "project_id", "context_id", "created_at", "updated_at",
		})

		mock.ExpectQuery(`SELECT id, title, description, status, priority, due_date, goal_id, project_id, context_id, created_at, updated_at FROM tasks WHERE goal_id = \$1 ORDER BY priority DESC, due_date ASC`).
			WithArgs(1).
			WillReturnRows(rows)

		tasks, err := resolver.Tasks(context.Background(), goal)

		assert.NoError(t, err)
		assert.Len(t, tasks, 0)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}

func TestGoalTagsResolver(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	resolver := &goalResolver{
		Resolver: &Resolver{DB: db},
	}

	t.Run("should return associated tags via many-to-many relationship", func(t *testing.T) {
		goal := &Goal{
			ID:    "1",
			Title: "Test Goal",
		}

		rows := sqlmock.NewRows([]string{
			"id", "name", "color", "parent_id", "created_at",
		}).
			AddRow(1, "urgent", "#FF0000", nil, time.Now()).
			AddRow(2, "work", "#00FF00", nil, time.Now())

		mock.ExpectQuery(`SELECT t\.id, t\.name, t\.color, t\.parent_id, t\.created_at FROM tags t JOIN goal_tags gt ON t\.id = gt\.tag_id WHERE gt\.goal_id = \$1 ORDER BY t\.name`).
			WithArgs(1).
			WillReturnRows(rows)

		tags, err := resolver.Tags(context.Background(), goal)

		assert.NoError(t, err)
		assert.Len(t, tags, 2)
		assert.Equal(t, "1", tags[0].ID)
		assert.Equal(t, "urgent", tags[0].Name)
		assert.Equal(t, "#FF0000", tags[0].Color)
		assert.Equal(t, "2", tags[1].ID)
		assert.Equal(t, "work", tags[1].Name)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("should return empty array when no tags found", func(t *testing.T) {
		goal := &Goal{
			ID:    "1",
			Title: "Test Goal",
		}

		rows := sqlmock.NewRows([]string{
			"id", "name", "color", "parent_id", "created_at",
		})

		mock.ExpectQuery(`SELECT t\.id, t\.name, t\.color, t\.parent_id, t\.created_at FROM tags t JOIN goal_tags gt ON t\.id = gt\.tag_id WHERE gt\.goal_id = \$1 ORDER BY t\.name`).
			WithArgs(1).
			WillReturnRows(rows)

		tags, err := resolver.Tags(context.Background(), goal)

		assert.NoError(t, err)
		assert.Len(t, tags, 0)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}

func TestGoalNotesResolver(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	resolver := &goalResolver{
		Resolver: &Resolver{DB: db},
	}

	t.Run("should return associated notes filtered by entity type and id", func(t *testing.T) {
		goal := &Goal{
			ID:    "1",
			Title: "Test Goal",
		}

		rows := sqlmock.NewRows([]string{
			"id", "title", "content", "entity_type", "entity_id", "created_at", "updated_at",
		}).
			AddRow(1, "Note 1", "Content 1", "goal", 1, time.Now(), time.Now()).
			AddRow(2, "Note 2", "Content 2", "goal", 1, time.Now(), time.Now())

		mock.ExpectQuery(`SELECT id, title, content, entity_type, entity_id, created_at, updated_at FROM notes WHERE entity_type = \$1 AND entity_id = \$2 ORDER BY created_at DESC`).
			WithArgs("goal", 1).
			WillReturnRows(rows)

		notes, err := resolver.Notes(context.Background(), goal)

		assert.NoError(t, err)
		assert.Len(t, notes, 2)
		assert.Equal(t, "1", notes[0].ID)
		assert.Equal(t, "Note 1", notes[0].Title)
		assert.Equal(t, "Content 1", notes[0].Content)
		assert.Equal(t, "2", notes[1].ID)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("should return empty array when no notes found", func(t *testing.T) {
		goal := &Goal{
			ID:    "1",
			Title: "Test Goal",
		}

		rows := sqlmock.NewRows([]string{
			"id", "title", "content", "entity_type", "entity_id", "created_at", "updated_at",
		})

		mock.ExpectQuery(`SELECT id, title, content, entity_type, entity_id, created_at, updated_at FROM notes WHERE entity_type = \$1 AND entity_id = \$2 ORDER BY created_at DESC`).
			WithArgs("goal", 1).
			WillReturnRows(rows)

		notes, err := resolver.Notes(context.Background(), goal)

		assert.NoError(t, err)
		assert.Len(t, notes, 0)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}