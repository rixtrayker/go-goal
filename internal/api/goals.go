package api

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"go-goal/internal/models"

	"github.com/gorilla/mux"
)

type GoalHandler struct {
	DB *sql.DB
}

func (h *GoalHandler) GetGoals(w http.ResponseWriter, r *http.Request) {
	rows, err := h.DB.Query(`
		SELECT id, title, description, project_id, status, priority, due_date, created_at, updated_at 
		FROM goals 
		ORDER BY priority DESC, created_at DESC
	`)
	if err != nil {
		http.Error(w, "Failed to fetch goals", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var goals []models.Goal
	for rows.Next() {
		var g models.Goal
		err := rows.Scan(&g.ID, &g.Title, &g.Description, &g.ProjectID, &g.Status, &g.Priority, &g.DueDate, &g.CreatedAt, &g.UpdatedAt)
		if err != nil {
			http.Error(w, "Failed to scan goal", http.StatusInternalServerError)
			return
		}
		goals = append(goals, g)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(goals)
}

func (h *GoalHandler) GetGoal(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid goal ID", http.StatusBadRequest)
		return
	}

	var g models.Goal
	err = h.DB.QueryRow(`
		SELECT id, title, description, project_id, status, priority, due_date, created_at, updated_at 
		FROM goals WHERE id = $1
	`, id).Scan(&g.ID, &g.Title, &g.Description, &g.ProjectID, &g.Status, &g.Priority, &g.DueDate, &g.CreatedAt, &g.UpdatedAt)

	if err == sql.ErrNoRows {
		http.Error(w, "Goal not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "Failed to fetch goal", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(g)
}

func (h *GoalHandler) CreateGoal(w http.ResponseWriter, r *http.Request) {
	var g models.Goal
	if err := json.NewDecoder(r.Body).Decode(&g); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	err := h.DB.QueryRow(`
		INSERT INTO goals (title, description, project_id, status, priority, due_date) 
		VALUES ($1, $2, $3, $4, $5, $6) 
		RETURNING id, created_at, updated_at
	`, g.Title, g.Description, g.ProjectID, g.Status, g.Priority, g.DueDate).Scan(&g.ID, &g.CreatedAt, &g.UpdatedAt)

	if err != nil {
		http.Error(w, "Failed to create goal", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(g)
}

func (h *GoalHandler) UpdateGoal(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid goal ID", http.StatusBadRequest)
		return
	}

	var g models.Goal
	if err := json.NewDecoder(r.Body).Decode(&g); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	g.ID = id
	err = h.DB.QueryRow(`
		UPDATE goals 
		SET title = $2, description = $3, project_id = $4, status = $5, priority = $6, due_date = $7
		WHERE id = $1 
		RETURNING updated_at
	`, g.ID, g.Title, g.Description, g.ProjectID, g.Status, g.Priority, g.DueDate).Scan(&g.UpdatedAt)

	if err == sql.ErrNoRows {
		http.Error(w, "Goal not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "Failed to update goal", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(g)
}

func (h *GoalHandler) DeleteGoal(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid goal ID", http.StatusBadRequest)
		return
	}

	result, err := h.DB.Exec("DELETE FROM goals WHERE id = $1", id)
	if err != nil {
		http.Error(w, "Failed to delete goal", http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Goal not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}