-- Add doctor perception/diagnosis field to health_records
-- Run this after master_enterprise_setup.sql

ALTER TABLE health_records 
ADD COLUMN IF NOT EXISTS doctor_perception TEXT,
ADD COLUMN IF NOT EXISTS diagnosis TEXT;

-- Update RLS policy to allow doctors to update records with their perception
CREATE POLICY IF NOT EXISTS "Doctors update patient records" ON health_records
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM doctor_patients WHERE doctor_id = auth.uid() AND patient_id = health_records.patient_id)
  );
