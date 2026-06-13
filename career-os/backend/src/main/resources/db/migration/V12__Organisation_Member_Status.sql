-- Add status column to organisation_members
ALTER TABLE public.organisation_members ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'APPROVED';
