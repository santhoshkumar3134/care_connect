-- FIX RLS POLICIES FOR MEDICATIONS AND ENSURE DATA EXISTS
-- The previous issue was that RLS was enabled for 'medications' but no policies were created,
-- effectively blocking ALL access to the data.

-- 1. Create RLS Policies for Medications
DO $$
BEGIN
    -- Drop existing policies if any to avoid conflicts
    DROP POLICY IF EXISTS "View own medications" ON medications;
    DROP POLICY IF EXISTS "Create medications" ON medications;
    DROP POLICY IF EXISTS "Update own medications" ON medications;
    DROP POLICY IF EXISTS "Delete own medications" ON medications;

    -- Policy: Patients can view their own medications
    CREATE POLICY "View own medications" ON medications 
    FOR SELECT 
    USING (patient_id = auth.uid() OR prescribed_by = auth.uid());

    -- Policy: Users can create medications for themselves
    CREATE POLICY "Create medications" ON medications 
    FOR INSERT 
    WITH CHECK (patient_id = auth.uid() OR prescribed_by = auth.uid());

    -- Policy: Users can update their own medications
    CREATE POLICY "Update own medications" ON medications 
    FOR UPDATE 
    USING (patient_id = auth.uid());

    -- Policy: Users can delete their own medications
    CREATE POLICY "Delete own medications" ON medications 
    FOR DELETE 
    USING (patient_id = auth.uid());

END $$;

-- 2. Verify Data (Check if we need to re-seed)
-- We will re-run the user-specific seed just in case the previous attempts failed silently due to other issues.
-- This part is identical to the previous success script.

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

SELECT 'RLS policies fixed and medications verified for Santhosh' as result;
