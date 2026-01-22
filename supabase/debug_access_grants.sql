-- Debug: Check if access_grants query works for Dr. Sarah
-- Dr. Sarah's ID: 1c80496e-09a6-4ce3-830d-5842fe758cb7

-- 1. Check raw access_grants
SELECT * FROM access_grants 
WHERE provider_id = '1c80496e-09a6-4ce3-830d-5842fe758cb7';

-- 2. Check with patient join (this is what the app does)
SELECT 
    ag.*,
    p.id as patient_id,
    p.name,
    p.email,
    p.phone,
    p.nalam_id,
    p.avatar_url,
    p.date_of_birth,
    p.gender
FROM access_grants ag
LEFT JOIN profiles p ON ag.patient_id = p.id
WHERE ag.provider_id = '1c80496e-09a6-4ce3-830d-5842fe758cb7'
AND ag.status = 'GRANTED';

-- 3. Check RLS policies on access_grants
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'access_grants';

-- 4. Check if profiles table has RLS that might block the join
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';
