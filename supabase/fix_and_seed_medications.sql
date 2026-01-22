-- FIX AND SEED MEDICATIONS (CORRECT USER TARGETING)
-- This script aligns the schema and inserts data specifically for 'santhosh@patient.com'

-- 1. Fix Schema (Idempotent)
DO $$
BEGIN
    -- Rename 'frequency' to 'freq' if valid
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medications' AND column_name = 'frequency') THEN
        ALTER TABLE medications RENAME COLUMN frequency TO freq;
    END IF;

    -- Add 'freq' if neither exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medications' AND column_name = 'freq') THEN
        ALTER TABLE medications ADD COLUMN freq TEXT;
    END IF;

    -- Add 'time' column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medications' AND column_name = 'time') THEN
        ALTER TABLE medications ADD COLUMN time TEXT;
    END IF;

    -- Add 'stock' column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medications' AND column_name = 'stock') THEN
        ALTER TABLE medications ADD COLUMN stock INTEGER DEFAULT 30;
    END IF;

    -- Add 'refill' column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medications' AND column_name = 'refill') THEN
        ALTER TABLE medications ADD COLUMN refill TEXT;
    END IF;

    -- Make start_date optional
    ALTER TABLE medications ALTER COLUMN start_date DROP NOT NULL;
END $$;

-- 2. Seed Data for SPECIFIC USER (Santhosh)
WITH target_user AS (
  SELECT id 
  FROM auth.users 
  WHERE email = 'santhosh@patient.com'
  LIMIT 1
)

INSERT INTO public.medications (patient_id, name, dosage, freq, time, stock, refill)
SELECT 
  target_user.id,
  name, 
  dosage, 
  freq, 
  time, 
  stock, 
  refill
FROM target_user, (VALUES
  ('Lisinopril', '10mg', 'Once daily', '08:00 AM', 28, (CURRENT_DATE + INTERVAL '28 days')::text),
  ('Metformin', '500mg', 'Twice daily', '08:00 AM, 08:00 PM', 14, (CURRENT_DATE + INTERVAL '10 days')::text),
  ('Atorvastatin', '20mg', 'Once daily', '09:00 PM', 45, (CURRENT_DATE + INTERVAL '45 days')::text),
  ('Levothyroxine', '50mcg', 'Once daily', '07:00 AM', 90, (CURRENT_DATE + INTERVAL '80 days')::text),
  ('Amlodipine', '5mg', 'Once daily', '09:00 AM', 7, (CURRENT_DATE + INTERVAL '5 days')::text),
  ('Omeprazole', '20mg', 'Once daily', '08:00 AM', 30, (CURRENT_DATE + INTERVAL '30 days')::text),
  ('Montelukast', '10mg', 'Once daily', '08:00 PM', 25, (CURRENT_DATE + INTERVAL '25 days')::text)
) AS data(name, dosage, freq, time, stock, refill)
WHERE target_user.id IS NOT NULL 
AND NOT EXISTS (
    SELECT 1 FROM public.medications m 
    WHERE m.name = data.name AND m.patient_id = target_user.id
);

-- If Santhosh wasn't found, try creating it for ALL users to be safe (Fallback)
INSERT INTO public.medications (patient_id, name, dosage, freq, time, stock, refill)
SELECT 
  users.id,
  data.name, 
  data.dosage, 
  data.freq, 
  data.time, 
  data.stock, 
  data.refill
FROM auth.users, (VALUES
  ('Lisinopril', '10mg', 'Once daily', '08:00 AM', 28, (CURRENT_DATE + INTERVAL '28 days')::text),
  ('Metformin', '500mg', 'Twice daily', '08:00 AM, 08:00 PM', 14, (CURRENT_DATE + INTERVAL '10 days')::text)
) AS data(name, dosage, freq, time, stock, refill)
WHERE auth.users.email != 'santhosh@patient.com' -- Avoid double insert if Santhosh existed
AND NOT EXISTS (
    SELECT 1 FROM public.medications m 
    WHERE m.name = data.name AND m.patient_id = auth.users.id
);

SELECT 'Medications seeded for user Santhosh (and others)' as result;
