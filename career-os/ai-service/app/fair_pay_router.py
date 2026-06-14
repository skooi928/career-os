"""
fair_pay_router.py
──────────────────
FastAPI router: accepts user profile + market job data and returns
AI-generated salary benchmarking insights via Gemini.

Endpoint: POST /fair-pay/analyze
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

router = APIRouter(prefix="/fair-pay", tags=["Fair Pay"])


# ── Pydantic models ──────────────────────────────────────────────────────────

class SkillEntry(BaseModel):
    name: str
    proficiency: Optional[str] = ""

class ExperienceEntry(BaseModel):
    jobTitle: Optional[str] = ""
    company: Optional[str] = ""
    startDate: Optional[str] = ""
    endDate: Optional[str] = ""
    current: Optional[bool] = False

class EducationEntry(BaseModel):
    degree: Optional[str] = ""
    institution: Optional[str] = ""
    field: Optional[str] = ""

class UserProfilePayload(BaseModel):
    location: Optional[str] = ""
    skills: Optional[List[SkillEntry]] = []
    experiences: Optional[List[ExperienceEntry]] = []
    education: Optional[List[EducationEntry]] = []
    badges: Optional[List[str]] = []

class MarketJob(BaseModel):
    title: str
    company: Optional[str] = ""
    location: Optional[str] = ""
    employment_type: Optional[str] = ""
    min_salary: Optional[int] = 0
    max_salary: Optional[int] = 0
    benefits: Optional[List[str]] = []
    seniority_levels: Optional[List[str]] = []

class FairPayRequest(BaseModel):
    job_title: str
    location: Optional[str] = ""
    employment_type: Optional[str] = ""
    user_profile: Optional[UserProfilePayload] = None
    market_jobs: Optional[List[MarketJob]] = []


# ── Prompt ────────────────────────────────────────────────────────────────────

FAIR_PAY_PROMPT = """
You are a professional compensation analyst and salary benchmarking expert specialising in the Malaysian job market.

Analyse the following data and produce a detailed, evidence-based salary benchmarking report.

TARGET ROLE: {job_title}
SEARCH LOCATION: {location}
EMPLOYMENT TYPE: {employment_type}

USER PROFILE:
- Location: {user_location}
- Skills: {skills}
- Experience: {experience_summary}
- Education: {education_summary}
- Earned Badges/Certifications: {badges}

MARKET DATA ({market_count} matching job postings on platform):
{market_jobs_summary}

BENEFITS DATA FROM JOB POSTINGS:
{benefits_summary}

────────────────────────────────────────────────────────────────────
Analyse the market data carefully. Base salary ranges on actual job posting data when available.
For Malaysian market context: use MYR currency. Consider the user's experience, skills, and education 
relative to market requirements to position their percentile.

Return ONLY a JSON object with exactly these keys (no markdown, no code fences):

{{
  "min_salary": <integer, minimum of estimated fair salary range in MYR/month>,
  "avg_salary": <integer, average/median estimated salary in MYR/month>,
  "max_salary": <integer, maximum of estimated fair salary range in MYR/month>,
  "currency": "MYR",
  "market_competitiveness_score": <integer 0-100, how competitive this role's pay is in the market>,
  "percentile": <integer 0-100, estimated percentile where this user sits vs market based on their profile>,
  "benefits_value_estimate": <integer, estimated monthly value of common non-salary benefits in MYR>,
  "compensation_breakdown": {{
    "base": <integer, estimated base salary MYR/month>,
    "benefits": <integer, estimated monthly benefits value MYR>,
    "total_package": <integer, total monthly package value MYR>
  }},
  "salary_explanation": "<3-4 sentence explanation of why this salary range was recommended, referencing specific data points from market jobs and the user's profile strengths>",
  "skills_to_increase_salary": [
    {{"skill": "<skill name>", "impact": "<expected salary impact, e.g. +10-15%>"}},
    ...
  ],
  "certifications_to_increase_salary": ["<cert name>", ...],
  "comparison_summary": "<2-3 sentence comparison of user profile vs typical market candidate for this role — be specific about gaps and strengths>",
  "ai_available": true
}}

Provide exactly 3-5 skills_to_increase_salary entries and 3-5 certifications_to_increase_salary.
"""


# ── Helper ────────────────────────────────────────────────────────────────────

def _extract_json(text: str) -> Dict[str, Any]:
    text = text.strip()
    # Strip markdown fences if present
    text = re.sub(r"^```(?:json)?", "", text, flags=re.MULTILINE).strip()
    text = re.sub(r"```$", "", text, flags=re.MULTILINE).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Try to extract JSON object
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise


def _build_experience_summary(experiences: List[ExperienceEntry]) -> str:
    if not experiences:
        return "No experience provided"
    parts = []
    for exp in experiences[:5]:
        duration = ""
        if exp.startDate:
            end = exp.endDate if not exp.current and exp.endDate else "Present"
            duration = f" ({exp.startDate[:7]} – {end})"
        parts.append(f"{exp.jobTitle or 'Unknown Role'} at {exp.company or 'Unknown'}{duration}")
    return "; ".join(parts)


def _build_education_summary(education: List[EducationEntry]) -> str:
    if not education:
        return "No education provided"
    parts = [f"{e.degree or 'Degree'} in {e.field or 'Unknown'} from {e.institution or 'Unknown'}" for e in education[:3]]
    return "; ".join(parts)


def _build_market_summary(market_jobs: List[MarketJob]) -> str:
    if not market_jobs:
        return "No matching job postings found on platform."
    lines = []
    for j in market_jobs[:15]:
        lines.append(
            f"- {j.title} @ {j.company} | {j.location} | {j.employment_type} | "
            f"MYR {j.min_salary:,}–{j.max_salary:,}/mo | Seniority: {', '.join(j.seniority_levels) or 'N/A'}"
        )
    return "\n".join(lines)


def _build_benefits_summary(market_jobs: List[MarketJob]) -> str:
    all_benefits = []
    for j in market_jobs:
        all_benefits.extend(j.benefits or [])
    if not all_benefits:
        return "No benefits data available."
    unique = list(dict.fromkeys(all_benefits))[:20]
    return "; ".join(unique)


# ── Route ─────────────────────────────────────────────────────────────────────

@router.post("/analyze")
async def analyze_fair_pay(payload: FairPayRequest) -> Dict[str, Any]:
    profile = payload.user_profile or UserProfilePayload()

    skills_str = ", ".join(
        f"{s.name} ({s.proficiency})" if s.proficiency else s.name
        for s in (profile.skills or [])
    ) or "Not specified"

    prompt = FAIR_PAY_PROMPT.format(
        job_title=payload.job_title,
        location=payload.location or "Malaysia",
        employment_type=payload.employment_type or "Not specified",
        user_location=profile.location or "Not specified",
        skills=skills_str,
        experience_summary=_build_experience_summary(profile.experiences or []),
        education_summary=_build_education_summary(profile.education or []),
        badges=", ".join(profile.badges or []) or "None",
        market_count=len(payload.market_jobs or []),
        market_jobs_summary=_build_market_summary(payload.market_jobs or []),
        benefits_summary=_build_benefits_summary(payload.market_jobs or []),
    )

    try:
        response = _model.generate_content(prompt)
        result = _extract_json(response.text)
        result["ai_available"] = True
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")
