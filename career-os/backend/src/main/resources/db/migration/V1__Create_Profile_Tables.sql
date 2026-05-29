-- Create user_profiles table
CREATE TABLE IF NOT EXISTS dbo.user_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    phone TEXT,
    location TEXT,
    bio TEXT,
    profile_image_url TEXT,
    supabase_uid VARCHAR(255) UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create experience table
CREATE TABLE IF NOT EXISTS dbo.experience (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID,
    supabase_uid VARCHAR(255),
    job_title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create education table
CREATE TABLE IF NOT EXISTS dbo.education (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID,
    supabase_uid VARCHAR(255),
    degree VARCHAR(255) NOT NULL,
    institution VARCHAR(255) NOT NULL,
    field VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create projects table
CREATE TABLE IF NOT EXISTS dbo.projects (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID,
    supabase_uid VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    technologies TEXT,
    link TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create skills table
CREATE TABLE IF NOT EXISTS dbo.skills (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID,
    supabase_uid VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    proficiency VARCHAR(50) NOT NULL,
    endorsed INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON dbo.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_supabase_uid ON dbo.user_profiles(supabase_uid);
CREATE INDEX IF NOT EXISTS idx_user_profiles_first_name ON dbo.user_profiles(first_name);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_name ON dbo.user_profiles(last_name);
CREATE INDEX IF NOT EXISTS idx_experience_user_id ON dbo.experience(user_id);
CREATE INDEX IF NOT EXISTS idx_experience_supabase_uid ON dbo.experience(supabase_uid);
CREATE INDEX IF NOT EXISTS idx_education_user_id ON dbo.education(user_id);
CREATE INDEX IF NOT EXISTS idx_education_supabase_uid ON dbo.education(supabase_uid);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON dbo.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_supabase_uid ON dbo.projects(supabase_uid);
CREATE INDEX IF NOT EXISTS idx_skills_user_id ON dbo.skills(user_id);
CREATE INDEX IF NOT EXISTS idx_skills_supabase_uid ON dbo.skills(supabase_uid);