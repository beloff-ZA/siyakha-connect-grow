
-- 1) Role enum for membership
do $$
begin
  if not exists (select 1 from pg_type where typname = 'company_role') then
    create type public.company_role as enum ('owner','admin','member');
  end if;
end$$;

-- 2) Companies table
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  billing_email text,
  phone text,
  address text,
  vat_number text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.companies enable row level security;

-- 3) Company members table
create table if not exists public.company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.company_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (company_id, user_id)
);

alter table public.company_members enable row level security;

-- 4) Helper function to check membership
create or replace function public.is_company_member(_company_id uuid, _user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.company_members
    where company_id = _company_id
      and user_id = coalesce(_user_id, auth.uid())
  );
$$;

-- 5) RLS for companies and company_members (read-only for members for now)
drop policy if exists "Members can view their companies" on public.companies;
create policy "Members can view their companies"
on public.companies
for select
to authenticated
using (public.is_company_member(id));

drop policy if exists "Users can view own memberships" on public.company_members;
create policy "Users can view own memberships"
on public.company_members
for select
to authenticated
using (user_id = auth.uid());

-- (No insert/update/delete policies yet; managed by admins/service role. We can add later.)

-- 6) Add company_id to support_calls and index
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'support_calls' and column_name = 'company_id'
  ) then
    alter table public.support_calls add column company_id uuid;
  end if;
end$$;

create index if not exists idx_support_calls_company_id on public.support_calls(company_id);
create index if not exists idx_company_members_user_id on public.company_members(user_id);
create index if not exists idx_company_members_company_id on public.company_members(company_id);

-- 7) Migrate: seed companies from existing profiles.company_name
insert into public.companies (name)
select distinct trim(company_name)
from public.profiles
where company_name is not null and trim(company_name) <> ''
on conflict (name) do nothing;

-- 8) Migrate: create memberships from profiles -> companies
insert into public.company_members (company_id, user_id, role)
select c.id, p.id, 'member'::public.company_role
from public.profiles p
join public.companies c on c.name = trim(p.company_name)
on conflict (company_id, user_id) do nothing;

-- 9) Backfill support_calls.company_id from membership
update public.support_calls sc
set company_id = cm.company_id
from public.company_members cm
where sc.user_id = cm.user_id
  and sc.company_id is null;

-- 10) Trigger to auto-apply company_id from the caller's membership on INSERT when not provided
create or replace function public.set_support_call_company_id()
returns trigger
language plpgsql
as $function$
begin
  if new.company_id is null then
    select cm.company_id into new.company_id
    from public.company_members cm
    where cm.user_id = new.user_id
    order by cm.created_at asc
    limit 1;
  end if;
  return new;
end;
$function$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_company_id_before_insert'
      and tgrelid = 'public.support_calls'::regclass
  ) then
    create trigger set_company_id_before_insert
    before insert on public.support_calls
    for each row execute function public.set_support_call_company_id();
  end if;
end$$;

-- 11) Support_calls policies: authorize by company membership, plus safe fallback for rows without company_id
drop policy if exists "Users can create their own calls" on public.support_calls;
drop policy if exists "Users can delete their own calls" on public.support_calls;
drop policy if exists "Users can update their own calls" on public.support_calls;
drop policy if exists "Users can view their own calls" on public.support_calls;

-- SELECT: members of the company can see rows; also allow creator to see own legacy rows (company_id is null)
create policy "Members can view company calls"
on public.support_calls
for select
to authenticated
using (
  (company_id is not null and public.is_company_member(company_id))
  or (company_id is null and auth.uid() = user_id)
);

-- INSERT: must be the creator, and either provide a company they belong to or let the trigger set it
create policy "Members can create company calls"
on public.support_calls
for insert
to authenticated
with check (
  auth.uid() = user_id
  and (company_id is null or public.is_company_member(company_id))
);

-- UPDATE: allow any company member (or the original creator for legacy rows)
create policy "Members can update company calls"
on public.support_calls
for update
to authenticated
using (
  (company_id is not null and public.is_company_member(company_id))
  or (company_id is null and auth.uid() = user_id)
);

-- DELETE: keep strict to creator only
create policy "Users can delete their own calls (strict)"
on public.support_calls
for delete
to authenticated
using (auth.uid() = user_id);

-- 12) Optional: keep company_id nullable for now to avoid blocking legacy rows.
-- We will enforce NOT NULL later once all rows and flows set company_id correctly.
-- If you want to enforce now and you're sure data is clean, uncomment:
-- alter table public.support_calls alter column company_id set not null;

-- 13) Quotes table (for "Quotes requested" on dashboard)
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  requested_by uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'requested',
  amount_cents integer,
  currency text not null default 'ZAR',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.quotes enable row level security;

drop policy if exists "Members can view company quotes" on public.quotes;
create policy "Members can view company quotes"
on public.quotes
for select
to authenticated
using (public.is_company_member(company_id));

drop policy if exists "Members can create company quotes" on public.quotes;
create policy "Members can create company quotes"
on public.quotes
for insert
to authenticated
with check (auth.uid() = requested_by and public.is_company_member(company_id));

drop policy if exists "Members can update company quotes" on public.quotes;
create policy "Members can update company quotes"
on public.quotes
for update
to authenticated
using (public.is_company_member(company_id));

drop policy if exists "Users can delete their own quotes" on public.quotes;
create policy "Users can delete their own quotes"
on public.quotes
for delete
to authenticated
using (auth.uid() = requested_by);
