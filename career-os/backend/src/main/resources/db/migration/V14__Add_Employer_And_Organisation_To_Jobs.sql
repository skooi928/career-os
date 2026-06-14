-- Migration to add employer_id and organisation_id columns to jobs table
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS employer_id UUID;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS organisation_id UUID;
