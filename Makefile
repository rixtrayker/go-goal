# Go Goal Project Makefile

.PHONY: help build run dev clean test deps frontend backend db-setup

# Default target
help:
	@echo "Go Goal - Project Management System"
	@echo ""
	@echo "Available commands:"
	@echo "  make dev        - Run both backend and frontend in development mode"
	@echo "  make backend    - Run only the Go backend server"
	@echo "  make frontend   - Serve the frontend static files"
	@echo "  make build      - Build the Go application"
	@echo "  make clean      - Clean build artifacts"
	@echo "  make test       - Run tests"
	@echo "  make deps       - Download Go dependencies"
	@echo "  make db-setup   - Set up the database (PostgreSQL)"
	@echo "  make help       - Show this help message"

# Install Go dependencies
deps:
	@echo "📦 Installing Go dependencies..."
	go mod download
	go mod tidy

# Build the application
build: deps
	@echo "🔨 Building Go Goal..."
	go build -o bin/go-goal cmd/server/main.go

# Run backend only
backend: deps
	@echo "🚀 Starting Go backend server..."
	@echo "Backend will be available at: http://localhost:8080"
	go run cmd/server/main.go

# Serve frontend static files using Python's built-in server
frontend:
	@echo "🌐 Starting frontend development server..."
	@echo "Frontend will be available at: http://localhost:3000"
	@echo "Make sure to update API_BASE_URL in web/static/js/config.js to point to http://localhost:8080"
	cd web && python3 -m http.server 3000

# Run both backend and frontend concurrently
dev:
	@echo "🚀 Starting Go Goal in development mode..."
	@echo ""
	@echo "This will start:"
	@echo "  - Backend API server on http://localhost:8080"
	@echo "  - Frontend dev server on http://localhost:3000"
	@echo ""
	@echo "Press Ctrl+C to stop both servers"
	@echo ""
	@make -j2 backend frontend

# Alternative dev command using tmux (if available)
dev-tmux:
	@echo "🚀 Starting Go Goal with tmux..."
	@if ! command -v tmux > /dev/null; then \
		echo "❌ tmux not found. Install tmux or use 'make dev' instead."; \
		exit 1; \
	fi
	tmux new-session -d -s go-goal
	tmux split-window -h
	tmux send-keys -t 0 'make backend' Enter
	tmux send-keys -t 1 'make frontend' Enter
	tmux attach-session -t go-goal

# Run tests
test:
	@echo "🧪 Running tests..."
	go test ./...

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf bin/
	go clean

# Database setup (PostgreSQL)
db-setup:
	@echo "🗄️  Setting up PostgreSQL database..."
	@./setup-db.sh

# Quick setup - database + dependencies
setup: db-setup deps
	@echo "✅ Go Goal setup completed!"
	@echo ""
	@echo "You can now run:"
	@echo "  make dev      # Start development servers"
	@echo "  ./dev.sh start # Alternative startup method"

# Super quick setup (automated)
quick-setup:
	@./quick-setup.sh

# Production build
build-prod: deps
	@echo "🏭 Building for production..."
	CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o bin/go-goal cmd/server/main.go

# Docker targets (if you want to add Docker support later)
docker-build:
	@echo "🐳 Building Docker image..."
	docker build -t go-goal .

docker-run:
	@echo "🐳 Running Docker container..."
	docker run -p 8080:8080 go-goal

# Development with live reload (requires air)
dev-air:
	@echo "🔄 Starting with live reload..."
	@if ! command -v air > /dev/null; then \
		echo "Installing air for live reload..."; \
		go install github.com/air-verse/air@latest; \
	fi
	air

# Check if required tools are installed
check-deps:
	@echo "🔍 Checking dependencies..."
	@command -v go >/dev/null 2>&1 || { echo "❌ Go is required but not installed."; exit 1; }
	@command -v python3 >/dev/null 2>&1 || { echo "⚠️  Python3 not found. Frontend server won't work."; }
	@command -v psql >/dev/null 2>&1 || { echo "⚠️  PostgreSQL not found. Database setup required."; }
	@echo "✅ Dependencies check completed"

# Show project info
info:
	@echo "📊 Go Goal Project Information"
	@echo "==============================="
	@echo "Go version: $$(go version)"
	@echo "Project root: $$(pwd)"
	@echo "Backend entry: cmd/server/main.go"
	@echo "Frontend root: web/"
	@echo "Database: PostgreSQL"
	@echo ""
	@echo "Environment variables to set:"
	@echo "  DATABASE_URL - PostgreSQL connection string"
	@echo "  PORT - Server port (default: 8080)"
	@echo ""