-- Create quick_tasks table
CREATE TABLE IF NOT EXISTS dbo.quick_tasks (
    id BIGSERIAL PRIMARY KEY,
    user_profile_id BIGINT NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_profile_id) REFERENCES dbo.user_profiles(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_quick_tasks_user_profile_id ON dbo.quick_tasks(user_profile_id);
