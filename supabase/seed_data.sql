-- ==========================================
-- ENTERPRISE SEED DATA SCRIPT
-- ==========================================
-- PREREQUISITE:
-- Please create these 3 users in your Authentication tab first:
-- 1. admin@test.com    (Role: Admin)
-- 2. doctor@test.com   (Role: Doctor)
-- 3. patient@test.com  (Role: Patient)
--
-- This script will find them by email and populate their dashboard
-- with professional, realistic medical data.
-- ==========================================

DO $$
DECLARE
  v_admin_id UUID;
  v_doctor_id UUID;
  v_patient_id UUID;
BEGIN
  -- 1. GET USER IDs
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin@test.com';
  SELECT id INTO v_doctor_id FROM auth.users WHERE email = 'doctor@test.com';
  SELECT id INTO v_patient_id FROM auth.users WHERE email = 'patient@test.com';

  -- Only proceed if users exist
  IF v_doctor_id IS NOT NULL AND v_patient_id IS NOT NULL THEN

    -- 2. UPDATE PROFILES (Make them look pro)
    
    -- Doctor Profile
    UPDATE public.profiles 
    SET 
      name = 'Dr. Sarah Venkat',
      specialization = 'Senior Cardiologist',
      hospital = 'Apollo Heart Institute',
      bio = 'Fellow of the American College of Cardiology with 15 years of experience in interventional cardiology.',
      license_number = 'MED-2024-8899',
      avatar_url = 'https://img.freepik.com/free-photo/woman-doctor-wearing-lab-coat-with-stethoscope-isolated_1303-29791.jpg',
      role = 'DOCTOR', -- Ensure role matches
      is_active = true
    WHERE id = v_doctor_id;

    -- Patient Profile
    UPDATE public.profiles 
    SET 
      name = 'Santhosh Kumar',
      bio = 'History of mild hypertension. Allergic to Penicillin.',
      avatar_url = 'https://img.freepik.com/free-photo/portrait-white-man-isolated_53876-40306.jpg',
      role = 'PATIENT',
      is_active = true
    WHERE id = v_patient_id;

    -- Admin Profile (if exists)
    IF v_admin_id IS NOT NULL THEN
      UPDATE public.profiles 
      SET role = 'ADMIN', name = 'System Administrator' 
      WHERE id = v_admin_id;
    END IF;

    -- 3. CREATE DOCTOR-PATIENT RELATIONSHIP
    INSERT INTO public.doctor_patients (doctor_id, patient_id, is_active)
    VALUES (v_doctor_id, v_patient_id, true)
    ON CONFLICT (doctor_id, patient_id) DO NOTHING;

    -- 4. INSERT APPOINTMENTS (Past & Upcoming)
    
    -- Upcoming
    INSERT INTO public.appointments (patient_id, doctor_id, date, time, status, type, reason)
    VALUES 
    (v_patient_id, v_doctor_id, to_char(now() + interval '2 days', 'YYYY-MM-DD'), '10:00 AM', 'SCHEDULED', 'VIDEO', 'Follow-up on blood pressure medication');

    -- Past
    INSERT INTO public.appointments (patient_id, doctor_id, date, time, status, type, reason, notes)
    VALUES 
    (v_patient_id, v_doctor_id, to_char(now() - interval '1 month', 'YYYY-MM-DD'), '02:30 PM', 'COMPLETED', 'IN_PERSON', 'Annual Cardiac Review', 'BP 130/85. Patient advised to reduce salt intake.');

    -- 5. INSERT HEALTH RECORDS
    INSERT INTO public.health_records (patient_id, doctor_id, title, type, date, summary, detailed_notes, visibility)
    VALUES
    (v_patient_id, v_doctor_id, 'Cardiac MRI Scan', 'SCAN', to_char(now() - interval '1 month', 'YYYY-MM-DD'), 'Normal left ventricular function.', 'No signs of ischemia or scarring. ejection fraction 60%.', 'DOCTOR_ONLY'),
    (v_patient_id, v_doctor_id, 'Blood Work - Q1 2024', 'LAB', to_char(now() - interval '2 days', 'YYYY-MM-DD'), 'Lipid profile improved.', 'Total Cholesterol: 180 mg/dL (Target <200). HDL: 45. LDL: 100.', 'PRIVATE');

    -- 6. INSERT MEDICATIONS
    INSERT INTO public.medications (patient_id, prescribed_by, name, dosage, frequency, start_date, reason)
    VALUES
    (v_patient_id, v_doctor_id, 'Lisinopril', '10mg', 'Once daily (Morning)', to_char(now() - interval '3 months', 'YYYY-MM-DD'), 'Hypertension management');

    -- 7. INSERT CHAT MAESSAGES (Enterprise Thread)
    INSERT INTO public.messages (sender_id, receiver_id, text, is_read, created_at)
    VALUES
    (v_doctor_id, v_patient_id, 'Hello Santhosh, I reviewed your latest lab results. They look much better.', true, now() - interval '1 day'),
    (v_patient_id, v_doctor_id, 'That is great news, Doctor! Should I continue the same dosage?', true, now() - interval '23 hours'),
    (v_doctor_id, v_patient_id, 'Yes, please continue 10mg Lisinopril. We will review again effectively in our video call.', false, now() - interval '1 hour');

    -- 8. SYSTEM NOTIFICATIONS
    INSERT INTO public.notifications (user_id, type, title, content, is_read)
    VALUES
    (v_patient_id, 'APPOINTMENT', 'Appointment Confirmed', 'Your video consultation with Dr. Sarah is confirmed for ' || to_char(now() + interval '2 days', 'YYYY-MM-DD'), false),
    (v_patient_id, 'SYSTEM', 'Welcome to CareConnect Enterprise', 'Your profile has been successfully verified.', true);

  END IF;
END $$;
