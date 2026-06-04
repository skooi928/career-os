-- Step 1: Add a new role column to user_profiles table
ALTER TABLE dbo.user_profiles ADD COLUMN role VARCHAR(50) DEFAULT 'candidate';

-- Step 2: Create a new table named dbo.candidates
CREATE TABLE IF NOT EXISTS dbo.candidates (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Step 3: Create a new table named dbo.employers
CREATE TABLE IF NOT EXISTS dbo.employers (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Step 4: Create a new table named dbo.mentors
CREATE TABLE IF NOT EXISTS dbo.mentors (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Insert existing users into candidates table (assuming they are all candidates for now)
INSERT INTO dbo.candidates (user_id)
SELECT DISTINCT user_id FROM dbo.user_profiles WHERE user_id IS NOT NULL;
