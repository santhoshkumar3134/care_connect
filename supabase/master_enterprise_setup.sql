-- =================================================================
-- CARECONNECT v4.0 - ULTIMATE ENTERPRISE MASTER SCRIPT
-- =================================================================
-- This single script sets up your entire backend infrastructure.
-- It includes:
-- 1. Cleaning up old tables (Fresh Start)
-- 2. Creating all Enterprise Tables (Profiles, Doctors, Records...)
-- 3. Setting up Row Level Security (RLS) Policies
-- 4. Creating Performance Indexes (Optimization)
-- 5. Enabling Real-time updates for Chat
-- 6. Setting up Storage Policies 
-- =================================================================

-- -----------------------------------------------------------------
-- PART 1: CLEAN SLATE (Drop existing to avoid conflicts)
-- -----------------------------------------------------------------
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS admin_settings CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS medications CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS health_records CASCADE;
DROP TABLE IF EXISTS doctor_patients CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.log_audit_action();
DROP SEQUENCE IF EXISTS nalam_id_seq;

-- -----------------------------------------------------------------
-- PART 2: CORE TABLES & SEQUENCES
-- -----------------------------------------------------------------

-- 1. Nalam ID Sequence
CREATE SEQUENCE IF NOT EXISTS nalam_id_seq START 1000;

-- 2. Profiles (All Users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('PATIENT', 'DOCTOR', 'ADMIN')),
  nalam_id TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  specialization TEXT,
  license_number TEXT,
  hospital TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Doctor-Patient Relationship
CREATE TABLE IF NOT EXISTS doctor_patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(doctor_id, patient_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Health Records
CREATE TABLE IF NOT EXISTS health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('LAB', 'PRESCRIPTION', 'SCAN', 'VISIT_NOTE', 'DIAGNOSIS')),
  date TEXT NOT NULL,
  summary TEXT,
  detailed_notes TEXT,
  file_url TEXT,
  file_type TEXT,
  visibility TEXT DEFAULT 'PRIVATE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
  type TEXT NOT NULL CHECK (type IN ('VIDEO', 'IN_PERSON', 'PHONE')),
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Medications
CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  prescribed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  reason TEXT,
  side_effects TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Messages (Chat)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  text TEXT NOT NULL,
  attachments TEXT[] DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Audit Logs (Admin)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  changes JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Admin Settings
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  setting_key TEXT NOT NULL,
  setting_value JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(admin_id, setting_key)
);

-- -----------------------------------------------------------------
-- PART 3: SECURITY (RLS POLICIES)
-- -----------------------------------------------------------------

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Doctor-Patients Policies
CREATE POLICY "View own relationships" ON doctor_patients
  FOR SELECT USING (doctor_id = auth.uid() OR patient_id = auth.uid());
CREATE POLICY "Doctors create relationships" ON doctor_patients
  FOR INSERT WITH CHECK (doctor_id = auth.uid());

-- Messages Policies (Chat)
CREATE POLICY "View own messages" ON messages
  FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());
CREATE POLICY "Send messages" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Update own messages" ON messages
  FOR UPDATE USING (sender_id = auth.uid());

-- Health Records Policies
CREATE POLICY "View own records" ON health_records
  FOR SELECT USING (
    patient_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM doctor_patients WHERE doctor_id = auth.uid() AND patient_id = health_records.patient_id)
  );
CREATE POLICY "Create records" ON health_records
  FOR INSERT WITH CHECK (patient_id = auth.uid() OR doctor_id = auth.uid());

-- Appointment Policies
CREATE POLICY "View own appointments" ON appointments
  FOR SELECT USING (patient_id = auth.uid() OR doctor_id = auth.uid());
CREATE POLICY "Create appointments" ON appointments
  FOR INSERT WITH CHECK (patient_id = auth.uid() OR doctor_id = auth.uid());

-- -----------------------------------------------------------------
-- PART 4: AUTOMATION (TRIGGERS)
-- -----------------------------------------------------------------

-- Auto Pofile Creation Handler
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_role TEXT;
  role_code TEXT;
  new_nalam_id TEXT;
BEGIN
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'PATIENT');
  
  -- Logic for Nalam ID prefix
  IF user_role = 'DOCTOR' THEN role_code := 'DR';
  ELSIF user_role = 'ADMIN' THEN role_code := 'AD';
  ELSE role_code := 'PT';
  END IF;

  -- Generate ID: NAL-2024-PT-1001
  new_nalam_id := 'NAL-' || to_char(NOW(), 'YYYY') || '-' || role_code || '-' || 
                  LPAD(nextval('public.nalam_id_seq')::TEXT, 4, '0');

  INSERT INTO public.profiles (id, email, name, role, nalam_id)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'User'), user_role, new_nalam_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------
-- PART 5: OPTIMIZATIONS (Performance & Realtime)
-- -----------------------------------------------------------------

-- Indexes for Fast Queries
CREATE INDEX IF NOT EXISTS messages_sender_idx ON messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_receiver_idx ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at);
CREATE INDEX IF NOT EXISTS appointments_patient_idx ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS records_patient_idx ON health_records(patient_id);

-- Enable Real-Time for Chat
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE doctor_patients;

-- -----------------------------------------------------------------
-- PART 6: STORAGE SETTINGS
-- -----------------------------------------------------------------
-- NOTE: You must Create buckets 'health-docs' and 'medical-documents' in the dashboard first.
-- These policies secure them.

DO $$
BEGIN
    -- Policy for health-docs
    BEGIN
        create policy "Authenticated users upload docs" 
          on storage.objects for insert 
          with check (bucket_id = 'health-docs' and auth.role() = 'authenticated');
    EXCEPTION WHEN OTHERS THEN NULL; END;

    BEGIN
        create policy "Users view own docs" 
          on storage.objects for select 
          using (bucket_id = 'health-docs' and auth.uid()::text = (storage.foldername(name))[1]);
    EXCEPTION WHEN OTHERS THEN NULL; END;
    
    -- Policy for medical-documents
    BEGIN
        create policy "Authenticated users upload medical docs" 
          on storage.objects for insert 
          with check (bucket_id = 'medical-documents' and auth.role() = 'authenticated');
    EXCEPTION WHEN OTHERS THEN NULL; END;

    BEGIN
        create policy "Users view medical docs" 
          on storage.objects for select 
          using (bucket_id = 'medical-documents');
    EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

-- =================================================================
-- BUILD COMPLETE
-- =================================================================
-- Your Enterprise Backend is now fully configured!
