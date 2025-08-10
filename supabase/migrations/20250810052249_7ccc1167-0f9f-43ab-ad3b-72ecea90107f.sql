
-- PHASE 1: Core schema for Call Logging, Assignments, Job Cards, Tracking & Notifications

-- 1) Enums
create type public.app_role as enum ('admin', 'technician', 'client', 'management');
create type public.call_status as enum ('new','in_progress','onsite','complete','closed','cancelled','escalated');
create type public.priority_level as enum ('low','medium','high','urgent');

-- 2) Roles helper
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- 3) Profiles (link to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  company text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create trigger if not exists profiles_set_updated_at
before update on public.profiles
for each row
execute procedure public.update_updated_at_column();

-- Auto-create a profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4) User roles
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

-- 5) Clients and Sites
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  address text,
  primary_contact_id uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.clients enable row level security;

create trigger if not exists clients_set_updated_at
before update on public.clients
for each row
execute procedure public.update_updated_at_column();

create table if not exists public.client_sites (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  name text,
  address text,
  city text,
  province text,
  country text,
  latitude numeric,
  longitude numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.client_sites enable row level security;

create trigger if not exists client_sites_set_updated_at
before update on public.client_sites
for each row
execute procedure public.update_updated_at_column();

-- 6) Calls (tickets)
create table if not exists public.calls (
  id uuid primary key default gen_random_uuid(),
  tracking_number text not null unique default (
    to_char(now(),'YYMMDD') || '-' || substr(replace(gen_random_uuid()::text,'-',''),1,6)
  ),
  subject text,
  description text,
  client_id uuid not null references public.clients(id) on delete restrict,
  site_id uuid references public.client_sites(id) on delete set null,
  created_by uuid references public.profiles(id),
  status public.call_status not null default 'new',
  priority public.priority_level not null default 'medium',
  escalated boolean not null default false,
  escalation_reason text,
  escalated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.calls enable row level security;

create index if not exists calls_client_id_idx on public.calls(client_id);
create index if not exists calls_status_idx on public.calls(status);

create trigger if not exists calls_set_updated_at
before update on public.calls
for each row
execute procedure public.update_updated_at_column();

-- 7) Assignments
create table if not exists public.call_assignments (
  id uuid primary key default gen_random_uuid(),
  call_id uuid not null references public.calls(id) on delete cascade,
  engineer_id uuid not null references public.profiles(id) on delete cascade,
  assigned_by uuid references public.profiles(id),
  status text not null default 'assigned',
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  accepted boolean not null default false,
  onsite_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.call_assignments enable row level security;

create index if not exists call_assignments_call_id_idx on public.call_assignments(call_id);
create index if not exists call_assignments_engineer_id_idx on public.call_assignments(engineer_id);

create trigger if not exists call_assignments_set_updated_at
before update on public.call_assignments
for each row
execute procedure public.update_updated_at_column();

-- 8) Job Cards + tasks/notes/media
create table if not exists public.job_cards (
  id uuid primary key default gen_random_uuid(),
  call_id uuid not null unique references public.calls(id) on delete cascade,
  created_by uuid references public.profiles(id),
  client_contact_name text,
  site_contact_name text,
  notes text,
  technician_signature_path text,
  client_signature_path text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.job_cards enable row level security;

create trigger if not exists job_cards_set_updated_at
before update on public.job_cards
for each row
execute procedure public.update_updated_at_column();

create table if not exists public.job_card_tasks (
  id uuid primary key default gen_random_uuid(),
  job_card_id uuid not null references public.job_cards(id) on delete cascade,
  description text not null,
  done boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.job_card_tasks enable row level security;

create table if not exists public.job_card_notes (
  id uuid primary key default gen_random_uuid(),
  job_card_id uuid not null references public.job_cards(id) on delete cascade,
  author_id uuid references public.profiles(id),
  note text not null,
  created_at timestamptz not null default now()
);
alter table public.job_card_notes enable row level security;

create table if not exists public.job_media (
  id uuid primary key default gen_random_uuid(),
  job_card_id uuid not null references public.job_cards(id) on delete cascade,
  file_path text not null,
  media_type text,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
alter table public.job_media enable row level security;

-- 9) Public tracking links + notifications
create table if not exists public.tracking_links (
  id uuid primary key default gen_random_uuid(),
  call_id uuid not null references public.calls(id) on delete cascade,
  token uuid not null unique default gen_random_uuid(),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.tracking_links enable row level security;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  call_id uuid references public.calls(id) on delete cascade,
  recipient_email text not null,
  type text not null,
  metadata jsonb not null default '{}'::jsonb,
  sent_at timestamptz not null default now()
);
alter table public.notifications enable row level security;

-- 10) RLS Policies

-- profiles
create policy "profiles_select_self" on public.profiles
for select to authenticated
using (id = auth.uid());

create policy "profiles_update_self" on public.profiles
for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "profiles_admin_all" on public.profiles
for all to authenticated
using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'management'))
with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'management'));

-- user_roles
create policy "roles_select_self" on public.user_roles
for select to authenticated
using (user_id = auth.uid());

create policy "roles_admin_all" on public.user_roles
for all to authenticated
using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'management'))
with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'management'));

-- clients
create policy "clients_admin_all" on public.clients
for all to authenticated
using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'management'))
with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'management'));

-- client_sites
create policy "sites_admin_all" on public.client_sites
for all to authenticated
using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'management'))
with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'management'));

-- calls (tickets)
create policy "calls_admin_all" on public.calls
for all to authenticated
using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'management'))
with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'management'));

create policy "calls_creator_manage_own" on public.calls
for all to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

create policy "calls_client_primary_contact_can_view" on public.calls
for select to authenticated
using (exists (
  select 1 from public.clients c
  where c.id = calls.client_id
    and c.primary_contact_id = auth.uid()
));

create policy "calls_technician_can_view_assigned" on public.calls
for select to authenticated
using (exists (
  select 1 from public.call_assignments ca
  where ca.call_id = calls.id
    and ca.engineer_id = auth.uid()
));

-- call_assignments
create policy "assign_admin_all" on public.call_assignments
for all to authenticated
using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'management'))
with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'management'));

create policy "assign_engineer_view_update_own" on public.call_assignments
for select using (engineer_id = auth.uid())
to authenticated;

create policy "assign_engineer_update_own" on public.call_assignments
for update using (engineer_id = auth.uid())
with check (engineer_id = auth.uid())
to authenticated;

-- job_cards
create policy "job_cards_admin_all" on public.job_cards
for all to authenticated
using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'management'))
with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'management'));

create policy "job_cards_tech_on_assigned_call" on public.job_cards
for all to authenticated
using (exists (
  select 1 from public.call_assignments ca
  where ca.call_id = job_cards.call_id
    and ca.engineer_id = auth.uid()
))
with check (exists (
  select 1 from public.call_assignments ca
  where ca.call_id = job_cards.call_id
    and ca.engineer_id = auth.uid()
));

create policy "job_cards_client_can_view" on public.job_cards
for select to authenticated
using (
  exists (select 1 from public.calls cl where cl.id = job_cards.call_id and cl.created_by = auth.uid())
  or exists (
    select 1 from public.clients c
    join public.calls cl on cl.client_id = c.id
    where cl.id = job_cards.call_id and c.primary_contact_id = auth.uid()
  )
);

-- job_card_tasks
create policy "tasks_admin_all" on public.job_card_tasks
for all to authenticated
using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'management'))
with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'management'));

create policy "tasks_tech_on_assigned_call" on public.job_card_tasks
for all to authenticated
using (exists (
  select 1 from public.job_cards jc
  join public.call_assignments ca on ca.call_id = jc.call_id
  where jc.id = job_card_tasks.job_card_id and ca.engineer_id = auth.uid()
))
with check (exists (
  select 1 from public.job_cards jc
  join public.call_assignments ca on ca.call_id = jc.call_id
  where jc.id = job_card_tasks.job_card_id and ca.engineer_id = auth.uid()
));

create policy "tasks_client_can_view" on public.job_card_tasks
for select to authenticated
using (exists (
  select 1 from public.job_cards jc
  join public.calls cl on cl.id = jc.call_id
  left join public.clients c on c.id = cl.client_id
  where jc.id = job_card_tasks.job_card_id
    and (cl.created_by = auth.uid() or c.primary_contact_id = auth.uid())
));

-- job_card_notes
create policy "notes_admin_all" on public.job_card_notes
for all to authenticated
using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'management'))
with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'management'));

create policy "notes_tech_on_assigned_call" on public.job_card_notes
for all to authenticated
using (exists (
  select 1 from public.job_cards jc
  join public.call_assignments ca on ca.call_id = jc.call_id
  where jc.id = job_card_notes.job_card_id and ca.engineer_id = auth.uid()
))
with check (exists (
  select 1 from public.job_cards jc
  join public.call_assignments ca on ca.call_id = jc.call_id
  where jc.id = job_card_notes.job_card_id and ca.engineer_id = auth.uid()
));

create policy "notes_client_can_view" on public.job_card_notes
for select to authenticated
using (exists (
  select 1 from public.job_cards jc
  join public.calls cl on cl.id = jc.call_id
  left join public.clients c on c.id = cl.client_id
  where jc.id = job_card_notes.job_card_id
    and (cl.created_by = auth.uid() or c.primary_contact_id = auth.uid())
));

-- job_media
create policy "media_admin_all" on public.job_media
for all to authenticated
using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'management'))
with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'management'));

create policy "media_tech_on_assigned_call" on public.job_media
for all to authenticated
using (exists (
  select 1 from public.job_cards jc
  join public.call_assignments ca on ca.call_id = jc.call_id
  where jc.id = job_media.job_card_id and ca.engineer_id = auth.uid()
))
with check (exists (
  select 1 from public.job_cards jc
  join public.call_assignments ca on ca.call_id = jc.call_id
  where jc.id = job_media.job_card_id and ca.engineer_id = auth.uid()
));

create policy "media_client_can_view" on public.job_media
for select to authenticated
using (exists (
  select 1 from public.job_cards jc
  join public.calls cl on cl.id = jc.call_id
  left join public.clients c on c.id = cl.client_id
  where jc.id = job_media.job_card_id
    and (cl.created_by = auth.uid() or c.primary_contact_id = auth.uid())
));

-- tracking_links
create policy "tracking_links_admin_all" on public.tracking_links
for all to authenticated
using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'management'))
with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'management'));

-- notifications
create policy "notifications_admin_all" on public.notifications
for all to authenticated
using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'management'))
with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'management'));

-- 11) Storage buckets (private)
insert into storage.buckets (id, name, public) values
  ('job-media','job-media', false),
  ('job-signatures','job-signatures', false),
  ('engineer-docs','engineer-docs', false)
on conflict (id) do nothing;

-- Storage policies (initial)
-- Admin/Management full access
create policy if not exists "storage_admin_all" on storage.objects
for all to authenticated
using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'management'))
with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'management'));

-- Technicians can manage job-media
create policy if not exists "storage_technician_job_media_rw" on storage.objects
for select to authenticated
using (bucket_id = 'job-media' and public.has_role(auth.uid(),'technician'));

create policy if not exists "storage_technician_job_media_insert" on storage.objects
for insert to authenticated
with check (bucket_id = 'job-media' and public.has_role(auth.uid(),'technician'));

-- 12) Realtime publications
alter publication supabase_realtime add table public.calls;
alter publication supabase_realtime add table public.call_assignments;
alter publication supabase_realtime add table public.job_cards;
