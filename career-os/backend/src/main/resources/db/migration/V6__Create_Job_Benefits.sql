-- Create Job Benefits table
CREATE TABLE IF NOT EXISTS public.job_benefits (
  benefit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  benefit_text TEXT NOT NULL
);
