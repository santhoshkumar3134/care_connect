# Quick Fix for Authentication

## The Problem
SQL-inserted users bypass Supabase's auth initialization, causing "Database error querying schema" errors.

## The Solution
Delete SQL users and use the **Signup flow** to create proper users.

## Steps to Fix

### 1. Delete All Existing Users
Run in Supabase SQL Editor:
```sql
DELETE FROM auth.users;
DELETE FROM public.profiles;
```

### 2. Create Your First User via Signup
1. Go to `http://localhost:3000/`
2. Click **"Sign up"**
3. Fill in:
   - **Name:** Dr. Sarah Venkat
   - **Email:** dr.sarah@careconnect.com
   - **Password:** doctor123
   - **Role:** Doctor
4. Click **"Create account"**

This creates a REAL user through Supabase's proper API!

### 3. Login
After signup, you'll be auto-logged in. You'll see:
- ✅ Doctor dashboard
- ✅ Your name in header
- ✅ Nalam ID auto-generated

### 4. Create More Users
Repeat signup for:
- **Patient:** santhosh@patient.com / patient123 / Santhosh Kumar
- **Doctor:** dr.james@careconnect.com / doctor123 / Dr. James Wilson

## Why This Works
- ✅ Uses Supabase's official signup API
- ✅ Properly initializes all auth metadata
- ✅ Trigger auto-creates profile with Nalam ID
- ✅ No database errors
- ✅ Production-ready flow

## Test It
1. Delete users (SQL above)
2. Sign up as Dr. Sarah
3. Logout
4. Login with same credentials
5. Should work perfectly! ✅
