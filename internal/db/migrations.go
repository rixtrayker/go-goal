package db

import (
	"database/sql"
	"fmt"
	"io/ioutil"
	"path/filepath"
)

func RunMigrations(db *sql.DB) error {
	// Create migrations table if it doesn't exist
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS migrations (
			version INTEGER PRIMARY KEY,
			applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		return fmt.Errorf("failed to create migrations table: %w", err)
	}

	// Run migration 001
	var count int
	err = db.QueryRow("SELECT COUNT(*) FROM migrations WHERE version = 1").Scan(&count)
	if err != nil {
		return fmt.Errorf("failed to check migration status: %w", err)
	}

	if count == 0 {
		// Read and execute migration file
		migrationSQL, err := ioutil.ReadFile("migrations/001_create_tables.sql")
		if err != nil {
			return fmt.Errorf("failed to read migration file: %w", err)
		}

		_, err = db.Exec(string(migrationSQL))
		if err != nil {
			return fmt.Errorf("failed to execute migration: %w", err)
		}

		// Mark migration as applied
		_, err = db.Exec("INSERT INTO migrations (version) VALUES (1)")
		if err != nil {
			return fmt.Errorf("failed to record migration: %w", err)
		}

		fmt.Println("Migration 001 applied successfully")
	}

	return nil
}