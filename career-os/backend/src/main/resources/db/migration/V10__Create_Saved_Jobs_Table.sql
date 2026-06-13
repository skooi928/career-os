-- Create Saved Jobs Table
CREATE TABLE IF NOT EXISTS public.saved_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_job UNIQUE(user_id, job_id)
);
