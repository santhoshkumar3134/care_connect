-- Quick test: Check if there are any access grants in the database
SELECT 
    ag.id,
    ag.status,
    ag.patient_id,
    ag.provider_id,
    p.name as patient_name,
    p.nalam_id,
    doc.name as doctor_name
FROM access_grants ag
LEFT JOIN profiles p ON ag.patient_id = p.id
LEFT JOIN profiles doc ON ag.provider_id = doc.id
ORDER BY ag.created_at DESC
LIMIT 10;

-- Check if current doctor user has any granted access
-- Replace 'YOUR_DOCTOR_USER_ID' with actual doctor's user ID
-- SELECT * FROM access_grants WHERE provider_id = 'YOUR_DOCTOR_USER_ID' AND status = 'GRANTED';
