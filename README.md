# Go Goal - Project Management System

A flexible backlog and project management system built with Go and PostgreSQL, designed to help organize projects, goals, tasks, and notes with a clean, minimal interface.

## Features (Phase 1 - Foundation)

✅ **Core Entities**
- Projects with status tracking
- Goals linked to projects with priorities and due dates
- Tasks with flexible relationships to goals and projects
- **Life Flows** for thematic organization and color-coded visualization
- Hierarchical tagging system
- Notes that can be linked to any entity
- Workspaces for organization

✅ **CRUD Operations**
- Full REST API for all entities
- Database migrations with PostgreSQL
- Proper relationships and foreign keys

✅ **Web Interface**
- Clean, minimal UI with responsive design
- Dashboard with flow status bar and color-coded visualization
- List views for all entities with flow indicators
- Flow management interface with timeline view
- Basic tagging system implementation

## 🚀 Quick Start

### Prerequisites
- **Go 1.23+** - [Install Go](https://golang.org/doc/install)
- **PostgreSQL** - [Install PostgreSQL](https://www.postgresql.org/download/)
- **Python 3** - For frontend development server (usually pre-installed on macOS/Linux)

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd go-goal
```

### 2. Database Setup

Create a PostgreSQL database:

```bash
# Connect to PostgreSQL as postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE go_goal;
CREATE USER go_goal_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE go_goal TO go_goal_user;
\q
```

Set your database URL:

```bash
export DATABASE_URL='postgres://go_goal_user:your_password@localhost/go_goal?sslmode=disable'
```

### 3. Run Development Servers

#### Option A: Using the dev script (Recommended)

```bash
# Start both backend and frontend servers
./dev.sh start

# Or just start backend
./dev.sh backend

# Or just start frontend
./dev.sh frontend
```

#### Option B: Using Makefile

```bash
# Start both servers concurrently
make dev

# Or start individually
make backend    # Backend on http://localhost:8080
make frontend   # Frontend on http://localhost:3000
```

#### Option C: Manual startup

```bash
# Terminal 1: Backend
go run cmd/server/main.go

# Terminal 2: Frontend
cd web && python3 -m http.server 3000
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **GraphQL Playground**: http://localhost:8080/graphql

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

### Flows
- `GET /api/v1/flows` - List all flows
- `POST /api/v1/flows` - Create flow
- `GET /api/v1/flows/{id}` - Get flow
- `PUT /api/v1/flows/{id}` - Update flow
- `DELETE /api/v1/flows/{id}` - Delete flow
- `GET /api/v1/flows/{id}/stats` - Get flow statistics

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

## 🛠️ Development Commands

### Using Makefile

```bash
# Development
make dev          # Start both servers
make backend      # Backend only
make frontend     # Frontend only

# Building
make build        # Build Go binary
make build-prod   # Production build

# Maintenance
make test         # Run tests
make clean        # Clean build artifacts
make deps         # Download dependencies

# Database
make db-setup     # Database setup instructions

# Information
make help         # Show all commands
make info         # Show project information
```

### Using Development Script

```bash
./dev.sh start     # Start both servers (default)
./dev.sh backend   # Backend only
./dev.sh frontend  # Frontend only
./dev.sh stop      # Stop all servers
./dev.sh restart   # Restart all servers
./dev.sh status    # Show server status
./dev.sh help      # Show help
```

## 🎯 Features

### ✅ Completed Features

- **Dashboard**: Overview with statistics, recent activity, and mini calendar
- **Projects**: Full CRUD operations with multiple view modes (List, Grid, Kanban)
- **Tasks**: Complete task management with subtasks, due dates, and progress tracking
- **Views**: Tree view, Kanban board, Calendar view for different data visualizations
- **Search**: Global search with scopes and intelligent ranking
- **UI/UX**: Modern glass morphism design with smooth animations
- **Keyboard Shortcuts**: Power user features (⌘K for search, Alt+1-9 for navigation)
- **Error Handling**: Comprehensive error logging and user feedback
- **Real-time**: WebSocket support for live updates

### 🚧 In Development

- Goals management
- Flow and tag management
- Advanced sub-task hierarchies
- Team collaboration features
- File attachments
- Time tracking

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

See `plan.md` for detailed feature specifications and `FLOWS.md` for comprehensive flow feature documentation.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.