package api

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"go-goal/internal/models"

	"github.com/gorilla/mux"
)

type ProjectHandler struct {
	DB *sql.DB
}

func (h *ProjectHandler) GetProjects(w http.ResponseWriter, r *http.Request) {
	rows, err := h.DB.Query(`
		SELECT id, title, description, status, workspace_id, created_at, updated_at 
		FROM projects 
		ORDER BY created_at DESC
	`)
	if err != nil {
		http.Error(w, "Failed to fetch projects", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var projects []models.Project
	for rows.Next() {
		var p models.Project
		err := rows.Scan(&p.ID, &p.Title, &p.Description, &p.Status, &p.WorkspaceID, &p.CreatedAt, &p.UpdatedAt)
		if err != nil {
			http.Error(w, "Failed to scan project", http.StatusInternalServerError)
			return
		}
		projects = append(projects, p)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(projects)
}

func (h *ProjectHandler) GetProject(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid project ID", http.StatusBadRequest)
		return
	}

	var p models.Project
	err = h.DB.QueryRow(`
		SELECT id, title, description, status, workspace_id, created_at, updated_at 
		FROM projects WHERE id = $1
	`, id).Scan(&p.ID, &p.Title, &p.Description, &p.Status, &p.WorkspaceID, &p.CreatedAt, &p.UpdatedAt)

	if err == sql.ErrNoRows {
		http.Error(w, "Project not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "Failed to fetch project", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
}

func (h *ProjectHandler) CreateProject(w http.ResponseWriter, r *http.Request) {
	var p models.Project
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	err := h.DB.QueryRow(`
		INSERT INTO projects (title, description, status, workspace_id) 
		VALUES ($1, $2, $3, $4) 
		RETURNING id, created_at, updated_at
	`, p.Title, p.Description, p.Status, p.WorkspaceID).Scan(&p.ID, &p.CreatedAt, &p.UpdatedAt)

	if err != nil {
		http.Error(w, "Failed to create project", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(p)
}

func (h *ProjectHandler) UpdateProject(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid project ID", http.StatusBadRequest)
		return
	}

	var p models.Project
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	p.ID = id
	err = h.DB.QueryRow(`
		UPDATE projects 
		SET title = $2, description = $3, status = $4, workspace_id = $5
		WHERE id = $1 
		RETURNING updated_at
	`, p.ID, p.Title, p.Description, p.Status, p.WorkspaceID).Scan(&p.UpdatedAt)

	if err == sql.ErrNoRows {
		http.Error(w, "Project not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "Failed to update project", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
}

func (h *ProjectHandler) DeleteProject(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid project ID", http.StatusBadRequest)
		return
	}

	result, err := h.DB.Exec("DELETE FROM projects WHERE id = $1", id)
	if err != nil {
		http.Error(w, "Failed to delete project", http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Project not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}