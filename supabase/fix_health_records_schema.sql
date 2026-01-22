-- =================================================================
-- FIX HEALTH RECORDS UPLOAD ERROR
-- =================================================================
-- This script fixes the "doctor_name column not found" error
-- by adding the missing column to the health_records table
-- =================================================================

-- Add doctor_name column for backward compatibility
-- This allows storing doctor names for external providers
ALTER TABLE health_records 
ADD COLUMN IF NOT EXISTS doctor_name TEXT;

-- Update existing records to populate doctor_name from profiles
-- This ensures existing records have doctor names filled in
UPDATE health_records hr
SET doctor_name = p.name
FROM profiles p
WHERE hr.doctor_id = p.id 
  AND hr.doctor_name IS NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_health_records_doctor_name 
ON health_records(doctor_name);

-- =================================================================
-- VERIFICATION QUERY
-- =================================================================
-- Run this to verify the column was added successfully:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'health_records';
-- =================================================================
