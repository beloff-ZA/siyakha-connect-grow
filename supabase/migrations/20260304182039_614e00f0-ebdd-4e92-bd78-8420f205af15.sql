
-- Projects pipeline table
CREATE TABLE public.director_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  client text,
  status text NOT NULL DEFAULT 'pipeline',
  priority text NOT NULL DEFAULT 'medium',
  estimated_value numeric(12,2) DEFAULT 0,
  start_date date,
  due_date date,
  description text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.director_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access director_projects" ON public.director_projects
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'siyakha_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'siyakha_admin'::app_role));

-- Costs / expenses table
CREATE TABLE public.director_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'general',
  vendor text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  project_id uuid REFERENCES public.director_projects(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.director_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access director_costs" ON public.director_costs
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'siyakha_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'siyakha_admin'::app_role));
