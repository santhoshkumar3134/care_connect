-- =================================================================
-- FIX HEALTH RECORD FILE URLS - DIAGNOSTIC AND REPAIR
-- =================================================================
-- This script will identify and fix broken file URLs
-- =================================================================

-- STEP 1: Check what file URLs are currently stored
SELECT 
    '=== CURRENT FILE URLS ===' as info,
    p.name as patient,
    hr.title,
    hr.type,
    hr.file_url
FROM health_records hr
JOIN profiles p ON hr.patient_id = p.id
WHERE hr.file_url IS NOT NULL
ORDER BY p.name, hr.title;

-- STEP 2: Clear broken/old file URLs
-- These are records that have file URLs but the files don't exist
UPDATE health_records 
SET file_url = NULL, file_type = NULL
WHERE title IN ('body Scan', 'brain scan', 'ECG - Routine', 'Lipid Profile - 1 Year', 
                'Hypertension Management Plan', 'Echocardiogram', 'Vaccination Record');

-- STEP 3: Re-attach correct file URLs
-- Only attach files that actually exist in storage
DO $$
DECLARE
    v_base_url TEXT := 'https://ekckjevxkiwmzgnvuiulz.supabase.co/storage/v1/object/public/health-docs/';
BEGIN
    -- Santhosh's records with existing files
    UPDATE health_records 
    SET file_url = v_base_url || 'lab_reports/lipid_panel_initial_1768968829399.png', 
        file_type = 'image/png'
    WHERE title = 'Lipid Profile - Initial' 
      AND type = 'LAB'
      AND patient_id = (SELECT id FROM profiles WHERE email = 'santhosh@patient.com')
      AND file_url IS NULL;

    UPDATE health_records 
    SET file_url = v_base_url || 'scans/ecg_report_normal_1768968847667.png',
        file_type = 'image/png'
    WHERE title = 'ECG Report'
      AND type = 'SCAN'
      AND patient_id = (SELECT id FROM profiles WHERE email = 'santhosh@patient.com')
      AND file_url IS NULL;

    UPDATE health_records 
    SET file_url = v_base_url || 'lab_reports/lipid_panel_followup_1768968871766.png',
        file_type = 'image/png'
    WHERE title = 'Lipid Profile - Follow-up'
      AND type = 'LAB'
      AND patient_id = (SELECT id FROM profiles WHERE email = 'santhosh@patient.com');

    UPDATE health_records 
    SET file_url = v_base_url || 'scans/chest_xray_report_1768968954842.png',
        file_type = 'image/png'
    WHERE title = 'Chest X-Ray'
      AND type = 'SCAN'
      AND patient_id = (SELECT id FROM profiles WHERE email = 'santhosh@patient.com');

    -- Priya's records
    UPDATE health_records 
    SET file_url = v_base_url || 'lab_reports/thyroid_panel_initial_1768968889509.png',
        file_type = 'image/png'
    WHERE title = 'Thyroid Panel'
      AND type = 'LAB'
      AND patient_id = (SELECT id FROM profiles WHERE email = 'priya@patient.com');

    UPDATE health_records 
    SET file_url = v_base_url || 'lab_reports/cbc_report_1768968909448.png',
        file_type = 'image/png'
    WHERE title = 'CBC'
      AND type = 'LAB'
      AND patient_id = (SELECT id FROM profiles WHERE email = 'priya@patient.com');

    -- Rahul's record
    UPDATE health_records 
    SET file_url = v_base_url || 'lab_reports/diabetes_monitoring_panel_1768968935354.png',
        file_type = 'image/png'
    WHERE title = 'HbA1c Test'
      AND type = 'LAB'
      AND patient_id = (SELECT id FROM profiles WHERE email = 'rahul@patient.com');

    RAISE NOTICE '✅ File URLs fixed!';
END $$;

-- STEP 4: Verify - Show records with files
SELECT 
    '=== RECORDS WITH FILES (AFTER FIX) ===' as info,
    p.name as patient,
    hr.title,
    hr.type,
    CASE WHEN hr.file_url IS NOT NULL THEN '✓ Has File' ELSE '✗ No File' END as status
FROM health_records hr
JOIN profiles p ON hr.patient_id = p.id
WHERE p.role = 'PATIENT'
ORDER BY p.name, hr.title;
