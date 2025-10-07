# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-10-07-crud-entity-filters/spec.md

## Endpoints

### GET /api/projects

**Purpose:** Retrieve projects with optional filtering
**Parameters:** 
- `name` (string): Filter by project name (partial match)
- `status` (string): Filter by status (active, completed, archived)
- `created_after` (date): Filter projects created after date
- `created_before` (date): Filter projects created before date
- `tag_ids` (comma-separated): Filter by associated tag IDs
- `flow_id` (int): Filter by life flow/context ID
- `limit` (int): Number of results (default: 50)
- `offset` (int): Pagination offset (default: 0)

**Response:** JSON array of filtered project objects with total count metadata
**Errors:** 400 for invalid filter parameters, 500 for server errors

### GET /api/tasks

**Purpose:** Retrieve tasks with advanced filtering capabilities
**Parameters:**
- `title` (string): Filter by task title (partial match)
- `status` (string): Filter by completion status (pending, completed, cancelled)
- `priority` (string): Filter by priority level (low, medium, high)
- `project_id` (int): Filter tasks belonging to specific project
- `due_after` (date): Filter tasks due after date
- `due_before` (date): Filter tasks due before date
- `tag_ids` (comma-separated): Filter by associated tag IDs
- `assigned_flow_id` (int): Filter by assigned life flow
- `limit` (int): Number of results (default: 50)
- `offset` (int): Pagination offset (default: 0)

**Response:** JSON array of filtered task objects with project and tag relationships
**Errors:** 400 for invalid parameters, 404 if project_id not found

### GET /api/goals

**Purpose:** Retrieve goals with status and timeline filtering
**Parameters:**
- `title` (string): Filter by goal title (partial match)
- `status` (string): Filter by achievement status (active, completed, paused)
- `target_date_after` (date): Filter goals with target date after specified date
- `target_date_before` (date): Filter goals with target date before specified date
- `flow_id` (int): Filter by associated life flow
- `tag_ids` (comma-separated): Filter by associated tag IDs
- `limit` (int): Number of results (default: 50)
- `offset` (int): Pagination offset (default: 0)

**Response:** JSON array of filtered goal objects with completion metrics
**Errors:** 400 for invalid date formats, 500 for server errors

### GET /api/flows

**Purpose:** Retrieve life flows/contexts with filtering
**Parameters:**
- `name` (string): Filter by flow name (partial match)
- `color` (string): Filter by assigned color code
- `active` (boolean): Filter by active/inactive status
- `limit` (int): Number of results (default: 50)
- `offset` (int): Pagination offset (default: 0)

**Response:** JSON array of filtered flow objects with entity counts
**Errors:** 400 for invalid boolean values

### GET /api/notes

**Purpose:** Retrieve notes with content and metadata filtering
**Parameters:**
- `title` (string): Filter by note title (partial match)
- `content` (string): Filter by note content (partial match)
- `created_after` (date): Filter notes created after date
- `created_before` (date): Filter notes created before date
- `tag_ids` (comma-separated): Filter by associated tag IDs
- `project_id` (int): Filter notes linked to specific project
- `limit` (int): Number of results (default: 50)
- `offset` (int): Pagination offset (default: 0)

**Response:** JSON array of filtered note objects with tag relationships
**Errors:** 400 for invalid parameters, 404 if project_id not found

### GET /api/tags

**Purpose:** Retrieve tags with usage and naming filters
**Parameters:**
- `name` (string): Filter by tag name (partial match)
- `color` (string): Filter by tag color
- `min_usage_count` (int): Filter tags used on minimum number of entities
- `entity_type` (string): Filter tags used on specific entity type (project, task, goal, note)
- `limit` (int): Number of results (default: 50)
- `offset` (int): Pagination offset (default: 0)

**Response:** JSON array of filtered tag objects with usage statistics
**Errors:** 400 for invalid entity_type values

## GraphQL Filter Support

All existing GraphQL queries will be enhanced with corresponding `filter` input arguments matching the REST API parameter structure, enabling consistent filtering across both API interfaces.