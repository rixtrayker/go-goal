package api

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestProjectHandlerFiltering(t *testing.T) {
	// Note: These are unit tests that test the handler logic without a real database
	// Integration tests would require a test database setup

	// Only test validation logic, not database execution
	tests := []struct {
		name           string
		queryParams    string
		expectedStatus int
	}{
		{
			name:           "invalid status filter",
			queryParams:    "status=invalid_status",
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "invalid limit",
			queryParams:    "limit=1000",
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "negative offset",
			queryParams:    "offset=-1",
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "invalid field",
			queryParams:    "invalid_field=value",
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create handler (DB will be nil, causing internal errors for valid requests)
			handler := &ProjectHandler{DB: nil}

			// Create request
			req := httptest.NewRequest("GET", "/projects?"+tt.queryParams, nil)
			w := httptest.NewRecorder()

			// Execute request
			handler.GetProjects(w, req)

			// Check status code
			assert.Equal(t, tt.expectedStatus, w.Code)

			// For bad request responses, check that error message is helpful
			if w.Code == http.StatusBadRequest {
				assert.Contains(t, w.Body.String(), "Invalid filter parameters")
			}
		})
	}
}

func TestTaskHandlerFiltering(t *testing.T) {
	// Only test validation logic, not database execution
	tests := []struct {
		name           string
		queryParams    string
		expectedStatus int
	}{
		{
			name:           "invalid task status",
			queryParams:    "status=invalid_task_status",
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "invalid date format",
			queryParams:    "due_after=not-a-date",
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create handler (DB will be nil)
			handler := &TaskHandler{DB: nil}

			// Create request
			req := httptest.NewRequest("GET", "/tasks?"+tt.queryParams, nil)
			w := httptest.NewRecorder()

			// Execute request
			handler.GetTasks(w, req)

			// Check status code
			assert.Equal(t, tt.expectedStatus, w.Code)

			// For bad request responses, check that error message is helpful
			if w.Code == http.StatusBadRequest {
				assert.Contains(t, w.Body.String(), "Invalid filter parameters")
			}
		})
	}
}

func TestFilterResponseStructure(t *testing.T) {
	// Test the structure of filter responses
	data := []map[string]interface{}{
		{"id": 1, "title": "Project 1"},
		{"id": 2, "title": "Project 2"},
	}

	criteria := FilterCriteria{
		Fields: map[string]interface{}{
			"name": "test",
		},
		Limit:  10,
		Offset: 0,
	}

	response := NewFilterResponse(data, 25, criteria)

	// Verify response structure
	assert.Equal(t, data, response.Data)
	assert.Equal(t, 25, response.Total)
	assert.Equal(t, 10, response.Limit)
	assert.Equal(t, 0, response.Offset)
	assert.True(t, response.HasMore)
	assert.Contains(t, response.FilteredBy, "name")

	// Test JSON serialization
	jsonData, err := json.Marshal(response)
	assert.NoError(t, err)
	assert.Contains(t, string(jsonData), "\"total\":25")
	assert.Contains(t, string(jsonData), "\"has_more\":true")
	assert.Contains(t, string(jsonData), "\"filtered_by\"")
}