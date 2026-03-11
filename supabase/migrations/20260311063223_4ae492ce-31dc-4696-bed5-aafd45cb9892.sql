
-- Notes table
CREATE TABLE public.director_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  content text,
  category text DEFAULT 'general',
  is_pinned boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.director_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins full access director_notes" ON public.director_notes FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'siyakha_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'siyakha_admin'::app_role));

-- Future projects table
CREATE TABLE public.future_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  client text,
  description text,
  estimated_value numeric DEFAULT 0,
  target_date date,
  status text NOT NULL DEFAULT 'idea',
  priority text NOT NULL DEFAULT 'medium',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.future_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins full access future_projects" ON public.future_projects FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'siyakha_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'siyakha_admin'::app_role));

-- Site performance updates
CREATE TABLE public.site_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  client_name text NOT NULL,
  site_name text NOT NULL,
  update_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'operational',
  uptime_percent numeric DEFAULT 100,
  notes text,
  issues text,
  next_review date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_performance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins full access site_performance" ON public.site_performance FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'siyakha_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'siyakha_admin'::app_role));

-- Customers table
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_person text,
  email text,
  phone text,
  address text,
  industry text,
  contract_type text DEFAULT 'ad-hoc',
  monthly_value numeric DEFAULT 0,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins full access customers" ON public.customers FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'siyakha_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'siyakha_admin'::app_role));

-- Suppliers table
CREATE TABLE public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_person text,
  email text,
  phone text,
  address text,
  category text DEFAULT 'general',
  account_number text,
  payment_terms text,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins full access suppliers" ON public.suppliers FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'siyakha_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'siyakha_admin'::app_role));

-- Internet providers table
CREATE TABLE public.internet_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_person text,
  email text,
  phone text,
  website text,
  coverage_areas text,
  account_manager text,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.internet_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins full access internet_providers" ON public.internet_providers FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'siyakha_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'siyakha_admin'::app_role));

-- VoIP providers table
CREATE TABLE public.voip_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_person text,
  email text,
  phone text,
  website text,
  services text,
  account_manager text,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.voip_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins full access voip_providers" ON public.voip_providers FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'siyakha_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'siyakha_admin'::app_role));

-- Packages table
CREATE TABLE public.packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_type text NOT NULL DEFAULT 'internet',
  provider_id uuid,
  provider_name text NOT NULL,
  package_name text NOT NULL,
  package_type text DEFAULT 'service',
  speed text,
  price numeric DEFAULT 0,
  billing_cycle text DEFAULT 'monthly',
  description text,
  customer_id uuid,
  customer_name text,
  status text DEFAULT 'active',
  contract_start date,
  contract_end date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins full access packages" ON public.packages FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'siyakha_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'siyakha_admin'::app_role));
