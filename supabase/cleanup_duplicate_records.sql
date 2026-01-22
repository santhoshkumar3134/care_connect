-- =================================================================
-- CLEANUP DUPLICATE AND OLD HEALTH RECORDS
-- =================================================================
-- Removes duplicate and old records, keeps only the ones with files
-- =================================================================

DO $$
DECLARE
    v_santhosh_id UUID := (SELECT id FROM profiles WHERE email = 'santhosh@patient.com');
BEGIN
    RAISE NOTICE '🧹 Cleaning up old and duplicate records...';
    
    -- Delete old records from previous setup (without files)
    DELETE FROM health_records
    WHERE patient_id = v_santhosh_id
      AND file_url IS NULL
      AND title IN (
          'body Scan',
          'brain scan',
          'ECG - Routine',
          'Echocardiogram',
          'Hypertension Management Plan',
          'Lipid Profile - 1 Year',
          'Vaccination Record'
      );
    
    -- Delete duplicate "Complete Blood Count" records (no files)
    DELETE FROM health_records
    WHERE patient_id = v_santhosh_id
      AND title = 'Complete Blood Count'
      AND file_url IS NULL;
    
    -- Keep only ONE "Lipid Profile - Initial" with file (the 2025 one)
    DELETE FROM health_records
    WHERE patient_id = v_santhosh_id
      AND title = 'Lipid Profile - Initial'
      AND date = '2024-01-19';  -- Delete the older duplicate
    
    -- Keep only ONE "ECG Report" from 2025-07-18 (our realistic one)
    DELETE FROM health_records
    WHERE patient_id = v_santhosh_id
      AND title = 'ECG Report'
      AND date = '2026-01-19';  -- Delete the newer duplicate
    
    RAISE NOTICE '✅ Cleanup complete!';
    RAISE NOTICE 'Remaining records now match the uploaded medical documents.';
    
END $$;

-- Verify cleanup - Show remaining records
SELECT 
    title,
    type,
    date,
    CASE 
        WHEN file_url IS NOT NULL THEN '✓ HAS FILE'
        ELSE '✗ NO FILE'
    END as file_status
FROM health_records
WHERE patient_id = (SELECT id FROM profiles WHERE email = 'santhosh@patient.com')
ORDER BY date DESC;
