-- Create test access grants between patients and doctors
-- This will allow doctors to see patients in "My Patients" page

-- Grant Dr. Sarah access to Santhosh
INSERT INTO access_grants (patient_id, provider_id, access_level, status)
VALUES (
    'c0f000d4-095c-4529-bae2-b26457931d1e', -- santhosh@patient.com
    '1c80496e-09a6-4ce3-830d-5842fe758cb7', -- dr.sarah@careconnect.com
    'FULL',
    'GRANTED'
) ON CONFLICT (patient_id, provider_id) DO NOTHING;

-- Grant Dr. James access to Priya
INSERT INTO access_grants (patient_id, provider_id, access_level, status)
VALUES (
    '34bfdf4d-29c0-40ab-a4ca-1cbf59b6cb16', -- priya@patient.com
    '090cfa04-52a3-4597-bca0-ca071aa5aada', -- dr.james@careconnect.com
    'FULL',
    'GRANTED'
) ON CONFLICT (patient_id, provider_id) DO NOTHING;

-- Grant Dr. Emily access to Rahul
INSERT INTO access_grants (patient_id, provider_id, access_level, status)
VALUES (
    '6e57b179-2b2d-4156-824d-c0cbebf3a603', -- rahul@patient.com
    '8ec96c7c-cbae-44d6-88ee-f3a1cbe3efcf', -- dr.emily@careconnect.com
    'FULL',
    'GRANTED'
) ON CONFLICT (patient_id, provider_id) DO NOTHING;

-- Grant Dr. Sarah access to Ananya (multiple patients per doctor)
INSERT INTO access_grants (patient_id, provider_id, access_level, status)
VALUES (
    '22f0a40c-addd-4761-bf68-9c776ab0c4ee', -- ananya@patient.com
    '1c80496e-09a6-4ce3-830d-5842fe758cb7', -- dr.sarah@careconnect.com
    'FULL',
    'GRANTED'
) ON CONFLICT (patient_id, provider_id) DO NOTHING;

-- Grant Dr. James access to Vikram
INSERT INTO access_grants (patient_id, provider_id, access_level, status)
VALUES (
    '1a2560e1-487c-42e7-9193-a17789dd404f', -- vikram@patient.com
    '090cfa04-52a3-4597-bca0-ca071aa5aada', -- dr.james@careconnect.com
    'FULL',
    'GRANTED'
) ON CONFLICT (patient_id, provider_id) DO NOTHING;

-- Verify all grants were created
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
LEFT JOIN profiles doc ON ag.provider_id = doc.id
ORDER BY doc.email, p.email;
