-- Enum for company types
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'company_type') THEN
    CREATE TYPE public.company_type AS ENUM (
      'msp','isp','school','enterprise','government','healthcare','hospitality','retail','nonprofit','manufacturing','finance','other'
    );
  END IF;
END $$;

-- Add column to companies table if not exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'company_type'
  ) THEN
    ALTER TABLE public.companies ADD COLUMN company_type public.company_type NULL;
  END IF;
END $$;

-- Optional: comment for documentation
COMMENT ON COLUMN public.companies.company_type IS 'Type/category of the company (e.g., MSP, ISP, school, etc.)';