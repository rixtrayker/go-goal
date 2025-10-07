package db

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetMigrationFiles(t *testing.T) {
	migrations, err := getMigrationFiles()
	assert.NoError(t, err)
	assert.NotEmpty(t, migrations, "Should find migration files")

	// Check that migrations are properly parsed
	foundMigrations := make(map[int]bool)
	for _, migration := range migrations {
		assert.Greater(t, migration.Version, 0, "Migration version should be positive")
		assert.NotEmpty(t, migration.Filename, "Migration filename should not be empty")
		assert.NotEmpty(t, migration.Description, "Migration description should not be empty")
		
		// Check for expected migrations
		foundMigrations[migration.Version] = true
	}

	// Verify expected migrations exist
	expectedMigrations := []int{1, 2, 3, 4} // 001, 002, 003, 004
	for _, expected := range expectedMigrations {
		assert.True(t, foundMigrations[expected], "Should find migration %d", expected)
	}
}

func TestMigrationInfo(t *testing.T) {
	// Test migration info structure
	migration := MigrationInfo{
		Version:     1,
		Filename:    "001_create_tables.sql",
		Description: "create tables",
	}

	assert.Equal(t, 1, migration.Version)
	assert.Equal(t, "001_create_tables.sql", migration.Filename)
	assert.Equal(t, "create tables", migration.Description)
}

// Note: Integration tests for RunAllMigrations would require a test database
// These would be better placed in an integration test suite
func TestMigrationFilenameFormat(t *testing.T) {
	// Test that our expected migration files exist and follow naming convention
	expectedFiles := []struct {
		version     int
		filename    string
		description string
	}{
		{1, "001_create_tables.sql", "create tables"},
		{2, "002_add_contexts.sql", "add contexts"},
		{3, "003_rename_contexts_to_flows.sql", "rename contexts to flows"},
		{4, "004_add_filter_indexes.sql", "add filter indexes"},
	}

	migrations, err := getMigrationFiles()
	assert.NoError(t, err)

	// Create a map for easier lookup
	migrationMap := make(map[int]MigrationInfo)
	for _, m := range migrations {
		migrationMap[m.Version] = m
	}

	for _, expected := range expectedFiles {
		migration, exists := migrationMap[expected.version]
		assert.True(t, exists, "Migration %d should exist", expected.version)
		if exists {
			assert.Equal(t, expected.filename, migration.Filename)
			assert.Equal(t, expected.description, migration.Description)
		}
	}
}