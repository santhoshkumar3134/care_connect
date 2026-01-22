-- ===========================================================================
-- UPDATE HEALTH RECORDS WITH FILE URLS
-- ===========================================================================
-- After uploading medical documents to Supabase Storage, run this script
-- to link the files to their corresponding health records.
-- 
-- IMPORTANT: Replace 'YOUR_PROJECT_URL' with your actual Supabase project URL
-- Example: https://abcdefgh.supabase.co
-- ===========================================================================

DO $$
DECLARE
    v_base_url TEXT := 'https://ekckjevxkiwmzgnvuiulz.supabase.co/storage/v1/object/public/health-docs/';
    v_patient_santhosh UUID;
    v_patient_priya UUID;
    v_patient_rahul UUID;
BEGIN
    -- Get patient IDs
    SELECT id INTO v_patient_santhosh FROM profiles WHERE email = 'santhosh@patient.com';
    SELECT id INTO v_patient_priya FROM profiles WHERE email = 'priya@patient.com';
    SELECT id INTO v_patient_rahul FROM profiles WHERE email = 'rahul@patient.com';

    RAISE NOTICE '📁 Updating health records with file URLs...';
    RAISE NOTICE 'Base URL: %', v_base_url;

    -- ========================================================================
    -- SANTHOSH'S RECORDS - Cardiac Risk Management
    -- ========================================================================

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
      AND title LIKE '%Chest%'
      AND type = 'SCAN';

    -- ========================================================================
    -- PRIYA'S RECORDS - Thyroid Disorder
    -- ========================================================================

    -- 5. Thyroid Function Panel (LAB)
    UPDATE health_records 
    SET 
        file_url = v_base_url || 'lab_reports/thyroid_panel_initial_1768968889509.png',
        file_type = 'image/png'
    WHERE patient_id = v_patient_priya
      AND title = 'Thyroid Function Panel'
      AND type = 'LAB'
      AND date = '2025-08-12';

    -- 6. Complete Blood Count (LAB)
    UPDATE health_records 
    SET 
        file_url = v_base_url || 'lab_reports/cbc_report_1768968909448.png',
        file_type = 'image/png'
    WHERE patient_id = v_patient_priya
      AND title = 'Complete Blood Count (CBC)'
      AND type = 'LAB'
      AND date = '2025-08-12';

    -- ========================================================================
    -- RAHUL'S RECORDS - Diabetes Management
    -- ========================================================================

    -- 7. Diabetes Monitoring Panel (LAB)
    UPDATE health_records 
    SET 
        file_url = v_base_url || 'lab_reports/diabetes_monitoring_panel_1768968935354.png',
        file_type = 'image/png'
    WHERE patient_id = v_patient_rahul
      AND title = 'Diabetes Monitoring Panel - Q1 2026'
      AND type = 'LAB'
      AND date = '2026-01-15';

    RAISE NOTICE '✅ File URLs updated successfully!';
    
END $$;

-- ===========================================================================
-- VERIFICATION QUERY
-- ===========================================================================
-- Check which records now have files attached

SELECT 
    p.name as patient_name,
    hr.title,
    hr.type,
    hr.date,
    CASE 
        WHEN hr.file_url IS NOT NULL THEN '✓ Has File'
        ELSE '✗ No File'
    END as file_status,
    hr.file_url
FROM health_records hr
JOIN profiles p ON hr.patient_id = p.id
WHERE p.email IN ('santhosh@patient.com', 'priya@patient.com', 'rahul@patient.com')
ORDER BY p.name, hr.date DESC;
