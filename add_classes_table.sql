-- Add missing classes table only
CREATE TABLE IF NOT EXISTS classes (
  id BIGSERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  stream TEXT,
  capacity INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow all on classes" ON classes FOR ALL USING (true);

-- Create index
CREATE INDEX IF NOT EXISTS idx_classes_name ON classes(name);
