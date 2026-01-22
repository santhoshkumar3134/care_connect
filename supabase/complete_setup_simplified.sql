-- =================================================================
-- COMPLETE CARECONNECT SETUP - SIMPLIFIED
-- =================================================================
-- Creates: 5 Patients, 6 Doctors, 2 Admins + Medical Records
-- Reduced mock data - concise but realistic
-- =================================================================

DO $$
DECLARE
    -- Existing Users (will skip if already exist)
    v_dr_sarah UUID := '1c80496e-09a6-4ce3-830d-5842fe758cb7';
    v_dr_james UUID := '090cfa04-52a3-4597-bca0-ca071aa5aada';
    v_santhosh UUID := 'c0f000d4-095c-4529-bae2-b26457931d1e';
    
    -- New Users to Create
    v_dr_emily UUID;
    v_dr_amit UUID;
    v_dr_kavya UUID;
    v_dr_rajesh UUID;
    
    v_priya UUID;
    v_rahul UUID;
    v_ananya UUID;
    v_vikram UUID;
    
    v_admin1 UUID;
    v_admin2 UUID;
BEGIN
    RAISE NOTICE '👥 Creating users...';

    -- =================================================================
    -- CREATE NEW DOCTORS (4 more to make 6 total)
    -- =================================================================
    
    -- Dr. Emily Chen - Endocrinologist
    SELECT id INTO v_dr_emily FROM auth.users WHERE email = 'dr.emily@careconnect.com';
    IF v_dr_emily IS NULL THEN
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 
                'dr.emily@careconnect.com', crypt('doctor123', gen_salt('bf')), now(), 
                '{"provider":"email","providers":["email"]}', '{"role":"DOCTOR","name":"Dr. Emily Chen"}', now(), now())
        RETURNING id INTO v_dr_emily;
    END IF;

    -- Dr. Amit Patel - Orthopedic
    SELECT id INTO v_dr_amit FROM auth.users WHERE email = 'dr.amit@careconnect.com';
    IF v_dr_amit IS NULL THEN
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 
                'dr.amit@careconnect.com', crypt('doctor123', gen_salt('bf')), now(), 
                '{"provider":"email","providers":["email"]}', '{"role":"DOCTOR","name":"Dr. Amit Patel"}', now(), now())
        RETURNING id INTO v_dr_amit;
    END IF;

    -- Dr. Kavya Reddy - Pediatrician
    SELECT id INTO v_dr_kavya FROM auth.users WHERE email = 'dr.kavya@careconnect.com';
    IF v_dr_kavya IS NULL THEN
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 
                'dr.kavya@careconnect.com', crypt('doctor123', gen_salt('bf')), now(), 
                '{"provider":"email","providers":["email"]}', '{"role":"DOCTOR","name":"Dr. Kavya Reddy"}', now(), now())
        RETURNING id INTO v_dr_kavya;
    END IF;

    -- Dr. Rajesh Kumar - Neurologist
    SELECT id INTO v_dr_rajesh FROM auth.users WHERE email = 'dr.rajesh@careconnect.com';
    IF v_dr_rajesh IS NULL THEN
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 
                'dr.rajesh@careconnect.com', crypt('doctor123', gen_salt('bf')), now(), 
                '{"provider":"email","providers":["email"]}', '{"role":"DOCTOR","name":"Dr. Rajesh Kumar"}', now(), now())
        RETURNING id INTO v_dr_rajesh;
    END IF;

    PERFORM pg_sleep(0.5);

    -- Update doctor profiles
    UPDATE profiles SET specialization = 'Endocrinologist', hospital = 'Fortis Hospital' WHERE id = v_dr_emily;
    UPDATE profiles SET specialization = 'Orthopedic Surgeon', hospital = 'Max Healthcare' WHERE id = v_dr_amit;
    UPDATE profiles SET specialization = 'Pediatrician', hospital = 'Apollo Children''s Hospital' WHERE id = v_dr_kavya;
    UPDATE profiles SET specialization = 'Neurologist', hospital = 'Manipal Hospital' WHERE id = v_dr_rajesh;

    -- =================================================================
    -- CREATE NEW PATIENTS (4 more to make 5 total)
    -- =================================================================

    -- Priya Sharma
    SELECT id INTO v_priya FROM auth.users WHERE email = 'priya@patient.com';
    IF v_priya IS NULL THEN
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 
                'priya@patient.com', crypt('patient123', gen_salt('bf')), now(), 
                '{"provider":"email","providers":["email"]}', '{"role":"PATIENT","name":"Priya Sharma"}', now(), now())
        RETURNING id INTO v_priya;
    END IF;

    -- Rahul Mehta
    SELECT id INTO v_rahul FROM auth.users WHERE email = 'rahul@patient.com';
    IF v_rahul IS NULL THEN
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 
                'rahul@patient.com', crypt('patient123', gen_salt('bf')), now(), 
                '{"provider":"email","providers":["email"]}', '{"role":"PATIENT","name":"Rahul Mehta"}', now(), now())
        RETURNING id INTO v_rahul;
    END IF;

    -- Ananya Iyer
    SELECT id INTO v_ananya FROM auth.users WHERE email = 'ananya@patient.com';
    IF v_ananya IS NULL THEN
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 
                'ananya@patient.com', crypt('patient123', gen_salt('bf')), now(), 
                '{"provider":"email","providers":["email"]}', '{"role":"PATIENT","name":"Ananya Iyer"}', now(), now())
        RETURNING id INTO v_ananya;
    END IF;

    -- Vikram Singh
    SELECT id INTO v_vikram FROM auth.users WHERE email = 'vikram@patient.com';
    IF v_vikram IS NULL THEN
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 
                'vikram@patient.com', crypt('patient123', gen_salt('bf')), now(), 
                '{"provider":"email","providers":["email"]}', '{"role":"PATIENT","name":"Vikram Singh"}', now(), now())
        RETURNING id INTO v_vikram;
    END IF;

    -- =================================================================
    -- CREATE ADMINS (2)
    -- =================================================================

    -- Admin 1
    SELECT id INTO v_admin1 FROM auth.users WHERE email = 'admin@careconnect.com';
    IF v_admin1 IS NULL THEN
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 
                'admin@careconnect.com', crypt('admin123', gen_salt('bf')), now(), 
                '{"provider":"email","providers":["email"]}', '{"role":"ADMIN","name":"Admin User"}', now(), now())
        RETURNING id INTO v_admin1;
    END IF;

    -- Admin 2
    SELECT id INTO v_admin2 FROM auth.users WHERE email = 'superadmin@careconnect.com';
    IF v_admin2 IS NULL THEN
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 
                'superadmin@careconnect.com', crypt('admin123', gen_salt('bf')), now(), 
                '{"provider":"email","providers":["email"]}', '{"role":"ADMIN","name":"Super Admin"}', now(), now())
        RETURNING id INTO v_admin2;
    END IF;

    PERFORM pg_sleep(0.5);

    -- =================================================================
    -- SIMPLIFIED MEDICAL RECORDS (Key records only)
    -- =================================================================

    RAISE NOTICE '📋 Adding simplified medical records...';

    -- Santhosh (existing) - Cardiac journey with uploaded documents
    INSERT INTO health_records (patient_id, doctor_id, title, type, date, summary)
    VALUES 
    (v_santhosh, v_dr_sarah, 'Lipid Profile - Initial', 'LAB', '2025-07-18', 'High cholesterol detected'),
    (v_santhosh, v_dr_sarah, 'ECG Report', 'SCAN', '2025-07-18', 'Normal sinus rhythm'),
    (v_santhosh, v_dr_sarah, 'Lipid Profile - Follow-up', 'LAB', '2025-10-20', 'Significant improvement'),
    (v_santhosh, v_dr_james, 'Chest X-Ray', 'SCAN', '2025-12-20', 'Normal chest radiograph')
    ON CONFLICT DO NOTHING;

    -- Priya - Thyroid patient
    INSERT INTO health_records (patient_id, doctor_id, title, type, date, summary)
    VALUES 
    (v_priya, v_dr_emily, 'Thyroid Panel', 'LAB', '2025-08-12', 'Hypothyroidism confirmed'),
    (v_priya, v_dr_emily, 'CBC', 'LAB', '2025-08-12', 'Mild anemia')
    ON CONFLICT DO NOTHING;

    -- Rahul - Diabetes patient
    INSERT INTO health_records (patient_id, doctor_id, title, type, date, summary)
    VALUES 
    (v_rahul, v_dr_james, 'HbA1c Test', 'LAB', '2026-01-15', 'Good diabetes control'),
    (v_rahul, v_dr_james, 'Kidney Function', 'LAB', '2026-01-15', 'Early nephropathy detected')
    ON CONFLICT DO NOTHING;

    -- Ananya - General checkup
    INSERT INTO health_records (patient_id, doctor_id, title, type, date, summary)
    VALUES 
    (v_ananya, v_dr_kavya, 'Annual Physical', 'VISIT_NOTE', '2026-01-10', 'Healthy, no issues')
    ON CONFLICT DO NOTHING;

    -- Vikram - Sports injury
    INSERT INTO health_records (patient_id, doctor_id, title, type, date, summary)
    VALUES 
    (v_vikram, v_dr_amit, 'Knee X-Ray', 'SCAN', '2025-12-15', 'Minor ligament strain')
    ON CONFLICT DO NOTHING;

    -- =================================================================
    -- SIMPLIFIED APPOINTMENTS (2-3 per patient)
    -- =================================================================

    INSERT INTO appointments (patient_id, doctor_id, date, time, status, type, reason)
    VALUES 
    -- Santhosh
    (v_santhosh, v_dr_sarah, '2025-07-15', '09:00 AM', 'COMPLETED', 'IN_PERSON', 'Initial checkup'),
    (v_santhosh, v_dr_sarah, '2026-02-10', '10:00 AM', 'SCHEDULED', 'VIDEO', 'Follow-up'),
    -- Priya
    (v_priya, v_dr_emily, '2025-08-10', '02:00 PM', 'COMPLETED', 'IN_PERSON', 'Thyroid symptoms'),
    (v_priya, v_dr_emily, '2026-02-15', '11:00 AM', 'SCHEDULED', 'VIDEO', 'Medication review'),
    -- Rahul
    (v_rahul, v_dr_james, '2026-01-15', '09:30 AM', 'COMPLETED', 'IN_PERSON', 'Diabetes checkup'),
    -- Ananya
    (v_ananya, v_dr_kavya, '2026-01-10', '03:00 PM', 'COMPLETED', 'IN_PERSON', 'Annual physical'),
    -- Vikram
    (v_vikram, v_dr_amit, '2025-12-15', '04:00 PM', 'COMPLETED', 'IN_PERSON', 'Knee pain')
    ON CONFLICT DO NOTHING;

    -- =================================================================
    -- SIMPLIFIED MEDICATIONS (1-2 per patient)
    -- =================================================================

    INSERT INTO medications (patient_id, prescribed_by, name, dosage, frequency, start_date, is_active, reason)
    VALUES 
    (v_santhosh, v_dr_sarah, 'Aspirin', '81mg', 'Once daily', '2025-07-20', true, 'Cardiovascular health'),
    (v_priya, v_dr_emily, 'Levothyroxine', '50mcg', 'Once daily (morning)', '2025-08-15', true, 'Hypothyroidism'),
    (v_rahul, v_dr_james, 'Metformin', '1000mg', 'Twice daily', '2024-01-01', true, 'Type 2 Diabetes'),
    (v_vikram, v_dr_amit, 'Ibuprofen', '400mg', 'As needed', '2025-12-15', false, 'Pain relief')
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '✅ Setup Complete!';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '👥 USERS CREATED:';
    RAISE NOTICE '   👨‍⚕️ 6 Doctors (all specializations)';
    RAISE NOTICE '   🧑 5 Patients';
    RAISE NOTICE '   🔐 2 Admins';
    RAISE NOTICE '';
    RAISE NOTICE '📊 DATA ADDED:';
    RAISE NOTICE '   📋 ~10 Health Records';
    RAISE NOTICE '   📅 ~7 Appointments';
    RAISE NOTICE '   💊 ~4 Medications';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 LOGIN CREDENTIALS:';
    RAISE NOTICE '   Doctors: doctor123';
    RAISE NOTICE '   Patients: patient123';
    RAISE NOTICE '   Admins: admin123';
    
END $$;
