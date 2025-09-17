package graphql

import (
	"context"
	"database/sql"
	"fmt"
	"strconv"
	"time"

	"go-goal/internal/models"
)

func (r *queryResolver) Projects(ctx context.Context, workspaceID *int) ([]*models.Project, error) {
	var query string
	var args []interface{}
	
	if workspaceID != nil {
		query = `SELECT id, title, description, status, workspace_id, created_at, updated_at 
				 FROM projects WHERE workspace_id = $1 ORDER BY created_at DESC`
		args = append(args, *workspaceID)
	} else {
		query = `SELECT id, title, description, status, workspace_id, created_at, updated_at 
				 FROM projects ORDER BY created_at DESC`
	}
	
	rows, err := r.DB.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch projects: %w", err)
	}
	defer rows.Close()

	var projects []*models.Project
	for rows.Next() {
		var p models.Project
		err := rows.Scan(&p.ID, &p.Title, &p.Description, &p.Status, &p.WorkspaceID, &p.CreatedAt, &p.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan project: %w", err)
		}
		projects = append(projects, &p)
	}

	return projects, nil
}

func (r *queryResolver) Project(ctx context.Context, id string) (*models.Project, error) {
	projectID, err := strconv.Atoi(id)
	if err != nil {
		return nil, fmt.Errorf("invalid project ID: %w", err)
	}

	var p models.Project
	err = r.DB.QueryRow(`
		SELECT id, title, description, status, workspace_id, created_at, updated_at 
		FROM projects WHERE id = $1
	`, projectID).Scan(&p.ID, &p.Title, &p.Description, &p.Status, &p.WorkspaceID, &p.CreatedAt, &p.UpdatedAt)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("project not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to fetch project: %w", err)
	}

	return &p, nil
}

func (r *mutationResolver) CreateProject(ctx context.Context, input CreateProjectInput) (*models.Project, error) {
	var p models.Project
	now := time.Now()
	
	err := r.DB.QueryRow(`
		INSERT INTO projects (title, description, status, workspace_id, created_at, updated_at) 
		VALUES ($1, $2, $3, $4, $5, $6) 
		RETURNING id, title, description, status, workspace_id, created_at, updated_at
	`, input.Title, input.Description, input.Status, input.WorkspaceID, now, now).Scan(
		&p.ID, &p.Title, &p.Description, &p.Status, &p.WorkspaceID, &p.CreatedAt, &p.UpdatedAt)

	if err != nil {
		return nil, fmt.Errorf("failed to create project: %w", err)
	}

	return &p, nil
}

func (r *mutationResolver) UpdateProject(ctx context.Context, id string, input UpdateProjectInput) (*models.Project, error) {
	projectID, err := strconv.Atoi(id)
	if err != nil {
		return nil, fmt.Errorf("invalid project ID: %w", err)
	}

	// Build dynamic update query
	query := "UPDATE projects SET updated_at = $1"
	args := []interface{}{time.Now()}
	argIndex := 2

	if input.Title != nil {
		query += fmt.Sprintf(", title = $%d", argIndex)
		args = append(args, *input.Title)
		argIndex++
	}
	if input.Description != nil {
		query += fmt.Sprintf(", description = $%d", argIndex)
		args = append(args, *input.Description)
		argIndex++
	}
	if input.Status != nil {
		query += fmt.Sprintf(", status = $%d", argIndex)
		args = append(args, *input.Status)
		argIndex++
	}
	if input.WorkspaceID != nil {
		query += fmt.Sprintf(", workspace_id = $%d", argIndex)
		args = append(args, *input.WorkspaceID)
		argIndex++
	}

	query += fmt.Sprintf(" WHERE id = $%d RETURNING id, title, description, status, workspace_id, created_at, updated_at", argIndex)
	args = append(args, projectID)

	var p models.Project
	err = r.DB.QueryRow(query, args...).Scan(
		&p.ID, &p.Title, &p.Description, &p.Status, &p.WorkspaceID, &p.CreatedAt, &p.UpdatedAt)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("project not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to update project: %w", err)
	}

	return &p, nil
}

func (r *mutationResolver) DeleteProject(ctx context.Context, id string) (bool, error) {
	projectID, err := strconv.Atoi(id)
	if err != nil {
		return false, fmt.Errorf("invalid project ID: %w", err)
	}

	result, err := r.DB.Exec("DELETE FROM projects WHERE id = $1", projectID)
	if err != nil {
		return false, fmt.Errorf("failed to delete project: %w", err)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return false, fmt.Errorf("project not found")
	}

	return true, nil
}

// Field resolvers for Project type
func (r *projectResolver) Goals(ctx context.Context, obj *models.Project) ([]*models.Goal, error) {
	rows, err := r.DB.Query(`
		SELECT id, title, description, priority, due_date, status, project_id, created_at, updated_at 
		FROM goals WHERE project_id = $1 ORDER BY created_at DESC
	`, obj.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch goals: %w", err)
	}
	defer rows.Close()

	var goals []*models.Goal
	for rows.Next() {
		var g models.Goal
		err := rows.Scan(&g.ID, &g.Title, &g.Description, &g.Priority, &g.DueDate, &g.Status, &g.ProjectID, &g.CreatedAt, &g.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan goal: %w", err)
		}
		goals = append(goals, &g)
	}

	return goals, nil
}

func (r *projectResolver) Tasks(ctx context.Context, obj *models.Project) ([]*models.Task, error) {
	rows, err := r.DB.Query(`
		SELECT id, title, description, status, priority, due_date, goal_id, project_id, created_at, updated_at 
		FROM tasks WHERE project_id = $1 ORDER BY created_at DESC
	`, obj.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch tasks: %w", err)
	}
	defer rows.Close()

	var tasks []*models.Task
	for rows.Next() {
		var t models.Task
		err := rows.Scan(&t.ID, &t.Title, &t.Description, &t.Status, &t.Priority, &t.DueDate, &t.GoalID, &t.ProjectID, &t.CreatedAt, &t.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan task: %w", err)
		}
		tasks = append(tasks, &t)
	}

	return tasks, nil
}

func (r *projectResolver) Notes(ctx context.Context, obj *models.Project) ([]*models.Note, error) {
	rows, err := r.DB.Query(`
		SELECT id, title, content, entity_type, entity_id, created_at, updated_at 
		FROM notes WHERE entity_type = 'project' AND entity_id = $1 ORDER BY created_at DESC
	`, obj.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch notes: %w", err)
	}
	defer rows.Close()

	var notes []*models.Note
	for rows.Next() {
		var n models.Note
		err := rows.Scan(&n.ID, &n.Title, &n.Content, &n.EntityType, &n.EntityID, &n.CreatedAt, &n.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan note: %w", err)
		}
		notes = append(notes, &n)
	}

	return notes, nil
}

func (r *projectResolver) Tags(ctx context.Context, obj *models.Project) ([]*models.Tag, error) {
	rows, err := r.DB.Query(`
		SELECT t.id, t.name, t.color, t.parent_id, t.created_at, t.updated_at
		FROM tags t
		JOIN taggings tg ON t.id = tg.tag_id
		WHERE tg.entity_type = 'project' AND tg.entity_id = $1
		ORDER BY t.name
	`, obj.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch tags: %w", err)
	}
	defer rows.Close()

	var tags []*models.Tag
	for rows.Next() {
		var tag models.Tag
		err := rows.Scan(&tag.ID, &tag.Name, &tag.Color, &tag.ParentID, &tag.CreatedAt, &tag.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan tag: %w", err)
		}
		tags = append(tags, &tag)
	}

	return tags, nil
}
