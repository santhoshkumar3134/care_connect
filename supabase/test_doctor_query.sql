-- Test the exact query the app is making
-- Dr. Sarah's ID: 1c80496e-09a6-4ce3-830d-5842fe758cb7

SELECT 
    ag.*,
    p.id,
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
