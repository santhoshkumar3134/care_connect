-- =================================================================
-- REALISTIC DATA FOR YOUR ACTUAL USERS
-- =================================================================
-- This adds real medical data for:
-- - Dr. Sarah Venkat (NAL-2026-DR-1011)
-- - Santhosh Kumar (NAL-2026-PT-1012)
-- - Dr. James Wilson (NAL-2026-DR-1013)
-- =================================================================

DO $$
DECLARE
  v_dr_sarah UUID;
  v_dr_james UUID;
  v_pt_santhosh UUID;
BEGIN
  -- Get the actual user IDs from profiles
  SELECT id INTO v_dr_sarah FROM public.profiles WHERE nalam_id = 'NAL-2026-DR-1011';
  SELECT id INTO v_dr_james FROM public.profiles WHERE nalam_id = 'NAL-2026-DR-1013';
  SELECT id INTO v_pt_santhosh FROM public.profiles WHERE nalam_id = 'NAL-2026-PT-1012';

  -- Update doctor profiles with details
  UPDATE public.profiles SET
    specialization = 'Cardiologist',
    hospital = 'Apollo Heart Institute',
    license_number = 'MED-2020-8899',
    bio = '15+ years in interventional cardiology'
  WHERE id = v_dr_sarah;

  UPDATE public.profiles SET
    specialization = 'General Physician',
    hospital = 'Max Healthcare',
    license_number = 'MED-2018-7654',
    bio = 'Family medicine specialist'
  WHERE id = v_dr_james;

  -- Create doctor-patient relationship
  INSERT INTO public.doctor_patients (doctor_id, patient_id, is_active)
  VALUES (v_dr_sarah, v_pt_santhosh, true)
  ON CONFLICT DO NOTHING;

  -- Add realistic appointments for Santhosh
  INSERT INTO public.appointments (patient_id, doctor_id, date, time, status, type, reason, notes)
  VALUES
    -- Past appointments
    (v_pt_santhosh, v_dr_sarah, to_char(now() - interval '2 years', 'YYYY-MM-DD'), '09:00 AM', 'COMPLETED', 'IN_PERSON', 'Initial Consultation - High BP', 'BP 150/95. Started lifestyle modifications.'),
    (v_pt_santhosh, v_dr_sarah, to_char(now() - interval '18 months', 'YYYY-MM-DD'), '10:30 AM', 'COMPLETED', 'IN_PERSON', '3-Month Follow-up', 'BP improving. Started medication.'),
    (v_pt_santhosh, v_dr_sarah, to_char(now() - interval '1 year', 'YYYY-MM-DD'), '02:00 PM', 'COMPLETED', 'VIDEO', 'Routine Checkup', 'BP controlled. Continue meds.'),
    (v_pt_santhosh, v_dr_sarah, to_char(now() - interval '6 months', 'YYYY-MM-DD'), '11:00 AM', 'COMPLETED', 'IN_PERSON', 'Half-yearly review', 'Excellent progress.'),
    (v_pt_santhosh, v_dr_sarah, to_char(now() - interval '1 week', 'YYYY-MM-DD'), '08:00 AM', 'COMPLETED', 'IN_PERSON', 'Urgent - Chest Discomfort', 'ECG normal. Gastritis.'),
    
    -- Upcoming appointments
    (v_pt_santhosh, v_dr_sarah, to_char(now() + interval '3 days', 'YYYY-MM-DD'), '10:00 AM', 'SCHEDULED', 'VIDEO', 'Follow-up consultation', NULL),
    (v_pt_santhosh, v_dr_sarah, to_char(now() + interval '2 weeks', 'YYYY-MM-DD'), '02:00 PM', 'SCHEDULED', 'IN_PERSON', 'Annual Physical Exam', NULL);

  -- Add health records for Santhosh
  INSERT INTO public.health_records (patient_id, doctor_id, title, type, date, summary, detailed_notes, visibility)
  VALUES
    (v_pt_santhosh, v_dr_sarah, 'Lipid Profile - Initial', 'LAB', to_char(now() - interval '2 years', 'YYYY-MM-DD'), 'High Cholesterol', 'Total: 240 mg/dL, LDL: 160 mg/dL, HDL: 38 mg/dL. Risk factor identified.', 'PRIVATE'),
    (v_pt_santhosh, v_dr_sarah, 'Echocardiogram', 'SCAN', to_char(now() - interval '2 years', 'YYYY-MM-DD'), 'Mild LV Hypertrophy', 'Ejection Fraction: 58%. Consistent with early hypertension.', 'PRIVATE'),
    (v_pt_santhosh, v_dr_sarah, 'Lipid Profile - 1 Year', 'LAB', to_char(now() - interval '1 year', 'YYYY-MM-DD'), 'Improved', 'Total: 200 mg/dL, LDL: 130 mg/dL. Diet working.', 'PRIVATE'),
    (v_pt_santhosh, v_dr_sarah, 'ECG - Routine', 'SCAN', to_char(now() - interval '1 week', 'YYYY-MM-DD'), 'Normal Sinus Rhythm', 'No ST changes. No arrhythmia.', 'PRIVATE'),
    (v_pt_santhosh, v_dr_sarah, 'Complete Blood Count', 'LAB', to_char(now() - interval '1 week', 'YYYY-MM-DD'), 'Normal', 'WBC: 7000, Hb: 14.5 g/dL. All parameters normal.', 'PRIVATE'),
    (v_pt_santhosh, v_dr_sarah, 'Hypertension Management Plan', 'PRESCRIPTION', to_char(now() - interval '18 months', 'YYYY-MM-DD'), 'Amlodipine 5mg', 'Once daily at bedtime. Monitor BP weekly.', 'PRIVATE');

  -- Add medications for Santhosh
  INSERT INTO public.medications (patient_id, prescribed_by, name, dosage, frequency, start_date, end_date, is_active, reason)
  VALUES
    -- Active medications
    (v_pt_santhosh, v_dr_sarah, 'Telmisartan', '40mg', 'Once daily (Morning)', to_char(now() - interval '1 year', 'YYYY-MM-DD'), NULL, true, 'Hypertension'),
    (v_pt_santhosh, v_dr_sarah, 'Atorvastatin', '10mg', 'Once daily (Night)', to_char(now() - interval '6 months', 'YYYY-MM-DD'), NULL, true, 'Cholesterol'),
    (v_pt_santhosh, v_dr_sarah, 'Aspirin', '75mg', 'Once daily (Morning)', to_char(now() - interval '1 year', 'YYYY-MM-DD'), NULL, true, 'Cardioprotection'),
    
    -- Past medications
    (v_pt_santhosh, v_dr_sarah, 'Amlodipine', '5mg', 'Once daily', to_char(now() - interval '2 years', 'YYYY-MM-DD'), to_char(now() - interval '1 year', 'YYYY-MM-DD'), false, 'Initial BP control'),
    (v_pt_santhosh, v_dr_sarah, 'Pantoprazole', '40mg', 'Once daily', to_char(now() - interval '1 week', 'YYYY-MM-DD'), to_char(now() - interval '3 days', 'YYYY-MM-DD'), false, 'Gastritis');

  -- Add realistic chat messages between Santhosh and Dr. Sarah
  INSERT INTO public.messages (sender_id, receiver_id, text, is_read, created_at)
  VALUES
    -- Recent conversation about chest discomfort
    (v_pt_santhosh, v_dr_sarah, 'Good morning Doctor. I woke up with some chest heaviness. Should I be worried?', true, now() - interval '1 week 4 hours'),
    (v_dr_sarah, v_pt_santhosh, 'Santhosh, if it is severe or radiating to your arm/jaw, go to ER immediately. How severe is it?', true, now() - interval '1 week 3 hours 55 minutes'),
    (v_pt_santhosh, v_dr_sarah, 'It is mild, more like burning sensation. I had spicy food last night.', true, now() - interval '1 week 3 hours 50 minutes'),
    (v_dr_sarah, v_pt_santhosh, 'Okay, sounds like gastritis. But let us be safe. Can you come in at 8 AM today for a quick ECG?', true, now() - interval '1 week 3 hours 45 minutes'),
    (v_pt_santhosh, v_dr_sarah, 'Yes Doctor, I will be there. Thank you.', true, now() - interval '1 week 3 hours 40 minutes'),
    
    -- Follow-up after visit
    (v_dr_sarah, v_pt_santhosh, 'Your ECG is completely normal. Blood work also came back fine. It was gastritis as suspected.', true, now() - interval '6 days'),
    (v_pt_santhosh, v_dr_sarah, 'That is such a relief! The antacid you prescribed really helped.', true, now() - interval '6 days 2 hours'),
    (v_dr_sarah, v_pt_santhosh, 'Good to hear. Avoid spicy food for a week. Let me know if symptoms return.', true, now() - interval '6 days 1 hour'),
    
    -- Recent message
    (v_pt_santhosh, v_dr_sarah, 'Doctor, can we do the follow-up via video call? I am traveling for work.', true, now() - interval '2 hours'),
    (v_dr_sarah, v_pt_santhosh, 'Absolutely. I have updated your appointment to Video type for 3 days from now.', true, now() - interval '10 minutes'),
    (v_dr_sarah, v_pt_santhosh, 'Please upload your home BP readings before the call if possible.', false, now() - interval '5 minutes');

END $$;

-- =================================================================
-- DATA ADDED SUCCESSFULLY!
-- =================================================================
-- Santhosh Kumar now has:
-- ✅ 7 Appointments (5 past, 2 upcoming)
-- ✅ 6 Health Records (Labs, Scans, Prescriptions)
-- ✅ 5 Medications (3 active, 2 past)
-- ✅ 11 Chat Messages with Dr. Sarah
-- ✅ Doctor-Patient relationship established
-- =================================================================
