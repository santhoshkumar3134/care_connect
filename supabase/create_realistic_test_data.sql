-- REALISTIC TEST DATA - CORRECTED WITH EXACT SCHEMAS
-- Run this in Supabase SQL Editor

DO $$
DECLARE
    v_patient_id UUID;
    v_dr_sarah_id UUID;
    v_dr_james_id UUID;
    v_admin_id UUID;
BEGIN
    -- Get user IDs
    SELECT id INTO v_patient_id FROM profiles WHERE email = 'santhosh@patient.com';
    SELECT id INTO v_dr_sarah_id FROM profiles WHERE email = 'dr.sarah@careconnect.com';
    SELECT id INTO v_dr_james_id FROM profiles WHERE email = 'dr.james@careconnect.com';
    SELECT id INTO v_admin_id FROM profiles WHERE email = 'admin@careconnect.com';

    -- 1. CREATE DOCTOR-PATIENT RELATIONSHIPS
    INSERT INTO doctor_patients (patient_id, doctor_id, start_date, is_active)
    VALUES 
        (v_patient_id, v_dr_sarah_id, '2026-01-15', true),
        (v_patient_id, v_dr_james_id, '2026-01-18', true)
    ON CONFLICT DO NOTHING;

    -- 2. CREATE APPOINTMENTS
    INSERT INTO appointments (patient_id, doctor_id, date, time, status, type, reason, notes)
    VALUES
        -- Past appointment with Dr. Sarah
        (v_patient_id, v_dr_sarah_id, '2026-01-18', '10:00 AM', 'COMPLETED', 'IN_PERSON', 'Annual checkup', 'Patient is healthy. BP 120/80.'),
        
        -- Scheduled appointment with Dr. Sarah
        (v_patient_id, v_dr_sarah_id, '2026-01-22', '02:00 PM', 'SCHEDULED', 'VIDEO', 'Blood test results review', NULL),
        
        -- Scheduled appointment with Dr. James
        (v_patient_id, v_dr_james_id, '2026-01-25', '11:30 AM', 'SCHEDULED', 'IN_PERSON', 'Cardiology consultation', NULL),
        
        -- Today's appointment
        (v_patient_id, v_dr_sarah_id, CURRENT_DATE::TEXT, '04:00 PM', 'SCHEDULED', 'VIDEO', 'Follow-up consultation', NULL)
    ON CONFLICT DO NOTHING;

    -- 3. CREATE HEALTH RECORDS
    INSERT INTO health_records (patient_id, doctor_id, title, type, date, doctor_name, summary)
    VALUES
        (v_patient_id, v_dr_sarah_id, 'Annual Physical Examination', 'VISIT_NOTE', '2026-01-18', 'Dr. Sarah Venkat', 
         'Complete physical examination. All vitals normal. Height: 175cm, Weight: 75kg, BP: 120/80. Patient is in excellent health. Recommended regular exercise and balanced diet.'),
        
        (v_patient_id, v_dr_sarah_id, 'Complete Blood Count', 'LAB', '2026-01-19', 'Dr. Sarah Venkat',
         'Blood test results: Hemoglobin 14.5 g/dL, WBC 7,500/μL, Platelets 250,000/μL. All blood parameters within normal range. No concerns.'),
        
        (v_patient_id, v_dr_james_id, 'ECG Report', 'SCAN', '2026-01-19', 'Dr. James Wilson',
         'Electrocardiogram shows normal sinus rhythm. Heart rhythm is normal. No abnormalities detected.'),
        
        (v_patient_id, v_dr_sarah_id, 'Vaccination Record', 'PRESCRIPTION', '2025-12-15', 'Dr. Sarah Venkat',
         'COVID-19 booster dose administered')
    ON CONFLICT DO NOTHING;

    -- 4. CREATE MEDICATIONS
    INSERT INTO medications (patient_id, prescribed_by, name, dosage, frequency, start_date, end_date, reason, is_active)
    VALUES
        (v_patient_id, v_dr_sarah_id, 'Vitamin D3', '1000 IU', 'Once daily', '2026-01-01', '2026-06-30', 'Vitamin D deficiency', true),
        (v_patient_id, v_dr_sarah_id, 'Omega-3 Fish Oil', '500mg', 'Twice daily', '2026-01-01', '2026-06-30', 'Heart health', true),
        (v_patient_id, v_dr_sarah_id, 'Multivitamin', '1 tablet', 'Once daily', '2026-01-15', '2026-04-15', 'General wellness', true)
    ON CONFLICT DO NOTHING;

    -- 5. CREATE NOTIFICATIONS
    BEGIN
        INSERT INTO notifications (user_id, from_user_id, type, title, content, link, is_read, created_at)
        VALUES
            (v_patient_id, v_dr_sarah_id, 'APPOINTMENT', 'Upcoming Appointment Today', 
             'You have an appointment with Dr. Sarah Venkat today at 04:00 PM', '/patient/appointments', false, NOW()),
            
            (v_patient_id, v_dr_sarah_id, 'HEALTH_RECORD', 'Doctor Added Findings', 
             'Dr. Sarah Venkat has added findings to: Annual Physical Examination', '/patient/records', true, NOW() - INTERVAL '2 days'),
            
            (v_patient_id, v_dr_james_id, 'MESSAGE', 'New Message', 
             'You have a new message from Dr. James Wilson', '/patient/messages', false, NOW() - INTERVAL '12 hours'),
            
            (v_dr_sarah_id, v_patient_id, 'APPOINTMENT', 'Patient Booked Appointment', 
             'Santhosh Kumar booked an appointment on 2026-01-22 at 02:00 PM', '/doctor/schedule', false, NOW() - INTERVAL '1 day')
        ON CONFLICT DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Notifications: %', SQLERRM;
    END;

    RAISE NOTICE '✅ Realistic test data created successfully!';
    RAISE NOTICE '👥 Users: 1 Patient (Santhosh), 2 Doctors (Sarah, James), 1 Admin';
    RAISE NOTICE '📅 Appointments: 4 (1 completed, 3 scheduled)';
    RAISE NOTICE '📋 Health Records: 4';
    RAISE NOTICE '💊 Medications: 3';
    RAISE NOTICE '🔔 Notifications: 4';
END $$;

-- VERIFY DATA CREATION
SELECT 'Appointments' as table_name, COUNT(*) as count FROM appointments
UNION ALL
SELECT 'Health Records', COUNT(*) FROM health_records
UNION ALL
SELECT 'Medications', COUNT(*) FROM medications
UNION ALL
SELECT 'Doctor-Patient Relationships', COUNT(*) FROM doctor_patients
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notifications;
