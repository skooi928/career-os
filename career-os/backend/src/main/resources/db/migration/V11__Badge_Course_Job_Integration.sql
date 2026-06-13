-- ─────────────────────────────────────────────────────────────────────────────
-- V11: Badge ↔ Course ↔ Job integration
--
-- 1. courses.badge_id          → which badge is awarded on completion
-- 2. user_badges.awarded_by_course_id → traceability (auto vs manual)
-- 3. job_required_badges       → skills/badges a job requires
-- 4. job_application_badges    → badges a candidate attaches to an application
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Link a course to the badge it awards (nullable → not every course awards a badge)
ALTER TABLE courses
    ADD COLUMN IF NOT EXISTS badge_id UUID REFERENCES badges(id) ON DELETE SET NULL;

-- 2. Track which course auto-awarded a user_badge (null = manually issued)
ALTER TABLE user_badges
    ADD COLUMN IF NOT EXISTS awarded_by_course_id UUID REFERENCES courses(id) ON DELETE SET NULL;

-- Unique constraint: one auto-award per (user, course) – prevent duplicates on re-run
DO $$ BEGIN
    ALTER TABLE user_badges
        ADD CONSTRAINT uq_user_badge_course
        UNIQUE (user_id, badge_id, awarded_by_course_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Badges/skill-tags required by a job posting
CREATE TABLE IF NOT EXISTS job_required_badges (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id       UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    badge_id     UUID REFERENCES badges(id) ON DELETE CASCADE,
    skill_tag    VARCHAR(255),
    is_required  BOOLEAN NOT NULL DEFAULT FALSE,  -- FALSE = preferred, TRUE = mandatory
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_badge_or_skill CHECK (badge_id IS NOT NULL OR skill_tag IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_job_required_badges_job ON job_required_badges(job_id);
CREATE INDEX IF NOT EXISTS idx_job_required_badges_badge ON job_required_badges(badge_id);

-- 4. Badges a candidate includes with their application (snapshot at apply time)
CREATE TABLE IF NOT EXISTS job_application_badges (
    application_id  UUID NOT NULL REFERENCES job_applications(application_id) ON DELETE CASCADE,
    user_badge_id   UUID NOT NULL REFERENCES user_badges(id) ON DELETE CASCADE,
    PRIMARY KEY (application_id, user_badge_id)
);

CREATE INDEX IF NOT EXISTS idx_app_badges_app ON job_application_badges(application_id);
