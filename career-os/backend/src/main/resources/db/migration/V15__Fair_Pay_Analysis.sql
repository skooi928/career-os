-- Fair Pay Analysis cache table
CREATE TABLE IF NOT EXISTS dbo.fair_pay_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supabase_uid TEXT NOT NULL,
  job_title VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  employment_type VARCHAR(100),
  result_json TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fair_pay_analyses_uid ON dbo.fair_pay_analyses(supabase_uid);
CREATE INDEX IF NOT EXISTS idx_fair_pay_analyses_uid_title ON dbo.fair_pay_analyses(supabase_uid, job_title);
