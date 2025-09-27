# Tech Stack

## Context

Global tech stack defaults for Agent OS projects, overridable in project-specific `.agent-os/product/tech-stack.md`.

## Backend Stack

- **App Framework:** GraphQL with REST endpoints
- **Language:** Golang 1.25+
- **Database:** PostgreSQL 18+
- **ORM:** pgx
- **API:** GraphQL (gqlgen) + REST

## Frontend Stack

- **Framework:** SvelteKit latest stable with SSR
- **Language:** TypeScript 5.0+
- **Build Tool:** Vite (included with SvelteKit)
- **SSR Adapter:** @sveltejs/adapter-static for static site generation
- **Dev Server:** SvelteKit dev server (port 3000) with Go backend proxy (port 8080)
- **Import Strategy:** ES6 modules with TypeScript support
- **Package Manager:** pnpm
- **Node Version:** 24.8

## Styling & UI

- **CSS Framework:** TailwindCSS 4.1+
- **UI Components:** Instrumental Components latest + Custom Svelte components
- **Design System:** Glass morphism with CSS custom properties
- **Font Provider:** Delius for English and IBM Plex Sans Arabic
- **Icons:** Lucide Svelte latest components
- **Internationalization:** svelte-i18n with Arabic (RTL) and English (LTR) support

## GraphQL & API Integration

- **GraphQL Client:** graphql-request or @urql/svelte
- **Code Generation:** @graphql-codegen/cli with TypeScript generators
- **API Integration:** Maintain existing GraphQL schema and REST endpoints
- **State Management:** Svelte stores with localStorage persistence

## Build & Deployment

- **Static Output:** Build to `/web` directory for Go server static serving
- **SSR Strategy:** Hybrid approach - SSR for initial load, client-side navigation
- **Performance:** Code splitting, lazy loading, and optimized hydration
- **CI/CD Platform:** GitHub Actions
- **CI/CD Trigger:** Push to main/dev branches
- **Tests:** Run before deployment
- **Production Environment:** main branch
- **Staging Environment:** staging branch
- **Dev Environment:** dev branch
