-- Add recovery questions to teacher accounts
-- Run this in Supabase SQL Editor before using the new forgot-password flow.

ALTER TABLE teachers ADD COLUMN IF NOT EXISTS security_question_1 TEXT;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS security_answer_1 TEXT;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS security_question_2 TEXT;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS security_answer_2 TEXT;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS security_questions_completed_at TIMESTAMP WITH TIME ZONE;