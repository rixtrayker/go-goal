package api

import (
	"database/sql"
	"fmt"
)

// QueryBuilder helps build dynamic SQL queries with filters
type QueryBuilder struct {
	baseQuery    string
	whereClause  string
	args         []interface{}
	orderBy      string
	limit        int
	offset       int
}

// NewQueryBuilder creates a new query builder with a base query
func NewQueryBuilder(baseQuery string) *QueryBuilder {
	return &QueryBuilder{
		baseQuery: baseQuery,
		args:      make([]interface{}, 0),
	}
}

// WithFilters adds filter criteria to the query
func (qb *QueryBuilder) WithFilters(criteria FilterCriteria, entityType string) error {
	whereClause, args, err := BuildWhereClause(criteria, entityType)
	if err != nil {
		return err
	}

	qb.whereClause = whereClause
	qb.args = args
	qb.limit = criteria.Limit
	qb.offset = criteria.Offset

	return nil
}

// WithOrderBy adds ORDER BY clause
func (qb *QueryBuilder) WithOrderBy(orderBy string) *QueryBuilder {
	qb.orderBy = orderBy
	return qb
}

// Build constructs the final SQL query
func (qb *QueryBuilder) Build() (string, []interface{}) {
	query := qb.baseQuery + qb.whereClause

	// Add ORDER BY if specified
	if qb.orderBy != "" {
		query += " ORDER BY " + qb.orderBy
	} else if !containsOrderBy(query) {
		// Add default ordering for consistent pagination
		query += " ORDER BY created_at DESC"
	}

	// Add pagination
	if qb.limit > 0 {
		query += " LIMIT " + intToString(qb.limit)
	}

	if qb.offset > 0 {
		query += " OFFSET " + intToString(qb.offset)
	}

	return query, qb.args
}

// Execute runs the query and returns rows
func (qb *QueryBuilder) Execute(db *sql.DB) (*sql.Rows, error) {
	query, args := qb.Build()
	return db.Query(query, args...)
}

// ExecuteCount runs a count query with the same filters
func (qb *QueryBuilder) ExecuteCount(db *sql.DB, entityType string) (int, error) {
	// Build count query
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM %s", getTableName(entityType))
	countQuery += qb.whereClause

	var count int
	err := db.QueryRow(countQuery, qb.args...).Scan(&count)
	return count, err
}

// FilteredQuery is a convenience function to build and execute a filtered query
func FilteredQuery(db *sql.DB, baseQuery string, criteria FilterCriteria, entityType string) (*sql.Rows, error) {
	qb := NewQueryBuilder(baseQuery)
	if err := qb.WithFilters(criteria, entityType); err != nil {
		return nil, err
	}
	return qb.Execute(db)
}

// FilteredQueryWithCount executes both the filtered query and count query
func FilteredQueryWithCount(db *sql.DB, baseQuery string, criteria FilterCriteria, entityType string) (*sql.Rows, int, error) {
	qb := NewQueryBuilder(baseQuery)
	if err := qb.WithFilters(criteria, entityType); err != nil {
		return nil, 0, err
	}

	// Execute main query
	rows, err := qb.Execute(db)
	if err != nil {
		return nil, 0, err
	}

	// Execute count query
	count, err := qb.ExecuteCount(db, entityType)
	if err != nil {
		rows.Close()
		return nil, 0, err
	}

	return rows, count, nil
}

// getTableName returns the database table name for an entity type
func getTableName(entityType string) string {
	switch entityType {
	case "project":
		return "projects"
	case "task":
		return "tasks"
	case "goal":
		return "goals"
	case "tag":
		return "tags"
	case "note":
		return "notes"
	case "flow":
		return "flows"
	case "workspace":
		return "workspaces"
	default:
		return entityType + "s" // Default pluralization
	}
}

// BuildSelectQuery creates a complete SELECT query for an entity type
func BuildSelectQuery(entityType string, criteria FilterCriteria) (string, []interface{}, error) {
	// Get base columns for entity type
	columns := getEntityColumns(entityType)
	tableName := getTableName(entityType)

	baseQuery := fmt.Sprintf("SELECT %s FROM %s", columns, tableName)

	qb := NewQueryBuilder(baseQuery)
	if err := qb.WithFilters(criteria, entityType); err != nil {
		return "", nil, err
	}

	query, args := qb.Build()
	return query, args, nil
}

// getEntityColumns returns the column list for an entity type
func getEntityColumns(entityType string) string {
	switch entityType {
	case "project":
		return "id, title, description, status, workspace_id, flow_id, created_at, updated_at"
	case "task":
		return "id, title, description, goal_id, project_id, flow_id, status, priority, due_date, created_at, updated_at"
	case "goal":
		return "id, title, description, project_id, flow_id, status, priority, due_date, created_at, updated_at"
	case "tag":
		return "id, name, color, parent_id, created_at"
	case "note":
		return "id, title, content, entity_id, entity_type, created_at, updated_at"
	case "flow":
		return "id, title, description, color, status, start_date, end_date, parent_id, workspace_id, created_at, updated_at"
	case "workspace":
		return "id, name, description, created_at"
	default:
		return "*"
	}
}

// FilterResponse represents a filtered query response with metadata
type FilterResponse struct {
	Data       interface{} `json:"data"`
	Total      int         `json:"total"`
	Limit      int         `json:"limit"`
	Offset     int         `json:"offset"`
	HasMore    bool        `json:"has_more"`
	FilteredBy []string    `json:"filtered_by,omitempty"`
}

// NewFilterResponse creates a filter response with metadata
func NewFilterResponse(data interface{}, total int, criteria FilterCriteria) FilterResponse {
	hasMore := (criteria.Offset + criteria.Limit) < total

	// Get list of applied filters
	var filteredBy []string
	for field := range criteria.Fields {
		filteredBy = append(filteredBy, field)
	}

	return FilterResponse{
		Data:       data,
		Total:      total,
		Limit:      criteria.Limit,
		Offset:     criteria.Offset,
		HasMore:    hasMore,
		FilteredBy: filteredBy,
	}
}