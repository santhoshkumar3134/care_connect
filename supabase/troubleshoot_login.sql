-- =================================================================
-- TROUBLESHOOTING LOGIN 500 ERROR
-- =================================================================

-- 1. Ensure Nalam ID Sequence Exists
CREATE SEQUENCE IF NOT EXISTS public.nalam_id_seq START 1000;

-- 2. Grant Permissions (Fixes "Database error querying schema" often caused by permissions)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- 3. Redefine the User Creation Trigger (Make it robust)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_role TEXT;
  role_code TEXT;
  new_nalam_id TEXT;
  full_name TEXT;
BEGIN
  -- Extract Role with fallback
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'PATIENT');
  full_name := COALESCE(NEW.raw_user_meta_data->>'name', 'User');
  
  -- Logic for Nalam ID prefix
  IF user_role = 'DOCTOR' THEN role_code := 'DR';
  ELSIF user_role = 'ADMIN' THEN role_code := 'AD';
  ELSE role_code := 'PT';
  END IF;

  -- Generate ID safely
  BEGIN
    new_nalam_id := 'NAL-' || to_char(NOW(), 'YYYY') || '-' || role_code || '-' || 
                    LPAD(nextval('public.nalam_id_seq')::TEXT, 4, '0');
  EXCEPTION WHEN OTHERS THEN
    -- Fallback if sequence fails
    new_nalam_id := 'NAL-' || to_char(NOW(), 'YYYY') || '-' || role_code || '-' || substring(md5(random()::text) from 1 for 4);
  END;

  -- Insert Profile with Conflict Handling
  INSERT INTO public.profiles (id, email, name, role, nalam_id)
  VALUES (NEW.id, NEW.email, full_name, user_role, new_nalam_id)
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-bind Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Verify Admin User Exists (Sync with App.tsx credentials)
DO $$
DECLARE
  v_admin_email TEXT := 'admin@careconnect.com';
BEGIN
  -- If admin exists in auth but not profiles, the trigger might have failed previously.
  -- This block ensures consistency.
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = v_admin_email) THEN
      INSERT INTO public.profiles (id, email, name, role, nalam_id)
      SELECT id, email, 'System Admin', 'ADMIN', 'NAL-ADMIN-001'
      FROM auth.users WHERE email = v_admin_email
      ON CONFLICT (id) DO UPDATE SET role = 'ADMIN';
  END IF;
END $$;
