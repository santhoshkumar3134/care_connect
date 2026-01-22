-- Check medications table schema
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'medications'
ORDER BY ordinal_position;

-- Get medications for Santhosh
SELECT * FROM medications
WHERE patient_id = 'c0f000d4-095c-4529-bae2-b26457931d1e'
ORDER BY created_at DESC;
