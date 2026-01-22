-- Check all health records for Santhosh
SELECT id, title, type, file_url, created_at
FROM health_records
WHERE patient_id = 'c0f000d4-095c-4529-bae2-b26457931d1e'
ORDER BY created_at DESC;
