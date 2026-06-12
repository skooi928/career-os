import os
import json
from groq import Groq

def get_groq_client():
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable is not set")
    return Groq(api_key=api_key)

def generate_interview_questions(target_role: str, industry: str, seniority_level: str, skills: list[str]) -> list:
    client = get_groq_client()
    prompt = f"""
    You are an expert professional interviewer. Generate 5 personalized interview questions for a candidate.
    
    Context:
    Role: {target_role}
    Industry: {industry}
    Seniority: {seniority_level}
    Candidate Skills: {', '.join(skills) if skills else 'Not specified'}
    
    CRITICAL INSTRUCTIONS:
    - The questions must be highly tailored to the specific Target Role and Industry provided above.
    - Be flexible! Do not assume this is a technology or software engineering role unless specified. If the role is in Marketing, Healthcare, Finance, etc., the questions should perfectly reflect that domain.
    
    You MUST output valid JSON only. The JSON must be an object with a "questions" key containing an array of question objects.
    Each question object must have:
    - "question_text": The actual question to ask.
    - "question_tag": A short tag (e.g., Python, Leadership, System Design).
    - "question_type": Must be one of ["technical", "behavioral", "situational"].
    - "difficulty_level": Must be one of ["easy", "medium", "hard"].
    """
    
    response = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.1-8b-instant", # Free tier model
        response_format={"type": "json_object"},
        temperature=0.7
    )
    
    content = response.choices[0].message.content
    try:
        data = json.loads(content)
        return data.get("questions", [])
    except json.JSONDecodeError:
        print("Failed to decode JSON from Groq:", content)
        return []
