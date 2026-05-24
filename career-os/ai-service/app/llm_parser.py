import os
import json
import re
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

model = genai.GenerativeModel(
    "gemini-2.5-flash"
)

#prompt message for llm
EXTRACTION_PROMPT = """
You are an expert resume parser for a living portfolio platform. Your job is to extract ALL information from a resume into a strict JSON structure, regardless of how the resume is formatted, worded, or structured.

CRITICAL RULES:
- Return ONLY raw JSON. No markdown. No explanation. No ```json fences.
- Missing or unavailable values must be null, never empty string "".
- Empty lists must be [] never null.
- Do not invent or guess information not present in the resume.
- Preserve the original wording of descriptions — do not paraphrase.

---

SECTION SEPARATION RULES (very important):

1. AWARDS vs ACTIVITIES — these are different:
   - "awards": Things the person WON or ACHIEVED (prizes, placements, dean's list, excellence awards, competition results).
   - "activities": Roles the person HELD in organizations (president, treasurer, committee member, coordinator, head of department, volunteer, club member). These are participatory, not competitive wins.
   - If something is BOTH (e.g. "won best leader award in club"), put it in awards.
   - Typical activity keywords: president, vice president, treasurer, secretary, member, coordinator, committee, bureau, head of department, director, organizer, facilitator, volunteer.

2. EXPERIENCE: Paid or formal work only (jobs, internships, freelance). Not club roles.

3. PROJECTS: Any hands-on work product — websites built, apps, research, campaigns, business ventures, hackathon submissions, capstone/final year projects. Extract even if described briefly.

4. HUMAN LANGUAGES: Spoken/written languages (English, Malay, Mandarin, etc.). Never programming languages.

5. SUMMARY: Extract the "About Me", "Objective", "Profile", or "Summary" section as a single plain text string.

6. "sections": 
    - List every section heading found in the resume with its title only.
    - Set content to null for all sections — do NOT copy the full text into content.
    - The content is already captured in the structured fields above.

---

EDUCATION RULES:
- Extract CGPA, GPA, or grade if mentioned anywhere in the resume (including in the About Me section).
- If the qualification mentions a major/minor or field, populate field_of_study.
- is_current = true if the year is in the future or the text says "currently", "present", "ongoing".
- grades: Extract any grade results mentioned (e.g. "8As", "straight As", 
  "5A+ 2A 1B", MUET Band scores). Check the About Me and Education Details 
  sections — students often mention SPM results there, not under the SPM entry.
- minor: Extract minor field of study if mentioned separately from field_of_study.

---

EXPERIENCE RULES:
- company: Extract if stated. If not stated, leave null — do NOT guess.
- responsibilities: If the description has bullet points or "~" or "-" separated items, split them into the responsibilities list as individual strings (cleaned, no bullet symbols).
- description: Keep as full original text too.
- Parse start_date and end_date from duration if possible (e.g. "April 2022 - June 2022" → start_date: "April 2022", end_date: "June 2022").
- is_current = true if end_date is "present", "current", "now", or similar.

---

SKILL NORMALIZATION:
- Normalize common abbreviations: JS → JavaScript, TS → TypeScript, C Sharp → C#, ML → Machine Learning, AI → Artificial Intelligence.
- Assign a category to every skill using one of: Programming Language, Framework, Library, Database, Cloud, DevOps, Design Tool, Productivity Tool, Soft Skill, Operating System, Other.
- Do NOT put spoken languages in skills.

---

LANGUAGE PROFICIENCY:
- If given as percentage (e.g. 95%), keep as-is in proficiency.
- If given as CEFR level (A1–C2), keep as-is.
- If given as a score (e.g. IELTS 7.5), put score in raw_score, and infer proficiency level if reasonable.
- If described as "native", "mother tongue", "fluent", keep that word.

---

PROJECT RULES:
- tools_and_methods: Any tools, software, platforms, methods, frameworks, or techniques used — applies to ALL fields, not just technical ones.
- Examples: Excel, SPSS, Canva, Google Analytics, interviews, surveys, Python, React, SAP, QuickBooks, Adobe suite, agile methodology.

---

OUTPUT STRUCTURE (follow exactly):

{
    "name": "",
    "email": "",
    "phone": "",
    "linkedin": "",
    "github": "",
    "website": "",
    "location": "",
    "summary": "",
    "skills": [
        {
            "name": "",
            "category": ""
        }
    ],
    "education": [
        {
            "institution": "",
            "qualification": "",
            "field_of_study": "",
            "start_year": "",
            "year": "",
            "cgpa": "",
            "grades": "",
            "is_current": null
        }
    ],
    "experience": [
        {
            "role": "",
            "company": "",
            "duration": "",
            "start_date": "",
            "end_date": "",
            "is_current": null,
            "description": "",
            "responsibilities": []
        }
    ],
    "projects": [
        {
            "title": "",
            "description": "",
            "tools_and_methods": [],
            "url": "",
            "year": ""
        }
    ],
    "human_languages": [
        {
            "name": "",
            "proficiency": "",
            "raw_score": ""
        }
    ],
    "awards": [
        {
            "title": "",
            "issuer": "",
            "year": "",
            "level": ""
        }
    ],
    "activities": [
        {
            "title": "",
            "organization": "",
            "role": "",
            "year": "",
            "duration": "",
            "description": ""
        }
    ],
    "certifications": [
        {
            "name": "",
            "issuer": "",
            "year": "",
            "expiry": "",
            "credential_id": ""
        }
    ],
    "references": [
        {
            "name": "",
            "title": "",
            "organization": "",
            "email": "",
            "phone": ""
        }
    ],
    "sections": [
        {
            "title": "",
            "content": ""
        }
    ]
}

Resume text:

{resume_text}
"""

#json cleaning functions to handle common issues with llm output
def _strip_markdown_fences(text: str) -> str:
    """Remove ```json ... ``` or ``` ... ``` wrappers the model sometimes adds."""
    text = re.sub(r"^```(?:json)?\s*", "", text.strip(), flags=re.IGNORECASE)
    text = re.sub(r"\s*```$", "", text.strip())
    return text.strip()

def _extract_json_object(text: str) -> str:
    """
    Find the first { ... } block in the text in case the model added
    preamble text before the JSON.
    """
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        return text[start:end + 1]
    return text

def _clean_response(text: str) -> str:
    text = _strip_markdown_fences(text)
    text = _extract_json_object(text)
    return text

#main extraction function
def extract_structured_resume(text: str) -> dict:
    prompt = EXTRACTION_PROMPT.replace("{resume_text}", text)

    response = model.generate_content(
        prompt,
        generation_config={
            "temperature": 0,
            "top_p": 1,
            "max_output_tokens": 16384,
        }
    )

    raw = response.text.strip()
    cleaned = _clean_response(raw)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:

        raise json.JSONDecodeError(
            f"LLM returned invalid JSON: {e.msg}\n\n--- RAW OUTPUT ---\n{cleaned}",
            e.doc,
            e.pos,
        )