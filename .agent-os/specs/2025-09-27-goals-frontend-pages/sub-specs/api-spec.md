# GraphQL API Specification

This is the GraphQL API specification for the spec detailed in @.agent-os/specs/2025-09-27-goals-frontend-pages/spec.md

## Current Implementation Status

### ✅ Implemented GraphQL Operations

**Mutations (Complete):**
- `createGoal(input: CreateGoalInput!)` - Create new goal with full validation
- `updateGoal(id: ID!, input: UpdateGoalInput!)` - Update existing goal
- `deleteGoal(id: ID!)` - Delete goal with proper cleanup

**Schema Types (Complete):**
- `Goal` type with all fields and relationships
- `CreateGoalInput` and `UpdateGoalInput` input types
- Complete field relationships to Project, Context, Task, Tag, Note entities

**Dashboard Integration (Complete):**
- `upcomingGoals` in dashboard query returns goals with upcoming due dates

### ❌ Missing Query Implementations

The following query resolvers are **MISSING** from `schema.resolvers.go`:

#### Missing Query: `goals(projectId: Int): [Goal!]!`
- **Schema Defined:** ✅ Yes in schema.graphqls
- **Resolver Implemented:** ❌ No resolver function exists
- **Generated Interface:** ✅ Yes in generated.go
- **Purpose:** List all goals with optional project filtering

#### Missing Query: `goal(id: ID!): Goal`
- **Schema Defined:** ✅ Yes in schema.graphqls  
- **Resolver Implemented:** ❌ No resolver function exists
- **Generated Interface:** ✅ Yes in generated.go
- **Purpose:** Fetch single goal with full details

### ❌ Missing Relationship Resolvers

The following Goal field resolvers are **MISSING**:

#### Missing: Goal.project
- **Purpose:** Load associated project for a goal
- **Current Status:** Schema defined but no resolver

#### Missing: Goal.context  
- **Purpose:** Load associated context for a goal
- **Current Status:** Schema defined but no resolver

#### Missing: Goal.tasks
- **Purpose:** Load tasks associated with a goal
- **Current Status:** Schema defined but no resolver

#### Missing: Goal.tags
- **Purpose:** Load tags associated with a goal  
- **Current Status:** Schema defined but no resolver

#### Missing: Goal.notes
- **Purpose:** Load notes associated with a goal
- **Current Status:** Schema defined but no resolver

## Frontend API Client Requirements

### GraphQL Queries Needed for UI

```graphql
# List goals with optional filtering
query GetGoals($projectId: Int, $contextId: Int, $status: String) {
  goals(projectId: $projectId) {
    id
    title
    description
    priority
    status
    dueDate
    createdAt
    updatedAt
    project {
      id
      title
    }
    context {
      id
      title
      color
    }
    tasks {
      id
      title
      status
    }
  }
}

# Get single goal details
query GetGoal($id: ID!) {
  goal(id: $id) {
    id
    title
    description
    priority
    status
    dueDate
    createdAt
    updatedAt
    project {
      id
      title
      status
    }
    context {
      id
      title
      color
    }
    tasks {
      id
      title
      status
      priority
      dueDate
    }
    tags {
      id
      name
      color
    }
    notes {
      id
      title
      content
    }
  }
}
```

### GraphQL Mutations (Already Implemented)

```graphql
# Create goal
mutation CreateGoal($input: CreateGoalInput!) {
  createGoal(input: $input) {
    id
    title
    description
    priority
    status
    dueDate
    project {
      id
      title
    }
  }
}

# Update goal  
mutation UpdateGoal($id: ID!, $input: UpdateGoalInput!) {
  updateGoal(id: $id, input: $input) {
    id
    title
    description
    priority
    status
    dueDate
    updatedAt
  }
}

# Delete goal
mutation DeleteGoal($id: ID!) {
  deleteGoal(id: $id)
}
```