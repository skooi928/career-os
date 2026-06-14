-- =============================================================================
-- V13: University Course Recognition
-- =============================================================================

CREATE TABLE IF NOT EXISTS course_recognition_requests (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id             UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    submitting_org_id     UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    reviewing_university_id UUID REFERENCES organisations(id) ON DELETE SET NULL,
    status                VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    syllabus_url          TEXT,
    learning_outcomes     TEXT,
    credit_hours          INTEGER,
    reviewer_notes        TEXT,
    submitted_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at           TIMESTAMPTZ,
    updated_at            TIMESTAMPTZ DEFAULT now(),
    UNIQUE (course_id, reviewing_university_id)
);

CREATE INDEX IF NOT EXISTS idx_recognition_course ON course_recognition_requests(course_id);
CREATE INDEX IF NOT EXISTS idx_recognition_submitting_org ON course_recognition_requests(submitting_org_id);
CREATE INDEX IF NOT EXISTS idx_recognition_reviewing_uni ON course_recognition_requests(reviewing_university_id);
CREATE INDEX IF NOT EXISTS idx_recognition_status ON course_recognition_requests(status);
