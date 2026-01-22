-- ENHANCEMENT SCRIPT FOR EXISTING SUPABASE PROJECT
-- Run this in your Supabase SQL Editor. It respects existing tables.

-- 1. Ensure UUID extension
create extension if not exists "uuid-ossp";

-- 2. MESSAGES TABLE ENHANCEMENT
-- Check if 'messages' table exists, if not create it
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references auth.users(id) not null,
  receiver_id uuid references auth.users(id) not null,
  text text,
  attachments text[] default '{}',
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add 'attachments' column if it doesn't exist (Migration)
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'messages' and column_name = 'attachments') then
    alter table public.messages add column attachments text[] default '{}';
  end if;
end $$;

-- Enable RLS on messages
alter table public.messages enable row level security;

-- Drop existing policies to avoid conflicts (safe re-run)
drop policy if exists "Users can view participating messages" on public.messages;
drop policy if exists "Users can send messages" on public.messages;
drop policy if exists "Users can view their own messages" on public.messages;
drop policy if exists "Users can insert messages" on public.messages;
drop policy if exists "Users can update their own messages" on public.messages;

-- Create robust policies
create policy "Users can view participating messages" 
  on public.messages for select 
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can send messages" 
  on public.messages for insert 
  with check (auth.uid() = sender_id);

create policy "Users can update own messages" 
  on public.messages for update
  using (auth.uid() = sender_id);

-- 3. PROFILES TABLE ENHANCEMENT
-- Ensure columns exist
do $$
begin
    -- Add columns if missing
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'nalam_id') then
        alter table public.profiles add column nalam_id text unique;
    end if;
end $$;

-- 4. REAL-TIME TRIGGERS
-- Create function to handle real-time notifications
create or replace function public.handle_new_message()
returns trigger as $$
begin
  perform pg_notify(
    'new_message',
    json_build_object(
      'id', new.id,
      'sender_id', new.sender_id,
      'receiver_id', new.receiver_id
    )::text
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new messages
drop trigger if exists on_new_message on public.messages;
create trigger on_new_message
  after insert on public.messages
  for each row execute procedure public.handle_new_message();

-- 5. INDEXES FOR PERFORMANCE
create index if not exists messages_sender_id_idx on public.messages(sender_id);
create index if not exists messages_receiver_id_idx on public.messages(receiver_id);
create index if not exists messages_created_at_idx on public.messages(created_at);

-- 6. STORAGE BUCKETS (Cannot create via SQL easily, but policies can be set)
-- NOTE: Please ensure 'health-docs' and 'medical-documents' buckets exist in Storage dashboard.
