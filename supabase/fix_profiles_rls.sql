-- Fix RLS on profiles table to allow doctors to read patient profiles
-- when the patient has granted them access

-- First, check current policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';

-- Add policy to allow doctors to read profiles of patients who granted access
CREATE POLICY "Doctors can view profiles of patients who granted access"
ON profiles
FOR SELECT
USING (
  -- Allow if there's a GRANTED access_grant where I am the provider
  EXISTS (
    SELECT 1 FROM access_grants
    WHERE access_grants.patient_id = profiles.id
    AND access_grants.provider_id = auth.uid()
    AND access_grants.status = 'GRANTED'
  )
);

-- Verify the policy was created
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
