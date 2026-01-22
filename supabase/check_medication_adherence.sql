-- First check the medications table schema
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'medications'
ORDER BY ordinal_position;

-- Then get medications for Santhosh
SELECT * FROM medications
WHERE patient_id = 'c0f000d4-095c-4529-bae2-b26457931d1e'
ORDER BY created_at DESC;

-- Check adherence records
SELECT * FROM medication_adherence
WHERE medication_id IN (
    SELECT id FROM medications WHERE patient_id = 'c0f000d4-095c-4529-bae2-b26457931d1e'
)
ORDER BY scheduled_time DESC
LIMIT 20;
