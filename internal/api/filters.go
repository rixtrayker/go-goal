package api

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"
)

// FilterCriteria represents the parsed filter parameters
type FilterCriteria struct {
	Fields map[string]interface{}
	Limit  int
	Offset int
}

// EntityFieldMap defines the mapping between filter field names and database columns
var EntityFieldMap = map[string]map[string]string{
	"project": {
		"name":           "title",
		"title":          "title",
		"description":    "description",
		"status":         "status",
		"workspace_id":   "workspace_id",
		"flow_id":        "flow_id",
		"tag_ids":        "id", // Special handling for tag relationships
		"created_after":  "created_at",
		"created_before": "created_at",
		"updated_after":  "updated_at",
		"updated_before": "updated_at",
	},
	"task": {
		"name":           "title",
		"title":          "title",
		"description":    "description",
		"status":         "status",
		"priority":       "priority",
		"project_id":     "project_id",
		"goal_id":        "goal_id",
		"flow_id":        "flow_id",
		"due_after":      "due_date",
		"due_before":     "due_date",
		"created_after":  "created_at",
		"created_before": "created_at",
		"updated_after":  "updated_at",
		"updated_before": "updated_at",
	},
	"goal": {
		"name":           "title",
		"title":          "title",
		"description":    "description",
		"status":         "status",
		"priority":       "priority",
		"project_id":     "project_id",
		"flow_id":        "flow_id",
		"due_after":      "due_date",
		"due_before":     "due_date",
		"created_after":  "created_at",
		"created_before": "created_at",
		"updated_after":  "updated_at",
		"updated_before": "updated_at",
	},
	"tag": {
		"name":       "name",
		"color":      "color",
		"parent_id":  "parent_id",
		"created_after": "created_at",
		"created_before": "created_at",
	},
	"note": {
		"name":           "title",
		"title":          "title",
		"content":        "content",
		"entity_id":      "entity_id",
		"entity_type":    "entity_type",
		"created_after":  "created_at",
		"created_before": "created_at",
		"updated_after":  "updated_at",
		"updated_before": "updated_at",
	},
	"flow": {
		"name":           "title",
		"title":          "title",
		"description":    "description",
		"color":          "color",
		"status":         "status",
		"workspace_id":   "workspace_id",
		"parent_id":      "parent_id",
		"start_after":    "start_date",
		"start_before":   "start_date",
		"end_after":      "end_date",
		"end_before":     "end_date",
		"created_after":  "created_at",
		"created_before": "created_at",
		"updated_after":  "updated_at",
		"updated_before": "updated_at",
	},
}

// ValidStatusValues defines valid status values for each entity type
var ValidStatusValues = map[string][]string{
	"project": {"active", "completed", "archived", "on_hold"},
	"task":    {"pending", "in_progress", "completed", "cancelled"},
	"goal":    {"active", "completed", "paused", "cancelled"},
	"flow":    {"active", "completed", "archived"},
}

// ParseFilterParams extracts and parses filter parameters from HTTP request
func ParseFilterParams(r *http.Request) FilterCriteria {
	criteria := FilterCriteria{
		Fields: make(map[string]interface{}),
		Limit:  50, // Default limit
		Offset: 0,  // Default offset
	}

	query := r.URL.Query()

	// Parse pagination parameters
	if limit := query.Get("limit"); limit != "" {
		if l, err := strconv.Atoi(limit); err == nil && l > 0 {
			criteria.Limit = l
		}
	}

	if offset := query.Get("offset"); offset != "" {
		if o, err := strconv.Atoi(offset); err == nil {
			criteria.Offset = o
		}
	}

	// Parse filter fields
	for key, values := range query {
		if key == "limit" || key == "offset" {
			continue // Skip pagination parameters
		}

		if len(values) > 0 && values[0] != "" {
			criteria.Fields[key] = values[0]
		}
	}

	return criteria
}

// ValidateFilterParams validates filter criteria for a specific entity type
func ValidateFilterParams(criteria FilterCriteria, entityType string) error {
	// Validate limit
	if criteria.Limit > 500 {
		return errors.New("limit exceeds maximum of 500")
	}

	if criteria.Limit < 1 {
		return errors.New("limit must be at least 1")
	}

	// Validate offset
	if criteria.Offset < 0 {
		return errors.New("offset cannot be negative")
	}

	// Validate field filters
	fieldMap, exists := EntityFieldMap[entityType]
	if !exists {
		return fmt.Errorf("unknown entity type: %s", entityType)
	}

	for fieldName, value := range criteria.Fields {
		// Check if field is valid for this entity type
		if _, validField := fieldMap[fieldName]; !validField {
			return fmt.Errorf("invalid filter field '%s' for entity type '%s'", fieldName, entityType)
		}

		// Validate specific field types
		if err := validateFieldValue(fieldName, value, entityType); err != nil {
			return err
		}
	}

	return nil
}

// validateFieldValue validates the value for a specific field
func validateFieldValue(fieldName string, value interface{}, entityType string) error {
	valueStr, ok := value.(string)
	if !ok {
		return fmt.Errorf("invalid value type for field '%s'", fieldName)
	}

	// Validate status fields
	if fieldName == "status" {
		validStatuses, exists := ValidStatusValues[entityType]
		if exists {
			for _, validStatus := range validStatuses {
				if valueStr == validStatus {
					return nil
				}
			}
			return fmt.Errorf("invalid status value '%s' for entity type '%s'", valueStr, entityType)
		}
	}

	// Validate date fields
	if strings.Contains(fieldName, "_after") || strings.Contains(fieldName, "_before") {
		if _, err := ParseDateFilter(valueStr); err != nil {
			return fmt.Errorf("invalid date format for field '%s': %v", fieldName, err)
		}
	}

	// Validate integer fields
	if strings.HasSuffix(fieldName, "_id") || fieldName == "priority" {
		if fieldName != "tag_ids" { // tag_ids is a comma-separated list
			if _, err := strconv.Atoi(valueStr); err != nil {
				return fmt.Errorf("invalid integer value for field '%s'", fieldName)
			}
		}
	}

	return nil
}

// SanitizeFilterValue sanitizes user input to prevent injection attacks
func SanitizeFilterValue(input string) string {
	// Truncate very long inputs
	if len(input) > 255 {
		return input[:255]
	}

	// Note: SQL injection protection is handled by parameterized queries
	// XSS protection is handled by proper JSON encoding in responses
	// We just need to ensure reasonable length limits here

	return input
}

// BuildWhereClause constructs a WHERE clause and parameters for the given filter criteria
func BuildWhereClause(criteria FilterCriteria, entityType string) (string, []interface{}, error) {
	fieldMap, exists := EntityFieldMap[entityType]
	if !exists {
		return "", nil, fmt.Errorf("unknown entity type: %s", entityType)
	}

	if len(criteria.Fields) == 0 {
		return "", []interface{}{}, nil
	}

	var clauses []string
	var args []interface{}
	argIndex := 1

	// Sort field names for consistent query generation
	var fieldNames []string
	for fieldName := range criteria.Fields {
		fieldNames = append(fieldNames, fieldName)
	}
	
	// Sort to ensure consistent ordering in tests
	for i := 0; i < len(fieldNames); i++ {
		for j := i + 1; j < len(fieldNames); j++ {
			if fieldNames[i] > fieldNames[j] {
				fieldNames[i], fieldNames[j] = fieldNames[j], fieldNames[i]
			}
		}
	}

	// Process each filter field
	for _, fieldName := range fieldNames {
		value := criteria.Fields[fieldName]
		valueStr := value.(string)

		dbColumn, exists := fieldMap[fieldName]
		if !exists {
			continue // Skip invalid fields (should be caught by validation)
		}

		// Handle different filter types
		if fieldName == "name" || fieldName == "title" || fieldName == "content" {
			// Text search with ILIKE for case-insensitive partial matching
			clauses = append(clauses, fmt.Sprintf("%s ILIKE $%d", dbColumn, argIndex))
			args = append(args, "%"+SanitizeFilterValue(valueStr)+"%")
			argIndex++
		} else if strings.Contains(fieldName, "_after") {
			// Date after filter
			clauses = append(clauses, fmt.Sprintf("%s >= $%d", dbColumn, argIndex))
			args = append(args, valueStr)
			argIndex++
		} else if strings.Contains(fieldName, "_before") {
			// Date before filter
			clauses = append(clauses, fmt.Sprintf("%s <= $%d", dbColumn, argIndex))
			args = append(args, valueStr)
			argIndex++
		} else if fieldName == "tag_ids" {
			// Tag filtering via junction table
			intArray, err := ParseIntArray(valueStr)
			if err == nil && len(intArray) > 0 {
				clauses = append(clauses, fmt.Sprintf("id IN (SELECT entity_id FROM taggings WHERE tag_id = ANY($%d) AND entity_type = '%s')", argIndex, entityType))
				args = append(args, intArray)
				argIndex++
			}
		} else if strings.HasSuffix(fieldName, "_id") || fieldName == "priority" {
			// Integer equality filter
			if intValue, err := strconv.Atoi(valueStr); err == nil {
				clauses = append(clauses, fmt.Sprintf("%s = $%d", dbColumn, argIndex))
				args = append(args, intValue)
				argIndex++
			}
		} else {
			// String equality filter (status, color, etc.)
			clauses = append(clauses, fmt.Sprintf("%s = $%d", dbColumn, argIndex))
			args = append(args, SanitizeFilterValue(valueStr))
			argIndex++
		}
	}

	if len(clauses) == 0 {
		return "", []interface{}{}, nil
	}

	whereClause := " WHERE " + strings.Join(clauses, " AND ")
	return whereClause, args, nil
}

// ParseDateFilter parses a date string into a time.Time
func ParseDateFilter(dateStr string) (time.Time, error) {
	if dateStr == "" {
		return time.Time{}, errors.New("empty date string")
	}

	// Try different date formats
	formats := []string{
		"2006-01-02",
		"2006-01-02T15:04:05Z",
		"2006-01-02T15:04:05Z07:00",
		"2006-01-02 15:04:05",
	}

	for _, format := range formats {
		if t, err := time.Parse(format, dateStr); err == nil {
			return t, nil
		}
	}

	return time.Time{}, fmt.Errorf("invalid date format: %s", dateStr)
}

// ParseIntArray parses a comma-separated string of integers
func ParseIntArray(input string) ([]int, error) {
	if input == "" {
		return []int{}, nil
	}

	parts := strings.Split(input, ",")
	result := make([]int, 0, len(parts))

	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed == "" {
			continue
		}

		num, err := strconv.Atoi(trimmed)
		if err != nil {
			return nil, fmt.Errorf("invalid integer: %s", part)
		}

		result = append(result, num)
	}

	return result, nil
}