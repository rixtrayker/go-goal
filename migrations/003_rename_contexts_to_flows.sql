-- Rename contexts table to flows
ALTER TABLE contexts RENAME TO flows;

-- Rename context_id columns to flow_id
ALTER TABLE projects RENAME COLUMN context_id TO flow_id;
ALTER TABLE goals RENAME COLUMN context_id TO flow_id;
ALTER TABLE tasks RENAME COLUMN context_id TO flow_id;

-- Rename indexes
ALTER INDEX idx_contexts_workspace_id RENAME TO idx_flows_workspace_id;
ALTER INDEX idx_contexts_parent_id RENAME TO idx_flows_parent_id;
ALTER INDEX idx_contexts_status RENAME TO idx_flows_status;
ALTER INDEX idx_projects_context_id RENAME TO idx_projects_flow_id;
ALTER INDEX idx_goals_context_id RENAME TO idx_goals_flow_id;
ALTER INDEX idx_tasks_context_id RENAME TO idx_tasks_flow_id;

-- Update foreign key constraints
ALTER TABLE flows DROP CONSTRAINT IF EXISTS contexts_parent_id_fkey;
ALTER TABLE flows ADD CONSTRAINT flows_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES flows(id) ON DELETE SET NULL;

ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_context_id_fkey;
ALTER TABLE projects ADD CONSTRAINT projects_flow_id_fkey FOREIGN KEY (flow_id) REFERENCES flows(id) ON DELETE SET NULL;

ALTER TABLE goals DROP CONSTRAINT IF EXISTS goals_context_id_fkey;
ALTER TABLE goals ADD CONSTRAINT goals_flow_id_fkey FOREIGN KEY (flow_id) REFERENCES flows(id) ON DELETE SET NULL;

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_context_id_fkey;
ALTER TABLE tasks ADD CONSTRAINT tasks_flow_id_fkey FOREIGN KEY (flow_id) REFERENCES flows(id) ON DELETE SET NULL;

-- Update trigger
DROP TRIGGER IF EXISTS update_contexts_updated_at ON flows;
CREATE TRIGGER update_flows_updated_at BEFORE UPDATE ON flows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Rename context_relationships table to flow_relationships if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'context_relationships') THEN
        ALTER TABLE context_relationships RENAME TO flow_relationships;
        ALTER TABLE flow_relationships RENAME COLUMN context_id TO flow_id;
        ALTER TABLE flow_relationships RENAME COLUMN related_context_id TO related_flow_id;
        ALTER TABLE flow_relationships DROP CONSTRAINT IF EXISTS context_relationships_context_id_fkey;
        ALTER TABLE flow_relationships DROP CONSTRAINT IF EXISTS context_relationships_related_context_id_fkey;
        ALTER TABLE flow_relationships ADD CONSTRAINT flow_relationships_flow_id_fkey FOREIGN KEY (flow_id) REFERENCES flows(id) ON DELETE CASCADE;
        ALTER TABLE flow_relationships ADD CONSTRAINT flow_relationships_related_flow_id_fkey FOREIGN KEY (related_flow_id) REFERENCES flows(id) ON DELETE CASCADE;
    END IF;
END $$;
