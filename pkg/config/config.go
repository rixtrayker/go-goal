package config

import (
	"os"
	"strconv"
	"strings"
)

type Config struct {
	Port        string
	DatabaseURL string
	
	// App Configuration
	AppName        string
	AppDescription string
	AppVersion     string
	
	// UI Configuration
	DefaultLanguage string
	SupportedLanguages []string
	DefaultTheme    string
	EnableRTL       bool
	
	// Feature Flags
	EnableDarkMode     bool
	EnableMultiLanguage bool
	EnableRealTimeUpdates bool
}

func Load() *Config {
	supportedLangs := []string{"en", "ar"}
	if langEnv := getEnv("SUPPORTED_LANGUAGES", ""); langEnv != "" {
		// Parse comma-separated languages
		supportedLangs = strings.Split(langEnv, ",")
		for i := range supportedLangs {
			supportedLangs[i] = strings.TrimSpace(supportedLangs[i])
		}
	}
	
	return &Config{
		Port:        getEnv("PORT", "8080"),
		DatabaseURL: getEnv("DATABASE_URL", "postgres://localhost/go_goal_dev?sslmode=disable"),
		
		// App Configuration
		AppName:        getEnv("APP_NAME", "Go Goal"),
		AppDescription: getEnv("APP_DESCRIPTION", "Project Management System"),
		AppVersion:     getEnv("APP_VERSION", "1.0.0"),
		
		// UI Configuration
		DefaultLanguage:    getEnv("DEFAULT_LANGUAGE", "en"),
		SupportedLanguages: supportedLangs,
		DefaultTheme:       getEnv("DEFAULT_THEME", "dark"),
		EnableRTL:          getBoolEnv("ENABLE_RTL", true),
		
		// Feature Flags
		EnableDarkMode:        getBoolEnv("ENABLE_DARK_MODE", true),
		EnableMultiLanguage:   getBoolEnv("ENABLE_MULTI_LANGUAGE", true),
		EnableRealTimeUpdates: getBoolEnv("ENABLE_REAL_TIME_UPDATES", true),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getBoolEnv(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if parsed, err := strconv.ParseBool(value); err == nil {
			return parsed
		}
	}
	return defaultValue
}