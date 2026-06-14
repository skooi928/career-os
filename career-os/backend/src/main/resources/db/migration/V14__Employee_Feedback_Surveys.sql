-- ── V14: Employee Feedback Survey Module ─────────────────────────────────────
-- Anonymity model:
--   survey_responses  → NO user_id (fully anonymous)
--   survey_participation → tracks who submitted (no FK to responses)
--   Managers can NEVER trace a response back to an individual employee.

-- Survey definitions (created by org managers)
CREATE TABLE IF NOT EXISTS dbo.employee_surveys (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id     UUID NOT NULL,
    title               VARCHAR(200) NOT NULL,
    description         TEXT,
    created_by_user_id  UUID NOT NULL,
    status              VARCHAR(20)  NOT NULL DEFAULT 'DRAFT', -- DRAFT | ACTIVE | CLOSED
    start_date          TIMESTAMPTZ,
    end_date            TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Questions for each survey
CREATE TABLE IF NOT EXISTS dbo.survey_questions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id     UUID NOT NULL REFERENCES dbo.employee_surveys(id) ON DELETE CASCADE,
    question_text TEXT        NOT NULL,
    category      VARCHAR(50) NOT NULL,  -- QuestionCategory enum value
    question_type VARCHAR(20) NOT NULL DEFAULT 'RATING', -- RATING (1-10) | SCALE (1-5) | TEXT
    order_index   INT  NOT NULL DEFAULT 0
);

-- Anonymous response containers — NO user_id column
CREATE TABLE IF NOT EXISTS dbo.survey_responses (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id            UUID NOT NULL REFERENCES dbo.employee_surveys(id) ON DELETE CASCADE,
    anonymization_token  UUID NOT NULL DEFAULT gen_random_uuid(),
    submitted_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Individual question answers within a response
CREATE TABLE IF NOT EXISTS dbo.survey_question_answers (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id  UUID NOT NULL REFERENCES dbo.survey_responses(id) ON DELETE CASCADE,
    question_id  UUID NOT NULL REFERENCES dbo.survey_questions(id) ON DELETE CASCADE,
    rating_value INT,   -- for RATING / SCALE questions
    text_answer  TEXT   -- for TEXT questions
);

-- Participation ledger: who has submitted (no FK to survey_responses — by design)
CREATE TABLE IF NOT EXISTS dbo.survey_participation (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id       UUID NOT NULL REFERENCES dbo.employee_surveys(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL,
    participated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (survey_id, user_id)
);

-- Cached AI-generated HR insights per survey
CREATE TABLE IF NOT EXISTS dbo.survey_ai_insights (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id    UUID NOT NULL REFERENCES dbo.employee_surveys(id) ON DELETE CASCADE,
    insight_json TEXT        NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_employee_surveys_org ON dbo.employee_surveys(organisation_id);
CREATE INDEX IF NOT EXISTS idx_survey_questions_survey ON dbo.survey_questions(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey ON dbo.survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_answers_response ON dbo.survey_question_answers(response_id);
CREATE INDEX IF NOT EXISTS idx_survey_answers_question ON dbo.survey_question_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_survey_participation_survey ON dbo.survey_participation(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_ai_insights_survey ON dbo.survey_ai_insights(survey_id);
