-- RESET ADMIN USER FOR MANUAL SIGN-UP
-- Run this to clear any broken admin accounts so you can sign up cleanly from the UI.

DO $$
BEGIN
    -- 1. Delete broken admin users from Auth (this cascades to profiles usually, but we'll be safe)
    DELETE FROM auth.users WHERE email = 'admin@careconnect.com';
    DELETE FROM auth.users WHERE email = 'test.admin@careconnect.com';
    
    -- 2. Delete from profiles just in case of orphans (if cascade wasn't set up perfectly)
    DELETE FROM public.profiles WHERE email = 'admin@careconnect.com';
    DELETE FROM public.profiles WHERE email = 'test.admin@careconnect.com';

    RAISE NOTICE 'Admin users cleared. You can now use the Sign Up form in the app.';
END $$;
