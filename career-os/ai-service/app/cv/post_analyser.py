"""
cv/post_analyser.py

Analyses posts marked "include_in_cv" and suggests structured CV updates
using Gemini. Maps post types to CV sections before sending to LLM.

Pipeline:
  1. Receive current CVData + list of marked posts
  2. Pre-map posts to likely CV sections by post_type
  3. Send to Gemini with structured prompt
  4. Return list of CvSuggestion objects
"""

import os
import json
import re
import google.generativeai as genai
from dotenv import load_dotenv
from typing import List, Optional
from pydantic import BaseModel

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-3.1-flash-lite")


# ── Models ───────────────────────────────────────────────────────────────────

class PostItem(BaseModel):
    """A single post marked include_in_cv from Spring Boot."""
    id: int
    content: str
    post_type: str          # general, achievement, project, learning, hiring
    created_at: Optional[str] = None


class CvSuggestion(BaseModel):
    """A single AI-generated suggestion to add/update in the CV."""
    post_id: int                # which post this came from
    section: str                # experience, education, skills, projects, awards, activities, certifications
    action: str                 # add, update
    title: Optional[str] = None # short label e.g. "Add new award"
    content: str                # the actual text to add
    field: Optional[str] = None # specific field if updating e.g. "description"
    confidence: str             # high, medium, low
    reason: str                 # why this suggestion was made


class AnalysePostsRequest(BaseModel):
    """Request body for POST /cv/analyse-posts."""
    user_id: str
    posts: List[PostItem]
    current_cv: dict            # serialised CVData


class AnalysePostsResponse(BaseModel):
    """Response from POST /cv/analyse-posts."""
    suggestions: List[CvSuggestion]
    summary: str                # human-readable summary e.g. "Found 3 suggestions from 4 posts"


# ── Post type → CV section mapping ───────────────────────────────────────────

POST_TYPE_SECTION_MAP = {
    "achievement": "awards",
    "project":     "projects",
    "learning":    "skills",
    "general":     None,        # LLM decides
    "hiring":      None,        # employer post — skip
}


def _pre_map_posts(posts: List[PostItem]) -> List[dict]:
    """
    Pre-map posts to likely CV sections based on post_type.
    Returns enriched list with suggested_section field.
    """
    mapped = []
    for post in posts:
        if post.post_type == "hiring":
            continue  # employer posts never go into CV
        section = POST_TYPE_SECTION_MAP.get(post.post_type)
        mapped.append({
            "id": post.id,
            "content": post.content,
            "post_type": post.post_type,
            "suggested_section": section or "unknown",
            "created_at": post.created_at or "",
        })
    return mapped


def _build_cv_summary(cv: dict) -> str:
    """Build a short text summary of current CV for context."""
    lines = []

    if cv.get("name"):
        lines.append(f"Name: {cv['name']}")
    if cv.get("summary"):
        lines.append(f"Summary: {cv['summary'][:200]}")

    edu = cv.get("education", [])
    if edu:
        latest = edu[0]
        lines.append(f"Latest education: {latest.get('degree','')} at {latest.get('institution','')}")

    exp = cv.get("experience", [])
    if exp:
        latest = exp[0]
        lines.append(f"Latest experience: {latest.get('job_title','')} at {latest.get('company','')}")

    skills = cv.get("skills", [])
    if skills:
        skill_names = [s.get("name","") for s in skills[:10]]
        lines.append(f"Current skills (sample): {', '.join(skill_names)}")

    awards = cv.get("awards", [])
    if awards:
        lines.append(f"Awards: {len(awards)} existing")

    projects = cv.get("projects", [])
    if projects:
        lines.append(f"Projects: {len(projects)} existing")

    return "\n".join(lines)


# ── Main analyser ─────────────────────────────────────────────────────────────

def analyse_posts_for_cv(
    posts: List[PostItem],
    current_cv: dict
) -> AnalysePostsResponse:
    """
    Analyse marked posts and return structured CV suggestions.
    """
    mapped_posts = _pre_map_posts(posts)

    if not mapped_posts:
        return AnalysePostsResponse(
            suggestions=[],
            summary="No relevant posts found to analyse."
        )

    cv_summary = _build_cv_summary(current_cv)
    posts_text = json.dumps(mapped_posts, indent=2)

    prompt = f"""
You are a professional CV writer and career coach.

A user has shared posts on a career platform and marked them as "include in CV".
Your job is to analyse these posts and suggest specific, concrete updates to their CV.

USER'S CURRENT CV SUMMARY:
{cv_summary}

POSTS MARKED FOR CV INCLUSION:
{posts_text}

INSTRUCTIONS:
- For each post, suggest ONE specific addition or update to the most relevant CV section.
- Be concrete — write the exact text that should appear in the CV, not vague advice.
- Map each post to the correct section:
  * Achievement/award posts → "awards" section
  * Project/portfolio posts → "projects" section
  * Learning/certification posts → "skills" or "certifications" section
  * General posts about work/roles → "experience" section
  * Leadership/activity posts → "activities" section
- Do NOT suggest adding something that already clearly exists in the current CV.
- Keep suggestions professional and CV-appropriate — no social media tone.
- For skills, suggest the specific skill name only, not a sentence.
- Confidence levels: "high" if post is clear and specific, "medium" if needs interpretation, "low" if vague.

RULES:
- Return ONLY raw JSON. No markdown. No explanation. No ```json fences.
- Return missing values as null.

OUTPUT FORMAT:
{{
  "suggestions": [
    {{
      "post_id": 123,
      "section": "projects",
      "action": "add",
      "title": "Add Kaggle Competition Project",
      "content": "Built a machine learning model for Kaggle Titanic competition",
      "description": "Implemented feature engineering and ensemble models achieving top 10% ranking",
      "impact": "Improved model accuracy to 92%",
      "issuer": null,
      "year": "2025",
      "level": null,
      "technologies": ["Python", "Scikit-learn", "XGBoost"],
      "link": "https://kaggle.com/myproject",
      "proficiency": null,
      "category": null,
      "organization": null,
      "duration": null,
      "company": null,
      "start_date": null,
      "end_date": null,
      "institution": null,
      "confidence": "high",
      "reason": "Post clearly describes a project with measurable outcome."
    }}
  ],
  "summary": "Found 3 suggestions from 4 posts. 1 award, 1 project, 1 skill."
}}
"""

    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.2,
                max_output_tokens=4096,
            )
        )

        raw = response.text.strip()

        # Clean markdown fences if present
        raw = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.IGNORECASE)
        raw = re.sub(r"\s*```$", "", raw.strip())

        # Extract JSON object
        start = raw.find("{")
        end = raw.rfind("}")
        if start != -1 and end != -1:
            raw = raw[start:end + 1]

        data = json.loads(raw)

        suggestions = [
            CvSuggestion(**s)
            for s in data.get("suggestions", [])
            if s.get("section") and s.get("content")
        ]

        return AnalysePostsResponse(
            suggestions=suggestions,
            summary=data.get("summary", f"Found {len(suggestions)} suggestion(s).")
        )

    except json.JSONDecodeError as e:
        print(f"[post_analyser] JSON parse error: {e}")
        return AnalysePostsResponse(
            suggestions=[],
            summary="Analysis failed — could not parse AI response."
        )
    except Exception as e:
        print(f"[post_analyser] Error: {e}")
        return AnalysePostsResponse(
            suggestions=[],
            summary=f"Analysis failed: {str(e)}"
        )