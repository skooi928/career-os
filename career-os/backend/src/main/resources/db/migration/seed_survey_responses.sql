-- ── Seed: Dummy Survey Responses for Analytics Testing ───────────────────────
-- Run this in Supabase SQL Editor AFTER V14 tables are created.
-- It inserts 15 anonymous responses with realistic varied scores
-- for the FIRST survey found in dbo.employee_surveys.
--
-- Scores are intentionally varied to produce interesting AI insights:
--   High:  JOB_SATISFACTION, TEAM_COLLABORATION, COMMUNICATION
--   Mid:   WORK_ENVIRONMENT, CAREER_GROWTH, EMPLOYEE_ENGAGEMENT
--   Low:   WORK_LIFE_BALANCE, MENTAL_WELLBEING, COMPENSATION, RETENTION_LIKELIHOOD
-- ──────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_survey_id   UUID;
  v_resp_id     UUID;
  v_question    RECORD;
  v_i           INT;

  -- 15 sets of multipliers (index 1..15) — simulates realistic variance
  -- RATING questions (1-10): base score per category
  type_scores   JSONB := '{
    "JOB_SATISFACTION":    [8,7,9,8,7,6,8,9,7,8,9,6,7,8,7],
    "WORK_ENVIRONMENT":    [7,6,7,8,6,5,7,7,6,7,8,5,6,7,6],
    "WORK_LIFE_BALANCE":   [5,4,6,5,4,3,5,6,4,5,6,3,4,5,4],
    "TEAM_COLLABORATION":  [9,8,9,9,8,7,9,8,8,9,9,7,8,9,8],
    "COMMUNICATION":       [8,7,8,9,7,6,8,9,7,8,9,6,7,8,7],
    "LEADERSHIP":          [7,6,7,8,6,5,7,8,6,7,8,5,6,7,6],
    "CAREER_GROWTH":       [6,5,7,6,5,4,6,7,5,6,7,4,5,6,5],
    "COMPENSATION":        [5,4,5,6,4,3,5,6,4,5,6,3,4,5,4],
    "MENTAL_WELLBEING":    [5,4,6,5,4,3,5,6,4,5,6,3,4,5,4],
    "EMPLOYEE_ENGAGEMENT": [7,6,7,8,6,5,7,8,6,7,8,5,6,7,6],
    "RETENTION_LIKELIHOOD":[6,5,6,7,5,4,6,7,5,6,7,4,5,6,5]
  }';

  -- Scale questions (1-5): use half the RATING score rounded
  -- Text responses (15 varied open answers)
  text_pool     TEXT[] := ARRAY[
    'The team atmosphere is great but workload has been increasing lately.',
    'I feel my skills are not being fully utilized in my current role.',
    'Management communication needs improvement, especially around strategic decisions.',
    'Work-life balance is a real concern — overtime has become normalized.',
    'I genuinely enjoy working with my colleagues. The culture is collaborative.',
    'Salary hasn''t kept up with market rates. Starting to look at other options.',
    'Career development opportunities are limited. Would appreciate mentorship programs.',
    'The flexible work policy is appreciated but could be extended further.',
    'Too many meetings. Need more focused time for deep work.',
    'Leadership is approachable but big decisions feel opaque.',
    'Benefits are decent but the compensation package lags behind competitors.',
    'I feel burnt out. The always-on culture is unsustainable long-term.',
    'Great colleagues and meaningful work — that''s what keeps me here.',
    'Onboarding was chaotic. New joiners need better support.',
    'Overall happy but would leave for the right opportunity if offered significantly more.'
  ];

BEGIN
  -- Get the first survey (most recently created)
  SELECT id INTO v_survey_id
  FROM dbo.employee_surveys
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_survey_id IS NULL THEN
    RAISE EXCEPTION 'No surveys found in dbo.employee_surveys. Create one first via the UI.';
  END IF;

  RAISE NOTICE 'Seeding responses for survey: %', v_survey_id;

  -- Insert 15 anonymous responses
  FOR v_i IN 1..15 LOOP
    -- Create anonymous response (no user_id — privacy by design)
    INSERT INTO dbo.survey_responses (survey_id)
    VALUES (v_survey_id)
    RETURNING id INTO v_resp_id;

    -- Insert an answer for every question in this survey
    FOR v_question IN
      SELECT id, category, question_type
      FROM dbo.survey_questions
      WHERE survey_id = v_survey_id
      ORDER BY order_index
    LOOP
      IF v_question.question_type = 'TEXT' THEN
        -- Use the text pool entry for this respondent index
        INSERT INTO dbo.survey_question_answers (response_id, question_id, text_answer)
        VALUES (v_resp_id, v_question.id, text_pool[v_i]);

      ELSIF v_question.question_type = 'SCALE' THEN
        -- SCALE 1-5: divide RATING score by 2, minimum 1
        INSERT INTO dbo.survey_question_answers (response_id, question_id, rating_value)
        VALUES (
          v_resp_id,
          v_question.id,
          GREATEST(1, ROUND(
            (type_scores->v_question.category->>(v_i - 1))::NUMERIC / 2
          )::INT)
        );

      ELSE
        -- RATING 1-10
        INSERT INTO dbo.survey_question_answers (response_id, question_id, rating_value)
        VALUES (
          v_resp_id,
          v_question.id,
          (type_scores->v_question.category->>(v_i - 1))::INT
        );
      END IF;
    END LOOP;

    RAISE NOTICE 'Inserted response % / 15 (id: %)', v_i, v_resp_id;
  END LOOP;

  RAISE NOTICE 'Done. 15 anonymous responses seeded for survey %.', v_survey_id;
END $$;
