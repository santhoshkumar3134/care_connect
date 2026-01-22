-- FIX: Allow 'RESCHEDULED' and 'UPCOMING' in appointments status
-- Run this in your Supabase SQL Editor to fix the 400 Error on Reschedule.

BEGIN;

ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;

ALTER TABLE appointments 
ADD CONSTRAINT appointments_status_check 
CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED', 'UPCOMING'));

COMMIT;
