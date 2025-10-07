package api

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNewQueryBuilder(t *testing.T) {
	baseQuery := "SELECT * FROM projects"
	qb := NewQueryBuilder(baseQuery)

	assert.Equal(t, baseQuery, qb.baseQuery)
	assert.Equal(t, "", qb.whereClause)
	assert.Equal(t, 0, len(qb.args))
}

func TestQueryBuilderWithFilters(t *testing.T) {
	tests := []struct {
		name       string
		criteria   FilterCriteria
		entityType string
		expectErr  bool
	}{
		{
			name: "valid filters",
			criteria: FilterCriteria{
				Fields: map[string]interface{}{
					"name":   "test",
					"status": "active",
				},
				Limit:  10,
				Offset: 0,
			},
			entityType: "project",
			expectErr:  false,
		},
		{
			name: "invalid entity type",
			criteria: FilterCriteria{
				Fields: map[string]interface{}{
					"name": "test",
				},
			},
			entityType: "invalid_entity",
			expectErr:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			qb := NewQueryBuilder("SELECT * FROM projects")
			err := qb.WithFilters(tt.criteria, tt.entityType)

			if tt.expectErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.criteria.Limit, qb.limit)
				assert.Equal(t, tt.criteria.Offset, qb.offset)
			}
		})
	}
}

func TestQueryBuilderWithOrderBy(t *testing.T) {
	qb := NewQueryBuilder("SELECT * FROM projects")
	result := qb.WithOrderBy("title ASC")

	assert.Equal(t, "title ASC", qb.orderBy)
	assert.Equal(t, qb, result) // Should return self for chaining
}

func TestQueryBuilderBuild(t *testing.T) {
	tests := []struct {
		name          string
		baseQuery     string
		criteria      FilterCriteria
		entityType    string
		orderBy       string
		expectedQuery string
		expectedArgs  int
	}{
		{
			name:      "basic query without filters",
			baseQuery: "SELECT * FROM projects",
			criteria: FilterCriteria{
				Fields: map[string]interface{}{},
				Limit:  10,
				Offset: 0,
			},
			entityType:    "project",
			expectedQuery: "SELECT * FROM projects ORDER BY created_at DESC LIMIT 10",
			expectedArgs:  0,
		},
		{
			name:      "query with filters",
			baseQuery: "SELECT * FROM projects",
			criteria: FilterCriteria{
				Fields: map[string]interface{}{
					"name": "test",
				},
				Limit:  5,
				Offset: 10,
			},
			entityType:    "project",
			expectedQuery: "SELECT * FROM projects WHERE title ILIKE $1 ORDER BY created_at DESC LIMIT 5 OFFSET 10",
			expectedArgs:  1,
		},
		{
			name:      "query with custom order by",
			baseQuery: "SELECT * FROM projects",
			criteria: FilterCriteria{
				Fields: map[string]interface{}{},
				Limit:  20,
				Offset: 0,
			},
			entityType:    "project",
			orderBy:       "title ASC",
			expectedQuery: "SELECT * FROM projects ORDER BY title ASC LIMIT 20",
			expectedArgs:  0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			qb := NewQueryBuilder(tt.baseQuery)
			err := qb.WithFilters(tt.criteria, tt.entityType)
			require.NoError(t, err)

			if tt.orderBy != "" {
				qb.WithOrderBy(tt.orderBy)
			}

			query, args := qb.Build()
			assert.Equal(t, tt.expectedQuery, query)
			assert.Equal(t, tt.expectedArgs, len(args))
		})
	}
}

func TestGetTableName(t *testing.T) {
	tests := []struct {
		entityType string
		expected   string
	}{
		{"project", "projects"},
		{"task", "tasks"},
		{"goal", "goals"},
		{"tag", "tags"},
		{"note", "notes"},
		{"flow", "flows"},
		{"workspace", "workspaces"},
		{"unknown", "unknowns"},
	}

	for _, tt := range tests {
		t.Run(tt.entityType, func(t *testing.T) {
			result := getTableName(tt.entityType)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestGetEntityColumns(t *testing.T) {
	tests := []struct {
		entityType string
		expected   string
	}{
		{
			"project",
			"id, title, description, status, workspace_id, flow_id, created_at, updated_at",
		},
		{
			"task",
			"id, title, description, goal_id, project_id, flow_id, status, priority, due_date, created_at, updated_at",
		},
		{
			"goal",
			"id, title, description, project_id, flow_id, status, priority, due_date, created_at, updated_at",
		},
		{
			"tag",
			"id, name, color, parent_id, created_at",
		},
		{
			"note",
			"id, title, content, entity_id, entity_type, created_at, updated_at",
		},
		{
			"flow",
			"id, title, description, color, status, start_date, end_date, parent_id, workspace_id, created_at, updated_at",
		},
		{
			"workspace",
			"id, name, description, created_at",
		},
		{
			"unknown",
			"*",
		},
	}

	for _, tt := range tests {
		t.Run(tt.entityType, func(t *testing.T) {
			result := getEntityColumns(tt.entityType)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestBuildSelectQuery(t *testing.T) {
	tests := []struct {
		name          string
		entityType    string
		criteria      FilterCriteria
		expectedQuery string
		expectError   bool
	}{
		{
			name:       "basic project query",
			entityType: "project",
			criteria: FilterCriteria{
				Fields: map[string]interface{}{},
				Limit:  10,
				Offset: 0,
			},
			expectedQuery: "SELECT id, title, description, status, workspace_id, flow_id, created_at, updated_at FROM projects ORDER BY created_at DESC LIMIT 10",
			expectError:   false,
		},
		{
			name:       "task query with filters",
			entityType: "task",
			criteria: FilterCriteria{
				Fields: map[string]interface{}{
					"status": "completed",
				},
				Limit:  5,
				Offset: 0,
			},
			expectedQuery: "SELECT id, title, description, goal_id, project_id, flow_id, status, priority, due_date, created_at, updated_at FROM tasks WHERE status = $1 ORDER BY created_at DESC LIMIT 5",
			expectError:   false,
		},
		{
			name:       "invalid entity type",
			entityType: "invalid",
			criteria: FilterCriteria{
				Fields: map[string]interface{}{
					"invalid_field": "value",
				},
			},
			expectError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			query, args, err := BuildSelectQuery(tt.entityType, tt.criteria)

			if tt.expectError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedQuery, query)
				assert.NotNil(t, args)
			}
		})
	}
}

func TestNewFilterResponse(t *testing.T) {
	data := []map[string]interface{}{
		{"id": 1, "name": "Project 1"},
		{"id": 2, "name": "Project 2"},
	}

	criteria := FilterCriteria{
		Fields: map[string]interface{}{
			"name":   "test",
			"status": "active",
		},
		Limit:  10,
		Offset: 0,
	}

	total := 25

	response := NewFilterResponse(data, total, criteria)

	assert.Equal(t, data, response.Data)
	assert.Equal(t, 25, response.Total)
	assert.Equal(t, 10, response.Limit)
	assert.Equal(t, 0, response.Offset)
	assert.True(t, response.HasMore) // 0 + 10 < 25
	assert.Len(t, response.FilteredBy, 2)
	assert.Contains(t, response.FilteredBy, "name")
	assert.Contains(t, response.FilteredBy, "status")
}

func TestFilterResponseHasMore(t *testing.T) {
	tests := []struct {
		name     string
		total    int
		limit    int
		offset   int
		expected bool
	}{
		{
			name:     "has more items",
			total:    100,
			limit:    10,
			offset:   0,
			expected: true, // 0 + 10 < 100
		},
		{
			name:     "no more items",
			total:    10,
			limit:    10,
			offset:   0,
			expected: false, // 0 + 10 = 10
		},
		{
			name:     "last page",
			total:    25,
			limit:    10,
			offset:   20,
			expected: false, // 20 + 10 > 25
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			criteria := FilterCriteria{
				Limit:  tt.limit,
				Offset: tt.offset,
			}

			response := NewFilterResponse([]interface{}{}, tt.total, criteria)
			assert.Equal(t, tt.expected, response.HasMore)
		})
	}
}