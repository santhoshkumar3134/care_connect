-- Check if foreign key exists on access_grants table
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='access_grants';

-- If no foreign keys exist, create them
-- Uncomment and run these if needed:

-- ALTER TABLE access_grants
-- ADD CONSTRAINT access_grants_patient_id_fkey 
-- FOREIGN KEY (patient_id) 
-- REFERENCES profiles(id) 
-- ON DELETE CASCADE;

-- ALTER TABLE access_grants
-- ADD CONSTRAINT access_grants_provider_id_fkey 
-- FOREIGN KEY (provider_id) 
-- REFERENCES profiles(id) 
-- ON DELETE CASCADE;
