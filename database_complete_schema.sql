-- COMPLETE DATABASE SCHEMA FOR JINJA COLLEGE CMS
-- Run this in Supabase SQL Editor to set up all tables

-- ============================================
-- 1. TEACHERS TABLE (Core user management)
-- ============================================
CREATE TABLE IF NOT EXISTS teachers (
  id BIGSERIAL PRIMARY KEY,
  staff_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  subjects TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'teacher' CHECK (role IN ('admin', 'teacher')),
  class_assigned TEXT,
  approved BOOLEAN DEFAULT false,
  rejection_reason TEXT,
  profile_picture TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. STUDENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS students (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female')),
  class TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  category TEXT DEFAULT 'green' CHECK (category IN ('green', 'orange', 'red')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. CLASSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS classes (
  id BIGSERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  stream TEXT,
  capacity INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. DUTY ASSIGNMENTS TABLE (Critical for feature system)
-- ============================================
CREATE TABLE IF NOT EXISTS duty_assignments (
  id BIGSERIAL PRIMARY KEY,
  teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  is_duty_head BOOLEAN DEFAULT false,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(teacher_id, start_date)
);

-- ============================================
-- 5. ATTENDANCE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS attendance (
  id BIGSERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  attendance_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  marked_by INTEGER NOT NULL REFERENCES teachers(id),
  marked_by_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, attendance_date)
);

-- ============================================
-- 6. LESSON REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS lesson_reports (
  id BIGSERIAL PRIMARY KEY,
  teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  teacher_name TEXT NOT NULL,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  lesson_notes TEXT NOT NULL,
  participation TEXT NOT NULL CHECK (participation IN ('Excellent', 'Good', 'Fair', 'Poor')),
  report_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. STREAM REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS stream_reports (
  id BIGSERIAL PRIMARY KEY,
  teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  teacher_name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  summary TEXT NOT NULL,
  total_reports INTEGER DEFAULT 0,
  red_students INTEGER DEFAULT 0,
  report_date DATE NOT NULL,
  status TEXT DEFAULT 'submitted',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 8. CONSOLIDATED REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS consolidated_reports (
  id BIGSERIAL PRIMARY KEY,
  duty_head_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  duty_head_name TEXT NOT NULL,
  week_start DATE NOT NULL,
  total_stream_reports INTEGER DEFAULT 0,
  total_red_students INTEGER DEFAULT 0,
  consolidated_notes TEXT NOT NULL,
  status TEXT DEFAULT 'submitted',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 9. SMS LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sms_logs (
  id BIGSERIAL PRIMARY KEY,
  teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  teacher_name TEXT NOT NULL,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'delivered')),
  sent_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 10. SYSTEM SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS system_settings (
  id BIGSERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  setting_key TEXT NOT NULL,
  setting_value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by INTEGER REFERENCES teachers(id),
  UNIQUE(category, setting_key)
);

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_teachers_staff_id ON teachers(staff_id);
CREATE INDEX IF NOT EXISTS idx_teachers_approved ON teachers(approved);
CREATE INDEX IF NOT EXISTS idx_teachers_class ON teachers(class_assigned);

CREATE INDEX IF NOT EXISTS idx_students_class ON students(class);
CREATE INDEX IF NOT EXISTS idx_students_category ON students(category);

CREATE INDEX IF NOT EXISTS idx_duty_teacher ON duty_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_duty_status ON duty_assignments(status);
CREATE INDEX IF NOT EXISTS idx_duty_dates ON duty_assignments(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_marked_by ON attendance(marked_by);

CREATE INDEX IF NOT EXISTS idx_lesson_reports_teacher ON lesson_reports(teacher_id);
CREATE INDEX IF NOT EXISTS idx_lesson_reports_student ON lesson_reports(student_id);
CREATE INDEX IF NOT EXISTS idx_lesson_reports_date ON lesson_reports(report_date);

CREATE INDEX IF NOT EXISTS idx_stream_reports_teacher ON stream_reports(teacher_id);
CREATE INDEX IF NOT EXISTS idx_stream_reports_date ON stream_reports(report_date);

CREATE INDEX IF NOT EXISTS idx_consolidated_duty_head ON consolidated_reports(duty_head_id);
CREATE INDEX IF NOT EXISTS idx_consolidated_week ON consolidated_reports(week_start);

CREATE INDEX IF NOT EXISTS idx_sms_teacher ON sms_logs(teacher_id);
CREATE INDEX IF NOT EXISTS idx_sms_student ON sms_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_sms_date ON sms_logs(sent_date);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE duty_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE consolidated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE POLICIES (Allow all for now)
-- ============================================
CREATE POLICY "Allow all on teachers" ON teachers FOR ALL USING (true);
CREATE POLICY "Allow all on students" ON students FOR ALL USING (true);
CREATE POLICY "Allow all on classes" ON classes FOR ALL USING (true);
CREATE POLICY "Allow all on duty_assignments" ON duty_assignments FOR ALL USING (true);
CREATE POLICY "Allow all on attendance" ON attendance FOR ALL USING (true);
CREATE POLICY "Allow all on lesson_reports" ON lesson_reports FOR ALL USING (true);
CREATE POLICY "Allow all on stream_reports" ON stream_reports FOR ALL USING (true);
CREATE POLICY "Allow all on consolidated_reports" ON consolidated_reports FOR ALL USING (true);
CREATE POLICY "Allow all on sms_logs" ON sms_logs FOR ALL USING (true);
CREATE POLICY "Allow all on system_settings" ON system_settings FOR ALL USING (true);

-- ============================================
-- CREATE FUNCTION TO AUTO-EXPIRE DUTIES
-- ============================================
CREATE OR REPLACE FUNCTION expire_old_duties()
RETURNS void AS $$
BEGIN
  UPDATE duty_assignments
  SET status = 'expired'
  WHERE end_date < CURRENT_DATE
  AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- INSERT DEFAULT ADMIN (if not exists)
-- ============================================
INSERT INTO teachers (staff_id, name, phone, subjects, password, role, approved)
VALUES ('admin', 'System Administrator', '+256700000000', 'All', 'admin', 'admin', true)
ON CONFLICT (staff_id) DO NOTHING;
