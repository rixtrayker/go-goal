package api

import (
	"html/template"
	"net/http"
	"path/filepath"
)

type WebHandler struct {
	templates *template.Template
}

func NewWebHandler() *WebHandler {
	templates := template.Must(template.ParseGlob(filepath.Join("web", "templates", "*.html")))
	return &WebHandler{templates: templates}
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