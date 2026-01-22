-- ENHANCED REALISTIC TEST DATA
-- More comprehensive medical records for thorough testing

DO $$
DECLARE
    v_patient_id UUID;
    v_dr_sarah_id UUID;
    v_dr_james_id UUID;
BEGIN
    -- Get user IDs
    SELECT id INTO v_patient_id FROM profiles WHERE email = 'santhosh@patient.com';
    SELECT id INTO v_dr_sarah_id FROM profiles WHERE email = 'dr.sarah@careconnect.com';
    SELECT id INTO v_dr_james_id FROM profiles WHERE email = 'dr.james@careconnect.com';

    -- ADD MORE APPOINTMENTS (past, present, future, different statuses)
    INSERT INTO appointments (patient_id, doctor_id, date, time, status, type, reason, notes)
    VALUES
        -- Historical appointments (last 3 months)
        (v_patient_id, v_dr_sarah_id, '2025-11-15', '09:00 AM', 'COMPLETED', 'IN_PERSON', 'Initial consultation', 'Discussed health concerns. Ordered blood tests.'),
        (v_patient_id, v_dr_sarah_id, '2025-12-01', '10:30 AM', 'COMPLETED', 'VIDEO', 'Follow-up - Test results', 'All tests normal. Continue current regimen.'),
        (v_patient_id, v_dr_james_id, '2025-12-20', '03:00 PM', 'COMPLETED', 'IN_PERSON', 'Cardiology screening', 'ECG performed. Heart health excellent.'),
        
        -- Recent appointments
        (v_patient_id, v_dr_sarah_id, '2026-01-10', '11:00 AM', 'COMPLETED', 'PHONE', 'Medication refill', 'Approved refill for vitamins.'),
        
        -- Upcoming varied appointments
        (v_patient_id, v_dr_sarah_id, '2026-01-28', '09:30 AM', 'SCHEDULED', 'IN_PERSON', 'Quarterly checkup', NULL),
        (v_patient_id, v_dr_james_id, '2026-02-05', '02:00 PM', 'SCHEDULED', 'VIDEO', 'Heart health follow-up', NULL),
        (v_patient_id, v_dr_sarah_id, '2026-02-15', '10:00 AM', 'SCHEDULED', 'IN_PERSON', 'Vaccination - Flu shot', NULL),
        
        -- One cancelled appointment
        (v_patient_id, v_dr_sarah_id, '2026-01-05', '04:00 PM', 'CANCELLED', 'VIDEO', 'Routine check', 'Patient rescheduled')
    ON CONFLICT DO NOTHING;

    -- ADD MORE HEALTH RECORDS (varied types, historical)
    INSERT INTO health_records (patient_id, doctor_id, title, type, date, doctor_name, summary)
    VALUES
        -- Historical records
        (v_patient_id, v_dr_sarah_id, 'Initial Patient Assessment', 'VISIT_NOTE', '2025-11-15', 'Dr. Sarah Venkat',
         'New patient intake. Medical history reviewed. No major health concerns. Family history: diabetes (father). Non-smoker. Exercises 3x/week.'),
        
        (v_patient_id, v_dr_sarah_id, 'Lipid Panel', 'LAB', '2025-11-20', 'Dr. Sarah Venkat',
         'Total Cholesterol: 185 mg/dL, LDL: 110 mg/dL, HDL: 55 mg/dL, Triglycerides: 100 mg/dL. All values within normal range.'),
        
        (v_patient_id, v_dr_sarah_id, 'Thyroid Function Test', 'LAB', '2025-12-01', 'Dr. Sarah Venkat',
         'TSH: 2.5 μIU/mL, T4: 8.5 μg/dL, T3: 110 ng/dL. Thyroid function normal.'),
        
        (v_patient_id, v_dr_james_id, 'Chest X-Ray', 'SCAN', '2025-12-20', 'Dr. James Wilson',
         'Chest radiograph shows clear lung fields. Heart size normal. No abnormalities detected.'),
        
        -- Recent prescriptions
        (v_patient_id, v_dr_sarah_id, 'Prescription - Vitamins', 'PRESCRIPTION', '2026-01-10', 'Dr. Sarah Venkat',
         'Prescribed: Vitamin D3 1000 IU daily, Omega-3 500mg twice daily, Multivitamin once daily. Duration: 6 months.'),
        
        (v_patient_id, v_dr_sarah_id, 'Progress Notes - Jan 2026', 'VISIT_NOTE', '2026-01-18', 'Dr. Sarah Venkat',
         'Patient reports feeling well. Energy levels good. Sleep quality improved. BP: 118/78. Weight stable at 75kg. Continue current wellness plan.'),
        
        (v_patient_id, v_dr_james_id, 'Echocardiogram', 'SCAN', '2026-01-19', 'Dr. James Wilson',
         'Echocardiogram shows normal cardiac function. Ejection fraction: 60%. No valvular abnormalities. Excellent cardiovascular health.')
    ON CONFLICT DO NOTHING;

    -- ADD MORE MEDICATIONS (varied durations, some completed)
    INSERT INTO medications (patient_id, prescribed_by, name, dosage, frequency, start_date, end_date, reason, is_active)
    VALUES
        -- Historical medications (completed)
        (v_patient_id, v_dr_sarah_id, 'Amoxicillin', '500mg', 'Three times daily', '2025-11-25', '2025-12-02', 'Mild respiratory infection', false),
        (v_patient_id, v_dr_sarah_id, 'Cetirizine', '10mg', 'Once daily', '2025-12-10', '2026-01-10', 'Seasonal allergies', false),
        
        -- Active long-term medications
        (v_patient_id, v_dr_sarah_id, 'Aspirin', '81mg', 'Once daily', '2025-11-15', '2026-11-15', 'Cardiovascular protection', true),
        (v_patient_id, v_dr_james_id, 'Coenzyme Q10', '100mg', 'Once daily', '2025-12-20', '2026-06-20', 'Heart health support', true),
        
        -- Recently prescribed
        (v_patient_id, v_dr_sarah_id, 'Probiotics', '10 billion CFU', 'Once daily', '2026-01-15', '2026-04-15', 'Digestive health', true)
    ON CONFLICT DO NOTHING;

    -- ADD MORE NOTIFICATIONS (varied types)
    BEGIN
        INSERT INTO notifications (user_id, from_user_id, type, title, content, link, is_read, created_at)
        VALUES
            -- Appointment reminders
            (v_patient_id, v_dr_sarah_id, 'APPOINTMENT', 'Upcoming Appointment in 2 Days',
             'Reminder: You have a quarterly checkup with Dr. Sarah Venkat on Jan 28 at 09:30 AM', '/patient/appointments', false, NOW() - INTERVAL '1 hour'),
            
            -- Health record updates
            (v_patient_id, v_dr_james_id, 'HEALTH_RECORD', 'New Test Results Available',
             'Dr. James Wilson uploaded: Echocardiogram results', '/patient/records', false, NOW() - INTERVAL '6 hours'),
            
            (v_patient_id, v_dr_sarah_id, 'HEALTH_RECORD', 'Lab Results Normal',
             'Your recent blood test results are within normal range', '/patient/records', true, NOW() - INTERVAL '3 days'),
            
            -- Medication reminders
            (v_patient_id, NULL, 'SYSTEM', 'Medication Refill Due',
             'Your Omega-3 prescription needs refill in 15 days', '/patient/medications', false, NOW() - INTERVAL '2 hours'),
            
            -- Doctor side notifications
            (v_dr_sarah_id, v_patient_id, 'APPOINTMENT', 'Patient Confirmed Appointment',
             'Santhosh Kumar confirmed appointment on Jan 28 at 09:30 AM', '/doctor/schedule', false, NOW() - INTERVAL '3 hours'),
            
            (v_dr_james_id, v_patient_id, 'MESSAGE', 'Patient Question',
             'Santhosh Kumar sent you a message about test results', '/doctor/chat', true, NOW() - INTERVAL '1 day')
        ON CONFLICT DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Notifications: %', SQLERRM;
    END;

    RAISE NOTICE '✅ Enhanced test data added successfully!';
    RAISE NOTICE '📅 Added 8 more appointments (varied statuses and types)';
    RAISE NOTICE '📋 Added 7 more health records (historical and current)';
    RAISE NOTICE '💊 Added 5 more medications (active and completed)';
    RAISE NOTICE '🔔 Added 6 more notifications (varied types)';
END $$;

-- VERIFY ENHANCED DATA
SELECT 
    'Appointments' as category,
    COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed,
    COUNT(CASE WHEN status = 'SCHEDULED' THEN 1 END) as scheduled,
    COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled,
    COUNT(*) as total
FROM appointments WHERE patient_id = (SELECT id FROM profiles WHERE email = 'santhosh@patient.com')
UNION ALL
SELECT 
    'Health Records',
    COUNT(CASE WHEN type = 'LAB' THEN 1 END),
    COUNT(CASE WHEN type = 'SCAN' THEN 1 END),
    COUNT(CASE WHEN type = 'VISIT_NOTE' THEN 1 END),
    COUNT(*)
FROM health_records WHERE patient_id = (SELECT id FROM profiles WHERE email = 'santhosh@patient.com')
UNION ALL
SELECT 
    'Medications',
    COUNT(CASE WHEN is_active = true THEN 1 END),
    COUNT(CASE WHEN is_active = false THEN 1 END),
    NULL,
    COUNT(*)
FROM medications WHERE patient_id = (SELECT id FROM profiles WHERE email = 'santhosh@patient.com');
