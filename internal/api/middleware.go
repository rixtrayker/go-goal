package api

import (
	"context"
	"log"
	"net/http"
)

// ContextKey is a type for context keys to avoid collisions
type ContextKey string

const (
	// FilterCriteriaKey is the context key for filter criteria
	FilterCriteriaKey ContextKey = "filter_criteria"
	// EntityTypeKey is the context key for entity type
	EntityTypeKey ContextKey = "entity_type"
)

// FilterMiddleware is middleware that parses and validates filter parameters
func FilterMiddleware(entityType string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Parse filter parameters from request
			criteria := ParseFilterParams(r)

			// Validate filter parameters
			if err := ValidateFilterParams(criteria, entityType); err != nil {
				log.Printf("Filter validation error for entity %s: %v", entityType, err)
				http.Error(w, "Invalid filter parameters: "+err.Error(), http.StatusBadRequest)
				return
			}

			// Add filter criteria and entity type to request context
			ctx := context.WithValue(r.Context(), FilterCriteriaKey, criteria)
			ctx = context.WithValue(ctx, EntityTypeKey, entityType)
			
			// Continue with the modified request
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// GetFilterCriteriaFromContext extracts filter criteria from request context
func GetFilterCriteriaFromContext(ctx context.Context) (FilterCriteria, bool) {
	criteria, ok := ctx.Value(FilterCriteriaKey).(FilterCriteria)
	return criteria, ok
}

// GetEntityTypeFromContext extracts entity type from request context
func GetEntityTypeFromContext(ctx context.Context) (string, bool) {
	entityType, ok := ctx.Value(EntityTypeKey).(string)
	return entityType, ok
}

// ApplyPagination adds LIMIT and OFFSET to a SQL query
func ApplyPagination(baseQuery string, criteria FilterCriteria) string {
	// Add ORDER BY if not present (required for consistent pagination)
	if len(baseQuery) > 0 && !containsOrderBy(baseQuery) {
		baseQuery += " ORDER BY created_at DESC"
	}

	// Add pagination
	if criteria.Limit > 0 {
		baseQuery += " LIMIT " + intToString(criteria.Limit)
	}

	if criteria.Offset > 0 {
		baseQuery += " OFFSET " + intToString(criteria.Offset)
	}

	return baseQuery
}

// containsOrderBy checks if a query already contains ORDER BY clause
func containsOrderBy(query string) bool {
	// Simple check for ORDER BY - in production might want more sophisticated parsing
	for i := 0; i < len(query)-8; i++ {
		if (query[i] == 'O' || query[i] == 'o') &&
			(query[i+1] == 'R' || query[i+1] == 'r') &&
			(query[i+2] == 'D' || query[i+2] == 'd') &&
			(query[i+3] == 'E' || query[i+3] == 'e') &&
			(query[i+4] == 'R' || query[i+4] == 'r') &&
			query[i+5] == ' ' &&
			(query[i+6] == 'B' || query[i+6] == 'b') &&
			(query[i+7] == 'Y' || query[i+7] == 'y') {
			return true
		}
	}
	return false
}

// intToString converts int to string (simple implementation)
func intToString(n int) string {
	if n == 0 {
		return "0"
	}

	result := ""
	for n > 0 {
		digit := n % 10
		result = string(rune('0'+digit)) + result
		n /= 10
	}
	return result
}

// CorsMiddleware adds CORS headers for API endpoints
func CorsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// LoggingMiddleware logs HTTP requests
func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("API Request: %s %s", r.Method, r.URL.Path)
		
		// Log filter parameters if present
		if len(r.URL.RawQuery) > 0 {
			log.Printf("Query parameters: %s", r.URL.RawQuery)
		}

		next.ServeHTTP(w, r)
	})
}