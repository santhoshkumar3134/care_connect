-- FIX MISSING RLS POLICIES
-- Run this to enable full functionality for Doctors and Patients

-- 1. APPOINTMENTS: Allow updates (for Status changes)
CREATE POLICY "Users can update own appointments" ON public.appointments
FOR UPDATE USING (
    auth.uid() = doctor_id OR auth.uid() = patient_id
);

-- 2. HEALTH RECORDS: Allow updates (for Doctor Findings)
CREATE POLICY "Doctors can update records they have access to" ON public.health_records
FOR UPDATE USING (
    doctor_id = auth.uid()
);

-- 3. NOTIFICATIONS: Ensure they are secure
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
FOR SELECT USING (
    auth.uid() = user_id
);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
FOR UPDATE USING (
    auth.uid() = user_id
);

-- 4. DOCTOR PATIENTS: Allow creation of relationships (if managed by doctors)
CREATE POLICY "Doctors can create patient relationships" ON public.doctor_patients
FOR INSERT WITH CHECK (
    auth.uid() = doctor_id
);

-- 5. STORAGE POLICIES (Ensure buckets serve files)
-- We'll just ensure the public bucket is readable for now to fix image issues
INSERT INTO storage.buckets (id, name, public)
VALUES ('health_records', 'health_records', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING ( bucket_id = 'health_records' );

CREATE POLICY "Authenticated Upload" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'health_records' 
    AND auth.role() = 'authenticated'
);
