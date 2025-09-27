# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-09-27-svelte-frontend-transform/spec.md

**TECHNICAL REQUIREMENTS:**
- **SvelteKit Setup**: Initialize SvelteKit project with TypeScript, SSR enabled, and adapter-static for static site generation
- **Development Server**: Configure dev server on port 3000 with proxy to Go backend on port 8080 for API calls
- **Component Architecture**: Create TypeScript interfaces for all data models (Goal, Project, Task, Tag) matching GraphQL schema
- **Routing Migration**: Implement file-based routing structure matching current URL patterns (/dashboard, /projects, /goals, /tasks, /tags)
- **State Management**: Implement Svelte stores with persistence using localStorage adapter for offline capability
- **CSS Migration**: Preserve existing glass morphism design system with CSS custom properties while converting to Svelte component styles
- **GraphQL Integration**: Configure GraphQL client (graphql-request or Apollo) with proper TypeScript codegen for type safety
- **i18n Implementation**: Set up svelte-i18n with Arabic (RTL) and English (LTR) support, including proper text direction handling
- **Build Configuration**: Configure Vite build to output static files to `/web` directory matching current deployment structure
- **Performance Optimization**: Implement code splitting, lazy loading for routes, and proper SSR hydration strategies

**EXTERNAL DEPENDENCIES:**
This spec requires several new external dependencies:

- **@sveltejs/kit@latest** - Core SvelteKit framework for SSR and routing
- **@sveltejs/adapter-static@latest** - Static site adapter for build output to `/web` directory
- **typescript@^5.0.0** - TypeScript support for enhanced development experience
- **@types/node@latest** - Node.js type definitions for build configuration
- **svelte-i18n@^4.0.0** - Internationalization library for Arabic/English support
- **graphql@^16.0.0** - GraphQL core library for API integration
- **graphql-request@^6.0.0** - Lightweight GraphQL client for API calls
- **@graphql-codegen/cli@^5.0.0** - GraphQL code generation for TypeScript types
- **@graphql-codegen/typescript@^4.0.0** - TypeScript generator for GraphQL schemas
- **vite@^5.0.0** - Build tool and dev server (included with SvelteKit)
- **postcss@^8.0.0** - CSS processor for current styling system
- **autoprefixer@^10.0.0** - CSS vendor prefixing for browser compatibility

**Justification:** These dependencies are essential for modern frontend development with SvelteKit, providing TypeScript support, internationalization, GraphQL integration, and maintaining compatibility with the existing CSS design system while enabling SSR capabilities.