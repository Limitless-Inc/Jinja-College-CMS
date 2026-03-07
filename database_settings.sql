-- SETTINGS TABLE
CREATE TABLE IF NOT EXISTS system_settings (
  id BIGSERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  setting_key TEXT NOT NULL,
  setting_value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by INTEGER,
  UNIQUE(category, setting_key)
);

-- Insert default settings
INSERT INTO system_settings (category, setting_key, setting_value) VALUES
-- General
('general', 'system_name', 'Jinja College CMS'),
('general', 'language', 'English (UK)'),
('general', 'date_format', 'DD/MM/YYYY'),
('general', 'time_format', '12-hour'),
('general', 'first_day_of_week', 'Monday'),
('general', 'academic_year_start', 'February'),
('general', 'number_of_terms', '3'),
('general', 'current_term', 'Term 1'),

-- School Profile
('school', 'school_name', 'Jinja College'),
('school', 'school_address', 'P.O. Box 211, Jinja, Uganda'),
('school', 'school_phone', '+256434120571'),
('school', 'school_email', 'info@jinjacollege.ug'),
('school', 'school_website', 'www.jinjacollege.ug'),
('school', 'school_motto', 'Strive to Excel'),
('school', 'header_color', '#1e40af'),
('school', 'footer_text', '© 2026 Jinja College. All rights reserved.'),

-- Class Management
('class', 'naming_convention', 'S.1, S.2, S.3...'),
('class', 'default_streams', 'East, West, North, South, Central'),
('class', 'max_students_per_stream', '50'),
('class', 'allow_no_streams', 'true'),
('class', 'auto_assign_teachers', 'false'),
('class', 'auto_promote', 'true'),
('class', 'promotion_date', '12-15'),

-- Attendance
('attendance', 'marking_window_start', '07:00'),
('attendance', 'marking_window_end', '09:00'),
('attendance', 'allow_past_date', 'true'),
('attendance', 'max_days_past', '7'),
('attendance', 'late_grace_period', '15'),
('attendance', 'green_threshold', '90'),
('attendance', 'orange_threshold', '70'),
('attendance', 'red_threshold', '70'),
('attendance', 'consecutive_absences_flag', '5'),
('attendance', 'include_weekends', 'false'),
('attendance', 'include_holidays', 'false'),

-- SMS & Notifications
('sms', 'provider', 'Africa''s Talking'),
('sms', 'test_mode', 'false'),
('sms', 'auto_send_red', 'false'),
('sms', 'auto_send_absence', 'false'),
('sms', 'max_sms_per_day', '3'),

-- Reporting
('reporting', 'default_period', 'Weekly'),
('reporting', 'weekly_report_day', 'Friday'),
('reporting', 'deadline_time', '17:00'),
('reporting', 'auto_remind', 'true'),
('reporting', 'reminder_frequency', '2'),
('reporting', 'default_export_format', 'PDF'),
('reporting', 'pdf_page_size', 'A4'),
('reporting', 'include_logo', 'true'),
('reporting', 'include_footer', 'true'),

-- Duty Management
('duty', 'default_duration', 'One Week'),
('duty', 'max_team_size', '5'),
('duty', 'min_team_size', '1'),
('duty', 'allow_consecutive', 'false'),
('duty', 'auto_assign', 'false'),
('duty', 'duty_head_rotation', 'Random'),
('duty', 'auto_expire', 'true'),

-- User Management
('user', 'default_password', 'Auto-generate'),
('user', 'require_password_change', 'true'),
('user', 'password_min_length', '8'),
('user', 'require_strong_password', 'true'),
('user', 'session_timeout', '2'),
('user', 'max_login_attempts', '5'),
('user', 'lockout_duration', '15'),
('user', 'allow_public_signup', 'true'),
('user', 'require_approval', 'true'),
('user', 'send_welcome_email', 'true'),

-- Data Management
('data', 'keep_attendance', 'Forever'),
('data', 'keep_reports', 'Forever'),
('data', 'keep_sms_logs', '3 years'),
('data', 'auto_delete', 'false'),
('data', 'export_format', 'Excel'),
('data', 'include_timestamps', 'true'),
('data', 'max_export_rows', '10000'),
('data', 'compress_exports', 'false'),

-- Privacy & Security
('privacy', 'show_parent_phones', 'Class teachers only'),
('privacy', 'show_full_names', 'true'),
('privacy', 'teachers_see_reports', 'false'),
('privacy', '2fa', 'Off'),
('privacy', 'audit_log', 'true'),

-- Appearance
('appearance', 'theme', 'Light'),
('appearance', 'allow_user_theme', 'true'),
('appearance', 'primary_color', '#3B82F6'),
('appearance', 'secondary_color', '#0A1929'),
('appearance', 'accent_color', '#10B981'),
('appearance', 'items_per_page', '25'),
('appearance', 'sidebar_default', 'Expanded'),
('appearance', 'dashboard_layout', 'Comfortable'),
('appearance', 'font_size', 'Medium'),

-- Backup
('backup', 'auto_backup', 'true'),
('backup', 'backup_frequency', 'Daily'),
('backup', 'backup_time', '02:00'),
('backup', 'keep_backups', '30'),
('backup', 'backup_location', 'Supabase Storage'),
('backup', 'email_status', 'true')

ON CONFLICT (category, setting_key) DO NOTHING;

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on system_settings" ON system_settings FOR ALL USING (true);
