-- Add rating and feedback columns to appointments table
-- Run this in Supabase SQL Editor

BEGIN;

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5),
ADD COLUMN IF NOT EXISTS feedback TEXT,
ADD COLUMN IF NOT EXISTS feedback_date TIMESTAMP WITH TIME ZONE;

-- Add index for analytics
CREATE INDEX IF NOT EXISTS appointments_rating_idx ON appointments(rating);

COMMIT;
