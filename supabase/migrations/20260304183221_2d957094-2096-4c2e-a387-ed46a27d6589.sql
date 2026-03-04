
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS verified text DEFAULT 'unreviewed',
ADD COLUMN IF NOT EXISTS flagged_reason text,
ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
ADD COLUMN IF NOT EXISTS company_size text,
ADD COLUMN IF NOT EXISTS budget_range text;
