-- Create companies table for company management
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  billing_email TEXT,
  phone TEXT,
  address TEXT,
  vat_number TEXT,
  logo_url TEXT,
  company_type TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create company_members table
CREATE TABLE public.company_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tickets table for support tickets
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  created_by_user_id UUID NOT NULL,
  channel TEXT NOT NULL DEFAULT 'portal',
  summary TEXT NOT NULL,
  details TEXT,
  service_category_id TEXT,
  priority TEXT NOT NULL DEFAULT 'normal',
  location TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  tracking_ref TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ticket_messages table
CREATE TABLE public.ticket_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
  direction TEXT NOT NULL,
  channel TEXT,
  to_from TEXT,
  subject TEXT,
  body TEXT,
  status TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for role-based access
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user', 'siyakha_admin');

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Users can view companies they belong to"
ON public.companies FOR SELECT
USING (
  id IN (
    SELECT company_id FROM public.company_members WHERE user_id = auth.uid()
  )
);

-- Company members policies
CREATE POLICY "Users can view their own memberships"
ON public.company_members FOR SELECT
USING (user_id = auth.uid());

-- Tickets policies
CREATE POLICY "Users can view their own tickets"
ON public.tickets FOR SELECT
USING (created_by_user_id = auth.uid());

CREATE POLICY "Users can create their own tickets"
ON public.tickets FOR INSERT
WITH CHECK (created_by_user_id = auth.uid());

-- Ticket messages policies
CREATE POLICY "Users can view messages on their tickets"
ON public.ticket_messages FOR SELECT
USING (
  ticket_id IN (
    SELECT id FROM public.tickets WHERE created_by_user_id = auth.uid()
  )
);

-- User roles policies (for admin check)
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (user_id = auth.uid());

-- Create has_role function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Triggers for updated_at
CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at
BEFORE UPDATE ON public.tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();