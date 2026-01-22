-- Create messages table if it doesn't exist
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references auth.users(id) not null,
  receiver_id uuid references auth.users(id) not null,
  text text,
  attachments text[] default '{}',
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.messages enable row level security;

-- Create policies
create policy "Users can view their own messages"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can insert messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);

create policy "Users can update their own messages"
  on public.messages for update
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- Create indexes for performance
create index if not exists messages_sender_id_idx on public.messages(sender_id);
create index if not exists messages_receiver_id_idx on public.messages(receiver_id);
create index if not exists messages_created_at_idx on public.messages(created_at);

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
