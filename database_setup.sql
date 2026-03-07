-- REPORTING SYSTEM DATABASE TABLES
-- Run these SQL commands in your Supabase SQL Editor

-- 1. Lesson Reports Table (Subject Teachers submit after each lesson)
CREATE TABLE IF NOT EXISTS lesson_reports (
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

-- 2. Stream Reports Table (Class Teachers consolidate weekly)
CREATE TABLE IF NOT EXISTS stream_reports (
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

-- 3. Consolidated Reports Table (Duty Head submits weekly)
CREATE TABLE IF NOT EXISTS consolidated_reports (
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

-- 4. SMS Logs Table (Track parent communications)
CREATE TABLE IF NOT EXISTS sms_logs (
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

-- 5. Attendance Table (Track daily attendance)
CREATE TABLE IF NOT EXISTS attendance (
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lesson_reports_teacher ON lesson_reports(teacher_id);
CREATE INDEX IF NOT EXISTS idx_lesson_reports_student ON lesson_reports(student_id);
CREATE INDEX IF NOT EXISTS idx_lesson_reports_class ON lesson_reports(class_name);
CREATE INDEX IF NOT EXISTS idx_lesson_reports_date ON lesson_reports(report_date);

CREATE INDEX IF NOT EXISTS idx_stream_reports_teacher ON stream_reports(teacher_id);
CREATE INDEX IF NOT EXISTS idx_stream_reports_class ON stream_reports(class_name);
CREATE INDEX IF NOT EXISTS idx_stream_reports_date ON stream_reports(report_date);

CREATE INDEX IF NOT EXISTS idx_consolidated_reports_duty_head ON consolidated_reports(duty_head_id);
CREATE INDEX IF NOT EXISTS idx_consolidated_reports_week ON consolidated_reports(week_start);

CREATE INDEX IF NOT EXISTS idx_sms_logs_student ON sms_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_date ON sms_logs(sent_date);

CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);

-- Enable Row Level Security (RLS)
ALTER TABLE lesson_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE consolidated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now - adjust based on your security needs)
CREATE POLICY "Allow all operations on lesson_reports" ON lesson_reports FOR ALL USING (true);
CREATE POLICY "Allow all operations on stream_reports" ON stream_reports FOR ALL USING (true);
CREATE POLICY "Allow all operations on consolidated_reports" ON consolidated_reports FOR ALL USING (true);
CREATE POLICY "Allow all operations on sms_logs" ON sms_logs FOR ALL USING (true);
CREATE POLICY "Allow all operations on attendance" ON attendance FOR ALL USING (true);