# Supabase Backend Setup Guide for CareConnect

This guide will help you set up the complete backend infrastructure for your project using Supabase.

## Prerequisites
- A Supabase account and project created at [database.new](https://database.new)
- Your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` added to `.env` file

## Step 1: Database Setup
1. Go to your **Supabase Dashboard** -> **SQL Editor**.
2. Run your existing **`CARECONNECT v4.0`** script (the one you provided).
3. Then, run the **Optimization Script** found at `supabase/optimization.sql`.
   - This adds necessary indexes for chat performance.
   - It enables Real-time listening for messages.
   - It sets up Storage policies.

> **Note:** Your schema handles `Profiles`, `Messages`, and `Appointments` perfectly. The optimization script just ensures it runs fast and syncs in real-time.

## Step 2: Create Users & Load Data
You can do this manually, OR use our new **Automation Script**.

**Option A: The "One-Click" Way (Recommended)**
1. Run the **User Creation Script** found at `supabase/create_users.sql`.
   - This creates `admin@test.com`, `doctor@test.com`, and `patient@test.com` (Password: `password123`).
2. Run the **Seed Script** found at `supabase/seed_data.sql`.
   - This populates their dashboards with data.

**Option B: The Manual Way**
1. Go to **Authentication** in Supabase and create 3 users manually.
2. Run `supabase/seed_data.sql`.

## Step 3: Storage Setup
You need to create buckets to store medical documents and attachments.

1. Go to **Storage** in Supabase Dashboard.
2. Click **New Bucket**.
3. Create a bucket named `health-docs`:
   - Name: `health-docs`
   - Public: **No** (Private)
   - Click **Save**.
4. Create a bucket named `medical-documents`:
   - Name: `medical-documents`
   - Public: **No** (Private)
   - Click **Save**.
5. Create a bucket named `avatars` (Optional):
   - Name: `avatars`
   - Public: **Yes**
   - Click **Save**.

### Storage Policies
To allow users to upload files, you need to add policies.
1. Click on `health-docs` configuration (three dots) -> **Policies**.
2. Click **New Policy** -> "For full customization".
3. **Policy Name**: "Authenticated users can upload".
4. **Allowed operations**: INSERT, SELECT.
5. **Target roles**: authenticated.
6. **USING expression**: `bucket_id = 'health-docs' AND auth.uid()::text = (storage.foldername(name))[1]`
   - *(This ensures users can only access their own folder)*.
7. Click **Review** and **Save**.
8. Repeat for `medical-documents`.

## Step 3: Authentication
1. Go to **Authentication** -> **Providers**.
2. Ensure **Email** is enabled.
3. (Optional) Disable "Confirm email" in **URL Configuration** if you want instant signups for testing.

## Step 4: Verification
1. Restart your dev server: `npm run dev`.
2. Sign Up a new user in your app.
3. Check Supabase **Table Editor** -> `profiles` table. You should see the new user there.
4. Try adding a medical record or appointment in the app.
5. Check the corresponding tables in Supabase to see the data triggered.

## Troubleshooting
- **Errors regarding "relation does not exist"**: Re-run the SQL script.
- **Permission denied**: Check your RLS policies in the SQL script.
- **Upload fails**: Check Storage policies.
