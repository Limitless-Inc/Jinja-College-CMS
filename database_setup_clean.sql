-- REPORTING SYSTEM DATABASE TABLES - CLEAN INSTALL
-- This version drops existing objects first to ensure clean setup

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations on lesson_reports" ON lesson_reports;
DROP POLICY IF EXISTS "Allow all operations on stream_reports" ON stream_reports;
DROP POLICY IF EXISTS "Allow all operations on consolidated_reports" ON consolidated_reports;
DROP POLICY IF EXISTS "Allow all operations on sms_logs" ON sms_logs;
DROP POLICY IF EXISTS "Allow all operations on attendance" ON attendance;

-- Drop existing indexes
DROP INDEX IF EXISTS idx_lesson_reports_teacher;
DROP INDEX IF EXISTS idx_lesson_reports_student;
DROP INDEX IF EXISTS idx_lesson_reports_class;
DROP INDEX IF EXISTS idx_lesson_reports_date;
DROP INDEX IF EXISTS idx_stream_reports_teacher;
DROP INDEX IF EXISTS idx_stream_reports_class;
DROP INDEX IF EXISTS idx_stream_reports_date;
DROP INDEX IF EXISTS idx_consolidated_reports_duty_head;
DROP INDEX IF EXISTS idx_consolidated_reports_week;
DROP INDEX IF EXISTS idx_sms_logs_student;
DROP INDEX IF EXISTS idx_sms_logs_date;
DROP INDEX IF EXISTS idx_attendance_student;
DROP INDEX IF EXISTS idx_attendance_date;

-- Drop existing tables
DROP TABLE IF EXISTS lesson_reports CASCADE;
DROP TABLE IF EXISTS stream_reports CASCADE;
DROP TABLE IF EXISTS consolidated_reports CASCADE;
DROP TABLE IF EXISTS sms_logs CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;

-- 1. Lesson Reports Table
CREATE TABLE lesson_reports (
  id BIGSERIAL PRIMARY KEY,
  teacher_id INTEGER NOT NULL,
  teacher_name TEXT NOT NULL,
  student_id INTEGER NOT NULL,
  student_name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  lesson_notes TEXT NOT NULL,
  participation TEXT NOT NULL CHECK (participation IN ('Excellent', 'Good', 'Fair', 'Poor')),
  report_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Stream Reports Table
CREATE TABLE stream_reports (
  id BIGSERIAL PRIMARY KEY,
  teacher_id INTEGER NOT NULL,
  teacher_name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  summary TEXT NOT NULL,
  total_reports INTEGER DEFAULT 0,
  red_students INTEGER DEFAULT 0,
  report_date DATE NOT NULL,
  status TEXT DEFAULT 'submitted',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Consolidated Reports Table
CREATE TABLE consolidated_reports (
  id BIGSERIAL PRIMARY KEY,
  duty_head_id INTEGER NOT NULL,
  duty_head_name TEXT NOT NULL,
  week_start DATE NOT NULL,
  total_stream_reports INTEGER DEFAULT 0,
  total_red_students INTEGER DEFAULT 0,
  consolidated_notes TEXT NOT NULL,
  status TEXT DEFAULT 'submitted',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SMS Logs Table
CREATE TABLE sms_logs (
  id BIGSERIAL PRIMARY KEY,
  teacher_id INTEGER NOT NULL,
  teacher_name TEXT NOT NULL,
  student_id INTEGER NOT NULL,
  student_name TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'delivered')),
  sent_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Attendance Table
CREATE TABLE attendance (
  id BIGSERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL,
  student_name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  attendance_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  marked_by INTEGER NOT NULL,
  marked_by_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, attendance_date)
);

-- Create indexes
CREATE INDEX idx_lesson_reports_teacher ON lesson_reports(teacher_id);
CREATE INDEX idx_lesson_reports_student ON lesson_reports(student_id);
CREATE INDEX idx_lesson_reports_class ON lesson_reports(class_name);
CREATE INDEX idx_lesson_reports_date ON lesson_reports(report_date);

CREATE INDEX idx_stream_reports_teacher ON stream_reports(teacher_id);
CREATE INDEX idx_stream_reports_class ON stream_reports(class_name);
CREATE INDEX idx_stream_reports_date ON stream_reports(report_date);

CREATE INDEX idx_consolidated_reports_duty_head ON consolidated_reports(duty_head_id);
CREATE INDEX idx_consolidated_reports_week ON consolidated_reports(week_start);

CREATE INDEX idx_sms_logs_student ON sms_logs(student_id);
CREATE INDEX idx_sms_logs_date ON sms_logs(sent_date);

CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);

-- Enable Row Level Security
ALTER TABLE lesson_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE consolidated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on lesson_reports" ON lesson_reports FOR ALL USING (true);
CREATE POLICY "Allow all operations on stream_reports" ON stream_reports FOR ALL USING (true);
CREATE POLICY "Allow all operations on consolidated_reports" ON consolidated_reports FOR ALL USING (true);
CREATE POLICY "Allow all operations on sms_logs" ON sms_logs FOR ALL USING (true);
CREATE POLICY "Allow all operations on attendance" ON attendance FOR ALL USING (true);
