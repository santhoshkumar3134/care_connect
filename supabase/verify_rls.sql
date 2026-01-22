-- VERIFY RLS POLICIES
-- Run this to check which tables have RLS enabled and view active policies

-- 1. Check RLS Status for all tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- 2. List all Policies
SELECT schemaname, tablename, policyname, cmd, roles, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- 3. Check for specific critical tables
DO $$
DECLARE
    tables text[] := ARRAY['profiles', 'appointments', 'health_records', 'messages', 'notifications', 'doctor_patients'];
    t text;
    rls_enabled boolean;
BEGIN
    FOREACH t IN ARRAY tables LOOP
        SELECT rowsecurity INTO rls_enabled FROM pg_tables WHERE schemaname = 'public' AND tablename = t;
        IF rls_enabled THEN
            RAISE NOTICE '✅ Table % has RLS ENABLED', t;
        ELSE
            RAISE WARNING '❌ Table % has RLS DISABLED - SECURITY RISK!', t;
        END IF;
    END LOOP;
END $$;
