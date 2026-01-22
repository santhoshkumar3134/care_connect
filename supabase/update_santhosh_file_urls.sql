-- =================================================================
-- UPDATE FILE URLS - SANTHOSH ONLY (Simplified)
-- =================================================================
-- Links the uploaded medical documents to Santhosh's health records
-- =================================================================

DO $$
DECLARE
    v_base_url TEXT := 'https://ekckjevxkiwmzgnvuiulz.supabase.co/storage/v1/object/public/health-docs/';
    v_patient_santhosh UUID := 'c0f000d4-095c-4529-bae2-b26457931d1e';
BEGIN
    RAISE NOTICE '📁 Linking medical documents to health records...';
    RAISE NOTICE 'Base URL: %', v_base_url;

    -- 1. Lipid Panel - Initial Assessment (LAB)
    UPDATE health_records 
    SET 
        file_url = v_base_url || 'lab_reports/lipid_panel_initial_1768968829399.png',
        file_type = 'image/png'
    WHERE patient_id = v_patient_santhosh
      AND title = 'Lipid Profile - Initial Assessment'
      AND type = 'LAB'
      AND date = '2025-07-18';

    -- 2. ECG Report (SCAN)
    UPDATE health_records 
    SET 
        file_url = v_base_url || 'scans/ecg_report_normal_1768968847667.png',
        file_type = 'image/png'
    WHERE patient_id = v_patient_santhosh
      AND title = 'Electrocardiogram (12-Lead ECG)'
      AND type = 'SCAN'
      AND date = '2025-07-18';

    -- 3. Lipid Panel - 3-Month Follow-up (LAB)
    UPDATE health_records 
    SET 
        file_url = v_base_url || 'lab_reports/lipid_panel_followup_1768968871766.png',
        file_type = 'image/png'
    WHERE patient_id = v_patient_santhosh
      AND title = 'Lipid Profile - 3-Month Follow-up'
      AND type = 'LAB'
      AND date = '2025-10-20';

    -- 4. Chest X-Ray (SCAN)
    UPDATE health_records 
    SET 
        file_url = v_base_url || 'scans/chest_xray_report_1768968954842.png',
        file_type = 'image/png'
    WHERE patient_id = v_patient_santhosh
      AND title = 'Chest Radiograph'
      AND type = 'SCAN'
      AND date = '2025-12-20';

    RAISE NOTICE '✅ File URLs updated successfully!';
    RAISE NOTICE '🔗 Linked 4 medical documents to health records';
    
END $$;

-- =================================================================
-- VERIFICATION QUERY
-- =================================================================
SELECT 
    title,
    type,
    date,
    CASE 
        WHEN file_url IS NOT NULL THEN '✓ Has File'
        ELSE '✗ No File'
    END as file_status,
    file_url
FROM health_records
WHERE patient_id = 'c0f000d4-095c-4529-bae2-b26457931d1e'
  AND date >= '2025-07-01'
ORDER BY date DESC;
