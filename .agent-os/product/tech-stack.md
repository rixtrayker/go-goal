# Technical Stack

## Backend Architecture

- **Application Framework:** Go 1.23+ with Gorilla Mux router
- **Database System:** PostgreSQL with JSON fields for extensibility
- **API Layer:** REST endpoints + GraphQL (gqlgen v0.17.78)
- **Database Migrations:** Custom Go migration system
- **Configuration:** Environment-based config management

## Frontend Architecture

- **JavaScript Framework:** Vanilla JavaScript (no framework dependency)
- **Import Strategy:** ES6 modules with static imports
- **CSS Framework:** Custom CSS with CSS Grid and Flexbox
- **UI Component Library:** Custom components with modern glass morphism design
- **State Management:** Custom lightweight state management
- **Routing:** Client-side routing with history API

## Development Tools

- **Build System:** Go standard build tools + Makefile
- **Development Server:** Go backend (port 8080) + Python HTTP server (port 3000)
- **Hot Reload:** Development script with auto-restart
- **Code Generation:** gqlgen for GraphQL schema and resolvers

## Assets and Styling

- **Fonts Provider:** System fonts (San Francisco, Segoe UI, Roboto)
- **Icon Library:** Custom SVG icons
- **CSS Architecture:** Component-based CSS with utility classes
- **Responsive Design:** Mobile-first responsive grid system

## Deployment and Infrastructure

- **Application Hosting:** Self-hosted / Docker ready
- **Database Hosting:** Self-hosted PostgreSQL
- **Asset Hosting:** Static file serving via Go HTTP server
- **Deployment Solution:** Docker containerization ready
- **Environment Management:** .env files with load scripts

## Development Workflow

- **Code Repository:** Git-based with main/dev branch strategy
- **Branching Strategy:** 
  - `main` branch for production releases
  - `dev` branch for development and integration
- **CI/CD Pipeline:** Ready for GitHub Actions setup
- **Database Versioning:** Sequential numbered migrations
- **Development Commands:** Comprehensive Makefile and dev scripts

## Security and Data

- **Database Security:** PostgreSQL with proper foreign key constraints
- **Input Validation:** Server-side validation on all endpoints
- **CORS Configuration:** Configurable cross-origin settings
- **Local Data Storage:** Self-hosted for privacy and control
- **Backup Strategy:** Standard PostgreSQL backup procedures