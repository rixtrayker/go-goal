# Go Goal - Project Management System

A flexible backlog and project management system built with Go and PostgreSQL, designed to help organize projects, goals, tasks, and notes with a clean, minimal interface.

## Features (Phase 1 - Foundation)

✅ **Core Entities**
- Projects with status tracking
- Goals linked to projects with priorities and due dates
- Tasks with flexible relationships to goals and projects
- **Life Contexts** for thematic organization and color-coded visualization
- Hierarchical tagging system
- Notes that can be linked to any entity
- Workspaces for organization

✅ **CRUD Operations**
- Full REST API for all entities
- Database migrations with PostgreSQL
- Proper relationships and foreign keys

✅ **Web Interface**
- Clean, minimal UI with responsive design
- Dashboard with context status bar and color-coded visualization
- List views for all entities with context indicators
- Context management interface with timeline view
- Basic tagging system implementation

## Quick Start

### Prerequisites
- Go 1.21+
- PostgreSQL

### Installation

1. Clone and setup:
```bash
git clone <repo-url>
cd go-goal
go mod tidy
```

2. Set up PostgreSQL database:
```bash
createdb go_goal_dev
```

3. Configure environment (optional):
```bash
export DATABASE_URL="postgres://localhost/go_goal_dev?sslmode=disable"
export PORT="8080"
```

4. Run the application:
```bash
go run cmd/server/main.go
```

5. Visit `http://localhost:8080` to see the dashboard

## API Endpoints

### Projects
- `GET /api/v1/projects` - List all projects
- `POST /api/v1/projects` - Create project
- `GET /api/v1/projects/{id}` - Get project
- `PUT /api/v1/projects/{id}` - Update project
- `DELETE /api/v1/projects/{id}` - Delete project

### Goals
- `GET /api/v1/goals` - List all goals
- `POST /api/v1/goals` - Create goal
- `GET /api/v1/goals/{id}` - Get goal
- `PUT /api/v1/goals/{id}` - Update goal
- `DELETE /api/v1/goals/{id}` - Delete goal

### Tasks
- `GET /api/v1/tasks` - List all tasks
- `POST /api/v1/tasks` - Create task
- `GET /api/v1/tasks/{id}` - Get task
- `PUT /api/v1/tasks/{id}` - Update task
- `DELETE /api/v1/tasks/{id}` - Delete task

### Contexts
- `GET /api/v1/contexts` - List all contexts
- `POST /api/v1/contexts` - Create context
- `GET /api/v1/contexts/{id}` - Get context
- `PUT /api/v1/contexts/{id}` - Update context
- `DELETE /api/v1/contexts/{id}` - Delete context
- `GET /api/v1/contexts/{id}/stats` - Get context statistics

### Tags
- `GET /api/v1/tags` - List all tags
- `POST /api/v1/tags` - Create tag
- `GET /api/v1/tags/{id}` - Get tag
- `PUT /api/v1/tags/{id}` - Update tag
- `DELETE /api/v1/tags/{id}` - Delete tag

### Tagging System
- `POST /api/v1/tags/assign` - Assign tag to entity
- `DELETE /api/v1/tags/remove/{entity_type}/{entity_id}/{tag_id}` - Remove tag
- `GET /api/v1/tags/{entity_type}/{entity_id}` - Get entity tags

### Notes & Workspaces
Similar CRUD patterns for `/api/v1/notes` and `/api/v1/workspaces`

## Project Structure

```
├── cmd/server/          # Application entry point
├── internal/
│   ├── api/            # HTTP handlers and routing
│   ├── db/             # Database connection and migrations
│   └── models/         # Data models
├── pkg/config/         # Configuration management
├── web/
│   ├── templates/      # HTML templates
│   └── static/         # Static assets
├── migrations/         # Database migration files
└── plan.md            # Detailed project roadmap
```

## Roadmap

- **Phase 1**: ✅ Foundation (CRUD, basic UI, tagging)
- **Phase 2**: 🔄 Core Functionality (relationships, search, dashboard)
- **Phase 3**: 📋 Views & Flexibility (Kanban, Calendar, filters)
- **Phase 4**: 🧠 Smart Features (bi-directional linking, analytics)
- **Phase 5**: 🎮 Gamification (quest system, achievements)
- **Phase 6**: 🤖 AI & Intelligence (smart suggestions, scheduling)

See `plan.md` for detailed feature specifications and `CONTEXTS.md` for comprehensive context feature documentation.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.