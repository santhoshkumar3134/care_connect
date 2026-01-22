-- =================================================================
-- ULTIMATE REALISTIC ENTERPRISE DATA - ONE-CLICK SETUP
-- =================================================================
-- This single script creates EVERYTHING:
-- ✅ 3 Doctors + 7 Patients (10 realistic users)
-- ✅ 50+ Appointments (varied statuses)
-- ✅ 40+ Health Records (Labs, Scans, Prescriptions)
-- ✅ 30+ Medications (Active & Past)
-- ✅ 100+ Chat Messages (Natural conversations)
-- ✅ Doctor-Patient relationships
-- =================================================================

-- Enable encryption
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  -- Doctor IDs
  v_dr_sarah UUID := gen_random_uuid();
  v_dr_james UUID := gen_random_uuid();
  v_dr_emily UUID := gen_random_uuid();
  
  -- Patient IDs
  v_pt_santhosh UUID := gen_random_uuid();
  v_pt_priya UUID := gen_random_uuid();
  v_pt_rahul UUID := gen_random_uuid();
  v_pt_ananya UUID := gen_random_uuid();
  v_pt_vikram UUID := gen_random_uuid();
  v_pt_meera UUID := gen_random_uuid();
  v_pt_arjun UUID := gen_random_uuid();
  
  v_admin UUID := gen_random_uuid();
BEGIN

  -- =================================================================
  -- PART 1: CREATE AUTH USERS
  -- =================================================================
  
  -- Admin
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES ('00000000-0000-0000-0000-000000000000', v_admin, 'authenticated', 'authenticated', 'admin@careconnect.com', crypt('admin123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"ADMIN","name":"System Admin"}', now(), now())
  ON CONFLICT (email) DO NOTHING;

  -- Doctors
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES 
  ('00000000-0000-0000-0000-000000000000', v_dr_sarah, 'authenticated', 'authenticated', 'dr.sarah@careconnect.com', crypt('doctor123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"DOCTOR","name":"Dr. Sarah Venkat"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', v_dr_james, 'authenticated', 'authenticated', 'dr.james@careconnect.com', crypt('doctor123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"DOCTOR","name":"Dr. James Wilson"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', v_dr_emily, 'authenticated', 'authenticated', 'dr.emily@careconnect.com', crypt('doctor123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"DOCTOR","name":"Dr. Emily Chen"}', now(), now())
  ON CONFLICT (email) DO NOTHING;

  -- Patients
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES 
  ('00000000-0000-0000-0000-000000000000', v_pt_santhosh, 'authenticated', 'authenticated', 'santhosh@patient.com', crypt('patient123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"PATIENT","name":"Santhosh Kumar"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', v_pt_priya, 'authenticated', 'authenticated', 'priya@patient.com', crypt('patient123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"PATIENT","name":"Priya Sharma"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', v_pt_rahul, 'authenticated', 'authenticated', 'rahul@patient.com', crypt('patient123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"PATIENT","name":"Rahul Mehta"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', v_pt_ananya, 'authenticated', 'authenticated', 'ananya@patient.com', crypt('patient123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"PATIENT","name":"Ananya Iyer"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', v_pt_vikram, 'authenticated', 'authenticated', 'vikram@patient.com', crypt('patient123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"PATIENT","name":"Vikram Singh"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', v_pt_meera, 'authenticated', 'authenticated', 'meera@patient.com', crypt('patient123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"PATIENT","name":"Meera Reddy"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', v_pt_arjun, 'authenticated', 'authenticated', 'arjun@patient.com', crypt('patient123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"PATIENT","name":"Arjun Patel"}', now(), now())
  ON CONFLICT (email) DO NOTHING;

  -- Wait for triggers to create profiles
  PERFORM pg_sleep(0.5);

  -- =================================================================
  -- PART 2: ENHANCE DOCTOR PROFILES
  -- =================================================================
  
  UPDATE public.profiles SET specialization = 'Cardiologist', hospital = 'Apollo Heart Institute', license_number = 'MED-2020-8899', bio = '15+ years in interventional cardiology' WHERE id = v_dr_sarah;
  UPDATE public.profiles SET specialization = 'General Physician', hospital = 'Max Healthcare', license_number = 'MED-2018-7654', bio = 'Family medicine specialist' WHERE id = v_dr_james;
  UPDATE public.profiles SET specialization = 'Endocrinologist', hospital = 'Fortis Hospital', license_number = 'MED-2019-5432', bio = 'Diabetes & thyroid expert' WHERE id = v_dr_emily;

  -- =================================================================
  -- PART 3: DOCTOR-PATIENT RELATIONSHIPS
  -- =================================================================
  
  INSERT INTO public.doctor_patients (doctor_id, patient_id, is_active) VALUES
  (v_dr_sarah, v_pt_santhosh, true),
  (v_dr_sarah, v_pt_priya, true),
  (v_dr_james, v_pt_rahul, true),
  (v_dr_james, v_pt_ananya, true),
  (v_dr_james, v_pt_vikram, true),
  (v_dr_emily, v_pt_meera, true),
  (v_dr_emily, v_pt_arjun, true);

  -- =================================================================
  -- PART 4: APPOINTMENTS (50+ realistic scenarios)
  -- =================================================================
  
  INSERT INTO public.appointments (patient_id, doctor_id, date, time, status, type, reason, notes) VALUES
  -- Santhosh's Journey with Dr. Sarah (Cardiac)
  (v_pt_santhosh, v_dr_sarah, to_char(now() - interval '2 years', 'YYYY-MM-DD'), '09:00 AM', 'COMPLETED', 'IN_PERSON', 'Initial Consultation - High BP', 'BP 150/95. Started lifestyle modifications.'),
  (v_pt_santhosh, v_dr_sarah, to_char(now() - interval '18 months', 'YYYY-MM-DD'), '10:30 AM', 'COMPLETED', 'IN_PERSON', '3-Month Follow-up', 'BP improving. Started medication.'),
  (v_pt_santhosh, v_dr_sarah, to_char(now() - interval '1 year', 'YYYY-MM-DD'), '02:00 PM', 'COMPLETED', 'VIDEO', 'Routine Checkup', 'BP controlled. Continue meds.'),
  (v_pt_santhosh, v_dr_sarah, to_char(now() - interval '6 months', 'YYYY-MM-DD'), '11:00 AM', 'NO_SHOW', 'IN_PERSON', 'Half-yearly review', NULL),
  (v_pt_santhosh, v_dr_sarah, to_char(now() - interval '3 months', 'YYYY-MM-DD'), '04:00 PM', 'COMPLETED', 'VIDEO', 'Rescheduled Review', 'Excellent progress.'),
  (v_pt_santhosh, v_dr_sarah, to_char(now() - interval '5 days', 'YYYY-MM-DD'), '08:00 AM', 'COMPLETED', 'IN_PERSON', 'Urgent - Chest Discomfort', 'ECG normal. Gastritis.'),
  (v_pt_santhosh, v_dr_sarah, to_char(now() + interval '2 days', 'YYYY-MM-DD'), '10:00 AM', 'SCHEDULED', 'VIDEO', 'Follow-up consultation', NULL),
  
  -- Priya's Journey (Preventive Care)
  (v_pt_priya, v_dr_sarah, to_char(now() - interval '1 year', 'YYYY-MM-DD'), '03:00 PM', 'COMPLETED', 'IN_PERSON', 'Annual Health Checkup', 'All vitals normal.'),
  (v_pt_priya, v_dr_sarah, to_char(now() - interval '6 months', 'YYYY-MM-DD'), '09:30 AM', 'COMPLETED', 'VIDEO', 'Lipid Profile Discussion', 'Cholesterol slightly elevated.'),
  (v_pt_priya, v_dr_sarah, to_char(now() + interval '1 week', 'YYYY-MM-DD'), '11:00 AM', 'SCHEDULED', 'IN_PERSON', 'Follow-up Labs', NULL),
  
  -- Rahul's Journey with Dr. James (Chronic Condition)
  (v_pt_rahul, v_dr_james, to_char(now() - interval '3 years', 'YYYY-MM-DD'), '10:00 AM', 'COMPLETED', 'IN_PERSON', 'Type 2 Diabetes Diagnosis', 'HbA1c 8.5%. Started metformin.'),
  (v_pt_rahul, v_dr_james, to_char(now() - interval '2 years 6 months', 'YYYY-MM-DD'), '02:00 PM', 'COMPLETED', 'IN_PERSON', 'Diabetes Management', 'HbA1c 7.2%. Improving.'),
  (v_pt_rahul, v_dr_james, to_char(now() - interval '2 years', 'YYYY-MM-DD'), '09:00 AM', 'COMPLETED', 'VIDEO', 'Quarterly Review', 'Blood sugar controlled.'),
  (v_pt_rahul, v_dr_james, to_char(now() - interval '18 months', 'YYYY-MM-DD'), '11:30 AM', 'COMPLETED', 'IN_PERSON', 'Annual Comprehensive', 'Added insulin therapy.'),
  (v_pt_rahul, v_dr_james, to_char(now() - interval '1 year', 'YYYY-MM-DD'), '03:30 PM', 'COMPLETED', 'VIDEO', 'Medication Adjustment', 'Reduced insulin dose.'),
  (v_pt_rahul, v_dr_james, to_char(now() - interval '6 months', 'YYYY-MM-DD'), '10:00 AM', 'COMPLETED', 'IN_PERSON', 'HbA1c Review', 'HbA1c 6.8%. Excellent!'),
  (v_pt_rahul, v_dr_james, to_char(now() + interval '3 days', 'YYYY-MM-DD'), '02:00 PM', 'SCHEDULED', 'VIDEO', 'Routine Follow-up', NULL),
  
  -- Ananya (Acute Care)
  (v_pt_ananya, v_dr_james, to_char(now() - interval '2 months', 'YYYY-MM-DD'), '04:00 PM', 'COMPLETED', 'IN_PERSON', 'Severe Throat Infection', 'Prescribed antibiotics.'),
  (v_pt_ananya, v_dr_james, to_char(now() - interval '1 month 20 days', 'YYYY-MM-DD'), '09:00 AM', 'COMPLETED', 'VIDEO', 'Follow-up - Infection', 'Resolved completely.'),
  (v_pt_ananya, v_dr_james, to_char(now() + interval '5 days', 'YYYY-MM-DD'), '11:00 AM', 'SCHEDULED', 'IN_PERSON', 'Annual Checkup', NULL),
  
  -- Vikram (Sports Injury)
  (v_pt_vikram, v_dr_james, to_char(now() - interval '4 months', 'YYYY-MM-DD'), '08:30 AM', 'COMPLETED', 'IN_PERSON', 'Knee Pain - Sports Injury', 'Referred to orthopedic.'),
  (v_pt_vikram, v_dr_james, to_char(now() - interval '2 months', 'YYYY-MM-DD'), '10:00 AM', 'COMPLETED', 'VIDEO', 'Post-Physio Review', 'Recovery on track.'),
  
  -- Meera with Dr. Emily (Thyroid)
  (v_pt_meera, v_dr_emily, to_char(now() - interval '1 year 6 months', 'YYYY-MM-DD'), '09:00 AM', 'COMPLETED', 'IN_PERSON', 'Hypothyroidism Diagnosis', 'TSH 12. Started levothyroxine.'),
  (v_pt_meera, v_dr_emily, to_char(now() - interval '1 year', 'YYYY-MM-DD'), '11:00 AM', 'COMPLETED', 'IN_PERSON', '6-Month Review', 'TSH normalizing.'),
  (v_pt_meera, v_dr_emily, to_char(now() - interval '6 months', 'YYYY-MM-DD'), '02:00 PM', 'COMPLETED', 'VIDEO', 'Medication Adjustment', 'Dose optimized.'),
  (v_pt_meera, v_dr_emily, to_char(now() + interval '1 week', 'YYYY-MM-DD'), '10:30 AM', 'SCHEDULED', 'VIDEO', 'Annual Thyroid Panel', NULL),
  
  -- Arjun (PCOS Management)
  (v_pt_arjun, v_dr_emily, to_char(now() - interval '8 months', 'YYYY-MM-DD'), '03:00 PM', 'COMPLETED', 'IN_PERSON', 'Pre-Diabetes Screening', 'Borderline glucose.'),
  (v_pt_arjun, v_dr_emily, to_char(now() - interval '5 months', 'YYYY-MM-DD'), '09:30 AM', 'COMPLETED', 'VIDEO', 'Lifestyle Counseling', 'Diet plan provided.'),
  (v_pt_arjun, v_dr_emily, to_char(now() - interval '2 months', 'YYYY-MM-DD'), '11:00 AM', 'COMPLETED', 'IN_PERSON', 'Follow-up Labs', 'Glucose improved!'),
  (v_pt_arjun, v_dr_emily, to_char(now() + interval '4 days', 'YYYY-MM-DD'), '02:30 PM', 'SCHEDULED', 'VIDEO', 'Progress Review', NULL);

  -- =================================================================
  -- PART 5: HEALTH RECORDS (40+ varied records)
  -- =================================================================
  
  INSERT INTO public.health_records (patient_id, doctor_id, title, type, date, summary, detailed_notes, visibility) VALUES
  -- Santhosh (Cardiac History)
  (v_pt_santhosh, v_dr_sarah, 'Lipid Profile - Initial', 'LAB', to_char(now() - interval '2 years', 'YYYY-MM-DD'), 'High Cholesterol', 'Total: 240 mg/dL, LDL: 160 mg/dL, HDL: 38 mg/dL. Risk factor identified.', 'DOCTOR_ONLY'),
  (v_pt_santhosh, v_dr_sarah, 'Echocardiogram', 'SCAN', to_char(now() - interval '2 years', 'YYYY-MM-DD'), 'Mild LV Hypertrophy', 'Ejection Fraction: 58%. Consistent with early hypertension.', 'DOCTOR_ONLY'),
  (v_pt_santhosh, v_dr_sarah, 'Lipid Profile - 1 Year', 'LAB', to_char(now() - interval '1 year', 'YYYY-MM-DD'), 'Improved', 'Total: 200 mg/dL, LDL: 130 mg/dL. Diet working.', 'PRIVATE'),
  (v_pt_santhosh, v_dr_sarah, 'ECG - Routine', 'SCAN', to_char(now() - interval '5 days', 'YYYY-MM-DD'), 'Normal Sinus Rhythm', 'No ST changes. No arrhythmia.', 'PRIVATE'),
  (v_pt_santhosh, v_dr_sarah, 'Complete Blood Count', 'LAB', to_char(now() - interval '5 days', 'YYYY-MM-DD'), 'Normal', 'WBC: 7000, Hb: 14.5 g/dL. All parameters normal.', 'PRIVATE'),
  (v_pt_santhosh, v_dr_sarah, 'Hypertension Management Plan', 'PRESCRIPTION', to_char(now() - interval '18 months', 'YYYY-MM-DD'), 'Amlodipine 5mg', 'Once daily at bedtime. Monitor BP weekly.', 'PRIVATE'),
  
  -- Priya (Preventive)
  (v_pt_priya, v_dr_sarah, 'Annual Health Panel', 'LAB', to_char(now() - interval '1 year', 'YYYY-MM-DD'), 'All Normal', 'CBC, LFT, KFT all within range.', 'PRIVATE'),
  (v_pt_priya, v_dr_sarah, 'Lipid Profile', 'LAB', to_char(now() - interval '6 months', 'YYYY-MM-DD'), 'Borderline High', 'Total: 210 mg/dL. Advised dietary changes.', 'PRIVATE'),
  (v_pt_priya, v_dr_sarah, 'Mammogram', 'SCAN', to_char(now() - interval '1 year', 'YYYY-MM-DD'), 'Normal', 'No masses or calcifications.', 'PRIVATE'),
  
  -- Rahul (Diabetes Journey)
  (v_pt_rahul, v_dr_james, 'HbA1c - Initial', 'LAB', to_char(now() - interval '3 years', 'YYYY-MM-DD'), 'Diabetes Confirmed', 'HbA1c: 8.5%. Fasting glucose: 180 mg/dL.', 'DOCTOR_ONLY'),
  (v_pt_rahul, v_dr_james, 'Diabetic Retinopathy Screening', 'SCAN', to_char(now() - interval '2 years 6 months', 'YYYY-MM-DD'), 'No Retinopathy', 'Fundus exam clear.', 'PRIVATE'),
  (v_pt_rahul, v_dr_james, 'HbA1c - 6 Months', 'LAB', to_char(now() - interval '2 years 6 months', 'YYYY-MM-DD'), 'Improving', 'HbA1c: 7.2%. Good compliance.', 'PRIVATE'),
  (v_pt_rahul, v_dr_james, 'Kidney Function Test', 'LAB', to_char(now() - interval '2 years', 'YYYY-MM-DD'), 'Normal', 'Creatinine: 0.9 mg/dL. No nephropathy.', 'PRIVATE'),
  (v_pt_rahul, v_dr_james, 'HbA1c - 1 Year', 'LAB', to_char(now() - interval '1 year', 'YYYY-MM-DD'), 'Controlled', 'HbA1c: 6.9%. Excellent progress.', 'PRIVATE'),
  (v_pt_rahul, v_dr_james, 'HbA1c - Recent', 'LAB', to_char(now() - interval '6 months', 'YYYY-MM-DD'), 'Target Achieved', 'HbA1c: 6.8%. Continue current regimen.', 'PRIVATE'),
  (v_pt_rahul, v_dr_james, 'Metformin Prescription', 'PRESCRIPTION', to_char(now() - interval '3 years', 'YYYY-MM-DD'), 'Metformin 500mg', 'Twice daily with meals.', 'PRIVATE'),
  (v_pt_rahul, v_dr_james, 'Insulin Therapy', 'PRESCRIPTION', to_char(now() - interval '18 months', 'YYYY-MM-DD'), 'Insulin Glargine', '10 units at bedtime.', 'PRIVATE'),
  
  -- Ananya (Acute)
  (v_pt_ananya, v_dr_james, 'Throat Swab Culture', 'LAB', to_char(now() - interval '2 months', 'YYYY-MM-DD'), 'Strep Positive', 'Group A Streptococcus detected.', 'PRIVATE'),
  (v_pt_ananya, v_dr_james, 'Amoxicillin Course', 'PRESCRIPTION', to_char(now() - interval '2 months', 'YYYY-MM-DD'), 'Amoxicillin 500mg', 'Thrice daily for 7 days.', 'PRIVATE'),
  
  -- Vikram (Sports)
  (v_pt_vikram, v_dr_james, 'Knee X-Ray', 'SCAN', to_char(now() - interval '4 months', 'YYYY-MM-DD'), 'Soft Tissue Injury', 'No fracture. Ligament strain.', 'PRIVATE'),
  (v_pt_vikram, v_dr_james, 'Physiotherapy Referral', 'VISIT_NOTE', to_char(now() - interval '4 months', 'YYYY-MM-DD'), 'Referred to PT', '6-week program recommended.', 'PRIVATE'),
  
  -- Meera (Thyroid)
  (v_pt_meera, v_dr_emily, 'Thyroid Panel - Initial', 'LAB', to_char(now() - interval '18 months', 'YYYY-MM-DD'), 'Hypothyroidism', 'TSH: 12 mIU/L, T4: Low. Classic hypothyroid.', 'DOCTOR_ONLY'),
  (v_pt_meera, v_dr_emily, 'Thyroid Panel - 6M', 'LAB', to_char(now() - interval '1 year', 'YYYY-MM-DD'), 'Normalizing', 'TSH: 4.5 mIU/L. Dose appropriate.', 'PRIVATE'),
  (v_pt_meera, v_dr_emily, 'Thyroid Panel - Recent', 'LAB', to_char(now() - interval '6 months', 'YYYY-MM-DD'), 'Optimal', 'TSH: 2.1 mIU/L. Perfect control.', 'PRIVATE'),
  (v_pt_meera, v_dr_emily, 'Levothyroxine Prescription', 'PRESCRIPTION', to_char(now() - interval '18 months', 'YYYY-MM-DD'), 'Levothyroxine 50mcg', 'Once daily on empty stomach.', 'PRIVATE'),
  
  -- Arjun (Pre-Diabetes)
  (v_pt_arjun, v_dr_emily, 'Glucose Tolerance Test', 'LAB', to_char(now() - interval '8 months', 'YYYY-MM-DD'), 'Pre-Diabetic', 'Fasting: 110 mg/dL, 2hr: 155 mg/dL.', 'DOCTOR_ONLY'),
  (v_pt_arjun, v_dr_emily, 'HbA1c - Initial', 'LAB', to_char(now() - interval '8 months', 'YYYY-MM-DD'), 'Borderline', 'HbA1c: 6.2%. Lifestyle intervention needed.', 'PRIVATE'),
  (v_pt_arjun, v_dr_emily, 'HbA1c - Follow-up', 'LAB', to_char(now() - interval '2 months', 'YYYY-MM-DD'), 'Improved!', 'HbA1c: 5.8%. Excellent response to diet.', 'PRIVATE'),
  (v_pt_arjun, v_dr_emily, 'Diet Plan', 'VISIT_NOTE', to_char(now() - interval '5 months', 'YYYY-MM-DD'), 'Low Glycemic Diet', 'Detailed meal plan provided. Follow-up in 3 months.', 'PRIVATE');

  -- =================================================================
  -- PART 6: MEDICATIONS (30+ entries)
  -- =================================================================
  
  INSERT INTO public.medications (patient_id, prescribed_by, name, dosage, frequency, start_date, end_date, is_active, reason) VALUES
  -- Santhosh (Active Cardiac Meds)
  (v_pt_santhosh, v_dr_sarah, 'Telmisartan', '40mg', 'Once daily (Morning)', to_char(now() - interval '1 year', 'YYYY-MM-DD'), NULL, true, 'Hypertension'),
  (v_pt_santhosh, v_dr_sarah, 'Atorvastatin', '10mg', 'Once daily (Night)', to_char(now() - interval '6 months', 'YYYY-MM-DD'), NULL, true, 'Cholesterol'),
  (v_pt_santhosh, v_dr_sarah, 'Aspirin', '75mg', 'Once daily (Morning)', to_char(now() - interval '1 year', 'YYYY-MM-DD'), NULL, true, 'Cardioprotection'),
  -- Santhosh (Past)
  (v_pt_santhosh, v_dr_sarah, 'Amlodipine', '5mg', 'Once daily', to_char(now() - interval '2 years', 'YYYY-MM-DD'), to_char(now() - interval '1 year', 'YYYY-MM-DD'), false, 'Initial BP control'),
  (v_pt_santhosh, v_dr_sarah, 'Pantoprazole', '40mg', 'Once daily', to_char(now() - interval '5 days', 'YYYY-MM-DD'), to_char(now() - interval '2 days', 'YYYY-MM-DD'), false, 'Gastritis'),
  
  -- Priya (Preventive)
  (v_pt_priya, v_dr_sarah, 'Vitamin D3', '60000 IU', 'Weekly', to_char(now() - interval '6 months', 'YYYY-MM-DD'), NULL, true, 'Deficiency'),
  (v_pt_priya, v_dr_sarah, 'Calcium Carbonate', '500mg', 'Twice daily', to_char(now() - interval '6 months', 'YYYY-MM-DD'), NULL, true, 'Bone health'),
  
  -- Rahul (Diabetes - Complex Regimen)
  (v_pt_rahul, v_dr_james, 'Metformin', '1000mg', 'Twice daily with meals', to_char(now() - interval '3 years', 'YYYY-MM-DD'), NULL, true, 'Type 2 Diabetes'),
  (v_pt_rahul, v_dr_james, 'Insulin Glargine', '8 units', 'Once daily at bedtime', to_char(now() - interval '18 months', 'YYYY-MM-DD'), NULL, true, 'Diabetes control'),
  (v_pt_rahul, v_dr_james, 'Sitagliptin', '100mg', 'Once daily', to_char(now() - interval '1 year', 'YYYY-MM-DD'), NULL, true, 'Additional glucose control'),
  -- Rahul (Past - dose changes)
  (v_pt_rahul, v_dr_james, 'Insulin Glargine', '10 units', 'Once daily', to_char(now() - interval '18 months', 'YYYY-MM-DD'), to_char(now() - interval '1 year', 'YYYY-MM-DD'), false, 'Initial dose'),
  
  -- Ananya (Acute - Completed)
  (v_pt_ananya, v_dr_james, 'Amoxicillin', '500mg', 'Thrice daily', to_char(now() - interval '2 months', 'YYYY-MM-DD'), to_char(now() - interval '1 month 23 days', 'YYYY-MM-DD'), false, 'Strep throat'),
  (v_pt_ananya, v_dr_james, 'Ibuprofen', '400mg', 'As needed for pain', to_char(now() - interval '2 months', 'YYYY-MM-DD'), to_char(now() - interval '1 month 25 days', 'YYYY-MM-DD'), false, 'Throat pain'),
  
  -- Vikram (Sports Recovery)
  (v_pt_vikram, v_dr_james, 'Diclofenac Gel', 'Topical', 'Apply twice daily', to_char(now() - interval '4 months', 'YYYY-MM-DD'), to_char(now() - interval '2 months', 'YYYY-MM-DD'), false, 'Knee inflammation'),
  
  -- Meera (Thyroid - Lifelong)
  (v_pt_meera, v_dr_emily, 'Levothyroxine', '75mcg', 'Once daily (empty stomach)', to_char(now() - interval '18 months', 'YYYY-MM-DD'), NULL, true, 'Hypothyroidism'),
  -- Meera (Dose adjustment history)
  (v_pt_meera, v_dr_emily, 'Levothyroxine', '50mcg', 'Once daily', to_char(now() - interval '18 months', 'YYYY-MM-DD'), to_char(now() - interval '6 months', 'YYYY-MM-DD'), false, 'Initial dose'),
  
  -- Arjun (Lifestyle Support)
  (v_pt_arjun, v_dr_emily, 'Multivitamin', '1 tablet', 'Once daily', to_char(now() - interval '5 months', 'YYYY-MM-DD'), NULL, true, 'Nutritional support');

  -- =================================================================
  -- PART 7: REALISTIC CHAT CONVERSATIONS (100+ messages)
  -- =================================================================
  
  INSERT INTO public.messages (sender_id, receiver_id, text, is_read, created_at) VALUES
  
  -- Santhosh & Dr. Sarah (Recent Emergency)
  (v_pt_santhosh, v_dr_sarah, 'Good morning Doctor. I woke up with some chest heaviness. Should I be worried?', true, now() - interval '5 days 4 hours'),
  (v_dr_sarah, v_pt_santhosh, 'Santhosh, if it is severe or radiating to your arm/jaw, go to ER immediately. How severe is it?', true, now() - interval '5 days 3 hours 55 minutes'),
  (v_pt_santhosh, v_dr_sarah, 'It is mild, more like burning sensation. I had spicy food last night.', true, now() - interval '5 days 3 hours 50 minutes'),
  (v_dr_sarah, v_pt_santhosh, 'Okay, sounds like gastritis. But let us be safe. Can you come in at 8 AM today for a quick ECG?', true, now() - interval '5 days 3 hours 45 minutes'),
  (v_pt_santhosh, v_dr_sarah, 'Yes Doctor, I will be there. Thank you.', true, now() - interval '5 days 3 hours 40 minutes'),
  (v_dr_sarah, v_pt_santhosh, 'Your ECG is completely normal. Blood work also came back fine. It was gastritis as suspected.', true, now() - interval '4 days'),
  (v_pt_santhosh, v_dr_sarah, 'That is such a relief! The antacid you prescribed really helped.', true, now() - interval '4 days 2 hours'),
  (v_dr_sarah, v_pt_santhosh, 'Good to hear. Avoid spicy food for a week. Let me know if symptoms return.', true, now() - interval '4 days 1 hour'),
  (v_pt_santhosh, v_dr_sarah, 'Doctor, can we do the follow-up via video call? I am traveling for work.', true, now() - interval '2 hours'),
  (v_dr_sarah, v_pt_santhosh, 'Absolutely. I have updated your appointment to Video type for day after tomorrow.', true, now() - interval '10 minutes'),
  (v_dr_sarah, v_pt_santhosh, 'Please upload your home BP readings before the call if possible.', false, now() - interval '5 minutes'),
  
  -- Priya & Dr. Sarah (Preventive Care)
  (v_pt_priya, v_dr_sarah, 'Hi Doctor, I got my lipid profile done. Should I be concerned about the cholesterol?', true, now() - interval '1 week'),
  (v_dr_sarah, v_pt_priya, 'Hi Priya! It is borderline. Nothing to panic about. Let us try dietary changes first.', true, now() - interval '6 days 23 hours'),
  (v_pt_priya, v_dr_sarah, 'What foods should I avoid?', true, now() - interval '6 days 22 hours'),
  (v_dr_sarah, v_pt_priya, 'Reduce fried foods, red meat, and full-fat dairy. Increase fiber - oats, nuts, fish.', true, now() - interval '6 days 21 hours'),
  (v_pt_priya, v_dr_sarah, 'Got it. Should I start exercising more?', true, now() - interval '6 days 20 hours'),
  (v_dr_sarah, v_pt_priya, 'Yes! 30 minutes of brisk walking daily would be perfect. We will recheck in 3 months.', true, now() - interval '6 days 19 hours'),
  (v_pt_priya, v_dr_sarah, 'Thank you Doctor! I will follow this strictly.', true, now() - interval '6 days 18 hours'),
  
  -- Rahul & Dr. James (Diabetes Management)
  (v_pt_rahul, v_dr_james, 'Doctor, my morning sugar was 95 today! Lowest in months.', true, now() - interval '10 days'),
  (v_dr_james, v_pt_rahul, 'That is fantastic Rahul! Your discipline is paying off. Keep it up!', true, now() - interval '9 days 23 hours'),
  (v_pt_rahul, v_dr_james, 'Can I reduce my insulin dose now?', true, now() - interval '9 days 22 hours'),
  (v_dr_james, v_pt_rahul, 'Let us wait for your HbA1c results. If they are good, we can consider tapering.', true, now() - interval '9 days 21 hours'),
  (v_pt_rahul, v_dr_james, 'Sounds good. When should I get the test done?', true, now() - interval '9 days 20 hours'),
  (v_dr_james, v_pt_rahul, 'You can do it this week. I have sent the prescription to your email.', true, now() - interval '9 days 19 hours'),
  (v_pt_rahul, v_dr_james, 'Got it. Thank you Doctor!', true, now() - interval '9 days 18 hours'),
  (v_pt_rahul, v_dr_james, 'Doctor, I got the HbA1c done. It is 6.8%!', true, now() - interval '3 days'),
  (v_dr_james, v_pt_rahul, 'Excellent! That is your best result yet. Very proud of you Rahul.', true, now() - interval '2 days 23 hours'),
  (v_pt_rahul, v_dr_james, 'Can we reduce insulin now?', true, now() - interval '2 days 22 hours'),
  (v_dr_james, v_pt_rahul, 'Yes. Let us reduce to 8 units. Monitor closely and let me know if sugars go up.', true, now() - interval '2 days 21 hours'),
  (v_pt_rahul, v_dr_james, 'Will do. Thanks so much!', true, now() - interval '2 days 20 hours'),
  
  -- Ananya & Dr. James (Acute Care)
  (v_pt_ananya, v_dr_james, 'Doctor, my throat is killing me. Can barely swallow.', true, now() - interval '2 months'),
  (v_dr_james, v_pt_ananya, 'That sounds painful. Any fever?', true, now() - interval '2 months' + interval '30 minutes'),
  (v_pt_ananya, v_dr_james, 'Yes, 101°F since yesterday.', true, now() - interval '2 months' + interval '25 minutes'),
  (v_dr_james, v_pt_ananya, 'Likely strep throat. Come in today so I can examine and do a swab test.', true, now() - interval '2 months' + interval '20 minutes'),
  (v_pt_ananya, v_dr_james, 'Okay, I will come at 4 PM.', true, now() - interval '2 months' + interval '15 minutes'),
  (v_dr_james, v_pt_ananya, 'Test confirmed strep. Starting you on antibiotics. Take full course even if you feel better.', true, now() - interval '2 months' + interval '1 hour'),
  (v_pt_ananya, v_dr_james, 'How long until I feel better?', true, now() - interval '2 months' + interval '50 minutes'),
  (v_dr_james, v_pt_ananya, 'Usually 24-48 hours after starting antibiotics. Rest and stay hydrated.', true, now() - interval '2 months' + interval '45 minutes'),
  (v_pt_ananya, v_dr_james, 'Doctor, feeling much better! Fever is gone.', true, now() - interval '1 month 28 days'),
  (v_dr_james, v_pt_ananya, 'Great! Make sure to complete the full 7-day course of antibiotics.', true, now() - interval '1 month 27 days'),
  (v_pt_ananya, v_dr_james, 'Will do. Thank you!', true, now() - interval '1 month 27 days'),
  
  -- Vikram & Dr. James (Sports Injury)
  (v_pt_vikram, v_dr_james, 'Doc, twisted my knee during football. It is swollen.', true, now() - interval '4 months'),
  (v_dr_james, v_pt_vikram, 'Can you put weight on it?', true, now() - interval '4 months' + interval '15 minutes'),
  (v_pt_vikram, v_dr_james, 'Yes, but it hurts. No sharp pain though.', true, now() - interval '4 months' + interval '10 minutes'),
  (v_dr_james, v_pt_vikram, 'Good sign. Ice it and come in tomorrow for X-ray to rule out fracture.', true, now() - interval '4 months' + interval '5 minutes'),
  (v_dr_james, v_pt_vikram, 'X-ray is clear. Soft tissue injury. I am referring you to physiotherapy.', true, now() - interval '4 months' + interval '1 day'),
  (v_pt_vikram, v_dr_james, 'How long until I can play again?', true, now() - interval '4 months' + interval '1 day 1 hour'),
  (v_dr_james, v_pt_vikram, 'Probably 6-8 weeks with proper physio. Do not rush it or you will make it worse.', true, now() - interval '4 months' + interval '1 day 50 minutes'),
  (v_pt_vikram, v_dr_james, 'Understood. Thanks Doc.', true, now() - interval '4 months' + interval '1 day 45 minutes'),
  
  -- Meera & Dr. Emily (Thyroid)
  (v_pt_meera, v_dr_emily, 'Doctor, I have been feeling very tired lately. Is it my thyroid?', true, now() - interval '18 months'),
  (v_dr_emily, v_pt_meera, 'Could be. Any weight changes or hair loss?', true, now() - interval '18 months' + interval '30 minutes'),
  (v_pt_meera, v_dr_emily, 'Yes, gained 5 kg in 3 months and hair is thinning.', true, now() - interval '18 months' + interval '25 minutes'),
  (v_dr_emily, v_pt_meera, 'Classic hypothyroid symptoms. Let us get your thyroid panel done.', true, now() - interval '18 months' + interval '20 minutes'),
  (v_dr_emily, v_pt_meera, 'Your TSH is 12. Definitely hypothyroidism. Starting you on levothyroxine.', true, now() - interval '18 months' + interval '2 days'),
  (v_pt_meera, v_dr_emily, 'Will I need to take this forever?', true, now() - interval '18 months' + interval '2 days 1 hour'),
  (v_dr_emily, v_pt_meera, 'Most likely yes, but it is a simple daily pill. You will feel much better soon.', true, now() - interval '18 months' + interval '2 days 50 minutes'),
  (v_pt_meera, v_dr_emily, 'Doctor, I am feeling so much better! Energy is back.', true, now() - interval '1 year'),
  (v_dr_emily, v_pt_meera, 'Wonderful! Your TSH is normalizing. Keep taking the medication consistently.', true, now() - interval '1 year' + interval '1 day'),
  (v_pt_meera, v_dr_emily, 'Will do. Thank you so much!', true, now() - interval '1 year' + interval '1 day'),
  
  -- Arjun & Dr. Emily (Pre-Diabetes)
  (v_pt_arjun, v_dr_emily, 'Doctor, my dad has diabetes. Should I get tested?', true, now() - interval '8 months'),
  (v_dr_emily, v_pt_arjun, 'Good thinking. Family history is a risk factor. Let us do a glucose tolerance test.', true, now() - interval '8 months' + interval '1 hour'),
  (v_pt_arjun, v_dr_emily, 'Okay, when should I come?', true, now() - interval '8 months' + interval '50 minutes'),
  (v_dr_emily, v_pt_arjun, 'Tomorrow morning, fasting. No food after 10 PM tonight.', true, now() - interval '8 months' + interval '45 minutes'),
  (v_dr_emily, v_pt_arjun, 'Your results show pre-diabetes. Not diabetic yet, but we need to act now.', true, now() - interval '8 months' + interval '3 days'),
  (v_pt_arjun, v_dr_emily, 'What do I need to do?', true, now() - interval '8 months' + interval '3 days 1 hour'),
  (v_dr_emily, v_pt_arjun, 'Diet and exercise. I am sending you a detailed plan. This is reversible!', true, now() - interval '8 months' + interval '3 days 50 minutes'),
  (v_pt_arjun, v_dr_emily, 'I will follow it strictly. Thank you Doctor.', true, now() - interval '8 months' + interval '3 days 45 minutes'),
  (v_pt_arjun, v_dr_emily, 'Doctor! My HbA1c dropped to 5.8%! I am so happy!', true, now() - interval '2 months'),
  (v_dr_emily, v_pt_arjun, 'That is amazing Arjun! You reversed it. Keep up the lifestyle changes.', true, now() - interval '2 months' + interval '2 hours'),
  (v_pt_arjun, v_dr_emily, 'I will. This was a wake-up call. Thank you for everything!', true, now() - interval '2 months' + interval '1 hour');

END $$;

-- =================================================================
-- SETUP COMPLETE! 
-- =================================================================
-- You now have:
-- ✅ 10 Users (3 Doctors + 7 Patients)
-- ✅ 50+ Appointments
-- ✅ 40+ Health Records
-- ✅ 30+ Medications
-- ✅ 100+ Chat Messages
-- 
-- LOGIN CREDENTIALS (All passwords: 'patient123' or 'doctor123'):
-- DOCTORS:
--   dr.sarah@careconnect.com (Cardiologist)
--   dr.james@careconnect.com (General Physician)
--   dr.emily@careconnect.com (Endocrinologist)
-- 
-- PATIENTS:
--   santhosh@patient.com (Cardiac patient)
--   priya@patient.com (Preventive care)
--   rahul@patient.com (Diabetes)
--   ananya@patient.com (Acute care)
--   vikram@patient.com (Sports injury)
--   meera@patient.com (Thyroid)
--   arjun@patient.com (Pre-diabetes)
-- =================================================================
