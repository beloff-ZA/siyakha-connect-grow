-- Create profiles table for user/company info
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  company_name text,
  avatar_url text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies (user can only access their own profile)
drop policy if exists "Profiles are viewable by the user" on public.profiles;
create policy "Profiles are viewable by the user"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles
  for update
  using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

-- Trigger to keep updated_at fresh
drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

-- Seed a profile automatically whenever a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, display_name, company_name, avatar_url, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email,'@',1)),
    new.raw_user_meta_data ->> 'company',
    null,
    null
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Attach trigger to auth.users to auto-create profiles
-- Note: this operates on Supabase-managed schema `auth` which is allowed for this standard trigger pattern
-- It will not modify any rows in auth, only reacts to inserts
-- Drop existing if any to avoid conflicts
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();