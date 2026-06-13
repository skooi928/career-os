-- Update all existing organisation memberships to APPROVED status since approval is now automatic
UPDATE public.organisation_members SET status = 'APPROVED' WHERE status = 'PENDING';
