-- =================================================================
-- FIX PROJECT URL - CORRECT SUPABASE PROJECT ID
-- =================================================================
-- Updates all file URLs to use the correct project ID
-- =================================================================

DO $$
DECLARE
    v_correct_url TEXT := 'https://ekcsjkkewlxemgwnutkj.supabase.co/storage/v1/object/public/health-docs/';
    v_wrong_url TEXT := 'https://ekckjevxkiwmzgnvuiulz.supabase.co/storage/v1/object/public/health-docs/';
BEGIN
    RAISE NOTICE '🔧 Fixing project URL in all file paths...';
    
    -- Update all file URLs to use correct project ID
    UPDATE health_records
    SET file_url = REPLACE(file_url, v_wrong_url, v_correct_url)
    WHERE file_url LIKE v_wrong_url || '%';
    
    -- Also check if any have the old wrong URL and fix them
    UPDATE health_records
    SET file_url = v_correct_url || 'lab_reports/lipid_panel_initial_1768968829399.png'
    WHERE title = 'Lipid Profile - Initial' 
      AND type = 'LAB'
      AND file_url IS NOT NULL;

    UPDATE health_records
    SET file_url = v_correct_url || 'scans/ecg_report_normal_1768968847667.png'
    WHERE title = 'ECG Report'
      AND type = 'SCAN'
      AND file_url IS NOT NULL;

    UPDATE health_records
    SET file_url = v_correct_url || 'lab_reports/lipid_panel_followup_1768968871766.png'
    WHERE title = 'Lipid Profile - Follow-up'
      AND type = 'LAB'
      AND file_url IS NOT NULL;

    UPDATE health_records
    SET file_url = v_correct_url || 'scans/chest_xray_report_1768968954842.png'
    WHERE title = 'Chest X-Ray'
      AND type = 'SCAN'
      AND file_url IS NOT NULL;

    UPDATE health_records
    SET file_url = v_correct_url || 'lab_reports/thyroid_panel_initial_1768968889509.png'
    WHERE title = 'Thyroid Panel'
      AND type = 'LAB'
      AND file_url IS NOT NULL;

    UPDATE health_records
    SET file_url = v_correct_url || 'lab_reports/cbc_report_1768968909448.png'
    WHERE title = 'CBC'
      AND type = 'LAB'
      AND file_url IS NOT NULL;

    UPDATE health_records
    SET file_url = v_correct_url || 'lab_reports/diabetes_monitoring_panel_1768968935354.png'
    WHERE title = 'HbA1c Test'
      AND type = 'LAB'
      AND file_url IS NOT NULL;

    RAISE NOTICE '✅ Project URL fixed!';
END $$;

-- Verify the fix
SELECT 
    title,
    file_url
FROM health_records
WHERE file_url IS NOT NULL
ORDER BY title;
