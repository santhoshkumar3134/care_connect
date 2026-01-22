-- OPTIMIZATION & STORAGE ADD-ON for CareConnect v4.0
-- Run this AFTER your main setup script.

-- 1. Performance Indexes (Crucial for Chat Speed)
create index if not exists messages_sender_idx on messages(sender_id);
create index if not exists messages_receiver_idx on messages(receiver_id);
create index if not exists messages_created_at_idx on messages(created_at);
create index if not exists appointments_patient_date_idx on appointments(patient_id, date);

-- 2. Enable Real-time for Messages
-- This ensures the chat subscription works instantly
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table notifications;

-- 3. Storage Policies (Run this after creating 'health-docs' and 'medical-documents' buckets)
-- We assume you will create the buckets in the Dashboard.

create policy "Authenticated users can upload docs" 
  on storage.objects for insert 
  with check (bucket_id = 'health-docs' and auth.role() = 'authenticated');

create policy "Users can view their own docs" 
  on storage.objects for select 
  using (bucket_id = 'health-docs' and auth.uid()::text = (storage.foldername(name))[1]);

-- Repeat for medical-documents if needed
create policy "Authenticated users can upload medical docs" 
  on storage.objects for insert 
  with check (bucket_id = 'medical-documents' and auth.role() = 'authenticated');

create policy "Users can view medical docs" 
  on storage.objects for select 
  using (bucket_id = 'medical-documents'); 
