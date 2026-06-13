-- V4__Create_Resume_Extended_Tables.sql
-- Summary == bio in user_profiles

-- CGPA + grades extension for education (add columns to existing table)
ALTER TABLE dbo.education
  ADD COLUMN IF NOT EXISTS cgpa VARCHAR(20),
  ADD COLUMN IF NOT EXISTS grades VARCHAR(100),
  ADD COLUMN IF NOT EXISTS minor VARCHAR(255);

-- Responsibilities extension for experience (add column to existing table)
ALTER TABLE dbo.experience
  ADD COLUMN IF NOT EXISTS responsibilities TEXT[];

-- Human languages (no equivalent in V2)
CREATE TABLE IF NOT EXISTS dbo.resume_languages (
  id           BIGSERIAL PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         VARCHAR(100) NOT NULL,
  proficiency  VARCHAR(50),
  raw_score    VARCHAR(50),
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);

-- Awards (no equivalent in V2)
CREATE TABLE IF NOT EXISTS dbo.resume_awards (
  id           BIGSERIAL PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        VARCHAR(500) NOT NULL,
  issuer       VARCHAR(255),
  year         VARCHAR(20),
  level        VARCHAR(100),
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);

-- Activities / co-curricular (no equivalent in V2)
CREATE TABLE IF NOT EXISTS dbo.resume_activities (
  id           BIGSERIAL PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        VARCHAR(500),
  organization VARCHAR(255),
  role         VARCHAR(255),
  year         VARCHAR(20),
  duration     VARCHAR(100),
  description  TEXT,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);

-- Certifications (no equivalent in V2)
CREATE TABLE IF NOT EXISTS dbo.resume_certifications (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          VARCHAR(255) NOT NULL,
  issuer        VARCHAR(255),
  year          VARCHAR(20),
  expiry        VARCHAR(20),
  credential_id VARCHAR(255),
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- References (no equivalent in V2)
CREATE TABLE IF NOT EXISTS dbo.resume_references (
  id           BIGSERIAL PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         VARCHAR(255),
  title        VARCHAR(255),
  organization VARCHAR(255),
  email        VARCHAR(255),
  phone        VARCHAR(50),
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_resume_languages_user_id  ON dbo.resume_languages(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_awards_user_id     ON dbo.resume_awards(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_activities_user_id ON dbo.resume_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_certifications_user_id ON dbo.resume_certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_references_user_id ON dbo.resume_references(user_id);

-- Row Level Security
ALTER TABLE dbo.resume_languages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE dbo.resume_awards        ENABLE ROW LEVEL SECURITY;
ALTER TABLE dbo.resume_activities    ENABLE ROW LEVEL SECURITY;
ALTER TABLE dbo.resume_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE dbo.resume_references    ENABLE ROW LEVEL SECURITY;