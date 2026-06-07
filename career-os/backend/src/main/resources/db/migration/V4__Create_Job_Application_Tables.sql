-- Create Job Questions Table
CREATE TABLE IF NOT EXISTS public.job_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL
);

-- Create Job Question Options Table
CREATE TABLE IF NOT EXISTS public.job_question_options (
    job_question_id UUID NOT NULL REFERENCES public.job_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL
);

-- Create Job Applications Table
CREATE TABLE IF NOT EXISTS public.job_applications (
    application_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL,
    resume_url VARCHAR(1024),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Job Application Answers Table
CREATE TABLE IF NOT EXISTS public.job_application_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_application_id UUID NOT NULL REFERENCES public.job_applications(application_id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.job_questions(id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL
);

-- Create triggers to update updated_at timestamp
CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON public.job_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
