-- Create mock_interview_sessions table
CREATE TABLE IF NOT EXISTS dbo.mock_interview_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    target_role VARCHAR(255),
    department VARCHAR(255),
    industry VARCHAR(255),
    seniority_level VARCHAR(50),
    language VARCHAR(50) DEFAULT 'en',
    job_description TEXT,
    interview_mode VARCHAR(50), -- video_audio / assessment
    interview_type VARCHAR(50), -- technical / behavioral / mixed
    status VARCHAR(50) DEFAULT 'in_progress', -- in_progress / completed / abandoned
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    duration_seconds INTEGER,
    overall_score DECIMAL(5, 2),
    evaluation_summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS dbo.interview_questions (
    question_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    question_text TEXT NOT NULL,
    question_tag VARCHAR(100),
    question_type VARCHAR(50), -- technical / behavioral / situational
    difficulty_level VARCHAR(50), -- easy / medium / hard
    generated_by_ai BOOLEAN DEFAULT true,
    sequence_number INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES dbo.mock_interview_sessions(session_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS dbo.interview_answers (
    answer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL,
    user_id UUID NOT NULL,
    answer_text TEXT,
    transcript_text TEXT,
    audio_url TEXT,
    video_url TEXT,
    response_duration INTEGER,
    confidence_level DECIMAL(5, 2),
    speech_pace DECIMAL(5, 2),
    filler_word_count INTEGER,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES dbo.interview_questions(question_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS dbo.interview_evaluations (
    evaluation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    answer_id UUID NOT NULL,
    technical_score DECIMAL(5, 2),
    communication_score DECIMAL(5, 2),
    confidence_score DECIMAL(5, 2),
    role_fit_score DECIMAL(5, 2),
    overall_answer_score DECIMAL(5, 2),
    feedback_text TEXT,
    strengths TEXT,
    weaknesses TEXT,
    improved_sample_answer TEXT,
    skill_gap_detected TEXT,
    raw_ai_response JSONB,
    ai_model_used VARCHAR(100),
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (answer_id) REFERENCES dbo.interview_answers(answer_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_mock_interview_sessions_user_id ON dbo.mock_interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_questions_session_id ON dbo.interview_questions(session_id);
CREATE INDEX IF NOT EXISTS idx_interview_answers_question_id ON dbo.interview_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_interview_answers_user_id ON dbo.interview_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_evaluations_answer_id ON dbo.interview_evaluations(answer_id);
