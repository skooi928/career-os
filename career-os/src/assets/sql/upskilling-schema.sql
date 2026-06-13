-- =============================================================================
-- Career-OS Upskilling Module — PostgreSQL Schema for Supabase
-- Run in Supabase SQL Editor
-- =============================================================================

-- ─── ENUM types ──────────────────────────────────────────────────────────────

CREATE TYPE org_type AS ENUM ('INDUSTRY', 'UNIVERSITY');
CREATE TYPE verification_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
CREATE TYPE org_member_role AS ENUM ('ORG_ADMIN', 'HR', 'MENTOR', 'REVIEWER');
CREATE TYPE difficulty_level AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
CREATE TYPE enrollment_status AS ENUM ('IN_PROGRESS', 'COMPLETED', 'DROPPED');
CREATE TYPE badge_verification_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
CREATE TYPE conversion_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- ─── Tables ───────────────────────────────────────────────────────────────────

CREATE TABLE organisations (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                      TEXT NOT NULL,
  type                      org_type NOT NULL,
  logo_url                  TEXT,
  website                   TEXT,
  description               TEXT,
  email_domain              TEXT,
  verification_status       verification_status NOT NULL DEFAULT 'PENDING',
  verification_document_url TEXT,
  verified_at               TIMESTAMPTZ,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE organisation_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            org_member_role NOT NULL DEFAULT 'MENTOR',
  invited_by      UUID REFERENCES auth.users(id),
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organisation_id, user_id)
);

CREATE TABLE badges (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  badge_image_url TEXT,
  skill_tag       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE courses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  category        TEXT,
  difficulty_level difficulty_level NOT NULL DEFAULT 'BEGINNER',
  duration_hours  INTEGER,
  is_published    BOOLEAN NOT NULL DEFAULT FALSE,
  badge_id        UUID REFERENCES badges(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE course_enrollments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id           UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  completion_status   enrollment_status NOT NULL DEFAULT 'IN_PROGRESS',
  enrolled_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at        TIMESTAMPTZ,
  UNIQUE (user_id, course_id)
);

CREATE TABLE user_badges (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id            UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  verification_status badge_verification_status NOT NULL DEFAULT 'PENDING',
  issued_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, badge_id)
);

CREATE TABLE university_course_conversion (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  university_name       TEXT NOT NULL,
  course_name           TEXT NOT NULL,
  uploaded_document_url TEXT,
  mapped_badge_id       UUID REFERENCES badges(id) ON DELETE SET NULL,
  status                conversion_status NOT NULL DEFAULT 'PENDING',
  reviewed_by           UUID REFERENCES auth.users(id),
  reviewed_at           TIMESTAMPTZ,
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX idx_org_members_user    ON organisation_members(user_id);
CREATE INDEX idx_org_members_org     ON organisation_members(organisation_id);
CREATE INDEX idx_courses_org         ON courses(organisation_id);
CREATE INDEX idx_courses_published   ON courses(is_published);
CREATE INDEX idx_enrollments_user    ON course_enrollments(user_id);
CREATE INDEX idx_enrollments_course  ON course_enrollments(course_id);
CREATE INDEX idx_user_badges_user    ON user_badges(user_id);
CREATE INDEX idx_conversions_user    ON university_course_conversion(user_id);
CREATE INDEX idx_conversions_status  ON university_course_conversion(status);

-- ─── Helper functions ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION is_org_admin(org_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM organisation_members
    WHERE organisation_id = org_id
      AND user_id = auth.uid()
      AND role = 'ORG_ADMIN'
  );
$$;

CREATE OR REPLACE FUNCTION is_org_member(org_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM organisation_members
    WHERE organisation_id = org_id
      AND user_id = auth.uid()
  );
$$;

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE organisations              ENABLE ROW LEVEL SECURITY;
ALTER TABLE organisation_members       ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges                ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_course_conversion ENABLE ROW LEVEL SECURITY;

-- organisations
CREATE POLICY "Public can view verified orgs"     ON organisations FOR SELECT USING (verification_status = 'VERIFIED');
CREATE POLICY "Members can view their orgs"       ON organisations FOR SELECT USING (is_org_member(id));
CREATE POLICY "Authenticated can create org"      ON organisations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admin can update org"              ON organisations FOR UPDATE USING (is_org_admin(id));

-- organisation_members
CREATE POLICY "Members can view org members"      ON organisation_members FOR SELECT USING (is_org_member(organisation_id));
CREATE POLICY "Admin can manage members"          ON organisation_members FOR ALL USING (is_org_admin(organisation_id));
CREATE POLICY "Can join own org"                  ON organisation_members FOR INSERT WITH CHECK (user_id = auth.uid());

-- courses
CREATE POLICY "Public can view published courses" ON courses FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Members can view org courses"      ON courses FOR SELECT USING (is_org_member(organisation_id));
CREATE POLICY "Members can manage courses"        ON courses FOR ALL USING (is_org_member(organisation_id));

-- course_enrollments
CREATE POLICY "Users see own enrollments"         ON course_enrollments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can enroll"                  ON course_enrollments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own enrollment"   ON course_enrollments FOR UPDATE USING (user_id = auth.uid());

-- badges
CREATE POLICY "Anyone can view badges"            ON badges FOR SELECT USING (TRUE);
CREATE POLICY "Members can manage org badges"     ON badges FOR ALL USING (is_org_member(organisation_id));

-- user_badges
CREATE POLICY "Public user badges viewable"       ON user_badges FOR SELECT USING (TRUE);
CREATE POLICY "Org members can issue badges"      ON user_badges FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- university_course_conversion
CREATE POLICY "Users see own conversions"         ON university_course_conversion FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can submit conversions"      ON university_course_conversion FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Reviewers can view all pending"    ON university_course_conversion FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Reviewers can update conversions"  ON university_course_conversion FOR UPDATE USING (auth.uid() IS NOT NULL);

-- ─── Storage Buckets ─────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public) VALUES
  ('badges', 'badges', TRUE),
  ('certificates', 'certificates', FALSE),
  ('organisation-verification', 'organisation-verification', FALSE);

-- ─── Seed Data ────────────────────────────────────────────────────────────────

INSERT INTO organisations (name, type, description, website, verification_status) VALUES
  ('TechCorp Malaysia', 'INDUSTRY', 'Leading software engineering company', 'https://techcorp.my', 'VERIFIED'),
  ('CloudVentures Sdn Bhd', 'INDUSTRY', 'Cloud infrastructure and DevOps specialists', 'https://cloudventures.my', 'VERIFIED'),
  ('Universiti Teknologi Malaysia', 'UNIVERSITY', 'Top engineering university in Malaysia', 'https://utm.my', 'VERIFIED');

INSERT INTO badges (organisation_id, name, description, skill_tag)
SELECT id, 'Full Stack Developer', 'Proficiency in full-stack web development', 'Web Development'
FROM organisations WHERE name = 'TechCorp Malaysia';

INSERT INTO badges (organisation_id, name, description, skill_tag)
SELECT id, 'Cloud Architect', 'AWS/Azure cloud architecture expertise', 'Cloud Computing'
FROM organisations WHERE name = 'CloudVentures Sdn Bhd';

INSERT INTO badges (organisation_id, name, description, skill_tag)
SELECT id, 'DevOps Engineer', 'CI/CD pipelines and containerisation', 'DevOps'
FROM organisations WHERE name = 'CloudVentures Sdn Bhd';

INSERT INTO badges (organisation_id, name, description, skill_tag)
SELECT id, 'Software Engineering Graduate', 'UTM BSc Software Engineering completion', 'Software Engineering'
FROM organisations WHERE name = 'Universiti Teknologi Malaysia';
