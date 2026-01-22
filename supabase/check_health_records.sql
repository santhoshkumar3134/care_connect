-- Check if health_records have file_url populated
SELECT 
    id,
    title,
    type,
    file_url,
    created_at
FROM health_records
WHERE patient_id = 'c0f000d4-095c-4529-bae2-b26457931d1e' -- Santhosh's ID
ORDER BY created_at DESC
LIMIT 10;
