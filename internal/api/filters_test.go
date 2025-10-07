package api

import (
	"net/http"
	"net/url"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestParseFilterParams(t *testing.T) {
	tests := []struct {
		name     string
		params   url.Values
		expected FilterCriteria
	}{
		{
			name:   "empty parameters",
			params: url.Values{},
			expected: FilterCriteria{
				Fields: make(map[string]interface{}),
				Limit:  50, // Default limit
				Offset: 0,  // Default offset
			},
		},
		{
			name: "single text filter",
			params: url.Values{
				"name": []string{"test project"},
			},
			expected: FilterCriteria{
				Fields: map[string]interface{}{
					"name": "test project",
				},
				Limit:  50, // Default limit
				Offset: 0,  // Default offset
			},
		},
		{
			name: "multiple filters",
			params: url.Values{
				"name":   []string{"test"},
				"status": []string{"active"},
			},
			expected: FilterCriteria{
				Fields: map[string]interface{}{
					"name":   "test",
					"status": "active",
				},
				Limit:  50, // Default limit
				Offset: 0,  // Default offset
			},
		},
		{
			name: "date filters",
			params: url.Values{
				"created_after":  []string{"2023-01-01"},
				"created_before": []string{"2023-12-31"},
			},
			expected: FilterCriteria{
				Fields: map[string]interface{}{
					"created_after":  "2023-01-01",
					"created_before": "2023-12-31",
				},
				Limit:  50, // Default limit
				Offset: 0,  // Default offset
			},
		},
		{
			name: "integer filters",
			params: url.Values{
				"project_id":   []string{"123"},
				"workspace_id": []string{"456"},
			},
			expected: FilterCriteria{
				Fields: map[string]interface{}{
					"project_id":   "123",
					"workspace_id": "456",
				},
				Limit:  50, // Default limit
				Offset: 0,  // Default offset
			},
		},
		{
			name: "array filters",
			params: url.Values{
				"tag_ids": []string{"1,2,3"},
			},
			expected: FilterCriteria{
				Fields: map[string]interface{}{
					"tag_ids": "1,2,3",
				},
				Limit:  50, // Default limit
				Offset: 0,  // Default offset
			},
		},
		{
			name: "pagination parameters",
			params: url.Values{
				"limit":  []string{"50"},
				"offset": []string{"100"},
			},
			expected: FilterCriteria{
				Fields: map[string]interface{}{},
				Limit:  50,
				Offset: 100,
			},
		},
		{
			name: "mixed parameters",
			params: url.Values{
				"name":   []string{"project"},
				"status": []string{"active"},
				"limit":  []string{"25"},
				"offset": []string{"0"},
			},
			expected: FilterCriteria{
				Fields: map[string]interface{}{
					"name":   "project",
					"status": "active",
				},
				Limit:  25,
				Offset: 0,
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := &http.Request{
				URL: &url.URL{
					RawQuery: tt.params.Encode(),
				},
			}

			result := ParseFilterParams(req)
			
			assert.Equal(t, tt.expected.Fields, result.Fields)
			assert.Equal(t, tt.expected.Limit, result.Limit)
			assert.Equal(t, tt.expected.Offset, result.Offset)
		})
	}
}

func TestValidateFilterParams(t *testing.T) {
	tests := []struct {
		name        string
		criteria    FilterCriteria
		entityType  string
		expectError bool
		errorMsg    string
	}{
		{
			name: "valid project filters",
			criteria: FilterCriteria{
				Fields: map[string]interface{}{
					"name":   "test",
					"status": "active",
				},
				Limit:  50,
				Offset: 0,
			},
			entityType:  "project",
			expectError: false,
		},
		{
			name: "invalid status value",
			criteria: FilterCriteria{
				Fields: map[string]interface{}{
					"status": "invalid_status",
				},
				Limit:  50,
				Offset: 0,
			},
			entityType:  "project",
			expectError: true,
			errorMsg:    "invalid status value",
		},
		{
			name: "invalid date format",
			criteria: FilterCriteria{
				Fields: map[string]interface{}{
					"created_after": "not-a-date",
				},
				Limit:  50,
				Offset: 0,
			},
			entityType:  "project",
			expectError: true,
			errorMsg:    "invalid date format",
		},
		{
			name: "invalid limit",
			criteria: FilterCriteria{
				Fields: map[string]interface{}{},
				Limit:  1000,
				Offset: 0,
			},
			entityType:  "project",
			expectError: true,
			errorMsg:    "limit exceeds maximum",
		},
		{
			name: "negative offset",
			criteria: FilterCriteria{
				Fields: map[string]interface{}{},
				Limit:  50,
				Offset: -1,
			},
			entityType:  "project",
			expectError: true,
			errorMsg:    "offset cannot be negative",
		},
		{
			name: "SQL injection attempt",
			criteria: FilterCriteria{
				Fields: map[string]interface{}{
					"name": "'; DROP TABLE projects; --",
				},
				Limit:  50,
				Offset: 0,
			},
			entityType:  "project",
			expectError: false, // Should be sanitized, not errored
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateFilterParams(tt.criteria, tt.entityType)
			
			if tt.expectError {
				assert.Error(t, err)
				if tt.errorMsg != "" {
					assert.Contains(t, err.Error(), tt.errorMsg)
				}
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestSanitizeFilterValue(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "normal text",
			input:    "project name",
			expected: "project name",
		},
		{
			name:     "SQL injection attempt",
			input:    "'; DROP TABLE projects; --",
			expected: "'; DROP TABLE projects; --", // Will be handled by parameterized queries
		},
		{
			name:     "XSS attempt",
			input:    "<script>alert('xss')</script>",
			expected: "<script>alert('xss')</script>", // Will be escaped in JSON response
		},
		{
			name:     "very long input",
			input:    string(make([]byte, 1000)),
			expected: string(make([]byte, 255)), // Should be truncated
		},
		{
			name:     "unicode characters",
			input:    "проект тест 项目测试",
			expected: "проект тест 项目测试",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := SanitizeFilterValue(tt.input)
			
			if len(tt.input) > 255 {
				assert.Len(t, result, 255)
			} else {
				assert.Equal(t, tt.expected, result)
			}
		})
	}
}

func TestBuildWhereClause(t *testing.T) {
	tests := []struct {
		name           string
		criteria       FilterCriteria
		entityType     string
		expectedClause string
		expectedArgs   []interface{}
	}{
		{
			name: "no filters",
			criteria: FilterCriteria{
				Fields: map[string]interface{}{},
			},
			entityType:     "project",
			expectedClause: "",
			expectedArgs:   []interface{}{},
		},
		{
			name: "single text filter",
			criteria: FilterCriteria{
				Fields: map[string]interface{}{
					"name": "test",
				},
			},
			entityType:     "project",
			expectedClause: " WHERE title ILIKE $1",
			expectedArgs:   []interface{}{"%test%"},
		},
		{
			name: "status filter",
			criteria: FilterCriteria{
				Fields: map[string]interface{}{
					"status": "active",
				},
			},
			entityType:     "project",
			expectedClause: " WHERE status = $1",
			expectedArgs:   []interface{}{"active"},
		},
		{
			name: "multiple filters",
			criteria: FilterCriteria{
				Fields: map[string]interface{}{
					"name":   "test",
					"status": "active",
				},
			},
			entityType:     "project",
			expectedClause: " WHERE title ILIKE $1 AND status = $2",
			expectedArgs:   []interface{}{"%test%", "active"},
		},
		{
			name: "date range filter",
			criteria: FilterCriteria{
				Fields: map[string]interface{}{
					"created_after":  "2023-01-01",
					"created_before": "2023-12-31",
				},
			},
			entityType:     "project",
			expectedClause: " WHERE created_at >= $1 AND created_at <= $2",
			expectedArgs:   []interface{}{"2023-01-01", "2023-12-31"},
		},
		{
			name: "foreign key filter",
			criteria: FilterCriteria{
				Fields: map[string]interface{}{
					"project_id": "123",
				},
			},
			entityType:     "task",
			expectedClause: " WHERE project_id = $1",
			expectedArgs:   []interface{}{123},
		},
		{
			name: "array filter",
			criteria: FilterCriteria{
				Fields: map[string]interface{}{
					"tag_ids": "1,2,3",
				},
			},
			entityType:     "project",
			expectedClause: " WHERE id IN (SELECT entity_id FROM taggings WHERE tag_id = ANY($1) AND entity_type = 'project')",
			expectedArgs:   []interface{}{[]int{1, 2, 3}},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			clause, args, err := BuildWhereClause(tt.criteria, tt.entityType)
			
			require.NoError(t, err)
			assert.Equal(t, tt.expectedClause, clause)
			assert.Equal(t, tt.expectedArgs, args)
		})
	}
}

func TestParseDateFilter(t *testing.T) {
	tests := []struct {
		name        string
		input       string
		expected    time.Time
		expectError bool
	}{
		{
			name:        "valid ISO date",
			input:       "2023-01-01",
			expected:    time.Date(2023, 1, 1, 0, 0, 0, 0, time.UTC),
			expectError: false,
		},
		{
			name:        "valid datetime",
			input:       "2023-01-01T12:00:00Z",
			expected:    time.Date(2023, 1, 1, 12, 0, 0, 0, time.UTC),
			expectError: false,
		},
		{
			name:        "invalid date format",
			input:       "not-a-date",
			expectError: true,
		},
		{
			name:        "empty string",
			input:       "",
			expectError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := ParseDateFilter(tt.input)
			
			if tt.expectError {
				assert.Error(t, err)
			} else {
				require.NoError(t, err)
				assert.Equal(t, tt.expected, result)
			}
		})
	}
}

func TestParseIntArray(t *testing.T) {
	tests := []struct {
		name        string
		input       string
		expected    []int
		expectError bool
	}{
		{
			name:        "single integer",
			input:       "123",
			expected:    []int{123},
			expectError: false,
		},
		{
			name:        "multiple integers",
			input:       "1,2,3,4,5",
			expected:    []int{1, 2, 3, 4, 5},
			expectError: false,
		},
		{
			name:        "integers with spaces",
			input:       "1, 2, 3",
			expected:    []int{1, 2, 3},
			expectError: false,
		},
		{
			name:        "invalid integer",
			input:       "1,abc,3",
			expectError: true,
		},
		{
			name:        "empty string",
			input:       "",
			expected:    []int{},
			expectError: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := ParseIntArray(tt.input)
			
			if tt.expectError {
				assert.Error(t, err)
			} else {
				require.NoError(t, err)
				assert.Equal(t, tt.expected, result)
			}
		})
	}
}