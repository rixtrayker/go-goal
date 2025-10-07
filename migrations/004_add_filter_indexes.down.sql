-- Remove database indexes for commonly filtered fields

-- Drop composite indexes for common filter combinations
DROP INDEX IF EXISTS idx_projects_status_created_at;
DROP INDEX IF EXISTS idx_goals_status_priority;
DROP INDEX IF EXISTS idx_tasks_status_priority;
DROP INDEX IF EXISTS idx_tasks_status_due_date;

-- Drop tag relationship indexes
DROP INDEX IF EXISTS idx_project_tags_tag_id;
DROP INDEX IF EXISTS idx_goal_tags_tag_id;
DROP INDEX IF EXISTS idx_task_tags_tag_id;

-- Drop the unified taggings view
DROP VIEW IF EXISTS taggings;

-- Drop Projects table indexes
DROP INDEX IF EXISTS idx_projects_status;
DROP INDEX IF EXISTS idx_projects_title;
DROP INDEX IF EXISTS idx_projects_created_at;
DROP INDEX IF EXISTS idx_projects_updated_at;

-- Drop Goals table indexes
DROP INDEX IF EXISTS idx_goals_status;
DROP INDEX IF EXISTS idx_goals_title;
DROP INDEX IF EXISTS idx_goals_priority;
DROP INDEX IF EXISTS idx_goals_due_date;
DROP INDEX IF EXISTS idx_goals_created_at;
DROP INDEX IF EXISTS idx_goals_updated_at;

-- Drop Tasks table indexes
DROP INDEX IF EXISTS idx_tasks_status;
DROP INDEX IF EXISTS idx_tasks_title;
DROP INDEX IF EXISTS idx_tasks_priority;
DROP INDEX IF EXISTS idx_tasks_due_date;
DROP INDEX IF EXISTS idx_tasks_created_at;
DROP INDEX IF EXISTS idx_tasks_updated_at;

-- Drop Flows table indexes
DROP INDEX IF EXISTS idx_flows_title;
DROP INDEX IF EXISTS idx_flows_color;
DROP INDEX IF EXISTS idx_flows_start_date;
DROP INDEX IF EXISTS idx_flows_end_date;
DROP INDEX IF EXISTS idx_flows_created_at;
DROP INDEX IF EXISTS idx_flows_updated_at;

-- Drop Tags table indexes
DROP INDEX IF EXISTS idx_tags_name;
DROP INDEX IF EXISTS idx_tags_color;
DROP INDEX IF EXISTS idx_tags_created_at;

-- Drop Notes table indexes
DROP INDEX IF EXISTS idx_notes_title;
DROP INDEX IF EXISTS idx_notes_entity_type;
DROP INDEX IF EXISTS idx_notes_created_at;
DROP INDEX IF EXISTS idx_notes_updated_at;

-- Drop Workspaces table indexes
DROP INDEX IF EXISTS idx_workspaces_name;
DROP INDEX IF EXISTS idx_workspaces_created_at;