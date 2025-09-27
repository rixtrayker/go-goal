package api

import (
	"encoding/json"
	"html/template"
	"net/http"
	"path/filepath"

	"go-goal/pkg/config"
)

type WebHandler struct {
	templates *template.Template
	config    *config.Config
}

func NewWebHandler(cfg *config.Config) *WebHandler {
	templates := template.Must(template.ParseGlob(filepath.Join("web", "templates", "*.html")))
	return &WebHandler{
		templates: templates,
		config:    cfg,
	}
}

func (h *WebHandler) Dashboard(w http.ResponseWriter, r *http.Request) {
	data := struct {
		Title string
	}{
		Title: "Dashboard",
	}
	
	if err := h.templates.ExecuteTemplate(w, "layout.html", data); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func (h *WebHandler) Projects(w http.ResponseWriter, r *http.Request) {
	data := struct {
		Title string
	}{
		Title: "Projects",
	}
	
	if err := h.templates.ExecuteTemplate(w, "layout.html", data); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func (h *WebHandler) Goals(w http.ResponseWriter, r *http.Request) {
	data := struct {
		Title string
	}{
		Title: "Goals",
	}
	
	if err := h.templates.ExecuteTemplate(w, "layout.html", data); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func (h *WebHandler) Tasks(w http.ResponseWriter, r *http.Request) {
	data := struct {
		Title string
	}{
		Title: "Tasks",
	}
	
	if err := h.templates.ExecuteTemplate(w, "layout.html", data); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func (h *WebHandler) Tags(w http.ResponseWriter, r *http.Request) {
	data := struct {
		Title string
	}{
		Title: "Tags",
	}
	
	if err := h.templates.ExecuteTemplate(w, "layout.html", data); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func (h *WebHandler) Notes(w http.ResponseWriter, r *http.Request) {
	data := struct {
		Title string
	}{
		Title: "Notes",
	}
	
	if err := h.templates.ExecuteTemplate(w, "layout.html", data); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func (h *WebHandler) Workspaces(w http.ResponseWriter, r *http.Request) {
	data := struct {
		Title string
	}{
		Title: "Workspaces",
	}
	
	if err := h.templates.ExecuteTemplate(w, "layout.html", data); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func (h *WebHandler) Contexts(w http.ResponseWriter, r *http.Request) {
	data := struct {
		Title string
	}{
		Title: "Contexts",
	}
	
	if err := h.templates.ExecuteTemplate(w, "layout.html", data); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
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