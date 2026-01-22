-- DATA SEED SCRIPT: MEDICATIONS
-- Run this script in your Supabase SQL Editor to populate realistic medication data.
-- IMPORTANT: Replace 'PLACEHOLDER_USER_ID' with your actual User ID from the Auth > Users table.

WITH user_info AS (
  -- Try to get the first user if running in a context where this works, otherwise use the placeholder
  -- You can uncomment the line below and replace with your actual UUID if you know it
  -- SELECT 'your-uuid-here'::uuid as user_id
  SELECT id as user_id FROM auth.users LIMIT 1
)

INSERT INTO public.medications (patient_id, name, dosage, freq, time, stock, refill)
SELECT 
  user_id,
  name, 
  dosage, 
  freq, 
  time, 
  stock, 
  refill
FROM user_info, (VALUES
  ('Lisinopril', '10mg', 'Once daily', '08:00 AM', 28, (CURRENT_DATE + INTERVAL '28 days')),
  ('Metformin', '500mg', 'Twice daily', '08:00 AM, 08:00 PM', 14, (CURRENT_DATE + INTERVAL '10 days')),
  ('Atorvastatin', '20mg', 'Once daily', '09:00 PM', 45, (CURRENT_DATE + INTERVAL '45 days')),
  ('Levothyroxine', '50mcg', 'Once daily', '07:00 AM', 90, (CURRENT_DATE + INTERVAL '80 days')),
  ('Amlodipine', '5mg', 'Once daily', '09:00 AM', 7, (CURRENT_DATE + INTERVAL '5 days')),
  ('Omeprazole', '20mg', 'Once daily', '08:00 AM', 30, (CURRENT_DATE + INTERVAL '30 days')),
  ('Montelukast', '10mg', 'Once daily', '08:00 PM', 25, (CURRENT_DATE + INTERVAL '25 days'))
) AS data(name, dosage, freq, time, stock, refill)
WHERE NOT EXISTS (
    SELECT 1 FROM public.medications m 
    WHERE m.name = data.name AND m.patient_id = user_info.user_id
);

-- Output confirmation
SELECT 'Medications seeded successfully' as status;
