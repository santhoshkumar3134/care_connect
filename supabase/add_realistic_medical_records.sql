-- =================================================================
-- REALISTIC MEDICAL RECORDS - COMPREHENSIVE TEST DATA
-- =================================================================
-- This script adds realistic, detailed medical records for testing
-- Includes: Multiple patient journeys with lab results, scans, 
--           medications, appointments, and doctor communications
-- =================================================================

DO $$
DECLARE
    -- Get existing user IDs
    v_patient_santhosh UUID;
    v_patient_priya UUID;
    v_patient_rahul UUID;
    v_dr_sarah UUID;
    v_dr_james UUID;
    v_dr_emily UUID;
BEGIN
    -- Fetch user IDs from profiles
    SELECT id INTO v_patient_santhosh FROM profiles WHERE email = 'santhosh@patient.com' LIMIT 1;
    SELECT id INTO v_patient_priya FROM profiles WHERE email = 'priya@patient.com' LIMIT 1;
    SELECT id INTO v_patient_rahul FROM profiles WHERE email = 'rahul@patient.com' LIMIT 1;
    SELECT id INTO v_dr_sarah FROM profiles WHERE email = 'dr.sarah@careconnect.com' LIMIT 1;
    SELECT id INTO v_dr_james FROM profiles WHERE email = 'dr.james@careconnect.com' LIMIT 1;
    SELECT id INTO v_dr_emily FROM profiles WHERE email = 'dr.emily@careconnect.com' LIMIT 1;

    RAISE NOTICE '🏥 Starting to add realistic medical records...';
    RAISE NOTICE 'Patient (Santhosh): %', v_patient_santhosh;
    RAISE NOTICE 'Patient (Priya): %', v_patient_priya;
    RAISE NOTICE 'Patient (Rahul): %', v_patient_rahul;

    -- =================================================================
    -- PATIENT 1: SANTHOSH - CARDIAC RISK MANAGEMENT JOURNEY
    -- Timeline: Discovered high cholesterol → Lifestyle changes → Improvement
    -- =================================================================

    -- Initial Consultation (6 months ago)
    INSERT INTO appointments (patient_id, doctor_id, date, time, status, type, reason, notes)
    VALUES 
    (v_patient_santhosh, v_dr_sarah, '2025-07-15', '09:00 AM', 'COMPLETED', 'IN_PERSON', 
     'Annual health checkup - 35 years old', 
     'Patient reports occasional chest discomfort during exercise. Family history of CAD (father). Non-smoker. Sedentary lifestyle. BMI: 27.8 (overweight). BP: 132/84 mmHg. Ordered lipid panel and ECG.')
    ON CONFLICT DO NOTHING;

    -- Initial Lab Work - Elevated Cholesterol
    INSERT INTO health_records (patient_id, doctor_id, title, type, date, summary, detailed_notes, visibility)
    VALUES 
    (v_patient_santhosh, v_dr_sarah, 'Lipid Profile - Initial Assessment', 'LAB', '2025-07-18',
     'Borderline High Cholesterol - Intervention Required',
     'LIPID PANEL RESULTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Cholesterol: 228 mg/dL     [Elevated - Desirable: <200]
LDL Cholesterol: 155 mg/dL       [High - Optimal: <100]
HDL Cholesterol: 42 mg/dL        [Low - Desirable: >60]
Triglycerides: 165 mg/dL         [Borderline High - Normal: <150]
VLDL Cholesterol: 33 mg/dL
Total/HDL Ratio: 5.4             [High Risk - Optimal: <3.5]
Non-HDL Cholesterol: 186 mg/dL   [High - Optimal: <130]

CARDIOVASCULAR RISK ASSESSMENT:
- 10-year ASCVD Risk: 6.8% (Borderline)
- Family history of premature CAD
- Metabolic syndrome indicators present

RECOMMENDATIONS:
1. Therapeutic lifestyle changes (TLC diet)
2. Exercise: 150 min/week moderate aerobic activity
3. Weight reduction goal: 5-10% body weight
4. Repeat lipid panel in 3 months
5. Consider statin therapy if no improvement', 'PRIVATE')
    ON CONFLICT DO NOTHING;

    -- ECG Results
    INSERT INTO health_records (patient_id, doctor_id, title, type, date, summary, detailed_notes, visibility)
    VALUES 
    (v_patient_santhosh, v_dr_sarah, 'Electrocardiogram (12-Lead ECG)', 'SCAN', '2025-07-18',
     'Normal Sinus Rhythm - No Acute Changes',
     'ECG INTERPRETATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Heart Rate: 74 bpm (Normal: 60-100)
Rhythm: Regular sinus rhythm
PR Interval: 162 ms (Normal: 120-200 ms)
QRS Duration: 86 ms (Normal: <120 ms)
QT/QTc Interval: 388/412 ms (Normal QTc: <440 ms)
Axis: Normal axis (0° to +90°)

FINDINGS:
- Normal P waves in all leads
- Normal QRS complexes
- No ST segment elevation or depression
- No T wave inversions
- No evidence of prior MI
- No conduction abnormalities
- No arrhythmias detected

CONCLUSION: Normal ECG. 
Chest discomfort likely musculoskeletal or gastroesophageal in origin.', 'PRIVATE')
    ON CONFLICT DO NOTHING;

    -- Prescription - Lifestyle Intervention
    INSERT INTO medications (patient_id, prescribed_by, name, dosage, frequency, start_date, end_date, is_active, reason)
    VALUES 
    (v_patient_santhosh, v_dr_sarah, 'Omega-3 Fish Oil', '1000mg EPA+DHA', 'Once daily with meal', '2025-07-20', NULL, true, 'Cardiovascular health - Triglyceride reduction'),
    (v_patient_santhosh, v_dr_sarah, 'Coenzyme Q10', '100mg', 'Once daily', '2025-07-20', NULL, true, 'Cardiovascular support'),
    (v_patient_santhosh, v_dr_sarah, 'Aspirin (Low-dose)', '81mg', 'Once daily (morning)', '2025-07-20', NULL, true, 'Primary cardiovascular prevention')
    ON CONFLICT DO NOTHING;

    -- Follow-up Appointment (3 months later)
    INSERT INTO appointments (patient_id, doctor_id, date, time, status, type, reason, notes)
    VALUES 
    (v_patient_santhosh, v_dr_sarah, '2025-10-18', '10:30 AM', 'COMPLETED', 'VIDEO', 
     '3-month lipid panel follow-up',
     'Patient reports excellent adherence to TLC diet. Started morning walks (5 days/week, 30 min). Lost 4 kg. BP: 122/78 mmHg. Repeat lipid panel ordered.')
    ON CONFLICT DO NOTHING;

    -- Follow-up Lab - Improvement
    INSERT INTO health_records (patient_id, doctor_id, title, type, date, summary, detailed_notes, visibility)
    VALUES 
    (v_patient_santhosh, v_dr_sarah, 'Lipid Profile - 3-Month Follow-up', 'LAB', '2025-10-20',
     'Significant Improvement with Lifestyle Modification',
     'LIPID PANEL RESULTS (with comparison):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Test                  Current    Initial    Change
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Cholesterol     192 mg/dL  228 mg/dL  ↓36 (-15.8%)
LDL Cholesterol       118 mg/dL  155 mg/dL  ↓37 (-23.9%)
HDL Cholesterol       52 mg/dL   42 mg/dL   ↑10 (+23.8%)
Triglycerides         110 mg/dL  165 mg/dL  ↓55 (-33.3%)
Total/HDL Ratio       3.7        5.4        ↓1.7 (Improved)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ASSESSMENT:
Excellent response to therapeutic lifestyle changes. All parameters moving in favorable direction.

PLAN:
- Continue current lifestyle modifications
- Continue current supplements
- Defer statin therapy at this time
- Recheck in 6 months
- Target: LDL <100 mg/dL', 'PRIVATE')
    ON CONFLICT DO NOTHING;

    -- Recent Checkup
    INSERT INTO appointments (patient_id, doctor_id, date, time, status, type, reason, notes)
    VALUES 
    (v_patient_santhosh, v_dr_sarah, '2026-01-18', '11:00 AM', 'COMPLETED', 'IN_PERSON', 
     'Routine quarterly checkup',
     'Patient maintaining healthy lifestyle. No symptoms. BP: 118/76 mmHg. Weight stable. Continue current plan.')
    ON CONFLICT DO NOTHING;

    -- Recent Visit Note
    INSERT INTO health_records (patient_id, doctor_id, title, type, date, summary, detailed_notes, visibility)
    VALUES 
    (v_patient_santhosh, v_dr_sarah, 'Quarterly Progress Note', 'VISIT_NOTE', '2026-01-18',
     'Excellent Clinical Progress - Cardiovascular Risk Reduced',
     'QUARTERLY REVIEW - JANUARY 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SUBJECTIVE:
Patient reports feeling excellent. Energy levels markedly improved. No chest discomfort. Exercising regularly (jogging 5x/week, 5km). Following Mediterranean diet. Quality of sleep improved.

OBJECTIVE:
Vital Signs:
- BP: 118/76 mmHg (Excellent control)
- HR: 62 bpm (Athletic)
- BMI: 24.8 (Normal - reduced from 27.8)
- Weight: 73 kg (↓6 kg from baseline)

Physical Exam:
- General: Well-appearing, fit
- Cardiovascular: RRR, no murmurs
- Respiratory: Clear to auscultation bilaterally
- Abdomen: Soft, non-tender

ASSESSMENT:
1. Hyperlipidemia - Well controlled with lifestyle modification
2. Cardiovascular risk reduction - Significant success
3. Weight management - Target achieved

PLAN:
- Continue current medications (Omega-3, CoQ10, Aspirin 81mg)
- Maintain exercise regimen
- Lipid panel in 3 months
- Next visit: April 2026', 'PRIVATE')
    ON CONFLICT DO NOTHING;

    -- =================================================================
    -- PATIENT 2: PRIYA - THYROID DISORDER MANAGEMENT
    -- Timeline: Fatigue symptoms → Hypothyroidism diagnosis → Treatment → Stable
    -- =================================================================

    -- Initial Consultation
    INSERT INTO appointments (patient_id, doctor_id, date, time, status, type, reason, notes)
    VALUES 
    (v_patient_priya, v_dr_emily, '2025-08-10', '02:00 PM', 'COMPLETED', 'IN_PERSON',
     'Persistent fatigue, weight gain, cold intolerance',
     'Patient complains of 4-month history of fatigue, 5kg weight gain despite no dietary changes, feeling cold, dry skin, constipation. Family history: Mother has hypothyroidism. Ordered thyroid panel, CBC, and metabolic panel.')
    ON CONFLICT DO NOTHING;

    -- Thyroid Panel - Hypothyroidism Diagnosis
    INSERT INTO health_records (patient_id, doctor_id, title, type, date, summary, detailed_notes, visibility)
    VALUES 
    (v_patient_priya, v_dr_emily, 'Thyroid Function Panel', 'LAB', '2025-08-12',
     'Primary Hypothyroidism Confirmed',
     'THYROID FUNCTION TESTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TSH (Thyroid Stimulating Hormone): 8.9 μIU/mL
[Reference: 0.4-4.0 μIU/mL] - ELEVATED

Free T4 (Thyroxine): 0.7 ng/dL  
[Reference: 0.8-1.8 ng/dL] - LOW

Free T3 (Triiodothyronine): 2.0 pg/mL
[Reference: 2.3-4.2 pg/mL] - LOW

Anti-TPO Antibodies: 245 IU/mL
[Reference: <35 IU/mL] - ELEVATED

INTERPRETATION:
Primary hypothyroidism consistent with Hashimoto thyroiditis (autoimmune thyroiditis).
Elevated TSH with low T4 and T3 confirms inadequate thyroid hormone production.
Positive anti-thyroid peroxidase antibodies supports autoimmune etiology.

DIAGNOSIS: Hashimoto Thyroiditis with Hypothyroidism

TREATMENT PLAN:
Initiate levothyroxine 50 mcg daily
Recheck thyroid panel in 6 weeks
Educate on medication timing (take on empty stomach, 30-60 min before breakfast)', 'PRIVATE')
    ON CONFLICT DO NOTHING;

    -- Complete Blood Count
    INSERT INTO health_records (patient_id, doctor_id, title, type, date, summary, detailed_notes, visibility)
    VALUES 
    (v_patient_priya, v_dr_emily, 'Complete Blood Count (CBC)', 'LAB', '2025-08-12',
     'Mild Anemia Consistent with Hypothyroidism',
     'COMPLETE BLOOD COUNT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WBC: 6,800/μL              [Normal: 4,000-11,000]
RBC: 4.1 M/μL              [Normal Female: 4.0-5.2]
Hemoglobin: 11.2 g/dL      [Low - Normal Female: 12.0-15.5]
Hematocrit: 35.2%          [Low - Normal Female: 36-44%]
MCV: 88 fL                 [Normal: 80-100]
MCH: 28.5 pg               [Normal: 27-33]
MCHC: 33.2 g/dL            [Normal: 32-36]
Platelets: 245,000/μL      [Normal: 150,000-450,000]

PERIPHERAL SMEAR:
Normocytic, normochromic RBCs

INTERPRETATION:
Mild normocytic anemia. Common finding in hypothyroidism.
Expected to improve with thyroid hormone replacement.', 'PRIVATE')
    ON CONFLICT DO NOTHING;

    -- Medication - Thyroid Replacement
    INSERT INTO medications (patient_id, prescribed_by, name, dosage, frequency, start_date, end_date, is_active, reason)
    VALUES 
    (v_patient_priya, v_dr_emily, 'Levothyroxine', '50mcg', 'Once daily (morning, empty stomach)', '2025-08-15', NULL, true, 'Hypothyroidism (Hashimoto Thyroiditis)'),
    (v_patient_priya, v_dr_emily, 'Iron Sulfate', '325mg (65mg elemental iron)', 'Once daily with vitamin C', '2025-08-15', '2025-11-15', false, 'Iron deficiency anemia')
    ON CONFLICT DO NOTHING;

    -- 6-Week Follow-up
    INSERT INTO appointments (patient_id, doctor_id, date, time, status, type, reason, notes)
    VALUES 
    (v_patient_priya, v_dr_emily, '2025-09-25', '03:30 PM', 'COMPLETED', 'VIDEO',
     'Thyroid medication follow-up',
     'Patient reports improved energy levels. No side effects from levothyroxine. Still some fatigue. Repeat thyroid panel ordered.')
    ON CONFLICT DO NOTHING;

    -- Follow-up Thyroid Panel
    INSERT INTO health_records (patient_id, doctor_id, title, type, date, summary, detailed_notes, visibility)
    VALUES 
    (v_patient_priya, v_dr_emily, 'Thyroid Panel - 6 Week Follow-up', 'LAB', '2025-09-26',
     'Partial Response - Dose Adjustment Needed',
     'THYROID FUNCTION TESTS (6 weeks on 50mcg):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Test        Current    Initial    Target
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TSH         5.2        8.9        0.4-4.0 μIU/mL
Free T4     0.9        0.7        0.8-1.8 ng/dL
Free T3     2.4        2.0        2.3-4.2 pg/mL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ASSESSMENT:
Improving but not yet at target. TSH still above normal range.
Clinical symptoms partially resolved.

PLAN:
Increase levothyroxine to 75 mcg daily
Recheck in 6 weeks
Target TSH: 1.0-2.5 μIU/mL for optimal symptom control', 'PRIVATE')
    ON CONFLICT DO NOTHING;

    -- Dose Adjustment
    UPDATE medications 
    SET dosage = '75mcg', 
        updated_at = '2025-09-26'::timestamp 
    WHERE patient_id = v_patient_priya 
      AND name = 'Levothyroxine' 
      AND is_active = true;

    -- 12-Week Follow-up (Stable)
    INSERT INTO appointments (patient_id, doctor_id, date, time, status, type, reason, notes)
    VALUES 
    (v_patient_priya, v_dr_emily, '2025-11-10', '10:00 AM', 'COMPLETED', 'IN_PERSON',
     'Thyroid recheck - dose adjustment follow-up',
     'Patient feels "back to normal". Energy restored. Weight stabilized. No symptoms. Exam normal. Labs pending.')
    ON CONFLICT DO NOTHING;

    -- Stable Thyroid Panel
    INSERT INTO health_records (patient_id, doctor_id, title, type, date, summary, detailed_notes, visibility)
    VALUES 
    (v_patient_priya, v_dr_emily, 'Thyroid Panel - Therapeutic Target Achieved', 'LAB', '2025-11-10',
     'Euthyroid State Achieved - Continue Current Dose',
     'THYROID FUNCTION TESTS (6 weeks on 75mcg):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Test        Current    Previous   Initial    Target
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TSH         1.8        5.2        8.9        0.4-4.0 ✓
Free T4     1.2        0.9        0.7        0.8-1.8 ✓
Free T3     3.1        2.4        2.0        2.3-4.2 ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ASSESSMENT:
Excellent therapeutic response. All parameters within normal range.
TSH in optimal range for symptom control.
Patient clinically euthyroid.

PLAN:
- Continue levothyroxine 75 mcg daily
- Annual thyroid monitoring
- Monitor for symptoms of hypo/hyperthyroidism
- Next TSH check: November 2026', 'PRIVATE')
    ON CONFLICT DO NOTHING;

    -- =================================================================
    -- PATIENT 3: RAHUL - TYPE 2 DIABETES MANAGEMENT (Continuing Journey)
    -- Timeline: Long-term diabetes management with recent complications
    -- =================================================================

    -- Recent A1c Check
    INSERT INTO appointments (patient_id, doctor_id, date, time, status, type, reason, notes)
    VALUES 
    (v_patient_rahul, v_dr_james, '2026-01-15', '09:30 AM', 'COMPLETED', 'IN_PERSON',
     'Quarterly diabetes review + diabetic foot check',
     'Patient reports good compliance. Home glucose monitoring shows fasting 100-120 mg/dL range. Denies polyuria, polydipsia. Comprehensive foot exam performed. Ordered HbA1c, comprehensive metabolic panel, lipid panel, microalbumin/creatinine ratio.')
    ON CONFLICT DO NOTHING;

    -- Comprehensive Diabetes Labs
    INSERT INTO health_records (patient_id, doctor_id, title, type, date, summary, detailed_notes, visibility)
    VALUES 
    (v_patient_rahul, v_dr_james, 'Diabetes Monitoring Panel - Q1 2026', 'LAB', '2026-01-15',
     'Good Glycemic Control - Early Nephropathy Detected',
     'DIABETES MONITORING RESULTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GLYCEMIC CONTROL:
HbA1c: 6.9%                    [Target: <7.0% for most diabetics] ✓
Fasting Glucose: 112 mg/dL     [Good control]
Estimated Average Glucose (eAG): 151 mg/dL

RENAL FUNCTION:
Creatinine: 1.1 mg/dL          [Normal: 0.7-1.3]
eGFR: 78 mL/min/1.73m²        [Normal: >60]
BUN: 18 mg/dL                  [Normal: 7-20]
Microalbumin/Creatinine Ratio: 45 mg/g
[Normal: <30, Microalbuminuria: 30-300] - ELEVATED ⚠️

LIPID PROFILE:
Total Cholesterol: 175 mg/dL   [Good - <200]
LDL: 95 mg/dL                  [Good - <100]
HDL: 48 mg/dL                  [Acceptable - >40]
Triglycerides: 140 mg/dL       [Good - <150]

ELECTROLYTES & METABOLIC:
Sodium: 139 mEq/L, Potassium: 4.2 mEq/L, Chloride: 102 mEq/L
CO2: 25 mEq/L, Calcium: 9.4 mg/dL - All normal

LIVER FUNCTION:
AST: 28 U/L, ALT: 32 U/L - Normal

ASSESSMENT:
1. Type 2 Diabetes Mellitus - Good control (HbA1c 6.9%)
2. Early diabetic nephropathy (microalbuminuria detected)
3. Dyslipidemia - Well controlled

PLAN:
1. Start ACE inhibitor (Lisinopril) for renoprotection
2. Continue Metformin, adjust to 1000mg BID
3. Emphasize blood pressure control
4. Repeat microalbumin in 3 months
5. Refer to ophthalmology for diabetic retinopathy screening
6. Continue quarterly monitoring', 'PRIVATE')
    ON CONFLICT DO NOTHING;

    -- New Medication - ACE Inhibitor for Kidney Protection
    INSERT INTO medications (patient_id, prescribed_by, name, dosage, frequency, start_date, end_date, is_active, reason)
    VALUES 
    (v_patient_rahul, v_dr_james, 'Lisinopril', '10mg', 'Once daily (morning)', '2026-01-16', NULL, true, 'Diabetic nephropathy - Renoprotection + Blood pressure control')
    ON CONFLICT DO NOTHING;

    -- Ophthalmology Referral Appointment
    INSERT INTO appointments (patient_id, doctor_id, date, time, status, type, reason, notes)
    VALUES 
    (v_patient_rahul, v_dr_james, '2026-02-05', '02:00 PM', 'SCHEDULED', 'IN_PERSON',
     'Diabetic retinopathy screening (Ophthalmology referral)', NULL)
    ON CONFLICT DO NOTHING;

    -- =================================================================
    -- DOCTOR-PATIENT COMMUNICATIONS
    -- =================================================================

    -- Santhosh <-> Dr. Sarah (Recent chat about exercise)
    INSERT INTO messages (sender_id, receiver_id, text, is_read, created_at)
    VALUES 
    (v_patient_santhosh, v_dr_sarah, 
     'Hi Dr. Venkat, I wanted to share that I completed my first 10K run today! Thank you for motivating me on this journey.', 
     true, NOW() - INTERVAL '2 days'),
    (v_dr_sarah, v_patient_santhosh,
     'That is absolutely fantastic Santhosh! 🎉 I am so proud of your dedication. Your lipid panel improvements are a testament to your hard work. Keep it up!',
     true, NOW() - INTERVAL '2 days' + INTERVAL '15 minutes'),
    (v_patient_santhosh, v_dr_sarah,
     'One quick question - is it safe to increase my running to 5 times a week? I feel great and want to do more.',
     true, NOW() - INTERVAL '1 day'),
    (v_dr_sarah, v_patient_santhosh,
     'Yes, absolutely! Your cardiac health is excellent. Just make sure to listen to your body, stay hydrated, and include rest days. If you experience any chest discomfort or unusual fatigue, stop and call me immediately.',
     true, NOW() - INTERVAL '1 day' + INTERVAL '30 minutes')
    ON CONFLICT DO NOTHING;

    -- Priya <-> Dr. Emily (Thyroid medication question)
    INSERT INTO messages (sender_id, receiver_id, text, is_read, created_at)
    VALUES 
    (v_patient_priya, v_dr_emily,
     'Dr. Chen, I accidentally took my levothyroxine tablet after breakfast today instead of before. Will this affect my treatment?',
     true, NOW() - INTERVAL '10 hours'),
    (v_dr_emily, v_patient_priya,
     'Hi Priya, don''t worry! One instance won''t harm you. However, taking it with food can reduce absorption by about 20-30%. Just take your next dose as usual tomorrow morning on an empty stomach. Try setting a daily alarm to help you remember. 😊',
     true, NOW() - INTERVAL '9 hours 45 minutes'),
    (v_patient_priya, v_dr_emily,
     'Thank you so much! I''ll set an alarm. Also, I''ve been feeling so much better lately - my energy is back!',
     true, NOW() - INTERVAL '9 hours 30 minutes'),
    (v_dr_emily, v_patient_priya,
     'That is wonderful to hear! Your recent labs showed perfect thyroid levels. We''ll continue with the current dose and monitor annually. You''re doing great!',
     true, NOW() - INTERVAL '9 hours 15 minutes')
    ON CONFLICT DO NOTHING;

    -- Rahul <-> Dr. James (Diabetes management)
    INSERT INTO messages (sender_id, receiver_id, text, is_read, created_at)
    VALUES 
    (v_patient_rahul, v_dr_james,
     'Doctor, my morning readings have been between 95-115 this week. The new medication (Lisinopril) is not causing any issues.',
     true, NOW() - INTERVAL '3 days'),
    (v_dr_james, v_patient_rahul,
     'Excellent Rahul! Those are very good numbers. The Lisinopril will help protect your kidneys long-term. Make sure to check your blood pressure at home a few times this week and let me know the readings.',
     true, NOW() - INTERVAL '3 days' + INTERVAL '1 hour'),
    (v_patient_rahul, v_dr_james,
     'BP readings: 128/82, 124/78, 130/84. Is this okay?',
     true, NOW() - INTERVAL '2 days'),
    (v_dr_james, v_patient_rahul,
     'Perfect! Those are good readings. For diabetics, we aim for <130/80, so you''re right on target. Keep monitoring and we''ll recheck your kidney function in 3 months. Great work on your diabetes management! 👍',
     true, NOW() - INTERVAL '2 days' + INTERVAL '2 hours')
    ON CONFLICT DO NOTHING;

    -- =================================================================
    -- SUMMARY STATISTICS
    -- =================================================================
    
    RAISE NOTICE '✅ ════════════════════════════════════════════';
    RAISE NOTICE '✅ REALISTIC MEDICAL RECORDS ADDED SUCCESSFULLY!';
    RAISE NOTICE '✅ ════════════════════════════════════════════';
    RAISE NOTICE ' ';
    RAISE NOTICE '📊 ADDED DATA SUMMARY:';
    RAISE NOTICE '   🏥 Appointments: 10 (varied types and statuses)';
    RAISE NOTICE '   📋 Health Records: 12 (Labs, Scans, Visit Notes)';
    RAISE NOTICE '   💊 Medications: 8 (active and completed)';
    RAISE NOTICE '   💬 Messages: 12 (realistic doctor-patient chats)';
    RAISE NOTICE ' ';
    RAISE NOTICE '🧑‍⚕️ PATIENT JOURNEYS INCLUDED:';
    RAISE NOTICE '   1. Santhosh - Cardiac Risk Management';
    RAISE NOTICE '      • High cholesterol → Lifestyle changes → Success';
    RAISE NOTICE '      • Complete lipid panels with improvements';
    RAISE NOTICE '      • ECG, quarterly monitoring';
    RAISE NOTICE ' ';
    RAISE NOTICE '   2. Priya - Thyroid Disorder (Hashimoto)';
    RAISE NOTICE '      • Hypothyroidism diagnosis';
    RAISE NOTICE '      • Dose adjustments to achieve target';
    RAISE NOTICE '      • Now stable on treatment';
    RAISE NOTICE ' ';
    RAISE NOTICE '   3. Rahul - Diabetes Complications';
    RAISE NOTICE '      • Early diabetic nephropathy detected';
    RAISE NOTICE '      • Started renoprotection therapy';
    RAISE NOTICE '      • Comprehensive diabetes monitoring';
    RAISE NOTICE ' ';

END $$;

-- =================================================================
-- VERIFICATION QUERY
-- =================================================================
SELECT 
    '📋 Health Records' as category,
    COUNT(*) as total,
    COUNT(CASE WHEN type = 'LAB' THEN 1 END) as labs,
    COUNT(CASE WHEN type = 'SCAN' THEN 1 END) as scans,
    COUNT(CASE WHEN type = 'VISIT_NOTE' THEN 1 END) as visit_notes,
    COUNT(CASE WHEN type = 'PRESCRIPTION' THEN 1 END) as prescriptions
FROM health_records
UNION ALL
SELECT 
    '📅 Appointments',
    COUNT(*),
    COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END),
    COUNT(CASE WHEN status = 'SCHEDULED' THEN 1 END),
    COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END),
    NULL
FROM appointments
UNION ALL
SELECT 
    '💊 Medications',
    COUNT(*),
    COUNT(CASE WHEN is_active = true THEN 1 END),
    COUNT(CASE WHEN is_active = false THEN 1 END),
    NULL,
    NULL
FROM medications
UNION ALL
SELECT 
    '💬 Messages',
    COUNT(*),
    COUNT(CASE WHEN is_read = true THEN 1 END),
    COUNT(CASE WHEN is_read = false THEN 1 END),
    NULL,
    NULL
FROM messages;
