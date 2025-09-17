package api

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"go-goal/internal/models"

	"github.com/gorilla/mux"
)

type NoteHandler struct {
	DB *sql.DB
}

func (h *NoteHandler) GetNotes(w http.ResponseWriter, r *http.Request) {
	rows, err := h.DB.Query(`
		SELECT id, title, content, entity_id, entity_type, created_at, updated_at 
		FROM notes 
		ORDER BY created_at DESC
	`)
	if err != nil {
		http.Error(w, "Failed to fetch notes", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var notes []models.Note
	for rows.Next() {
		var n models.Note
		err := rows.Scan(&n.ID, &n.Title, &n.Content, &n.EntityID, &n.EntityType, &n.CreatedAt, &n.UpdatedAt)
		if err != nil {
			http.Error(w, "Failed to scan note", http.StatusInternalServerError)
			return
		}
		notes = append(notes, n)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(notes)
}

func (h *NoteHandler) GetNote(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid note ID", http.StatusBadRequest)
		return
	}

	var n models.Note
	err = h.DB.QueryRow(`
		SELECT id, title, content, entity_id, entity_type, created_at, updated_at 
		FROM notes WHERE id = $1
	`, id).Scan(&n.ID, &n.Title, &n.Content, &n.EntityID, &n.EntityType, &n.CreatedAt, &n.UpdatedAt)

	if err == sql.ErrNoRows {
		http.Error(w, "Note not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "Failed to fetch note", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(n)
}

func (h *NoteHandler) CreateNote(w http.ResponseWriter, r *http.Request) {
	var n models.Note
	if err := json.NewDecoder(r.Body).Decode(&n); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	err := h.DB.QueryRow(`
		INSERT INTO notes (title, content, entity_id, entity_type) 
		VALUES ($1, $2, $3, $4) 
		RETURNING id, created_at, updated_at
	`, n.Title, n.Content, n.EntityID, n.EntityType).Scan(&n.ID, &n.CreatedAt, &n.UpdatedAt)

	if err != nil {
		http.Error(w, "Failed to create note", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(n)
}

func (h *NoteHandler) UpdateNote(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid note ID", http.StatusBadRequest)
		return
	}

	var n models.Note
	if err := json.NewDecoder(r.Body).Decode(&n); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	n.ID = id
	err = h.DB.QueryRow(`
		UPDATE notes 
		SET title = $2, content = $3, entity_id = $4, entity_type = $5
		WHERE id = $1 
		RETURNING updated_at
	`, n.ID, n.Title, n.Content, n.EntityID, n.EntityType).Scan(&n.UpdatedAt)

	if err == sql.ErrNoRows {
		http.Error(w, "Note not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "Failed to update note", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(n)
}

func (h *NoteHandler) DeleteNote(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid note ID", http.StatusBadRequest)
		return
	}

	result, err := h.DB.Exec("DELETE FROM notes WHERE id = $1", id)
	if err != nil {
		http.Error(w, "Failed to delete note", http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Note not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}