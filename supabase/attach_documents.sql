-- =================================================================
-- ATTACH MEDICAL DOCUMENTS TO RECORDS
-- =================================================================
-- Run this AFTER running complete_setup_simplified.sql
-- Links uploaded documents to the health records
-- =================================================================

DO $$
DECLARE
    v_base_url TEXT := 'https://ekckjevxkiwmzgnvuiulz.supabase.co/storage/v1/object/public/health-docs/';
BEGIN
    RAISE NOTICE '📎 Attaching medical documents...';

    -- Santhosh's records (4 documents)
    UPDATE health_records 
    SET file_url = v_base_url || 'lab_reports/lipid_panel_initial_1768968829399.png', file_type = 'image/png'
    WHERE title = 'Lipid Profile - Initial' AND type = 'LAB'
      AND patient_id = (SELECT id FROM profiles WHERE email = 'santhosh@patient.com');

    UPDATE health_records 
    SET file_url = v_base_url || 'scans/ecg_report_normal_1768968847667.png', file_type = 'image/png'
    WHERE title = 'ECG Report' AND type = 'SCAN'
      AND patient_id = (SELECT id FROM profiles WHERE email = 'santhosh@patient.com');

    UPDATE health_records 
    SET file_url = v_base_url || 'lab_reports/lipid_panel_followup_1768968871766.png', file_type = 'image/png'
    WHERE title = 'Lipid Profile - Follow-up' AND type = 'LAB'
      AND patient_id = (SELECT id FROM profiles WHERE email = 'santhosh@patient.com');

    UPDATE health_records 
    SET file_url = v_base_url || 'scans/chest_xray_report_1768968954842.png', file_type = 'image/png'
    WHERE title = 'Chest X-Ray' AND type = 'SCAN'
      AND patient_id = (SELECT id FROM profiles WHERE email = 'santhosh@patient.com');

    -- Priya's records (2 documents)
    UPDATE health_records 
    SET file_url = v_base_url || 'lab_reports/thyroid_panel_initial_1768968889509.png', file_type = 'image/png'
    WHERE title = 'Thyroid Panel' AND type = 'LAB'
      AND patient_id = (SELECT id FROM profiles WHERE email = 'priya@patient.com');

    UPDATE health_records 
    SET file_url = v_base_url || 'lab_reports/cbc_report_1768968909448.png', file_type = 'image/png'
    WHERE title = 'CBC' AND type = 'LAB'
      AND patient_id = (SELECT id FROM profiles WHERE email = 'priya@patient.com');

    -- Rahul's record (1 document)
    UPDATE health_records 
    SET file_url = v_base_url || 'lab_reports/diabetes_monitoring_panel_1768968935354.png', file_type = 'image/png'
    WHERE title = 'HbA1c Test' AND type = 'LAB'
      AND patient_id = (SELECT id FROM profiles WHERE email = 'rahul@patient.com');

    RAISE NOTICE '✅ Attached 7 medical documents to health records!';
    
END $$;

-- Verification
SELECT 
    p.name,
    hr.title,
    hr.type,
    CASE WHEN hr.file_url IS NOT NULL THEN '✓' ELSE '✗' END as has_file
FROM health_records hr
JOIN profiles p ON hr.patient_id = p.id
WHERE p.role = 'PATIENT'
ORDER BY p.name, hr.date DESC;
