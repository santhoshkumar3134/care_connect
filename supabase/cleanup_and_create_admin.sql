-- CLEANUP AND CREATE CORRECT ADMIN
-- Run this to remove the confusing "test.admin" and ensure "admin@careconnect.com" exists

DO $$
BEGIN
  -- 1. Remove the old/confusing test admin if it exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'test.admin@careconnect.com') THEN
    DELETE FROM auth.users WHERE email = 'test.admin@careconnect.com';
    RAISE NOTICE 'Removed old user: test.admin@careconnect.com';
  END IF;

  -- 2. Explicitly recreate/update the CORRECT admin
  -- Email: admin@careconnect.com
  -- Password: Admin@123
  
  -- Check if correct user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@careconnect.com') THEN
         INSERT INTO auth.users (
          instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
          raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        )
        VALUES (
          '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 
          'admin@careconnect.com', crypt('Admin@123', gen_salt('bf')), now(), 
          '{"provider":"email","providers":["email"]}', '{"role":"ADMIN","name":"System Admin"}', now(), now()
        );
        RAISE NOTICE 'Created new admin: admin@careconnect.com';
  ELSE
       -- Update password just in case
       UPDATE auth.users 
       SET encrypted_password = crypt('Admin@123', gen_salt('bf'))
       WHERE email = 'admin@careconnect.com';
       RAISE NOTICE 'Updated existing admin password: admin@careconnect.com';
  END IF;

  -- 3. Ensure Profile
  INSERT INTO public.profiles (id, email, name, role, nalam_id)
  SELECT id, email, 'System Admin', 'ADMIN', 'NAL-ADMIN-001'
  FROM auth.users WHERE email = 'admin@careconnect.com'
  ON CONFLICT (id) DO UPDATE SET role = 'ADMIN';

END $$;
