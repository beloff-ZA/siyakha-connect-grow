-- 1) Helper: check if current user is an admin of a company
create or replace function public.is_company_admin(_company_id uuid, _user_id uuid default auth.uid())
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
      and role = 'admin'::company_role
  );
$$;

-- 2) Ensure no duplicate memberships
create unique index if not exists uq_company_members_company_id_user_id
  on public.company_members(company_id, user_id);

-- 3) Admin-only: add an existing user by email to a company
create or replace function public.add_company_member_by_email(_company_id uuid, _email text, _role company_role default 'member')
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  _uid uuid;
begin
  if not public.is_company_admin(_company_id) then
    raise exception 'Only company admins can add members' using errcode = '42501';
  end if;

  select id into _uid
  from auth.users
  where lower(email) = lower(_email)
  limit 1;

  if _uid is null then
    raise exception 'No user found with that email. Ask them to sign up first, then add them.' using errcode = '22023';
  end if;

  insert into public.company_members (company_id, user_id, role)
  values (_company_id, _uid, _role)
  on conflict (company_id, user_id) do nothing;
end;
$$;

-- 4) Admin-only: remove a member (cannot remove yourself)
create or replace function public.remove_company_member(_company_id uuid, _member_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_company_admin(_company_id) then
    raise exception 'Only company admins can remove members' using errcode = '42501';
  end if;

  if _member_id = auth.uid() then
    raise exception 'You cannot remove yourself; assign another admin first.' using errcode = '22023';
  end if;

  delete from public.company_members
  where company_id = _company_id and user_id = _member_id;
end;
$$;

-- 5) Admin-only: change a member’s role
create or replace function public.set_company_member_role(_company_id uuid, _member_id uuid, _role company_role)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_company_admin(_company_id) then
    raise exception 'Only company admins can change roles' using errcode = '42501';
  end if;

  update public.company_members
  set role = _role
  where company_id = _company_id and user_id = _member_id;
end;
$$;

-- 6) Ensure creator is auto-added as admin on new companies (trigger)
create or replace function public.add_creator_as_company_admin()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  _uid uuid;
begin
  _uid := auth.uid();
  if _uid is null then
    return new; -- skip when not in auth context
  end if;
  insert into public.company_members (company_id, user_id, role)
  values (new.id, _uid, 'admin')
  on conflict do nothing;
  return new;
end;
$function$;

drop trigger if exists on_companies_add_creator_as_company_admin on public.companies;
create trigger on_companies_add_creator_as_company_admin
after insert on public.companies
for each row execute function public.add_creator_as_company_admin();

-- 7) Ensure support_calls.company_id defaults from caller’s earliest membership (trigger)
create or replace function public.set_support_call_company_id()
returns trigger
language plpgsql
set search_path = public, pg_temp
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

drop trigger if exists before_insert_support_calls_set_company on public.support_calls;
create trigger before_insert_support_calls_set_company
before insert on public.support_calls
for each row execute function public.set_support_call_company_id();

-- 8) Ensure profiles are auto-created on auth.users insert (trigger)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
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
$function$;

drop trigger if exists on_auth_user_created_handle_new_user on auth.users;
create trigger on_auth_user_created_handle_new_user
after insert on auth.users
for each row execute function public.handle_new_user();