-- Create medication_adherence table
CREATE TABLE IF NOT EXISTS medication_adherence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  scheduled_time TIMESTAMPTZ NOT NULL,
  taken BOOLEAN DEFAULT FALSE,
  taken_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_adherence_medication ON medication_adherence(medication_id);
CREATE INDEX IF NOT EXISTS idx_adherence_patient ON medication_adherence(patient_id);
CREATE INDEX IF NOT EXISTS idx_adherence_scheduled ON medication_adherence(scheduled_time);

-- Enable RLS
ALTER TABLE medication_adherence ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own adherence records
CREATE POLICY "Users can view their own adherence records"
ON medication_adherence FOR SELECT
USING (patient_id = auth.uid());

-- RLS Policy: Users can insert their own adherence records
CREATE POLICY "Users can insert their own adherence records"
ON medication_adherence FOR INSERT
WITH CHECK (patient_id = auth.uid());

-- RLS Policy: Users can update their own adherence records
CREATE POLICY "Users can update their own adherence records"
ON medication_adherence FOR UPDATE
USING (patient_id = auth.uid());

-- RLS Policy: Doctors can view adherence of patients who granted access
CREATE POLICY "Doctors can view adherence of patients who granted access"
ON medication_adherence FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM access_grants
    WHERE access_grants.patient_id = medication_adherence.patient_id
    AND access_grants.provider_id = auth.uid()
    AND access_grants.status = 'GRANTED'
  )
);

-- Verify table was created
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'medication_adherence'
ORDER BY ordinal_position;
