-- =============================================================================
-- V12: Industry Project Marketplace
-- =============================================================================

CREATE TABLE IF NOT EXISTS industry_projects (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id   UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    title             TEXT NOT NULL,
    description       TEXT,
    skills_required   TEXT,
    max_candidates    INTEGER NOT NULL DEFAULT 5,
    status            VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    deadline          DATE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_industry_projects_org ON industry_projects(organisation_id);
CREATE INDEX IF NOT EXISTS idx_industry_projects_status ON industry_projects(status);

CREATE TABLE IF NOT EXISTS project_required_badges (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES industry_projects(id) ON DELETE CASCADE,
    badge_id   UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    UNIQUE (project_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_proj_req_badges_project ON project_required_badges(project_id);

CREATE TABLE IF NOT EXISTS project_applications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  UUID NOT NULL REFERENCES industry_projects(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status      VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    note        TEXT,
    applied_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMPTZ,
    UNIQUE (project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_proj_apps_project ON project_applications(project_id);
CREATE INDEX IF NOT EXISTS idx_proj_apps_user ON project_applications(user_id);
