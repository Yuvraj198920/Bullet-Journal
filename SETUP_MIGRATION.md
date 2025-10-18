# Setup: Daily Task Migration System

## Create Database Table

Run this SQL in your **Supabase Dashboard → SQL Editor**:

```sql
CREATE TABLE IF NOT EXISTS migration_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_date DATE NOT NULL,
  migrated_to_date DATE,
  migration_type TEXT NOT NULL CHECK (migration_type IN ('migrate', 'schedule', 'cancel')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_migration_history_task_id ON migration_history(task_id);
CREATE INDEX IF NOT EXISTS idx_migration_history_user_id ON migration_history(user_id);
CREATE INDEX IF NOT EXISTS idx_migration_history_original_date ON migration_history(original_date);
CREATE INDEX IF NOT EXISTS idx_migration_history_created_at ON migration_history(created_at DESC);

ALTER TABLE migration_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own migration history" 
  ON migration_history FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own migration history" 
  ON migration_history FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

GRANT ALL ON migration_history TO authenticated;
```

Done! The migration feature will work after this.
