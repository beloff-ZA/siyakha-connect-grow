-- Phase 5: extend the EXISTING project documents table with drawing-pack control.
alter table public.portal_documents
  add column if not exists technician_visible boolean not null default false,
  add column if not exists floor_id uuid references public.portal_floors(id) on delete set null,
  add column if not exists is_current boolean not null default true,
  add column if not exists archived boolean not null default false;

create index if not exists portal_documents_project_current_idx
  on public.portal_documents (project_id, archived, is_current);
