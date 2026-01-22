-- RESTORE USER SIGN-UP TRIGGER (Safe Version)
-- Use this to re-enable automatic profile creation for new users

-- 1. Ensure the sequence logic is robust (fallback to random if seq missing)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_role TEXT;
  role_code TEXT;
  new_nalam_id TEXT;
  full_name TEXT;
  seq_val BIGINT;
BEGIN
  -- Extract Metadata
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'PATIENT');
  full_name := COALESCE(NEW.raw_user_meta_data->>'name', 'User');

  -- Determin Role Code
  IF user_role = 'DOCTOR' THEN role_code := 'DR';
  ELSIF user_role = 'ADMIN' THEN role_code := 'AD';
  ELSE role_code := 'PT';
  END IF;

  -- Generate Nalam ID safely
  BEGIN
    -- Try to get value from sequence
    SELECT nextval('public.nalam_id_seq') INTO seq_val;
    new_nalam_id := 'NAL-' || to_char(NOW(), 'YYYY') || '-' || role_code || '-' || LPAD(seq_val::TEXT, 4, '0');
  EXCEPTION WHEN OTHERS THEN
    -- Fallback: Generate random ID if sequence fails
    new_nalam_id := 'NAL-' || to_char(NOW(), 'YYYY') || '-' || role_code || '-' || substring(md5(random()::text) from 1 for 6);
  END;

  -- Insert Profile
  -- We use EXCEPTIONS to prevent the entire auth transaction from failing if profile insert fails
  BEGIN
    INSERT INTO public.profiles (id, email, name, role, nalam_id)
    VALUES (NEW.id, NEW.email, full_name, user_role, new_nalam_id);
  EXCEPTION WHEN OTHERS THEN
    -- Log error but ALLOW the user creation to succeed in Auth
    -- This prevents 500 Errors on Sign Up
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Re-bind the Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Verify Sequence Exists
CREATE SEQUENCE IF NOT EXISTS public.nalam_id_seq START 2000;
