import re
from typing import Any

#activity keywords incase mixed up with awards
ACTIVITY_KEYWORDS = [
    "president", "vice president", "treasurer", "secretary",
    "member", "coordinator", "committee", "bureau",
    "head of department", "head of", "director",
    "organizer", "facilitator", "volunteer", "representative",
    "chairman", "chairperson", "deputy", "advisor", "mentor",
    "captain", "co-captain", "leader", "officer",
    "publicity", "marketing department", "growth marketing",
    "project director", "u-voice", "google developer",
    "hackathon", "vhack", "pixel", "cs society", "csicx",
]

# Award-specific keywords — used to keep something in awards even if it
# superficially looks like an activity.
AWARD_KEYWORDS = [
    "winner", "champion", "first place", "second place", "third place",
    "top 3", "top 5", "top 10", "runner-up", "runner up",
    "excellence", "award", "dean list", "dean's list",
    "best", "gold", "silver", "bronze", "medal",
    "merit", "distinction", "honourable mention",
]

#return true if value is empty string, null, or common placeholders
def _is_empty(value: Any) -> bool:
    if value is None:
        return True
    if isinstance(value, str) and value.strip() in ("", "null", "N/A", "n/a", "none", "None"):
        return True
    return False

#return none if empty, else original value
def _null_if_empty(value: Any) -> Any:
    return None if _is_empty(value) else value

#clean dict values recursively
def _clean_dict(obj: dict) -> dict:
    return {k: _null_if_empty(v) if not isinstance(v, (dict, list)) else v
            for k, v in obj.items()}

#return true if title looks like an activity role, not an award
def _is_activity(title: str) -> bool:
    lower = title.lower()
    has_activity = any(kw in lower for kw in ACTIVITY_KEYWORDS)
    has_award = any(kw in lower for kw in AWARD_KEYWORDS)

    return has_activity and not has_award

#split a duration string into start/end/current
def _parse_duration(duration: str):
    if not duration:
        return None, None, None

    duration = duration.strip()
    present_re = re.compile(r"\b(present|current|now|ongoing)\b", re.IGNORECASE)

    #split on common separators
    parts = re.split(r"\s*[-–—to/]\s*", duration, maxsplit=1)

    if len(parts) == 2:
        start = parts[0].strip() or None
        end_raw = parts[1].strip()
        is_current = bool(present_re.search(end_raw))
        end = None if is_current else (end_raw or None)
        return start, end, is_current

    #single value, could be a year or "present"
    is_current = bool(present_re.search(duration))
    return duration, None, is_current


def _split_responsibilities(description: str):
    if not description:
        return []

    #split on common bullet markers
    parts = re.split(r"[\n~•\*]+|(?<!\d)\.\s+|\d+\.\s+", description)
    cleaned = []
    for part in parts:
        part = part.strip(" -–—\t")
        if len(part) > 3: #skip short fragments that are unlikely to be real responsibilities
            cleaned.append(part)
    return cleaned

#normalize skill names and categories, handle duplicates
SKILL_ALIASES = {
    "js": "JavaScript",
    "javascript": "JavaScript",
    "ts": "TypeScript",
    "typescript": "TypeScript",
    "py": "Python",
    "c sharp": "C#",
    "c#": "C#",
    "c++": "C++",
    "cpp": "C++",
    "html5": "HTML",
    "css3": "CSS",
    "sql": "SQL",
    "mysql": "MySQL",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "ml": "Machine Learning",
    "ai": "Artificial Intelligence",
    "dl": "Deep Learning",
    "nlp": "Natural Language Processing",
    "react": "React",
    "reactjs": "React",
    "react.js": "React",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "vuejs": "Vue.js",
    "vue.js": "Vue.js",
    "next.js": "Next.js",
    "nextjs": "Next.js",
}

SKILL_CATEGORIES = {
    # Programming languages
    "Python": "Programming Language",
    "Java": "Programming Language",
    "C++": "Programming Language",
    "C#": "Programming Language",
    "JavaScript": "Programming Language",
    "TypeScript": "Programming Language",
    "HTML": "Programming Language",
    "CSS": "Programming Language",
    "SQL": "Programming Language",
    "R": "Programming Language",
    "PHP": "Programming Language",
    "Swift": "Programming Language",
    "Kotlin": "Programming Language",
    "Go": "Programming Language",
    "Rust": "Programming Language",
    # Frameworks / Libraries
    "React": "Framework",
    "Vue.js": "Framework",
    "Next.js": "Framework",
    "Django": "Framework",
    "Flask": "Framework",
    "Spring": "Framework",
    "Node.js": "Framework",
    "TensorFlow": "Library",
    "PyTorch": "Library",
    "scikit-learn": "Library",
    "pandas": "Library",
    "NumPy": "Library",
    # Tools
    "Anaconda": "Programming Tool",
    "Jupyter Notebook": "Programming Tool",
    "Google Colaboratory": "Programming Tool",
    "Microsoft Visio": "Programming Tool",
    "Dev-C++": "Programming Tool",
    "Git": "DevOps",
    "Docker": "DevOps",
    # Design
    "Canva": "Design Tool",
    "Adobe Illustrator": "Design Tool",
    "Figma": "Design Tool",
    "Capcut": "Design Tool",
    "Adobe Photoshop": "Design Tool",
    # Productivity
    "Microsoft Word": "Productivity Tool",
    "Microsoft Excel": "Productivity Tool",
    "Microsoft PowerPoint": "Productivity Tool",
    # OS
    "Windows 11": "Operating System",
    "macOS": "Operating System",
    "Linux": "Operating System",
    "Ubuntu": "Operating System",
}


def _normalize_skill(skill_input) -> dict:

    if isinstance(skill_input, str):
        name = skill_input.strip()
        category = None
    elif isinstance(skill_input, dict):
        name = (skill_input.get("name") or "").strip()
        category = skill_input.get("category")
    else:
        return None

    if not name:
        return None

    #apply alias normalization
    normalized_name = SKILL_ALIASES.get(name.lower(), name)

    #infer category if missing
    if _is_empty(category):
        category = SKILL_CATEGORIES.get(normalized_name)

    return {
        "name": normalized_name,
        "category": _null_if_empty(category),
    }

def _deduplicate_skills(skills: list) -> list:
    seen = set()
    result = []
    for skill in skills:
        key = skill["name"].lower()
        if key not in seen:
            seen.add(key)
            result.append(skill)
    return result


def _extract_cgpa(text: str) -> str | None:
    """Find CGPA/GPA patterns in arbitrary text."""
    pattern = re.compile(
        r"(?:cgpa|gpa|grade\s*point\s*average)[:\s]*([0-9]\.[0-9]{1,2})(?:\s*/\s*[0-9]\.[0-9]{1,2})?",
        re.IGNORECASE,
    )
    match = pattern.search(text or "")
    if match:
        full_match = match.group(0)
        # Return full "3.59/4.00" style if slash is present
        slash_pattern = re.compile(
            r"([0-9]\.[0-9]{1,2}\s*/\s*[0-9]\.[0-9]{1,2})", re.IGNORECASE
        )
        slash_match = slash_pattern.search(full_match)
        return slash_match.group(1) if slash_match else match.group(1)
    return None

#main normalization function
def normalize_resume(data: dict) -> dict:

    #SKILLS: string to dict, alias normalization, category inference, dedup
    raw_skills = data.get("skills", []) or []
    normalized_skills = [_normalize_skill(s) for s in raw_skills]
    normalized_skills = [s for s in normalized_skills if s]  # remove None
    data["skills"] = _deduplicate_skills(normalized_skills)

    #HUMAN LANGUAGES: string to dict
    raw_langs = data.get("human_languages", []) or []
    normalized_langs = []
    for lang in raw_langs:
        if isinstance(lang, str):
            normalized_langs.append({"name": lang.strip(), "proficiency": None, "raw_score": None})
        elif isinstance(lang, dict):
            normalized_langs.append({
                "name": _null_if_empty(lang.get("name")),
                "proficiency": _null_if_empty(lang.get("proficiency")),
                "raw_score": _null_if_empty(lang.get("raw_score")),
            })
    data["human_languages"] = [l for l in normalized_langs if l.get("name")]

    #EXPERIENCE: parse dates, split responsibilities
    for exp in data.get("experience", []) or []:
        # Clean all string fields
        exp["role"] = _null_if_empty(exp.get("role"))
        exp["company"] = _null_if_empty(exp.get("company"))
        exp["description"] = _null_if_empty(exp.get("description"))

        #parse duration if start/end not already populated
        if _is_empty(exp.get("start_date")) and not _is_empty(exp.get("duration")):
            start, end, is_current = _parse_duration(exp["duration"])
            exp["start_date"] = start
            exp["end_date"] = end
            if exp.get("is_current") is None:
                exp["is_current"] = is_current

        #split responsibilities if LLM returned them merged in description
        if not exp.get("responsibilities") and exp.get("description"):
            exp["responsibilities"] = _split_responsibilities(exp["description"])

    #EDUCATION: clean fields, extract CGPA from summary if missing
    summary_text = data.get("summary") or ""
    #also check all section contents for CGPA
    all_text = summary_text + " ".join(
        (s.get("content") or "") for s in (data.get("sections") or [])
    )

    for edu in data.get("education", []) or []:
        edu["institution"] = _null_if_empty(edu.get("institution"))
        edu["qualification"] = _null_if_empty(edu.get("qualification"))
        edu["field_of_study"] = _null_if_empty(edu.get("field_of_study"))
        edu["cgpa"] = _null_if_empty(edu.get("cgpa"))

        current_edu = next(
            (e for e in data.get("education", []) if e.get("is_current")), 
            None
        )
        if current_edu and current_edu.get("cgpa") is None:
            extracted_cgpa = _extract_cgpa(all_text)
            if extracted_cgpa:
                current_edu["cgpa"] = extracted_cgpa

    # AWARDS vs ACTIVITIES SEPARATION: Re-scan awards list and move misclassified items to activities
    final_awards = []
    new_activities = list(data.get("activities") or [])

    for award in data.get("awards", []) or []:
        title = award.get("title") or ""
        if _is_activity(title):
            #convert award-shaped dict to activity-shaped dict
            new_activities.append({
                "title": title,
                "organization": _null_if_empty(award.get("issuer")),
                "role": None,
                "year": _null_if_empty(award.get("year")),
                "duration": None,
                "description": None,
            })
        else:
            award["title"] = _null_if_empty(award.get("title"))
            award["issuer"] = _null_if_empty(award.get("issuer"))
            award["year"] = _null_if_empty(award.get("year"))
            award["level"] = _null_if_empty(award.get("level"))
            final_awards.append(award)

    data["awards"] = final_awards

    #clean activity fields
    for act in new_activities:
        act["title"] = _null_if_empty(act.get("title"))
        act["organization"] = _null_if_empty(act.get("organization"))
        act["role"] = _null_if_empty(act.get("role"))
        act["year"] = _null_if_empty(act.get("year"))
        act["duration"] = _null_if_empty(act.get("duration"))
        act["description"] = _null_if_empty(act.get("description"))

    data["activities"] = [a for a in new_activities if a.get("title")]

    #PROJECTS: clean nulls
    for proj in data.get("projects", []) or []:
        proj["title"] = _null_if_empty(proj.get("title"))
        proj["description"] = _null_if_empty(proj.get("description"))
        proj["url"] = _null_if_empty(proj.get("url"))
        proj["year"] = _null_if_empty(proj.get("year"))
        if not isinstance(proj.get("technologies"), list):
            proj["technologies"] = []

    #CERTIFICATIONS: clean nulls
    for cert in data.get("certifications", []) or []:
        cert["name"] = _null_if_empty(cert.get("name"))
        cert["issuer"] = _null_if_empty(cert.get("issuer"))
        cert["year"] = _null_if_empty(cert.get("year"))
        cert["expiry"] = _null_if_empty(cert.get("expiry"))
        cert["credential_id"] = _null_if_empty(cert.get("credential_id"))

    #REFERENCES: clean nulls
    for ref in data.get("references", []) or []:
        ref["name"] = _null_if_empty(ref.get("name"))
        ref["title"] = _null_if_empty(ref.get("title"))
        ref["organization"] = _null_if_empty(ref.get("organization"))
        ref["email"] = _null_if_empty(ref.get("email"))
        ref["phone"] = _null_if_empty(ref.get("phone"))

    #TOP-LEVEL: clean contact fields
    for field in ("name", "email", "phone", "linkedin", "github", "website", "location", "summary"):
        data[field] = _null_if_empty(data.get(field))

    return data