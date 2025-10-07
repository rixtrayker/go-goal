package api

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestFilterMiddleware(t *testing.T) {
	tests := []struct {
		name           string
		entityType     string
		queryParams    string
		expectError    bool
		expectedStatus int
	}{
		{
			name:           "valid filters",
			entityType:     "project",
			queryParams:    "name=test&status=active&limit=10",
			expectError:    false,
			expectedStatus: http.StatusOK,
		},
		{
			name:           "no filters",
			entityType:     "project",
			queryParams:    "",
			expectError:    false,
			expectedStatus: http.StatusOK,
		},
		{
			name:           "invalid status",
			entityType:     "project",
			queryParams:    "status=invalid_status",
			expectError:    true,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "invalid date format",
			entityType:     "project",
			queryParams:    "created_after=not-a-date",
			expectError:    true,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "limit too high",
			entityType:     "project",
			queryParams:    "limit=1000",
			expectError:    true,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "negative offset",
			entityType:     "project",
			queryParams:    "offset=-1",
			expectError:    true,
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create a test handler that checks context
			testHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				// Verify filter criteria is in context
				criteria, ok := GetFilterCriteriaFromContext(r.Context())
				assert.True(t, ok, "Filter criteria should be in context")

				// Verify entity type is in context
				entityType, ok := GetEntityTypeFromContext(r.Context())
				assert.True(t, ok, "Entity type should be in context")
				assert.Equal(t, tt.entityType, entityType)

				// Check some filter values
				if tt.queryParams != "" && !tt.expectError {
					assert.NotNil(t, criteria.Fields)
					if tt.queryParams == "name=test&status=active&limit=10" {
						assert.Equal(t, "test", criteria.Fields["name"])
						assert.Equal(t, "active", criteria.Fields["status"])
						assert.Equal(t, 10, criteria.Limit)
					}
				}

				w.WriteHeader(http.StatusOK)
			})

			// Create middleware
			middleware := FilterMiddleware(tt.entityType)
			handler := middleware(testHandler)

			// Create request
			req := httptest.NewRequest("GET", "/test?"+tt.queryParams, nil)
			w := httptest.NewRecorder()

			// Execute request
			handler.ServeHTTP(w, req)

			// Check response
			assert.Equal(t, tt.expectedStatus, w.Code)
		})
	}
}

func TestGetFilterCriteriaFromContext(t *testing.T) {
	// Test with valid context
	criteria := FilterCriteria{
		Fields: map[string]interface{}{
			"name": "test",
		},
		Limit:  50,
		Offset: 0,
	}

	ctx := context.WithValue(context.Background(), FilterCriteriaKey, criteria)
	
	result, ok := GetFilterCriteriaFromContext(ctx)
	assert.True(t, ok)
	assert.Equal(t, criteria, result)

	// Test with empty context
	emptyResult, ok := GetFilterCriteriaFromContext(context.Background())
	assert.False(t, ok)
	assert.Equal(t, FilterCriteria{}, emptyResult)
}

func TestGetEntityTypeFromContext(t *testing.T) {
	// Test with valid context
	entityType := "project"
	ctx := context.WithValue(context.Background(), EntityTypeKey, entityType)
	
	result, ok := GetEntityTypeFromContext(ctx)
	assert.True(t, ok)
	assert.Equal(t, entityType, result)

	// Test with empty context
	emptyResult, ok := GetEntityTypeFromContext(context.Background())
	assert.False(t, ok)
	assert.Equal(t, "", emptyResult)
}

func TestApplyPagination(t *testing.T) {
	tests := []struct {
		name     string
		query    string
		criteria FilterCriteria
		expected string
	}{
		{
			name:  "basic query with limit and offset",
			query: "SELECT * FROM projects",
			criteria: FilterCriteria{
				Limit:  10,
				Offset: 20,
			},
			expected: "SELECT * FROM projects ORDER BY created_at DESC LIMIT 10 OFFSET 20",
		},
		{
			name:  "query with existing ORDER BY",
			query: "SELECT * FROM projects ORDER BY title ASC",
			criteria: FilterCriteria{
				Limit:  5,
				Offset: 0,
			},
			expected: "SELECT * FROM projects ORDER BY title ASC LIMIT 5",
		},
		{
			name:  "no pagination",
			query: "SELECT * FROM projects",
			criteria: FilterCriteria{
				Limit:  0,
				Offset: 0,
			},
			expected: "SELECT * FROM projects ORDER BY created_at DESC",
		},
		{
			name:  "only limit",
			query: "SELECT * FROM projects",
			criteria: FilterCriteria{
				Limit:  25,
				Offset: 0,
			},
			expected: "SELECT * FROM projects ORDER BY created_at DESC LIMIT 25",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := ApplyPagination(tt.query, tt.criteria)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestContainsOrderBy(t *testing.T) {
	tests := []struct {
		name     string
		query    string
		expected bool
	}{
		{
			name:     "contains order by lowercase",
			query:    "SELECT * FROM projects order by created_at",
			expected: true,
		},
		{
			name:     "contains order by uppercase",
			query:    "SELECT * FROM projects ORDER BY created_at",
			expected: true,
		},
		{
			name:     "contains order by mixed case",
			query:    "SELECT * FROM projects Order By created_at",
			expected: true,
		},
		{
			name:     "no order by",
			query:    "SELECT * FROM projects WHERE status = 'active'",
			expected: false,
		},
		{
			name:     "partial match",
			query:    "SELECT * FROM projects WHERE name = 'order'",
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := containsOrderBy(tt.query)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestIntToString(t *testing.T) {
	tests := []struct {
		input    int
		expected string
	}{
		{0, "0"},
		{1, "1"},
		{10, "10"},
		{123, "123"},
		{9999, "9999"},
	}

	for _, tt := range tests {
		t.Run(tt.expected, func(t *testing.T) {
			result := intToString(tt.input)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestCorsMiddleware(t *testing.T) {
	testHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	middleware := CorsMiddleware(testHandler)

	t.Run("adds CORS headers", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/test", nil)
		w := httptest.NewRecorder()

		middleware.ServeHTTP(w, req)

		assert.Equal(t, "*", w.Header().Get("Access-Control-Allow-Origin"))
		assert.Equal(t, "GET, POST, PUT, DELETE, OPTIONS", w.Header().Get("Access-Control-Allow-Methods"))
		assert.Equal(t, "Content-Type, Authorization", w.Header().Get("Access-Control-Allow-Headers"))
		assert.Equal(t, http.StatusOK, w.Code)
	})

	t.Run("handles OPTIONS request", func(t *testing.T) {
		req := httptest.NewRequest("OPTIONS", "/test", nil)
		w := httptest.NewRecorder()

		middleware.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
	})
}

func TestLoggingMiddleware(t *testing.T) {
	testHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	middleware := LoggingMiddleware(testHandler)

	t.Run("logs request", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/test?name=value", nil)
		w := httptest.NewRecorder()

		// Note: In a real test, you might want to capture log output
		// For now, we just verify the middleware doesn't break the request
		middleware.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
	})
}