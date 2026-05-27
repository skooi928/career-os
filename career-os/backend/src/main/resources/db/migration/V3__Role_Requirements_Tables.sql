-- Refactor Jobs table to remove duplicates
ALTER TABLE public.jobs DROP COLUMN IF EXISTS seniority_level;
ALTER TABLE public.jobs DROP COLUMN IF EXISTS skills;
ALTER TABLE public.jobs DROP COLUMN IF EXISTS description;

-- Create Role Requirement table
CREATE TABLE IF NOT EXISTS public.role_requirements (
  requirement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  seniority_level VARCHAR(100) NOT NULL,
  required_experience_years INTEGER NOT NULL,
  job_description TEXT
);

-- Create Role Skill Requirement table
CREATE TABLE IF NOT EXISTS public.role_skill_requirements (
  role_skill_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_id UUID NOT NULL REFERENCES public.role_requirements(requirement_id) ON DELETE CASCADE,
  skill_text VARCHAR(255) NOT NULL
);
