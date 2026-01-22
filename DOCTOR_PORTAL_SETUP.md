# Quick Setup Guide - Doctor Portal Access Control

## Problem
The `access_grants` table doesn't exist, so the Doctor Portal can't show patients.

## Solution - Run These Steps in Order:

### Step 1: Create the `access_grants` Table
1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `supabase/create_access_grants.sql`
3. Click "Run" to execute

### Step 2: Grant Access (Patient Side)
1. Log in as a **PATIENT** (e.g., `patient@careconnect.com`)
2. Navigate to **Patient Records** → **Access Control** tab
3. Click **"Grant Access"** button
4. Search for a doctor by email: `doctor@careconnect.com`
5. Select the doctor and confirm

### Step 3: View Patient Records (Doctor Side)
1. Log out and log in as **DOCTOR** (`doctor@careconnect.com`)
2. Go to **My Patients** page (`/doctor/patients`)
3. You should now see the patient in the list
4. Click the blue **"View Record"** button
5. You'll be taken to `/doctor/patient/:id` with the full patient record

## Alternative: Create Test Data Directly

If you want to skip the UI and create a test access grant directly:

```sql
-- Get your patient and doctor IDs first
SELECT id, email, role FROM auth.users WHERE email IN ('patient@careconnect.com', 'doctor@careconnect.com');

-- Then insert a test grant (replace the UUIDs with actual IDs from above)
INSERT INTO access_grants (patient_id, provider_id, access_level, status)
VALUES (
    'PATIENT_UUID_HERE',  -- Replace with patient's user ID
    'DOCTOR_UUID_HERE',   -- Replace with doctor's user ID
    'FULL',
    'GRANTED'
);
```

## Verify It Works
Run this query to see all grants:
```sql
SELECT 
    ag.id,
    ag.status,
    p.name as patient_name,
    p.email as patient_email,
    doc.name as doctor_name,
    doc.email as doctor_email
FROM access_grants ag
LEFT JOIN profiles p ON ag.patient_id = p.id
LEFT JOIN profiles doc ON ag.provider_id = doc.id;
```

## Current Status
✅ "View Record" button added to `/doctor/patients`  
✅ Route `/doctor/patient/:id` configured  
✅ Read-only patient view implemented  
❌ `access_grants` table not created yet ← **YOU ARE HERE**
