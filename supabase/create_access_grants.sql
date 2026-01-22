-- Create access_grants table
CREATE TABLE IF NOT EXISTS access_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL, -- Refers to the Doctor/Hospital Profile
  access_level TEXT DEFAULT 'READ', -- 'READ', 'WRITE', 'NONE'
  status TEXT DEFAULT 'GRANTED', -- 'GRANTED', 'REVOKED', 'EXPIRED'
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Prevent duplicate active grants for same pair
  UNIQUE(patient_id, provider_id)
);

-- Enable RLS
ALTER TABLE access_grants ENABLE ROW LEVEL SECURITY;

-- Policies

-- 1. Patients can seeing their own grants (ALL operations)
CREATE POLICY "Patients can manage their own grants"
ON access_grants
FOR ALL
USING (auth.uid() = patient_id);

-- 2. Doctors can see grants meant for them (READ ONLY)
-- This allows them to check if they have access
CREATE POLICY "Doctors can view grants assigned to them"
ON access_grants
FOR SELECT
USING (auth.uid() = provider_id);

-- Indexes for performance
CREATE INDEX idx_access_grants_patient ON access_grants(patient_id);
CREATE INDEX idx_access_grants_provider ON access_grants(provider_id);
CREATE INDEX idx_access_grants_status ON access_grants(status);
