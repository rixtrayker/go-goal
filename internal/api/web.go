package api

import (
	"encoding/json"
	"net/http"

	"go-goal/pkg/config"
)

type WebHandler struct {
	config *config.Config
}

func NewWebHandler(cfg *config.Config) *WebHandler {
	return &WebHandler{
		config: cfg,
	}
}

func (h *WebHandler) Dashboard(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "web/index.html")
}

func (h *WebHandler) Projects(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "web/index.html")
}

func (h *WebHandler) Goals(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "web/index.html")
}

func (h *WebHandler) Tasks(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "web/index.html")
}

func (h *WebHandler) Tags(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "web/index.html")
}

func (h *WebHandler) Notes(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "web/index.html")
}

func (h *WebHandler) Workspaces(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "web/index.html")
}

func (h *WebHandler) Flows(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "web/index.html")
}

// AppConfig returns the application configuration for the frontend
func (h *WebHandler) AppConfig(w http.ResponseWriter, r *http.Request) {
	// Create a safe subset of config to expose to frontend
	frontendConfig := struct {
		AppName             string   `json:"appName"`
		AppDescription      string   `json:"appDescription"`
		AppVersion          string   `json:"appVersion"`
		DefaultLanguage     string   `json:"defaultLanguage"`
		SupportedLanguages  []string `json:"supportedLanguages"`
		DefaultTheme        string   `json:"defaultTheme"`
		EnableRTL           bool     `json:"enableRTL"`
		EnableDarkMode      bool     `json:"enableDarkMode"`
		EnableMultiLanguage bool     `json:"enableMultiLanguage"`
		EnableRealTimeUpdates bool   `json:"enableRealTimeUpdates"`
	}{
		AppName:               h.config.AppName,
		AppDescription:        h.config.AppDescription,
		AppVersion:            h.config.AppVersion,
		DefaultLanguage:       h.config.DefaultLanguage,
		SupportedLanguages:    h.config.SupportedLanguages,
		DefaultTheme:          h.config.DefaultTheme,
		EnableRTL:             h.config.EnableRTL,
		EnableDarkMode:        h.config.EnableDarkMode,
		EnableMultiLanguage:   h.config.EnableMultiLanguage,
		EnableRealTimeUpdates: h.config.EnableRealTimeUpdates,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(frontendConfig); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}