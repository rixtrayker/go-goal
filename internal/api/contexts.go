package api

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"go-goal/internal/models"

	"github.com/gorilla/mux"
)

type ContextHandler struct {
	DB *sql.DB
}

func (h *ContextHandler) GetContexts(w http.ResponseWriter, r *http.Request) {
	workspaceID := r.URL.Query().Get("workspace_id")
	
	var query string
	var args []interface{}
	
	if workspaceID != "" {
		query = `
			SELECT id, title, description, color, status, start_date, end_date, parent_id, workspace_id, created_at, updated_at 
			FROM contexts 
			WHERE workspace_id = $1
			ORDER BY created_at DESC
		`
		args = append(args, workspaceID)
	} else {
		query = `
			SELECT id, title, description, color, status, start_date, end_date, parent_id, workspace_id, created_at, updated_at 
			FROM contexts 
			ORDER BY created_at DESC
		`
	}

	rows, err := h.DB.Query(query, args...)
	if err != nil {
		http.Error(w, "Failed to fetch contexts", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var contexts []models.Context
	for rows.Next() {
		var c models.Context
		err := rows.Scan(&c.ID, &c.Title, &c.Description, &c.Color, &c.Status, &c.StartDate, &c.EndDate, &c.ParentID, &c.WorkspaceID, &c.CreatedAt, &c.UpdatedAt)
		if err != nil {
			http.Error(w, "Failed to scan context", http.StatusInternalServerError)
			return
		}
		contexts = append(contexts, c)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(contexts)
}

func (h *ContextHandler) GetContext(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid context ID", http.StatusBadRequest)
		return
	}

	var c models.Context
	err = h.DB.QueryRow(`
		SELECT id, title, description, color, status, start_date, end_date, parent_id, workspace_id, created_at, updated_at 
		FROM contexts WHERE id = $1
	`, id).Scan(&c.ID, &c.Title, &c.Description, &c.Color, &c.Status, &c.StartDate, &c.EndDate, &c.ParentID, &c.WorkspaceID, &c.CreatedAt, &c.UpdatedAt)

	if err == sql.ErrNoRows {
		http.Error(w, "Context not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "Failed to fetch context", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(c)
}

func (h *ContextHandler) CreateContext(w http.ResponseWriter, r *http.Request) {
	var c models.Context
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	err := h.DB.QueryRow(`
		INSERT INTO contexts (title, description, color, status, start_date, end_date, parent_id, workspace_id) 
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
		RETURNING id, created_at, updated_at
	`, c.Title, c.Description, c.Color, c.Status, c.StartDate, c.EndDate, c.ParentID, c.WorkspaceID).Scan(&c.ID, &c.CreatedAt, &c.UpdatedAt)

	if err != nil {
		http.Error(w, "Failed to create context", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(c)
}

func (h *ContextHandler) UpdateContext(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid context ID", http.StatusBadRequest)
		return
	}

	var c models.Context
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	c.ID = id
	err = h.DB.QueryRow(`
		UPDATE contexts 
		SET title = $2, description = $3, color = $4, status = $5, start_date = $6, end_date = $7, parent_id = $8, workspace_id = $9
		WHERE id = $1 
		RETURNING updated_at
	`, c.ID, c.Title, c.Description, c.Color, c.Status, c.StartDate, c.EndDate, c.ParentID, c.WorkspaceID).Scan(&c.UpdatedAt)

	if err == sql.ErrNoRows {
		http.Error(w, "Context not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "Failed to update context", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(c)
}

func (h *ContextHandler) DeleteContext(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid context ID", http.StatusBadRequest)
		return
	}

	result, err := h.DB.Exec("DELETE FROM contexts WHERE id = $1", id)
	if err != nil {
		http.Error(w, "Failed to delete context", http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Context not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ContextHandler) GetContextStats(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	contextID, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid context ID", http.StatusBadRequest)
		return
	}

	// Get context details
	var context models.Context
	err = h.DB.QueryRow(`
		SELECT id, title, description, color, status, start_date, end_date, parent_id, workspace_id, created_at, updated_at 
		FROM contexts WHERE id = $1
	`, contextID).Scan(&context.ID, &context.Title, &context.Description, &context.Color, &context.Status, &context.StartDate, &context.EndDate, &context.ParentID, &context.WorkspaceID, &context.CreatedAt, &context.UpdatedAt)

	if err == sql.ErrNoRows {
		http.Error(w, "Context not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "Failed to fetch context", http.StatusInternalServerError)
		return
	}

	// Get stats
	var stats struct {
		TotalProjects    int `json:"total_projects"`
		TotalGoals       int `json:"total_goals"`
		TotalTasks       int `json:"total_tasks"`
		CompletedTasks   int `json:"completed_tasks"`
		PendingTasks     int `json:"pending_tasks"`
		ActiveProjects   int `json:"active_projects"`
		CompletedGoals   int `json:"completed_goals"`
	}

	// Count projects
	h.DB.QueryRow("SELECT COUNT(*) FROM projects WHERE context_id = $1", contextID).Scan(&stats.TotalProjects)
	h.DB.QueryRow("SELECT COUNT(*) FROM projects WHERE context_id = $1 AND status = 'active'", contextID).Scan(&stats.ActiveProjects)

	// Count goals
	h.DB.QueryRow("SELECT COUNT(*) FROM goals WHERE context_id = $1", contextID).Scan(&stats.TotalGoals)
	h.DB.QueryRow("SELECT COUNT(*) FROM goals WHERE context_id = $1 AND status = 'completed'", contextID).Scan(&stats.CompletedGoals)

	// Count tasks
	h.DB.QueryRow("SELECT COUNT(*) FROM tasks WHERE context_id = $1", contextID).Scan(&stats.TotalTasks)
	h.DB.QueryRow("SELECT COUNT(*) FROM tasks WHERE context_id = $1 AND status = 'completed'", contextID).Scan(&stats.CompletedTasks)
	h.DB.QueryRow("SELECT COUNT(*) FROM tasks WHERE context_id = $1 AND status = 'pending'", contextID).Scan(&stats.PendingTasks)

	response := struct {
		Context models.Context `json:"context"`
		Stats   interface{}    `json:"stats"`
	}{
		Context: context,
		Stats:   stats,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}


