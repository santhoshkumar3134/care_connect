-- Add date_of_birth and gender to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('Male', 'Female', 'Other'));

-- Update existing profiles with mock data for realism
UPDATE public.profiles 
SET 
  date_of_birth = CASE 
    WHEN name = 'Santhosh Kumar' THEN '1985-06-15'::DATE
    WHEN name = 'Priya Sharma' THEN '1992-08-22'::DATE
    WHEN name = 'Rahul Mehta' THEN '1978-03-10'::DATE
    WHEN name = 'Ananya Iyer' THEN '2000-11-05'::DATE
    WHEN name = 'Vikram Singh' THEN '1965-01-30'::DATE
    WHEN name = 'Meera Reddy' THEN '1988-07-12'::DATE
    WHEN name = 'Arjun Patel' THEN '1995-04-18'::DATE
    ELSE '1990-01-01'::DATE
  END,
  gender = CASE 
    WHEN name IN ('Santhosh Kumar', 'Rahul Mehta', 'Vikram Singh', 'Arjun Patel', 'Dr. James Wilson') THEN 'Male'
    WHEN name IN ('Priya Sharma', 'Ananya Iyer', 'Meera Reddy', 'Dr. Sarah Venkat', 'Dr. Emily Chen') THEN 'Female'
    ELSE 'Other'
  END
WHERE date_of_birth IS NULL;
