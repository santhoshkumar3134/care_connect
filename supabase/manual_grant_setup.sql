-- Step 1: Check what users exist in your database
SELECT id, email, raw_user_meta_data->>'role' as role 
FROM auth.users 
ORDER BY created_at DESC;

-- Step 2: Check what profiles exist
SELECT id, name, email, role 
FROM profiles 
ORDER BY created_at DESC;

-- Step 3: Once you see the actual emails, manually create a grant
-- Replace 'PATIENT_EMAIL' and 'DOCTOR_EMAIL' with actual emails from above

-- Get the IDs
WITH user_ids AS (
  SELECT 
    (SELECT id FROM auth.users WHERE email = 'PATIENT_EMAIL_HERE' LIMIT 1) as patient_id,
    (SELECT id FROM auth.users WHERE email = 'DOCTOR_EMAIL_HERE' LIMIT 1) as doctor_id
)
-- Insert the grant
INSERT INTO access_grants (patient_id, provider_id, access_level, status)
SELECT patient_id, doctor_id, 'FULL', 'GRANTED'
FROM user_ids
WHERE patient_id IS NOT NULL AND doctor_id IS NOT NULL
ON CONFLICT (patient_id, provider_id) DO NOTHING;

-- Step 4: Verify it worked
SELECT 
    ag.id,
    ag.status,
    p.name as patient_name,
    p.email as patient_email,
    doc.name as doctor_name,
    doc.email as doctor_email
FROM access_grants ag
LEFT JOIN profiles p ON ag.patient_id = p.id
LEFT JOIN profiles doc ON ag.provider_id = doc.id;
