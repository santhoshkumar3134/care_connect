-- EMERGENCY FIX FOR 500 ERROR
-- Run this to clear potential blockers for login

-- 1. Temporarily Drop the Trigger responsible for Profile Creation
-- If this fixes the login, we know the issue is in the handle_new_user function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Grant Explicit Permissions to the underlying Auth schema (Be careful with this in prod, but needed for debug)
GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;
GRANT SELECT ON auth.users TO anon, authenticated, service_role;

-- 3. Ensure extensions are available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 4. Manually Fix the Admin Profile (Bypassing Trigger)
DO $$
DECLARE
    v_user_id UUID;
    v_email TEXT := 'admin@careconnect.com';
BEGIN
    -- Get the ID of the admin user if they exist in auth
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
    
    IF v_user_id IS NOT NULL THEN
        -- Force insert/update profile
        INSERT INTO public.profiles (id, email, name, role, nalam_id)
        VALUES (v_user_id, v_email, 'System Admin', 'ADMIN', 'NAL-ADMIN-001')
        ON CONFLICT (id) DO UPDATE 
        SET role = 'ADMIN', nalam_id = 'NAL-ADMIN-001';
        
        RAISE NOTICE 'Fixed Admin Profile for %', v_email;
    ELSE
        RAISE NOTICE 'Admin user not found in auth.users. Please run seed_test_admin.sql first.';
    END IF;
END $$;
