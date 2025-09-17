-- Create contexts table
CREATE TABLE IF NOT EXISTS contexts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    status VARCHAR(50) DEFAULT 'active',
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    parent_id INTEGER REFERENCES contexts(id) ON DELETE SET NULL,
    workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add context_id columns to existing tables
ALTER TABLE projects ADD COLUMN IF NOT EXISTS context_id INTEGER REFERENCES contexts(id) ON DELETE SET NULL;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS context_id INTEGER REFERENCES contexts(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS context_id INTEGER REFERENCES contexts(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contexts_workspace_id ON contexts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_contexts_parent_id ON contexts(parent_id);
CREATE INDEX IF NOT EXISTS idx_contexts_status ON contexts(status);
CREATE INDEX IF NOT EXISTS idx_projects_context_id ON projects(context_id);
CREATE INDEX IF NOT EXISTS idx_goals_context_id ON goals(context_id);
CREATE INDEX IF NOT EXISTS idx_tasks_context_id ON tasks(context_id);

-- Create trigger for contexts updated_at
CREATE TRIGGER update_contexts_updated_at BEFORE UPDATE ON contexts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some example contexts
INSERT INTO contexts (title, description, color, status, start_date, end_date, workspace_id) VALUES 
('Financial Goals', 'Saving money and building wealth', '#10B981', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '6 months', 1),
('Health & Fitness', 'Physical health and wellness goals', '#F59E0B', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '3 months', 1),
('Career Development', 'Professional growth and job search', '#8B5CF6', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '4 months', 1),
('Habit Building', 'Building positive daily habits', '#06B6D4', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '2 months', 1)
ON CONFLICT DO NOTHING;


