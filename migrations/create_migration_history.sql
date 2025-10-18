-- Migration History Table
-- This table tracks the history of task migrations for the Daily Task Migration System
-- Issue: https://github.com/Yuvraj198920/Bullet-Journal/issues/1

CREATE TABLE IF NOT EXISTS migration_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_date DATE NOT NULL,
  migrated_to_date DATE,
  migration_type TEXT NOT NULL CHECK (migration_type IN ('migrate', 'schedule', 'cancel')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_migration_history_task_id ON migration_history(task_id);
CREATE INDEX IF NOT EXISTS idx_migration_history_user_id ON migration_history(user_id);
CREATE INDEX IF NOT EXISTS idx_migration_history_original_date ON migration_history(original_date);
CREATE INDEX IF NOT EXISTS idx_migration_history_created_at ON migration_history(created_at DESC);

-- Enable Row Level Security
ALTER TABLE migration_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own migration history
CREATE POLICY "Users can view their own migration history" 
  ON migration_history FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can only create their own migration history
CREATE POLICY "Users can create their own migration history" 
  ON migration_history FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own migration history
CREATE POLICY "Users can update their own migration history" 
  ON migration_history FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can only delete their own migration history
CREATE POLICY "Users can delete their own migration history" 
  ON migration_history FOR DELETE 
  USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON migration_history TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Comments for documentation
COMMENT ON TABLE migration_history IS 'Tracks the history of task migrations for the Daily Task Migration System';
COMMENT ON COLUMN migration_history.id IS 'Unique identifier for the migration history record';
COMMENT ON COLUMN migration_history.task_id IS 'Reference to the task that was migrated';
COMMENT ON COLUMN migration_history.user_id IS 'Reference to the user who owns the task';
COMMENT ON COLUMN migration_history.original_date IS 'The original date the task was scheduled for';
COMMENT ON COLUMN migration_history.migrated_to_date IS 'The new date the task was migrated to (null for cancelled tasks)';
COMMENT ON COLUMN migration_history.migration_type IS 'Type of migration: migrate (>), schedule (<), or cancel (strikethrough)';
COMMENT ON COLUMN migration_history.created_at IS 'Timestamp when the migration was created';
