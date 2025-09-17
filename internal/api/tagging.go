package api

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

type TaggingHandler struct {
	DB *sql.DB
}

type TagAssignment struct {
	EntityID   int    `json:"entity_id"`
	EntityType string `json:"entity_type"`
	TagID      int    `json:"tag_id"`
}

func (h *TaggingHandler) AssignTag(w http.ResponseWriter, r *http.Request) {
	var assignment TagAssignment
	if err := json.NewDecoder(r.Body).Decode(&assignment); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	var tableName string
	var columnName string
	
	switch assignment.EntityType {
	case "project":
		tableName = "project_tags"
		columnName = "project_id"
	case "goal":
		tableName = "goal_tags"
		columnName = "goal_id"
	case "task":
		tableName = "task_tags"
		columnName = "task_id"
	default:
		http.Error(w, "Invalid entity type", http.StatusBadRequest)
		return
	}

	_, err := h.DB.Exec(`
		INSERT INTO `+tableName+` (`+columnName+`, tag_id) 
		VALUES ($1, $2) 
		ON CONFLICT DO NOTHING
	`, assignment.EntityID, assignment.TagID)

	if err != nil {
		http.Error(w, "Failed to assign tag", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(assignment)
}

func (h *TaggingHandler) RemoveTag(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	entityType := vars["entity_type"]
	entityID, err := strconv.Atoi(vars["entity_id"])
	if err != nil {
		http.Error(w, "Invalid entity ID", http.StatusBadRequest)
		return
	}
	
	tagID, err := strconv.Atoi(vars["tag_id"])
	if err != nil {
		http.Error(w, "Invalid tag ID", http.StatusBadRequest)
		return
	}

	var tableName string
	var columnName string
	
	switch entityType {
	case "project":
		tableName = "project_tags"
		columnName = "project_id"
	case "goal":
		tableName = "goal_tags"
		columnName = "goal_id"
	case "task":
		tableName = "task_tags"
		columnName = "task_id"
	default:
		http.Error(w, "Invalid entity type", http.StatusBadRequest)
		return
	}

	result, err := h.DB.Exec(`
		DELETE FROM `+tableName+` 
		WHERE `+columnName+` = $1 AND tag_id = $2
	`, entityID, tagID)

	if err != nil {
		http.Error(w, "Failed to remove tag", http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Tag assignment not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *TaggingHandler) GetEntityTags(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	entityType := vars["entity_type"]
	entityID, err := strconv.Atoi(vars["entity_id"])
	if err != nil {
		http.Error(w, "Invalid entity ID", http.StatusBadRequest)
		return
	}

	var tableName string
	var columnName string
	
	switch entityType {
	case "project":
		tableName = "project_tags"
		columnName = "project_id"
	case "goal":
		tableName = "goal_tags"
		columnName = "goal_id"
	case "task":
		tableName = "task_tags"
		columnName = "task_id"
	default:
		http.Error(w, "Invalid entity type", http.StatusBadRequest)
		return
	}

	rows, err := h.DB.Query(`
		SELECT t.id, t.name, t.color, t.parent_id, t.created_at 
		FROM tags t 
		JOIN `+tableName+` et ON t.id = et.tag_id 
		WHERE et.`+columnName+` = $1 
		ORDER BY t.name
	`, entityID)
	
	if err != nil {
		http.Error(w, "Failed to fetch tags", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var tags []map[string]interface{}
	for rows.Next() {
		var id, parentID sql.NullInt64
		var name, color, createdAt string
		
		err := rows.Scan(&id, &name, &color, &parentID, &createdAt)
		if err != nil {
			http.Error(w, "Failed to scan tag", http.StatusInternalServerError)
			return
		}
		
		tag := map[string]interface{}{
			"id":         id.Int64,
			"name":       name,
			"color":      color,
			"created_at": createdAt,
		}
		
		if parentID.Valid {
			tag["parent_id"] = parentID.Int64
		}
		
		tags = append(tags, tag)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tags)
}