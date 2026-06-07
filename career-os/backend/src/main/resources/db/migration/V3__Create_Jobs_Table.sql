-- Create Jobs Table

CREATE TABLE IF NOT EXISTS dbo.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  initials VARCHAR(10) NOT NULL,
  location VARCHAR(255) NOT NULL,
  employment_type VARCHAR(100) NOT NULL,
  seniority_level VARCHAR(100) NOT NULL,
  min_salary INTEGER NOT NULL,
  max_salary INTEGER NOT NULL,
  skills TEXT NOT NULL,
  deadline VARCHAR(50) NOT NULL,
  vacancies INTEGER NOT NULL,
  description TEXT,
  website VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a trigger to automatically update the updated_at timestamp
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (optional but recommended)
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
