-- DISCOVER EXACT TABLE SCHEMAS
-- Run this first to see what columns exist in each table

-- Appointments table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'appointments'
ORDER BY ordinal_position;

-- Health Records table structure  
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'health_records'
ORDER BY ordinal_position;

-- Medications table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'medications'
ORDER BY ordinal_position;

-- Doctor Patients table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'doctor_patients'
ORDER BY ordinal_position;

-- Notifications table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;

-- Messages table structure (if exists)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'messages'
ORDER BY ordinal_position;
