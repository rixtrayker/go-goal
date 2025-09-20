package api

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"go-goal/internal/models"

	"github.com/gorilla/mux"
)

type WorkspaceHandler struct {
	DB *sql.DB
}

func (h *WorkspaceHandler) GetWorkspaces(w http.ResponseWriter, r *http.Request) {
	rows, err := h.DB.Query(`
		SELECT id, name, description, created_at 
		FROM workspaces 
		ORDER BY created_at DESC
	`)
	if err != nil {
		http.Error(w, "Failed to fetch workspaces", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var workspaces []models.Workspace
	for rows.Next() {
		var workspace models.Workspace
		err := rows.Scan(&workspace.ID, &workspace.Name, &workspace.Description, &workspace.CreatedAt)
		if err != nil {
			http.Error(w, "Failed to scan workspace", http.StatusInternalServerError)
			return
		}
		workspaces = append(workspaces, workspace)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(workspaces)
}

func (h *WorkspaceHandler) GetWorkspace(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid workspace ID", http.StatusBadRequest)
		return
	}

	var ws models.Workspace
	err = h.DB.QueryRow(`
		SELECT id, name, description, created_at 
		FROM workspaces WHERE id = $1
	`, id).Scan(&ws.ID, &ws.Name, &ws.Description, &ws.CreatedAt)

	if err == sql.ErrNoRows {
		http.Error(w, "Workspace not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "Failed to fetch workspace", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ws)
}

func (h *WorkspaceHandler) CreateWorkspace(w http.ResponseWriter, r *http.Request) {
	var ws models.Workspace
	if err := json.NewDecoder(r.Body).Decode(&ws); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	err := h.DB.QueryRow(`
		INSERT INTO workspaces (name, description) 
		VALUES ($1, $2) 
		RETURNING id, created_at
	`, ws.Name, ws.Description).Scan(&ws.ID, &ws.CreatedAt)

	if err != nil {
		http.Error(w, "Failed to create workspace", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(ws)
}

func (h *WorkspaceHandler) UpdateWorkspace(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid workspace ID", http.StatusBadRequest)
		return
	}

	var ws models.Workspace
	if err := json.NewDecoder(r.Body).Decode(&ws); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	ws.ID = id
	result, err := h.DB.Exec(`
		UPDATE workspaces 
		SET name = $2, description = $3
		WHERE id = $1
	`, ws.ID, ws.Name, ws.Description)

	if err != nil {
		http.Error(w, "Failed to update workspace", http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Workspace not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ws)
}

func (h *WorkspaceHandler) DeleteWorkspace(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid workspace ID", http.StatusBadRequest)
		return
	}

	result, err := h.DB.Exec("DELETE FROM workspaces WHERE id = $1", id)
	if err != nil {
		http.Error(w, "Failed to delete workspace", http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Workspace not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}