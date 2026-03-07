-- Add profile_picture column to teachers table
-- Run this in Supabase SQL Editor

ALTER TABLE teachers ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Create storage bucket for profile pictures (run in Supabase Storage section)
-- Go to Storage → Create Bucket → Name: "profile-pictures" → Public: Yes
