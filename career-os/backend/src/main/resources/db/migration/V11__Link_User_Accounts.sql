-- Add linked_user_id to user_profiles for account binding
ALTER TABLE dbo.user_profiles ADD COLUMN linked_user_id UUID NULL;
ALTER TABLE dbo.user_profiles ADD CONSTRAINT fk_user_profiles_linked_user_id FOREIGN KEY (linked_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
