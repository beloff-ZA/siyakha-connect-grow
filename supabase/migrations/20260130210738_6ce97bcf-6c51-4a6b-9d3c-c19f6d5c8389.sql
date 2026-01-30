-- Create jobs table for job postings
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT 'Remote / South Africa',
  department TEXT NOT NULL,
  employment_type TEXT NOT NULL DEFAULT 'Full-time',
  description TEXT NOT NULL,
  requirements TEXT[] NOT NULL DEFAULT '{}',
  benefits TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create job_applications table
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  cv_url TEXT NOT NULL,
  cover_letter TEXT,
  years_experience INTEGER,
  current_employer TEXT,
  linkedin_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Jobs are publicly readable (anyone can view job listings)
CREATE POLICY "Anyone can view active jobs"
ON public.jobs FOR SELECT
USING (is_active = true);

-- Applications can be inserted by anyone (public application form)
CREATE POLICY "Anyone can submit job applications"
ON public.job_applications FOR INSERT
WITH CHECK (true);

-- Applications can only be read by admins (we'll handle admin check via edge function)
-- For now, no direct read access - admin portal will use service role via edge function

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_jobs_updated_at
BEFORE UPDATE ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
BEFORE UPDATE ON public.job_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for CVs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('cvs', 'cvs', false, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);

-- Storage policies for CV uploads - anyone can upload, only service role can read
CREATE POLICY "Anyone can upload CVs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'cvs');

-- Admins can view CVs (using service role in edge function)
-- No public read access to protect applicant privacy

-- Insert the Sales Rep job posting
INSERT INTO public.jobs (
  title,
  location,
  department,
  employment_type,
  description,
  requirements,
  benefits
) VALUES (
  'Sales Representative - ICT Solutions',
  'Johannesburg / Remote (Own Vehicle Required)',
  'Sales',
  'Full-time (Commission + Basic)',
  'We''re looking for an enthusiastic and driven Sales Representative to join our growing team. This role is ideal for a self-motivated individual with a proven track record in ICT sales, particularly within the education, SMME, and private sectors. You''ll be responsible for building relationships with schools, small businesses, and enterprise clients while driving revenue growth for our comprehensive ICT solutions portfolio.',
  ARRAY[
    '5+ years sales experience in ICT-related sales',
    'Proven track record working with schools and education sector',
    'Experience selling to SMMEs and private sector clients',
    'Own reliable vehicle (essential)',
    'Self-driven and goal-oriented individual',
    'Excellent communication and presentation skills',
    'Ability to work independently from home',
    'Understanding of networking, security, and cloud solutions (advantageous)'
  ],
  ARRAY[
    'Competitive basic salary plus commission structure',
    'Work from home flexibility',
    'Company laptop and phone',
    'Petrol allowance for client visits',
    'Growth opportunities within the company',
    'Training on our full ICT solutions portfolio'
  ]
);