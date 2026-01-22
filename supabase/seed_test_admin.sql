-- Create a Test Admin User (Updated to match UI credentials)
-- Email: admin@careconnect.com
-- Password: Admin@123

DO $$
DECLARE
  v_admin_id UUID := gen_random_uuid();
  v_email TEXT := 'admin@careconnect.com';
  v_password TEXT := 'Admin@123';
  v_existing_id UUID;
BEGIN
  -- Check if user already exists
  SELECT id INTO v_existing_id FROM auth.users WHERE email = v_email;

  IF v_existing_id IS NULL THEN
    -- Insert new admin user
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_admin_id,
      'authenticated',
      'authenticated',
      v_email,
      crypt(v_password, gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"role":"ADMIN","name":"System Admin"}',
      now(),
      now(),
      '',
      ''
    );
    
    -- Explicitly ensure profile exists (in case trigger fails or we want to be sure)
    INSERT INTO public.profiles (id, email, name, role, nalam_id)
    VALUES (
        v_admin_id, 
        v_email, 
        'System Admin', 
        'ADMIN', 
        'NAL-2024-AD-0001'
    )
    ON CONFLICT (id) DO UPDATE 
    SET role = 'ADMIN';

    RAISE NOTICE 'Admin User Created: % (Password: %)', v_email, v_password;
  ELSE
    -- User exists, update password and role just in case
    UPDATE auth.users 
    SET encrypted_password = crypt(v_password, gen_salt('bf')),
        raw_user_meta_data = '{"role":"ADMIN","name":"System Admin"}'
    WHERE id = v_existing_id;
    
    -- Ensure profile matches
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (v_existing_id, v_email, 'System Admin', 'ADMIN')
    ON CONFLICT (id) DO UPDATE 
    SET role = 'ADMIN';

    RAISE NOTICE 'Admin User Updated: % (Password reset to %)', v_email, v_password;
  END IF;
END $$;
