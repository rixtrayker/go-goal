package api

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestDefaultSecurityConfig(t *testing.T) {
	config := DefaultSecurityConfig()

	assert.Equal(t, 255, config.MaxFilterLength)
	assert.Equal(t, 20, config.MaxFilterCount)
	assert.True(t, config.EnableXSSProtection)
	assert.True(t, config.EnableSQLProtection)
	assert.NotNil(t, config.AllowedCharPattern)
	assert.Len(t, config.BlockedPatterns, 4)
}

func TestSecureSanitizeFilterValue(t *testing.T) {
	config := DefaultSecurityConfig()

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
			name:     "text with special characters",
			input:    "Project-Name_123",
			expected: "project-name_123",
		},
		{
			name:     "xss attempt",
			input:    "<script>alert('xss')</script>",
			expected: "&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;", // HTML is escaped but script content remains
		},
		{
			name:     "sql injection attempt",
			input:    "'; DROP TABLE users; --",
			expected: "&#39;;  table users; --",
		},
		{
			name:     "long input",
			input:    string(make([]byte, 300)),
			expected: "", // Control characters are removed
		},
		{
			name:     "unicode text",
			input:    "Проект Test 项目",
			expected: "проект test 项目",
		},
		{
			name:     "text with null bytes",
			input:    "test\x00value",
			expected: "testvalue",
		},
		{
			name:     "javascript protocol",
			input:    "javascript:alert('xss')",
			expected: "alert(&#39;xss&#39;)", // javascript: gets removed completely
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := SecureSanitizeFilterValue(tt.input, config)
			assert.NoError(t, err)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestValidateFilterSecurity(t *testing.T) {
	config := DefaultSecurityConfig()

	tests := []struct {
		name        string
		criteria    FilterCriteria
		expectError bool
		errorType   error
	}{
		{
			name: "valid criteria",
			criteria: FilterCriteria{
				Fields: map[string]interface{}{
					"name":   "test",
					"status": "active",
				},
			},
			expectError: false,
		},
		{
			name: "too many filters",
			criteria: FilterCriteria{
				Fields: func() map[string]interface{} {
					fields := make(map[string]interface{})
					for i := 0; i < 25; i++ {
						fields["field"+string(rune('0'+i))] = "value"
					}
					return fields
				}(),
			},
			expectError: true,
			errorType:   ErrTooManyFilters,
		},
		{
			name: "invalid field name",
			criteria: FilterCriteria{
				Fields: map[string]interface{}{
					"invalid-field!": "value",
				},
			},
			expectError: true,
			errorType:   ErrInvalidFieldName,
		},
		{
			name: "sql injection in value",
			criteria: FilterCriteria{
				Fields: map[string]interface{}{
					"name": "test'; DROP TABLE users; --",
				},
			},
			expectError: true,
			errorType:   ErrSecurityViolation,
		},
		{
			name: "xss in value",
			criteria: FilterCriteria{
				Fields: map[string]interface{}{
					"name": "<script>alert('xss')</script>",
				},
			},
			expectError: true,
			errorType:   ErrSecurityViolation,
		},
		{
			name: "javascript protocol",
			criteria: FilterCriteria{
				Fields: map[string]interface{}{
					"name": "javascript:alert('xss')",
				},
			},
			expectError: true,
			errorType:   ErrSecurityViolation,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateFilterSecurity(tt.criteria, config)

			if tt.expectError {
				assert.Error(t, err)
				if tt.errorType != nil {
					assert.Equal(t, tt.errorType, err)
				}
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestValidateFieldNameSecurity(t *testing.T) {
	config := DefaultSecurityConfig()

	tests := []struct {
		name        string
		fieldName   string
		expectError bool
		errorType   error
	}{
		{
			name:        "valid field name",
			fieldName:   "project_name",
			expectError: false,
		},
		{
			name:        "valid camelCase field",
			fieldName:   "projectName",
			expectError: false,
		},
		{
			name:        "field with underscore",
			fieldName:   "created_at",
			expectError: false,
		},
		{
			name:        "field starting with number",
			fieldName:   "1invalid",
			expectError: true,
			errorType:   ErrInvalidFieldName,
		},
		{
			name:        "field with special characters",
			fieldName:   "field-name!",
			expectError: true,
			errorType:   ErrInvalidFieldName,
		},
		{
			name:        "field with sql keyword",
			fieldName:   "select",
			expectError: true,
			errorType:   ErrSecurityViolation,
		},
		{
			name:        "field with script",
			fieldName:   "script",
			expectError: true,
			errorType:   ErrSecurityViolation,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validateFieldNameSecurity(tt.fieldName, config)

			if tt.expectError {
				assert.Error(t, err)
				if tt.errorType != nil {
					assert.Equal(t, tt.errorType, err)
				}
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestValidateValueSecurity(t *testing.T) {
	config := DefaultSecurityConfig()

	tests := []struct {
		name        string
		value       string
		expectError bool
		errorType   error
	}{
		{
			name:        "safe value",
			value:       "project name",
			expectError: false,
		},
		{
			name:        "value with sql comment",
			value:       "test -- comment",
			expectError: true,
			errorType:   ErrSecurityViolation,
		},
		{
			name:        "value with sql separator",
			value:       "test; DROP TABLE",
			expectError: true,
			errorType:   ErrSecurityViolation,
		},
		{
			name:        "value with logical operators",
			value:       "test || 1=1",
			expectError: true,
			errorType:   ErrSecurityViolation,
		},
		{
			name:        "value with html tags",
			value:       "<div>content</div>",
			expectError: true,
			errorType:   ErrSecurityViolation,
		},
		{
			name:        "value with javascript",
			value:       "javascript:alert('xss')",
			expectError: true,
			errorType:   ErrSecurityViolation,
		},
		{
			name:        "value with data url",
			value:       "data:text/html,<script>alert(1)</script>",
			expectError: true,
			errorType:   ErrSecurityViolation,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validateValueSecurity(tt.value, config)

			if tt.expectError {
				assert.Error(t, err)
				if tt.errorType != nil {
					assert.Equal(t, tt.errorType, err)
				}
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestNormalizeUnicode(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "ascii text",
			input:    "Project Name",
			expected: "project name",
		},
		{
			name:     "unicode text",
			input:    "Проект Test 项目",
			expected: "проект test 项目",
		},
		{
			name:     "mixed case",
			input:    "MiXeD CaSe",
			expected: "mixed case",
		},
		{
			name:     "text with control characters",
			input:    "test\x01control\x02chars",
			expected: "testcontrolchars",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := normalizeUnicode(tt.input)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestRemoveControlCharacters(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "normal text",
			input:    "normal text",
			expected: "normal text",
		},
		{
			name:     "text with null bytes",
			input:    "test\x00null\x00bytes",
			expected: "testnullbytes",
		},
		{
			name:     "text with various control chars",
			input:    "test\x01\x02\x03control",
			expected: "testcontrol",
		},
		{
			name:     "text with newlines and tabs",
			input:    "test\n\twith\rwhitespace",
			expected: "testwithwhitespace",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := removeControlCharacters(tt.input)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestFilterComplexity(t *testing.T) {
	tests := []struct {
		name     string
		criteria FilterCriteria
		expected int
	}{
		{
			name: "simple filters",
			criteria: FilterCriteria{
				Fields: map[string]interface{}{
					"status": "active",
				},
				Limit: 10,
			},
			expected: 1, // 1 field
		},
		{
			name: "text search filter",
			criteria: FilterCriteria{
				Fields: map[string]interface{}{
					"name": "project",
				},
				Limit: 10,
			},
			expected: 3, // 1 field + 2 for text search
		},
		{
			name: "date range filters",
			criteria: FilterCriteria{
				Fields: map[string]interface{}{
					"created_after":  "2023-01-01",
					"created_before": "2023-12-31",
				},
				Limit: 10,
			},
			expected: 4, // 2 fields + 1 each for date filters
		},
		{
			name: "array filter",
			criteria: FilterCriteria{
				Fields: map[string]interface{}{
					"tag_ids": "1,2,3",
				},
				Limit: 10,
			},
			expected: 4, // 1 field + 3 for array
		},
		{
			name: "large limit",
			criteria: FilterCriteria{
				Fields: map[string]interface{}{
					"status": "active",
				},
				Limit: 200,
			},
			expected: 3, // 1 field + 2 for large limit
		},
		{
			name: "complex query",
			criteria: FilterCriteria{
				Fields: map[string]interface{}{
					"name":          "project",
					"status":        "active",
					"created_after": "2023-01-01",
					"tag_ids":       "1,2,3",
				},
				Limit: 150,
			},
			expected: 12, // 4 fields + 2 for name + 1 for date + 3 for array + 2 for large limit
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := FilterComplexity(tt.criteria)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestSecurityError(t *testing.T) {
	err := SecurityError{"test error"}
	assert.Equal(t, "test error", err.Error())
}

func TestSecurityErrorConstants(t *testing.T) {
	assert.Equal(t, "too many filter parameters", ErrTooManyFilters.Error())
	assert.Equal(t, "invalid filter field name", ErrInvalidFieldName.Error())
	assert.Equal(t, "potential security violation detected", ErrSecurityViolation.Error())
	assert.Equal(t, "filter query too complex", ErrFilterTooComplex.Error())
}