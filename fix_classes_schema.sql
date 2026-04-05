-- Fix Classes schema to support multiple streams
-- This migration updates the classes table and creates a streams table

-- Step 1: Backup existing data
CREATE TABLE classes_backup AS SELECT * FROM classes;

-- Step 2: Alter classes table to add has_streams column
ALTER TABLE classes ADD COLUMN IF NOT EXISTS has_streams BOOLEAN DEFAULT false;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Step 3: Create streams table (if not exists)
CREATE TABLE IF NOT EXISTS streams (
  id BIGSERIAL PRIMARY KEY,
  class_id BIGINT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, name)
);

-- Step 4: Enable RLS on streams table
ALTER TABLE streams ENABLE ROW LEVEL SECURITY;

-- Step 5: Create policies for streams
CREATE POLICY "Allow all on streams" ON streams FOR ALL USING (true);

-- Step 6: Create index on streams
CREATE INDEX IF NOT EXISTS idx_streams_class_id ON streams(class_id);

-- Let's check the data
SELECT 'Classes with old stream field:' as info;
SELECT id, name, stream, has_streams FROM classes LIMIT 5;

SELECT 'Streams created so far:' as info;
SELECT * FROM streams LIMIT 5;
