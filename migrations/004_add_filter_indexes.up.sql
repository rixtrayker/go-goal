-- Add database indexes for commonly filtered fields to improve query performance

-- Projects table indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_title ON projects(title);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at);

-- Goals table indexes
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_title ON goals(title);
CREATE INDEX IF NOT EXISTS idx_goals_priority ON goals(priority);
CREATE INDEX IF NOT EXISTS idx_goals_due_date ON goals(due_date);
CREATE INDEX IF NOT EXISTS idx_goals_created_at ON goals(created_at);
CREATE INDEX IF NOT EXISTS idx_goals_updated_at ON goals(updated_at);

-- Tasks table indexes
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_title ON tasks(title);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_updated_at ON tasks(updated_at);

-- Flows table indexes
CREATE INDEX IF NOT EXISTS idx_flows_title ON flows(title);
CREATE INDEX IF NOT EXISTS idx_flows_color ON flows(color);
CREATE INDEX IF NOT EXISTS idx_flows_start_date ON flows(start_date);
CREATE INDEX IF NOT EXISTS idx_flows_end_date ON flows(end_date);
CREATE INDEX IF NOT EXISTS idx_flows_created_at ON flows(created_at);
CREATE INDEX IF NOT EXISTS idx_flows_updated_at ON flows(updated_at);

-- Tags table indexes
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_tags_color ON tags(color);
CREATE INDEX IF NOT EXISTS idx_tags_created_at ON tags(created_at);

-- Notes table indexes
CREATE INDEX IF NOT EXISTS idx_notes_title ON notes(title);
CREATE INDEX IF NOT EXISTS idx_notes_entity_type ON notes(entity_type);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at);

-- Workspaces table indexes
CREATE INDEX IF NOT EXISTS idx_workspaces_name ON workspaces(name);
CREATE INDEX IF NOT EXISTS idx_workspaces_created_at ON workspaces(created_at);

-- Composite indexes for common filter combinations
CREATE INDEX IF NOT EXISTS idx_projects_status_created_at ON projects(status, created_at);
CREATE INDEX IF NOT EXISTS idx_goals_status_priority ON goals(status, priority);
CREATE INDEX IF NOT EXISTS idx_tasks_status_priority ON tasks(status, priority);
CREATE INDEX IF NOT EXISTS idx_tasks_status_due_date ON tasks(status, due_date);

-- Tag relationship indexes for efficient tag filtering
CREATE INDEX IF NOT EXISTS idx_project_tags_tag_id ON project_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_goal_tags_tag_id ON goal_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_task_tags_tag_id ON task_tags(tag_id);

-- Create a unified taggings view for cross-entity tag queries (used in tag_ids filtering)
CREATE OR REPLACE VIEW taggings AS
SELECT project_id as entity_id, 'project' as entity_type, tag_id FROM project_tags
UNION ALL
SELECT goal_id as entity_id, 'goal' as entity_type, tag_id FROM goal_tags  
UNION ALL
SELECT task_id as entity_id, 'task' as entity_type, tag_id FROM task_tags;

-- Create indexes on the materialized view columns for better performance
-- Note: These will be virtual since it's a view, but helps with query planning
CREATE INDEX IF NOT EXISTS idx_taggings_entity_type ON project_tags(tag_id) WHERE 'project' = 'project';
CREATE INDEX IF NOT EXISTS idx_taggings_entity_type_goal ON goal_tags(tag_id) WHERE 'goal' = 'goal';
CREATE INDEX IF NOT EXISTS idx_taggings_entity_type_task ON task_tags(tag_id) WHERE 'task' = 'task';

-- Add comments for documentation
COMMENT ON INDEX idx_projects_status IS 'Index for filtering projects by status';
COMMENT ON INDEX idx_goals_status_priority IS 'Composite index for filtering goals by status and priority';
COMMENT ON INDEX idx_tasks_status_due_date IS 'Composite index for filtering tasks by status and due date';
COMMENT ON VIEW taggings IS 'Unified view for tag relationships across all entity types';

-- Performance optimization: Update statistics after index creation
ANALYZE projects;
ANALYZE goals;
ANALYZE tasks;
ANALYZE flows;
ANALYZE tags;
ANALYZE notes;
ANALYZE workspaces;
ANALYZE project_tags;
ANALYZE goal_tags;
ANALYZE task_tags;