"""
survey_insights_router.py
─────────────────────────
FastAPI router that accepts aggregated survey analytics from the Java backend
and returns AI-generated HR / organisational psychology insights via Gemini.

Endpoint: POST /survey-insights/analyze
"""

import json
import os
import re
from typing import Any, Dict, List, Optional

import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
_model = genai.GenerativeModel("gemini-2.5-flash")

router = APIRouter(prefix="/survey-insights", tags=["Survey Insights"])


class SurveyAnalyticsPayload(BaseModel):
    survey_title: str
    total_responses: int
    overall_score: float          # 1–10 normalised
    score_by_category: Dict[str, float]
    open_text_responses: List[str]
    response_rate: int            # 0–100 %


SURVEY_INSIGHT_PROMPT = """
You are a senior HR consultant and organisational psychologist. Analyse the following anonymous
employee survey results and produce a professional, evidence-based report for management.

SURVEY: {survey_title}
TOTAL RESPONSES: {total_responses}  |  RESPONSE RATE: {response_rate}%
OVERALL SATISFACTION SCORE: {overall_score}/10

CATEGORY SCORES (out of 10):
{category_scores}

OPEN-ENDED RESPONSES (anonymous, summarise themes — DO NOT quote individuals):
{open_text}

────────────────────────────────────────────────────────────────────
Return ONLY a JSON object with exactly these keys (no markdown, no fences):

{{
  "overall_sentiment": "positive | moderate | concerning | critical",
  "satisfaction_analysis": "<2–3 sentence evidence-based analysis of overall satisfaction>",
  "burnout_indicators": "<assessment of burnout / disengagement risk based on scores and text themes>",
  "team_morale": "<evaluation of team dynamics, collaboration, and morale>",
  "retention_risk": "low | moderate | high | critical",
  "retention_risk_explanation": "<why employees may or may not leave, supported by data>",
  "culture_assessment": "<assessment of workplace culture, psychological safety, inclusion>",
  "top_strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "critical_concerns": ["<concern 1>", "<concern 2>", "<concern 3>"],
  "recommendations": [
    {{"priority": "high | medium | low", "action": "<specific actionable recommendation>", "rationale": "<why>"}},
    {{"priority": "...", "action": "...", "rationale": "..."}},
    {{"priority": "...", "action": "...", "rationale": "..."}},
    {{"priority": "...", "action": "...", "rationale": "..."}},
    {{"priority": "...", "action": "...", "rationale": "..."}}
  ],
  "low_score_categories": ["<category with score < 6>"],
  "high_score_categories": ["<category with score > 8>"],
  "manager_action_plan": "<concrete 30/60/90-day action plan for managers>",
  "pulse_survey_suggested": true | false,
  "ai_available": true
}}
────────────────────────────────────────────────────────────────────
RULES:
- Base all analysis strictly on the data provided. Do not fabricate.
- Never identify or quote individual respondents.
- Scores < 6 = at-risk area. Scores 6–7.9 = moderate. Scores ≥ 8 = strength.
- retention_risk = "critical" if RETENTION_LIKELIHOOD score < 5 or overall < 5.
- Recommendations must be specific and actionable, not generic platitudes.
- Return ONLY raw JSON. No markdown. No explanation outside JSON.
"""


def _build_prompt(payload: SurveyAnalyticsPayload) -> str:
    cat_lines = "\n".join(
        f"  • {cat.replace('_', ' ').title()}: {score}/10"
        for cat, score in sorted(payload.score_by_category.items(), key=lambda x: x[1])
    )
    text_block = (
        "\n".join(f"  - {t}" for t in payload.open_text_responses[:30])
        if payload.open_text_responses
        else "  (No open-text responses provided)"
    )
    return SURVEY_INSIGHT_PROMPT.format(
        survey_title=payload.survey_title,
        total_responses=payload.total_responses,
        response_rate=payload.response_rate,
        overall_score=payload.overall_score,
        category_scores=cat_lines,
        open_text=text_block,
    )


def _parse_json_response(raw: str) -> Dict[str, Any]:
    """Strip markdown fences if model adds them anyway, then parse JSON."""
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw.strip(), flags=re.MULTILINE)
    return json.loads(cleaned)


@router.post("/analyze")
async def analyze_survey(payload: SurveyAnalyticsPayload):
    if payload.total_responses < 1:
        raise HTTPException(status_code=400, detail="No responses to analyse yet.")

    prompt = _build_prompt(payload)
    try:
        response = _model.generate_content(prompt)
        result = _parse_json_response(response.text)
        return result
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=502, detail=f"AI returned non-JSON: {exc}") from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Gemini error: {exc}") from exc
