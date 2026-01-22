-- ========================================
-- DOCTOR PORTAL SETUP - ALL IN ONE SCRIPT
-- ========================================
-- Run this entire script in Supabase SQL Editor

-- Step 1: Create access_grants table
CREATE TABLE IF NOT EXISTS access_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  access_level TEXT DEFAULT 'READ',
  status TEXT DEFAULT 'GRANTED',
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(patient_id, provider_id)
);

-- Step 2: Enable RLS
ALTER TABLE access_grants ENABLE ROW LEVEL SECURITY;

-- Step 3: Create Policies
DROP POLICY IF EXISTS "Patients can manage their own grants" ON access_grants;
CREATE POLICY "Patients can manage their own grants"
ON access_grants
FOR ALL
USING (auth.uid() = patient_id);

DROP POLICY IF EXISTS "Doctors can view grants assigned to them" ON access_grants;
CREATE POLICY "Doctors can view grants assigned to them"
ON access_grants
FOR SELECT
USING (auth.uid() = provider_id);

-- Step 4: Create Indexes
CREATE INDEX IF NOT EXISTS idx_access_grants_patient ON access_grants(patient_id);
CREATE INDEX IF NOT EXISTS idx_access_grants_provider ON access_grants(provider_id);
CREATE INDEX IF NOT EXISTS idx_access_grants_status ON access_grants(status);

-- Step 5: Create a test access grant
-- First, let's find patient and doctor user IDs
DO $$
DECLARE
    patient_user_id UUID;
    doctor_user_id UUID;
BEGIN
    -- Get patient ID (adjust email if needed)
    SELECT id INTO patient_user_id FROM auth.users WHERE email = 'patient@careconnect.com' LIMIT 1;
    
    -- Get doctor ID (adjust email if needed)
    SELECT id INTO doctor_user_id FROM auth.users WHERE email = 'doctor@careconnect.com' LIMIT 1;
    
    -- Only insert if both users exist
    IF patient_user_id IS NOT NULL AND doctor_user_id IS NOT NULL THEN
        INSERT INTO access_grants (patient_id, provider_id, access_level, status)
        VALUES (patient_user_id, doctor_user_id, 'FULL', 'GRANTED')
        ON CONFLICT (patient_id, provider_id) DO NOTHING;
        
        RAISE NOTICE 'Test access grant created successfully!';
    ELSE
        RAISE NOTICE 'Could not find patient or doctor users. Please create them first or adjust the emails in this script.';
    END IF;
END $$;

-- Step 6: Verify the setup
SELECT 
    ag.id,
    ag.status,
    ag.access_level,
    p.name as patient_name,
    p.email as patient_email,
    doc.name as doctor_name,
    doc.email as doctor_email,
    ag.granted_at
FROM access_grants ag
LEFT JOIN profiles p ON ag.patient_id = p.id
LEFT JOIN profiles doc ON ag.provider_id = doc.id;
