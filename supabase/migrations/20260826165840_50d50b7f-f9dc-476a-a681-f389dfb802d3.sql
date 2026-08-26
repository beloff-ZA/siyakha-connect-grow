CREATE TABLE public.portal_solution_options (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.portal_projects(id) on delete cascade,
  boq_id uuid references public.portal_boqs(id) on delete set null,
  code text not null,
  name text not null,
  quote_reference text,
  badge text,
  comparison_label text,
  positioning text,
  summary text,
  price_ex_vat numeric not null default 0,
  vat_rate numeric not null default 15,
  vat_amount numeric not null default 0,
  total_incl_vat numeric not null default 0,
  deposit_incl_vat numeric,
  balance_incl_vat numeric,
  status text not null default 'draft',
  client_visible boolean not null default false,
  sort_order integer not null default 0,
  highlights jsonb not null default '[]'::jsonb,
  technical_notes jsonb not null default '[]'::jsonb,
  exclusions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, code)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_solution_options TO authenticated;
GRANT ALL ON public.portal_solution_options TO service_role;
ALTER TABLE public.portal_solution_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins manage solution options" ON public.portal_solution_options
  FOR ALL TO authenticated USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());
CREATE POLICY "clients read visible solution options" ON public.portal_solution_options
  FOR SELECT TO authenticated
  USING (private.portal_can_read_project(project_id) AND client_visible AND status <> 'draft');

CREATE TRIGGER portal_solution_options_updated_at BEFORE UPDATE ON public.portal_solution_options
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.portal_option_preferences (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.portal_projects(id) on delete cascade,
  option_id uuid not null references public.portal_solution_options(id) on delete cascade,
  share_link_id uuid references public.portal_share_links(id) on delete set null,
  viewer_id uuid references public.portal_deck_viewers(id) on delete set null,
  full_name text,
  email text,
  note text,
  selected_at timestamptz not null default now()
);

GRANT SELECT ON public.portal_option_preferences TO authenticated;
GRANT ALL ON public.portal_option_preferences TO service_role;
ALTER TABLE public.portal_option_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read option preferences" ON public.portal_option_preferences
  FOR SELECT TO authenticated USING (private.portal_is_admin());

CREATE INDEX portal_option_preferences_project_idx ON public.portal_option_preferences (project_id, selected_at DESC);