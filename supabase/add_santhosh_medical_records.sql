-- =================================================================
-- ADD REALISTIC MEDICAL RECORDS - SANTHOSH ONLY (Simplified)
-- =================================================================
-- This adds realistic medical records for Santhosh Kumar with 
-- complete cardiac risk management journey
-- =================================================================

DO $$
DECLARE
    v_patient_santhosh UUID := 'c0f000d4-095c-4529-bae2-b26457931d1e';
    v_dr_sarah UUID := '1c80496e-09a6-4ce3-830d-5842fe758cb7';
    v_dr_james UUID := '090cfa04-52a3-4597-bca0-ca071aa5aada';
BEGIN
    RAISE NOTICE '🏥 Adding realistic medical records for Santhosh Kumar...';

    -- =================================================================
    -- SANTHOSH - CARDIAC RISK MANAGEMENT JOURNEY
    -- Timeline: High cholesterol → Lifestyle changes → Improvement
    -- =================================================================

    -- Initial Consultation (July 2025)
    INSERT INTO appointments (patient_id, doctor_id, date, time, status, type, reason, notes)
    VALUES 
    (v_patient_santhosh, v_dr_sarah, '2025-07-15', '09:00 AM', 'COMPLETED', 'IN_PERSON', 
     'Annual health checkup - 35 years old', 
     'Patient reports occasional chest discomfort during exercise. Family history of CAD (father). Non-smoker. Sedentary lifestyle. BMI: 27.8 (overweight). BP: 132/84 mmHg. Ordered lipid panel and ECG.')
    ON CONFLICT DO NOTHING;

    -- Lab Report 1: Lipid Panel - Initial (HIGH CHOLESTEROL)
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

CARDIOVASCULAR RISK ASSESSMENT:
- 10-year ASCVD Risk: 6.8% (Borderline)
- Family history of premature CAD

RECOMMENDATIONS:
1. Therapeutic lifestyle changes (TLC diet)
2. Exercise: 150 min/week moderate aerobic activity
3. Weight reduction goal: 5-10% body weight
4. Repeat lipid panel in 3 months', 'PRIVATE')
    ON CONFLICT DO NOTHING;

    -- Scan 1: ECG Report (NORMAL)
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

FINDINGS:
- Normal P waves in all leads
- No ST segment elevation or depression
- No T wave inversions
- No evidence of prior MI

CONCLUSION: Normal ECG. 
Chest discomfort likely musculoskeletal or gastroesophageal in origin.', 'PRIVATE')
    ON CONFLICT DO NOTHING;

    -- Medications Prescribed
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

    -- Lab Report 2: Lipid Panel Follow-up (IMPROVED)
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

ASSESSMENT:
Excellent response to therapeutic lifestyle changes.

PLAN:
- Continue current lifestyle modifications
- Recheck in 6 months
- Target: LDL <100 mg/dL', 'PRIVATE')
    ON CONFLICT DO NOTHING;

    -- Scan 2: Chest X-Ray (NORMAL)
    INSERT INTO health_records (patient_id, doctor_id, title, type, date, summary, detailed_notes, visibility)
    VALUES 
    (v_patient_santhosh, v_dr_james, 'Chest Radiograph', 'SCAN', '2025-12-20',
     'Normal Chest X-Ray',
     'CHEST RADIOGRAPH (PA View):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINDINGS:
- Lungs: Clear, no infiltrates or masses
- Heart: Normal size and contour
- Mediastinum: Normal
- Bones: No acute fractures
- Soft tissues: Unremarkable

IMPRESSION: Normal chest radiograph', 'PRIVATE')
    ON CONFLICT DO NOTHING;

    -- Recent Checkup
    INSERT INTO appointments (patient_id, doctor_id, date, time, status, type, reason, notes)
    VALUES 
    (v_patient_santhosh, v_dr_sarah, '2026-01-16', '11:00 AM', 'COMPLETED', 'IN_PERSON', 
     'Routine quarterly checkup',
     'Patient maintaining healthy lifestyle. No symptoms. BP: 118/76 mmHg. Weight stable. Continue current plan.')
    ON CONFLICT DO NOTHING;

    -- Recent Visit Note
    INSERT INTO health_records (patient_id, doctor_id, title, type, date, summary, detailed_notes, visibility)
    VALUES 
    (v_patient_santhosh, v_dr_sarah, 'Quarterly Progress Note - January 2026', 'VISIT_NOTE', '2026-01-16',
     'Excellent Clinical Progress - Cardiovascular Risk Reduced',
     'QUARTERLY REVIEW - JANUARY 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SUBJECTIVE:
Patient reports feeling excellent. Energy levels markedly improved. Exercising regularly (jogging 5x/week, 5km). Following Mediterranean diet.

OBJECTIVE:
Vital Signs:
- BP: 118/76 mmHg (Excellent control)
- HR: 62 bpm (Athletic)
- BMI: 24.8 (Normal - reduced from 27.8)
- Weight: 73 kg (↓6 kg from baseline)

ASSESSMENT:
1. Hyperlipidemia - Well controlled with lifestyle modification
2. Cardiovascular risk reduction - Significant success

PLAN:
- Continue current medications
- Lipid panel in 3 months
- Next visit: April 2026', 'PRIVATE')
    ON CONFLICT DO NOTHING;

    -- Doctor-Patient Messages
    INSERT INTO messages (sender_id, receiver_id, text, is_read, created_at)
    VALUES 
    (v_patient_santhosh, v_dr_sarah, 
     'Hi Dr. Venkat, I wanted to share that I completed my first 10K run today! Thank you for motivating me on this journey.', 
     true, NOW() - INTERVAL '2 days'),
    (v_dr_sarah, v_patient_santhosh,
     'That is absolutely fantastic Santhosh! 🎉 I am so proud of your dedication. Your lipid panel improvements are a testament to your hard work. Keep it up!',
     true, NOW() - INTERVAL '2 days' + INTERVAL '15 minutes')
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '✅ ════════════════════════════════════════════';
    RAISE NOTICE '✅ MEDICAL RECORDS ADDED SUCCESSFULLY!';
    RAISE NOTICE '✅ ════════════════════════════════════════════';
    RAISE NOTICE '📊 Added for Santhosh Kumar:';
    RAISE NOTICE '   📋 4 Lab Reports (2 Lipid Panels)';
    RAISE NOTICE '   🫀 2 Scans (ECG, Chest X-Ray)';
    RAISE NOTICE '   📝 1 Visit Note';
    RAISE NOTICE '   📅 3 Appointments';
    RAISE NOTICE '   💊 3 Medications';
    RAISE NOTICE '   💬 2 Messages';
    
END $$;
