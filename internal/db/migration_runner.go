package db

import (
	"database/sql"
	"fmt"
	"io/ioutil"
	"path/filepath"
	"sort"
	"strings"
)

// MigrationInfo holds information about a migration
type MigrationInfo struct {
	Version     int
	Filename    string
	Description string
}

// RunAllMigrations runs all pending migrations in order
func RunAllMigrations(db *sql.DB) error {
	// Create migrations table if it doesn't exist
	err := createMigrationsTable(db)
	if err != nil {
		return err
	}

	// Get list of migration files
	migrations, err := getMigrationFiles()
	if err != nil {
		return err
	}

	// Sort migrations by version
	sort.Slice(migrations, func(i, j int) bool {
		return migrations[i].Version < migrations[j].Version
	})

	// Run each migration if not already applied
	for _, migration := range migrations {
		err := runMigrationIfNeeded(db, migration)
		if err != nil {
			return fmt.Errorf("failed to run migration %d: %w", migration.Version, err)
		}
	}

	return nil
}

// createMigrationsTable creates the migrations tracking table
func createMigrationsTable(db *sql.DB) error {
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS migrations (
			version INTEGER PRIMARY KEY,
			filename VARCHAR(255) NOT NULL,
			description VARCHAR(255),
			applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		return fmt.Errorf("failed to create migrations table: %w", err)
	}
	return nil
}

// getMigrationFiles scans the migrations directory for SQL files
func getMigrationFiles() ([]MigrationInfo, error) {
	// Try multiple possible paths for migrations directory
	possiblePaths := []string{
		"migrations/*.sql",
		"../../migrations/*.sql", // From internal/db during tests
		"../../../migrations/*.sql", // Alternative path
	}
	
	var files []string
	var err error
	
	for _, path := range possiblePaths {
		files, err = filepath.Glob(path)
		if err == nil && len(files) > 0 {
			break
		}
	}
	
	if len(files) == 0 {
		return nil, fmt.Errorf("no migration files found in any of the expected paths")
	}

	var migrations []MigrationInfo
	for _, file := range files {
		filename := filepath.Base(file)
		
		// Parse filename to extract version and description
		// Expected format: 001_create_tables.sql
		parts := strings.SplitN(filename, "_", 2)
		if len(parts) < 2 {
			continue // Skip files that don't match expected format
		}

		var version int
		_, err := fmt.Sscanf(parts[0], "%d", &version)
		if err != nil {
			continue // Skip files with invalid version numbers
		}

		description := strings.TrimSuffix(parts[1], ".sql")
		description = strings.ReplaceAll(description, "_", " ")

		migrations = append(migrations, MigrationInfo{
			Version:     version,
			Filename:    filename,
			Description: description,
		})
	}

	return migrations, nil
}

// runMigrationIfNeeded checks if a migration needs to be run and executes it
func runMigrationIfNeeded(db *sql.DB, migration MigrationInfo) error {
	// Check if migration has already been applied
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM migrations WHERE version = $1", migration.Version).Scan(&count)
	if err != nil {
		return fmt.Errorf("failed to check migration status: %w", err)
	}

	if count > 0 {
		// Migration already applied
		return nil
	}

	// Read migration file
	migrationPath := filepath.Join("migrations", migration.Filename)
	migrationSQL, err := ioutil.ReadFile(migrationPath)
	if err != nil {
		return fmt.Errorf("failed to read migration file %s: %w", migration.Filename, err)
	}

	// Execute migration in a transaction
	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Execute the migration SQL
	_, err = tx.Exec(string(migrationSQL))
	if err != nil {
		return fmt.Errorf("failed to execute migration %s: %w", migration.Filename, err)
	}

	// Record migration as applied
	_, err = tx.Exec(
		"INSERT INTO migrations (version, filename, description) VALUES ($1, $2, $3)",
		migration.Version, migration.Filename, migration.Description,
	)
	if err != nil {
		return fmt.Errorf("failed to record migration: %w", err)
	}

	// Commit transaction
	err = tx.Commit()
	if err != nil {
		return fmt.Errorf("failed to commit migration transaction: %w", err)
	}

	fmt.Printf("Migration %03d applied successfully: %s\n", migration.Version, migration.Description)
	return nil
}

// GetAppliedMigrations returns a list of applied migrations
func GetAppliedMigrations(db *sql.DB) ([]MigrationInfo, error) {
	rows, err := db.Query(`
		SELECT version, filename, description, applied_at 
		FROM migrations 
		ORDER BY version
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to query migrations: %w", err)
	}
	defer rows.Close()

	var migrations []MigrationInfo
	for rows.Next() {
		var migration MigrationInfo
		var appliedAt string
		err := rows.Scan(&migration.Version, &migration.Filename, &migration.Description, &appliedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan migration row: %w", err)
		}
		migrations = append(migrations, migration)
	}

	return migrations, nil
}

// ValidateIndexes checks that important indexes exist for filtering performance
func ValidateIndexes(db *sql.DB) error {
	requiredIndexes := []string{
		"idx_projects_status",
		"idx_projects_title",
		"idx_goals_status",
		"idx_tasks_status",
		"idx_flows_title",
		"idx_tags_name",
	}

	for _, indexName := range requiredIndexes {
		var exists bool
		err := db.QueryRow(`
			SELECT EXISTS (
				SELECT 1 FROM pg_indexes 
				WHERE indexname = $1
			)
		`, indexName).Scan(&exists)
		
		if err != nil {
			return fmt.Errorf("failed to check index %s: %w", indexName, err)
		}
		
		if !exists {
			return fmt.Errorf("required index %s does not exist", indexName)
		}
	}

	fmt.Println("All required filter indexes are present")
	return nil
}