
-- 1) Create table for public-facing “Need Help” submissions
create table if not exists public.inbound_support_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  full_name text not null,
  contact_number text not null,
  whatsapp_number text,
  email text not null,
  category text not null,
  description text not null,

  preferred_channel text,
  status text not null default 'new',
  source text not null default 'web',

  ip text,
  user_agent text
);

-- 2) Enable Row Level Security
alter table public.inbound_support_requests enable row level security;

-- 3) RLS Policies
-- Anyone (including anon) can insert new requests
drop policy if exists "Anyone can log an inbound support request" on public.inbound_support_requests;
create policy "Anyone can log an inbound support request"
  on public.inbound_support_requests
  for insert
  to public
  with check (true);

-- Only admins/dispatchers can read
drop policy if exists "Admins and dispatchers can view inbound requests" on public.inbound_support_requests;
create policy "Admins and dispatchers can view inbound requests"
  on public.inbound_support_requests
  for select
  to authenticated
  using (
    public.has_role(auth.uid(), 'siyakha_admin')
    or public.has_role(auth.uid(), 'dispatcher')
  );

-- Only admins/dispatchers can update
drop policy if exists "Admins and dispatchers can update inbound requests" on public.inbound_support_requests;
create policy "Admins and dispatchers can update inbound requests"
  on public.inbound_support_requests
  for update
  to authenticated
  using (
    public.has_role(auth.uid(), 'siyakha_admin')
    or public.has_role(auth.uid(), 'dispatcher')
  )
  with check (
    public.has_role(auth.uid(), 'siyakha_admin')
    or public.has_role(auth.uid(), 'dispatcher')
  );

-- Only admins/dispatchers can delete
drop policy if exists "Admins and dispatchers can delete inbound requests" on public.inbound_support_requests;
create policy "Admins and dispatchers can delete inbound requests"
  on public.inbound_support_requests
  for delete
  to authenticated
  using (
    public.has_role(auth.uid(), 'siyakha_admin')
    or public.has_role(auth.uid(), 'dispatcher')
  );

-- 4) Timestamp trigger
drop trigger if exists inbound_support_requests_set_updated_at on public.inbound_support_requests;
create trigger inbound_support_requests_set_updated_at
before update on public.inbound_support_requests
for each row execute function public.update_updated_at_column();

-- 5) Helpful indexes
create index if not exists idx_inbound_support_requests_created_at on public.inbound_support_requests (created_at desc);
create index if not exists idx_inbound_support_requests_status on public.inbound_support_requests (status);
