-- Blog views per-user and public notes

-- 1) Table: blog_views
create table if not exists public.blog_views (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  user_key text not null,
  count integer not null default 0,
  first_view_at timestamptz not null default now(),
  last_view_at timestamptz not null default now(),
  unique (path, user_key)
);
alter table public.blog_views enable row level security;

create index if not exists blog_views_path_idx on public.blog_views(path);

-- RLS: allow public read/insert/update (no delete) – minimal for public counter
create policy if not exists "blog_views_select_all" on public.blog_views
for select using (true);

create policy if not exists "blog_views_insert_all" on public.blog_views
for insert with check (true);

create policy if not exists "blog_views_update_all" on public.blog_views
for update using (true) with check (true);

-- Trigger to maintain last_view_at on update
create or replace function public.set_last_view_at()
returns trigger language plpgsql as $$
begin
  new.last_view_at = now();
  return new;
end; $$;

drop trigger if exists blog_views_set_last on public.blog_views;
create trigger blog_views_set_last
before update on public.blog_views
for each row execute procedure public.set_last_view_at();

-- 2) RPC to increment per-user counter and return totals
create or replace function public.increment_blog_view(p_path text, p_user_key text)
returns table (user_count integer, total_count integer)
language plpgsql
as $$
begin
  -- upsert per-user counter
  insert into public.blog_views(path, user_key, count)
  values (p_path, p_user_key, 1)
  on conflict (path, user_key)
  do update set count = public.blog_views.count + 1, last_view_at = now();

  return query
  select
    (select count from public.blog_views where path = p_path and user_key = p_user_key) as user_count,
    (select coalesce(sum(count),0) from public.blog_views where path = p_path) as total_count;
end; $$;

-- 3) Table: blog_notes
create table if not exists public.blog_notes (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  user_key text not null,
  name text,
  note text not null,
  approved boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.blog_notes enable row level security;

create index if not exists blog_notes_path_idx on public.blog_notes(path);

-- RLS: select only approved notes; anyone can insert
create policy if not exists "blog_notes_select_approved" on public.blog_notes
for select using (approved = true);

create policy if not exists "blog_notes_insert_all" on public.blog_notes
for insert with check (true);

-- Admin/Management can update/delete notes
create policy if not exists "blog_notes_admin_update" on public.blog_notes
for update to authenticated
using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'management'))
with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'management'));

create policy if not exists "blog_notes_admin_delete" on public.blog_notes
for delete to authenticated
using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'management'));
