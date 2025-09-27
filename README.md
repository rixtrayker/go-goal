# Go Goal - Personal Productivity System

A personal productivity system that helps individuals organize their projects, goals, tasks, and notes by providing a clean, flexible interface for structured personal project management.

## Business Features

### Core Management
- **Hierarchical Organization**: Workspaces → Projects → Goals → Tasks with flexible relationships
- **Life Flows**: Thematic organization with color-coded visualization for different life areas
- **Flexible Note System**: Notes can be attached to any entity or exist independently
- **Smart Tagging**: Hierarchical tagging system for flexible categorization
- **Entity Relationships**: Flexible connections between any entities (projects, goals, tasks, notes)

### User Experience
- **Multiple Views**: List, Grid, Kanban, Calendar, and Tree views for different workflows
- **Global Search**: Fast search across all content with keyboard shortcuts (⌘K)
- **Clean Modern UI**: Glass morphism design with smooth animations
- **Keyboard Shortcuts**: Power user features (⌘K for search, Alt+1-9 for navigation)
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live UI updates without page refreshes

## Technical Features

### Architecture
- **Backend**: Go 1.25+ with Gorilla Mux router, REST API and GraphQL (gqlgen)
- **Database**: PostgreSQL with JSON fields for extensibility and proper relationships
- **Frontend**: Vanilla JavaScript with ES6 modules and modern UI components
- **API**: RESTful endpoints + GraphQL with comprehensive CRUD operations

### Development
- **Modern Stack**: Go 1.25+, PostgreSQL, vanilla JavaScript
- **Development Tools**: Hot reload, automated testing, custom migration system
- **Deployment**: Self-hosted with Docker containerization ready
- **Configuration**: Environment-based config management with .env files
- **Local-First**: Runs locally with web interface for privacy and offline access

## Quick Start

### Prerequisites
- Go 1.25+
- PostgreSQL

### Setup
```bash
# Clone and setup
git clone <your-repo-url>
cd go-goal

# Database setup
export DATABASE_URL='postgres://go_goal_user:password@localhost/go_goal?sslmode=disable'

# Start development servers
./dev.sh start
```

### Access
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **GraphQL Playground**: http://localhost:8080/graphql

## Development

```bash
# Development
make dev          # Start both servers
make backend      # Backend only
make frontend     # Frontend only

# Building
make build        # Build Go binary
make test         # Run tests
```

## Roadmap

- **Phase 1**: ✅ Foundation (CRUD, basic UI, tagging)
- **Phase 2**: 🔄 Core Functionality (relationships, search, dashboard)
- **Phase 3**: 📋 Views & Flexibility (Kanban, Calendar, filters)
- **Phase 4**: 🧠 Smart Features (bi-directional linking, analytics)
- **Phase 5**: 🎮 Gamification (quest system, achievements)
- **Phase 6**: 🤖 AI & Intelligence (smart suggestions, scheduling)

## License

MIT License