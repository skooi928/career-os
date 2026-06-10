-- V8__Create_Career_Predictions_Table.sql
-- Store AI career prediction results for users

CREATE TABLE IF NOT EXISTS dbo.career_predictions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    supabase_uid VARCHAR(255),
    prediction_data TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_career_predictions_user_id ON dbo.career_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_career_predictions_supabase_uid ON dbo.career_predictions(supabase_uid);
