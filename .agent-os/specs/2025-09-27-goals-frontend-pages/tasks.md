# Spec Tasks

## Tasks

- [ ] 1. Implement Missing GraphQL Goal Query Resolvers
  - [ ] 1.1 Write tests for Goals and Goal query resolvers
  - [ ] 1.2 Implement `goals(projectId: Int)` query resolver with database queries
  - [ ] 1.3 Implement `goal(id: ID!)` query resolver with proper ID validation
  - [ ] 1.4 Add error handling for database failures and not found cases
  - [ ] 1.5 Test GraphQL playground queries to verify resolver functionality
  - [ ] 1.6 Verify all resolver tests pass

- [ ] 2. Implement Missing GraphQL Goal Relationship Resolvers  
  - [ ] 2.1 Write tests for all Goal field resolvers (project, context, tasks, tags, notes)
  - [ ] 2.2 Implement Goal.project resolver with foreign key lookup
  - [ ] 2.3 Implement Goal.context resolver handling nullable context_id
  - [ ] 2.4 Implement Goal.tasks resolver with proper ordering
  - [ ] 2.5 Implement Goal.tags resolver with many-to-many join
  - [ ] 2.6 Implement Goal.notes resolver filtering by entity_type and entity_id
  - [ ] 2.7 Test relationship loading through GraphQL playground
  - [ ] 2.8 Verify all relationship resolver tests pass

- [ ] 3. Create Goals Page Component and Routing
  - [ ] 3.1 Write tests for GoalsPage component initialization and rendering
  - [ ] 3.2 Create GoalsPage class following existing ProjectsPage pattern
  - [ ] 3.3 Implement goals list view with filtering and search capabilities
  - [ ] 3.4 Add goal creation form with project association and context selection
  - [ ] 3.5 Implement goal editing with inline and modal edit modes
  - [ ] 3.6 Register goal routes in app.js (/goals, /goals/new, /goals/:id, /goals/:id/edit)
  - [ ] 3.7 Update navigation to remove placeholder and add active goals link
  - [ ] 3.8 Verify all GoalsPage component tests pass

- [ ] 4. Enhance API Client for GraphQL Goals Operations
  - [ ] 4.1 Write tests for new API client goal methods
  - [ ] 4.2 Add getGoals(projectId) GraphQL query method to apiClient
  - [ ] 4.3 Add getGoal(id) GraphQL query method with relationship loading
  - [ ] 4.4 Update existing goal mutation methods to use GraphQL consistently
  - [ ] 4.5 Add proper error handling for GraphQL-specific errors
  - [ ] 4.6 Test API client methods with backend GraphQL endpoint
  - [ ] 4.7 Verify all API client tests pass

- [ ] 5. Implement Goal UI Components and Integration
  - [ ] 5.1 Write tests for goal card, form, and detail components
  - [ ] 5.2 Create goal card component with status, priority, and progress indicators
  - [ ] 5.3 Implement goal form component with validation and context integration
  - [ ] 5.4 Add goal detail modal with associated tasks and notes display
  - [ ] 5.5 Integrate goals with global search functionality
  - [ ] 5.6 Add keyboard shortcuts for goal navigation and quick actions
  - [ ] 5.7 Implement loading states and error handling throughout goal UI
  - [ ] 5.8 Test goal CRUD operations through complete user workflow
  - [ ] 5.9 Verify all goal UI component tests pass