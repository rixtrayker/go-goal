package api

import (
	"html"
	"regexp"
	"strings"
	"unicode"
)

// SecurityConfig holds security configuration for filtering
type SecurityConfig struct {
	MaxFilterLength     int
	MaxFilterCount      int
	AllowedCharPattern  *regexp.Regexp
	BlockedPatterns     []*regexp.Regexp
	EnableXSSProtection bool
	EnableSQLProtection bool
}

// DefaultSecurityConfig returns default security configuration
func DefaultSecurityConfig() SecurityConfig {
	// Compile regex patterns for performance
	allowedChars := regexp.MustCompile(`^[a-zA-Z0-9\s\-_.,@:\/\p{L}]*$`)
	
	blockedPatterns := []*regexp.Regexp{
		regexp.MustCompile(`(?i)\b(union|select|insert|update|delete|drop|create|alter|exec)\b`),
		regexp.MustCompile(`(?i)(javascript:|data:|vbscript:)`),
		regexp.MustCompile(`(?i)(<script|<iframe|<object|<embed)`),
		regexp.MustCompile(`(?i)(onload|onclick|onerror|onmouseover)=`),
	}

	return SecurityConfig{
		MaxFilterLength:     255,
		MaxFilterCount:      20,
		AllowedCharPattern:  allowedChars,
		BlockedPatterns:     blockedPatterns,
		EnableXSSProtection: true,
		EnableSQLProtection: true,
	}
}

// SecureSanitizeFilterValue performs comprehensive sanitization with security checks
func SecureSanitizeFilterValue(input string, config SecurityConfig) (string, error) {
	// Check length limits
	if len(input) > config.MaxFilterLength {
		input = input[:config.MaxFilterLength]
	}

	// Trim whitespace
	input = strings.TrimSpace(input)

	// XSS Protection
	if config.EnableXSSProtection {
		input = html.EscapeString(input)
		
		// Remove potentially dangerous patterns
		for _, pattern := range config.BlockedPatterns {
			if pattern.MatchString(input) {
				// Log security violation but don't error - just sanitize
				input = pattern.ReplaceAllString(input, "")
			}
		}
	}

	// Normalize unicode
	input = normalizeUnicode(input)

	// Remove null bytes and control characters
	input = removeControlCharacters(input)

	return input, nil
}

// ValidateFilterSecurity performs security validation on filter criteria
func ValidateFilterSecurity(criteria FilterCriteria, config SecurityConfig) error {
	// Check total number of filters
	if len(criteria.Fields) > config.MaxFilterCount {
		return ErrTooManyFilters
	}

	// Validate each filter field
	for fieldName, value := range criteria.Fields {
		valueStr, ok := value.(string)
		if !ok {
			continue
		}

		// Check field name security
		if err := validateFieldNameSecurity(fieldName, config); err != nil {
			return err
		}

		// Check value security
		if err := validateValueSecurity(valueStr, config); err != nil {
			return err
		}
	}

	return nil
}

// validateFieldNameSecurity validates filter field names for security
func validateFieldNameSecurity(fieldName string, config SecurityConfig) error {
	// Field names should only contain safe characters
	if !regexp.MustCompile(`^[a-zA-Z_][a-zA-Z0-9_]*$`).MatchString(fieldName) {
		return ErrInvalidFieldName
	}

	// Check against specific dangerous patterns for field names
	dangerousFieldPatterns := []*regexp.Regexp{
		regexp.MustCompile(`(?i)\b(script|exec|eval|union|select)\b`),
	}
	
	for _, pattern := range dangerousFieldPatterns {
		if pattern.MatchString(fieldName) {
			return ErrSecurityViolation
		}
	}

	return nil
}

// validateValueSecurity validates filter values for security issues
func validateValueSecurity(value string, config SecurityConfig) error {
	// Check for potential SQL injection patterns
	if config.EnableSQLProtection {
		sqlPatterns := []*regexp.Regexp{
			regexp.MustCompile(`(?i)(;|\|\||&&)`), // Command separators
			regexp.MustCompile(`(?i)(--|\#|/\*)`), // SQL comments
		}

		for _, pattern := range sqlPatterns {
			if pattern.MatchString(value) {
				return ErrSecurityViolation
			}
		}
	}

	// Check for XSS patterns
	if config.EnableXSSProtection {
		xssPatterns := []*regexp.Regexp{
			regexp.MustCompile(`(?i)<[^>]*>`), // HTML tags
			regexp.MustCompile(`(?i)javascript:`),
			regexp.MustCompile(`(?i)data:text/html`),
		}

		for _, pattern := range xssPatterns {
			if pattern.MatchString(value) {
				return ErrSecurityViolation
			}
		}
	}

	return nil
}

// normalizeUnicode normalizes unicode characters to prevent bypass attacks
func normalizeUnicode(input string) string {
	// Convert to lowercase for consistency
	input = strings.ToLower(input)
	
	// Remove or replace problematic unicode characters
	var result strings.Builder
	for _, r := range input {
		if unicode.IsPrint(r) && !unicode.IsControl(r) {
			result.WriteRune(r)
		}
	}
	
	return result.String()
}

// removeControlCharacters removes null bytes and control characters
func removeControlCharacters(input string) string {
	var result strings.Builder
	for _, r := range input {
		if r != 0 && !unicode.IsControl(r) {
			result.WriteRune(r)
		}
	}
	return result.String()
}

// RateLimitConfig holds rate limiting configuration for filtering
type RateLimitConfig struct {
	MaxRequestsPerMinute int
	MaxComplexFilters    int
}

// FilterComplexity calculates the complexity score of filter criteria
func FilterComplexity(criteria FilterCriteria) int {
	complexity := 0
	
	// Add complexity for number of filters
	complexity += len(criteria.Fields)
	
	// Add complexity for specific filter types
	for fieldName, value := range criteria.Fields {
		valueStr, ok := value.(string)
		if !ok {
			continue
		}
		
		// Text search filters are more expensive
		if strings.Contains(fieldName, "name") || strings.Contains(fieldName, "content") {
			complexity += 2
		}
		
		// Date range filters are moderately expensive
		if strings.Contains(fieldName, "_after") || strings.Contains(fieldName, "_before") {
			complexity += 1
		}
		
		// Array filters (like tag_ids) are expensive
		if strings.Contains(valueStr, ",") {
			complexity += 3
		}
	}
	
	// Large result sets are expensive
	if criteria.Limit > 100 {
		complexity += 2
	}
	
	return complexity
}

// Custom error types for security validation
type SecurityError struct {
	message string
}

func (e SecurityError) Error() string {
	return e.message
}

var (
	ErrTooManyFilters    = SecurityError{"too many filter parameters"}
	ErrInvalidFieldName  = SecurityError{"invalid filter field name"}
	ErrSecurityViolation = SecurityError{"potential security violation detected"}
	ErrFilterTooComplex  = SecurityError{"filter query too complex"}
)