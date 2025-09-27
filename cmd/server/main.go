package main

import (
	"fmt"
	"log"
	"net/http"

	"go-goal/internal/api"
	"go-goal/internal/db"
	"go-goal/pkg/config"
)

func main() {
	cfg := config.Load()
	
	database, err := db.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer database.Close()

	// Run migrations
	if err := db.RunMigrations(database); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	router := api.NewRouter(database, cfg)
	
	fmt.Printf("Server starting on port %s\n", cfg.Port)
	log.Fatal(http.ListenAndServe(":"+cfg.Port, router))
}