# Backend Implementation TODOs

## Missing GraphQL Query Resolvers

### ❌ TODO: Implement Goals Query Resolver
**File:** `internal/graphql/schema.resolvers.go`
**Function:** `func (r *queryResolver) Goals(ctx context.Context, projectID *int) ([]*Goal, error)`

**Implementation Requirements:**
- Query goals table with optional project filtering
- Handle NULL project_id filtering
- Return array of Goal objects with proper type conversion
- Include error handling for database failures
- Support for future filtering by context_id, status

**SQL Query Example:**
```sql
SELECT id, title, description, priority, due_date, status, project_id, context_id, created_at, updated_at 
FROM goals 
WHERE ($1 IS NULL OR project_id = $1)
ORDER BY priority DESC, due_date ASC
```

### ❌ TODO: Implement Goal Query Resolver  
**File:** `internal/graphql/schema.resolvers.go`
**Function:** `func (r *queryResolver) Goal(ctx context.Context, id string) (*Goal, error)`

**Implementation Requirements:**
- Convert string ID to integer with validation
- Query single goal by ID
- Return NULL if goal not found (GraphQL standard)
- Include proper error handling
- Return fully populated Goal object

**SQL Query Example:**
```sql
SELECT id, title, description, priority, due_date, status, project_id, context_id, created_at, updated_at 
FROM goals 
WHERE id = $1
```

## Missing GraphQL Field Resolvers

### ❌ TODO: Implement Goal.project Resolver
**File:** `internal/graphql/schema.resolvers.go` (or separate resolver file)
**Function:** `func (r *goalResolver) Project(ctx context.Context, obj *Goal) (*Project, error)`

**Implementation Requirements:**
- Load project by goal.ProjectID
- Handle foreign key relationship
- Return NULL if project not found
- Include project title, status, workspace info

### ❌ TODO: Implement Goal.context Resolver
**File:** `internal/graphql/schema.resolvers.go`
**Function:** `func (r *goalResolver) Context(ctx context.Context, obj *Goal) (*Context, error)`

**Implementation Requirements:**
- Load context by goal.ContextID (nullable)
- Return NULL if no context assigned
- Include context title, color, status

### ❌ TODO: Implement Goal.tasks Resolver
**File:** `internal/graphql/schema.resolvers.go`
**Function:** `func (r *goalResolver) Tasks(ctx context.Context, obj *Goal) ([]*Task, error)`

**Implementation Requirements:**
- Query tasks where goal_id = goal.ID
- Return empty array if no tasks
- Include task title, status, priority, due_date
- Order by priority DESC, due_date ASC

**SQL Query Example:**
```sql
SELECT id, title, description, status, priority, due_date, goal_id, project_id, context_id, created_at, updated_at
FROM tasks 
WHERE goal_id = $1
ORDER BY priority DESC, due_date ASC
```

### ❌ TODO: Implement Goal.tags Resolver
**File:** `internal/graphql/schema.resolvers.go`
**Function:** `func (r *goalResolver) Tags(ctx context.Context, obj *Goal) ([]*Tag, error)`

**Implementation Requirements:**
- Join through goal_tags table
- Return tags associated with the goal
- Include tag name, color, parent relationship

**SQL Query Example:**
```sql
SELECT t.id, t.name, t.color, t.parent_id, t.created_at
FROM tags t
JOIN goal_tags gt ON t.id = gt.tag_id
WHERE gt.goal_id = $1
ORDER BY t.name
```

### ❌ TODO: Implement Goal.notes Resolver
**File:** `internal/graphql/schema.resolvers.go`
**Function:** `func (r *goalResolver) Notes(ctx context.Context, obj *Goal) ([]*Note, error)`

**Implementation Requirements:**
- Query notes where entity_type = 'goal' AND entity_id = goal.ID
- Return notes with title, content, timestamps
- Order by created_at DESC

**SQL Query Example:**
```sql
SELECT id, title, content, entity_type, entity_id, created_at, updated_at
FROM notes 
WHERE entity_type = 'goal' AND entity_id = $1
ORDER BY created_at DESC
```

## Schema Validation TODOs

### ❌ TODO: Add Additional Query Parameters to Goals Query
**File:** `internal/graphql/schema.graphqls`
**Current:** `goals(projectId: Int): [Goal!]!`
**Enhancement:** `goals(projectId: Int, contextId: Int, status: String): [Goal!]!`

**Implementation Requirements:**
- Update schema to support contextId and status filtering
- Regenerate GraphQL code with `go generate`
- Update resolver to handle new parameters

### ❌ TODO: Fix Priority Type Consistency
**File:** `internal/graphql/schema.graphqls` and `internal/models/models.go`
**Issue:** Schema uses String for priority, model uses Int
**Resolution:** Decide on Int (recommended) and update schema or keep String with validation

## Integration TODOs

### ❌ TODO: Update API Client for GraphQL Goals
**File:** `web/static/js/api-client.js`
**Requirements:**
- Add GraphQL queries for goals and goal
- Add methods: `getGoals(projectId)`, `getGoal(id)`
- Update existing goal mutations to use GraphQL
- Add proper error handling for GraphQL responses

### ❌ TODO: Add Goals to Global Search
**File:** `web/static/js/global-search.js`
**Requirements:**
- Include goals in search results
- Add goal-specific search ranking
- Add navigation to goal detail view
- Include goal status and project in search results

## Testing TODOs

### ❌ TODO: Add GraphQL Resolver Tests
**Files:** Create test files for goal resolvers
**Requirements:**
- Test goals query with and without project filtering
- Test goal query with valid and invalid IDs
- Test all relationship resolvers (project, context, tasks, tags, notes)
- Test error cases (database failures, not found scenarios)

### ❌ TODO: Add Frontend Integration Tests
**Requirements:**
- Test goal CRUD operations through UI
- Test goal-project relationships
- Test goal status updates
- Test goal filtering and search functionality

## Performance TODOs

### ❌ TODO: Add Database Indexes for Goal Queries
**File:** Database migration or existing migration update
**Indexes Needed:**
- `CREATE INDEX idx_goals_project_id ON goals(project_id);`
- `CREATE INDEX idx_goals_context_id ON goals(context_id);`
- `CREATE INDEX idx_goals_status ON goals(status);`
- `CREATE INDEX idx_goals_due_date ON goals(due_date);`

### ❌ TODO: Implement GraphQL DataLoader Pattern
**Optimization:** Prevent N+1 queries when loading goal relationships
**Files:** Add dataloader implementation for projects, contexts, tasks
**Benefit:** Batch load related entities to reduce database queries

## Documentation TODOs

### ❌ TODO: Update API Documentation
**Requirements:**
- Document all GraphQL goal queries and mutations
- Add example queries for frontend developers
- Update schema documentation
- Add relationship documentation