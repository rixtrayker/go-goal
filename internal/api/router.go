package api

import (
	"database/sql"
	"net/http"

	"go-goal/pkg/config"
	"go-goal/internal/graphql"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gorilla/mux"
)

func NewRouter(db *sql.DB, cfg *config.Config) http.Handler {
	r := mux.NewRouter()
	
	// Serve static files
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("web/static/"))))
	
	// Initialize handlers
	projectHandler := &ProjectHandler{DB: db}
	goalHandler := &GoalHandler{DB: db}
	taskHandler := &TaskHandler{DB: db}
	tagHandler := &TagHandler{DB: db}
	noteHandler := &NoteHandler{DB: db}
	workspaceHandler := &WorkspaceHandler{DB: db}
	taggingHandler := &TaggingHandler{DB: db}
	contextHandler := &ContextHandler{DB: db}
	webHandler := NewWebHandler(cfg)
	
	// Health check endpoint
	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	}).Methods("GET")
	
	// GraphQL endpoint
	resolver := &graphql.Resolver{DB: db}
	srv := handler.NewDefaultServer(graphql.NewExecutableSchema(graphql.Config{Resolvers: resolver}))
	r.Handle("/graphql", srv)
	r.Handle("/playground", playground.Handler("GraphQL playground", "/graphql"))
	
	// Web routes
	r.HandleFunc("/", webHandler.Dashboard).Methods("GET")
	r.HandleFunc("/dashboard", webHandler.Dashboard).Methods("GET")
	r.HandleFunc("/projects", webHandler.Projects).Methods("GET")
	r.HandleFunc("/goals", webHandler.Goals).Methods("GET")
	r.HandleFunc("/tasks", webHandler.Tasks).Methods("GET")
	r.HandleFunc("/tags", webHandler.Tags).Methods("GET")
	r.HandleFunc("/notes", webHandler.Notes).Methods("GET")
	r.HandleFunc("/workspaces", webHandler.Workspaces).Methods("GET")
	r.HandleFunc("/contexts", webHandler.Contexts).Methods("GET")
	
	// API routes
	api := r.PathPrefix("/api/v1").Subrouter()
	
	// Project routes
	api.HandleFunc("/projects", projectHandler.GetProjects).Methods("GET")
	api.HandleFunc("/projects", projectHandler.CreateProject).Methods("POST")
	api.HandleFunc("/projects/{id:[0-9]+}", projectHandler.GetProject).Methods("GET")
	api.HandleFunc("/projects/{id:[0-9]+}", projectHandler.UpdateProject).Methods("PUT")
	api.HandleFunc("/projects/{id:[0-9]+}", projectHandler.DeleteProject).Methods("DELETE")
	
	// Goal routes
	api.HandleFunc("/goals", goalHandler.GetGoals).Methods("GET")
	api.HandleFunc("/goals", goalHandler.CreateGoal).Methods("POST")
	api.HandleFunc("/goals/{id:[0-9]+}", goalHandler.GetGoal).Methods("GET")
	api.HandleFunc("/goals/{id:[0-9]+}", goalHandler.UpdateGoal).Methods("PUT")
	api.HandleFunc("/goals/{id:[0-9]+}", goalHandler.DeleteGoal).Methods("DELETE")
	
	// Task routes
	api.HandleFunc("/tasks", taskHandler.GetTasks).Methods("GET")
	api.HandleFunc("/tasks", taskHandler.CreateTask).Methods("POST")
	api.HandleFunc("/tasks/{id:[0-9]+}", taskHandler.GetTask).Methods("GET")
	api.HandleFunc("/tasks/{id:[0-9]+}", taskHandler.UpdateTask).Methods("PUT")
	api.HandleFunc("/tasks/{id:[0-9]+}", taskHandler.DeleteTask).Methods("DELETE")
	
	// Tag routes
	api.HandleFunc("/tags", tagHandler.GetTags).Methods("GET")
	api.HandleFunc("/tags", tagHandler.CreateTag).Methods("POST")
	api.HandleFunc("/tags/{id:[0-9]+}", tagHandler.GetTag).Methods("GET")
	api.HandleFunc("/tags/{id:[0-9]+}", tagHandler.UpdateTag).Methods("PUT")
	api.HandleFunc("/tags/{id:[0-9]+}", tagHandler.DeleteTag).Methods("DELETE")
	
	// Note routes
	api.HandleFunc("/notes", noteHandler.GetNotes).Methods("GET")
	api.HandleFunc("/notes", noteHandler.CreateNote).Methods("POST")
	api.HandleFunc("/notes/{id:[0-9]+}", noteHandler.GetNote).Methods("GET")
	api.HandleFunc("/notes/{id:[0-9]+}", noteHandler.UpdateNote).Methods("PUT")
	api.HandleFunc("/notes/{id:[0-9]+}", noteHandler.DeleteNote).Methods("DELETE")
	
	// Workspace routes
	api.HandleFunc("/workspaces", workspaceHandler.GetWorkspaces).Methods("GET")
	api.HandleFunc("/workspaces", workspaceHandler.CreateWorkspace).Methods("POST")
	api.HandleFunc("/workspaces/{id:[0-9]+}", workspaceHandler.GetWorkspace).Methods("GET")
	api.HandleFunc("/workspaces/{id:[0-9]+}", workspaceHandler.UpdateWorkspace).Methods("PUT")
	api.HandleFunc("/workspaces/{id:[0-9]+}", workspaceHandler.DeleteWorkspace).Methods("DELETE")
	
	// Tagging routes
	api.HandleFunc("/tags/assign", taggingHandler.AssignTag).Methods("POST")
	api.HandleFunc("/tags/remove/{entity_type}/{entity_id:[0-9]+}/{tag_id:[0-9]+}", taggingHandler.RemoveTag).Methods("DELETE")
	api.HandleFunc("/tags/{entity_type}/{entity_id:[0-9]+}", taggingHandler.GetEntityTags).Methods("GET")
	
	// Context routes
	api.HandleFunc("/contexts", contextHandler.GetContexts).Methods("GET")
	api.HandleFunc("/contexts", contextHandler.CreateContext).Methods("POST")
	api.HandleFunc("/contexts/{id:[0-9]+}", contextHandler.GetContext).Methods("GET")
	api.HandleFunc("/contexts/{id:[0-9]+}", contextHandler.UpdateContext).Methods("PUT")
	api.HandleFunc("/contexts/{id:[0-9]+}", contextHandler.DeleteContext).Methods("DELETE")
	api.HandleFunc("/contexts/{id:[0-9]+}/stats", contextHandler.GetContextStats).Methods("GET")
	
	return r
}