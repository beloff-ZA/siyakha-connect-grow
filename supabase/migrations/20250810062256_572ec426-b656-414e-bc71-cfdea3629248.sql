-- Ensure table exists
create table if not exists public.support_calls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  client_status text,
  location text,
  issues text[] not null default '{}',
  description text,
  contact_name text,
  contact_email text,
  contact_phone text,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.support_calls enable row level security;

-- Recreate policies safely
drop policy if exists "Users can view their own calls" on public.support_calls;
drop policy if exists "Users can create their own calls" on public.support_calls;
drop policy if exists "Users can update their own calls" on public.support_calls;
drop policy if exists "Users can delete their own calls" on public.support_calls;

create policy "Users can view their own calls"
  on public.support_calls for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can create their own calls"
  on public.support_calls for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own calls"
  on public.support_calls for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete their own calls"
  on public.support_calls for delete
  to authenticated
  using (auth.uid() = user_id);

-- Trigger for updated_at
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = 'public', 'pg_temp';

drop trigger if exists support_calls_set_updated_at on public.support_calls;
create trigger support_calls_set_updated_at
before update on public.support_calls
for each row execute function public.update_updated_at_column();

-- Helpful indexes
create index if not exists idx_support_calls_user_created on public.support_calls (user_id, created_at desc);