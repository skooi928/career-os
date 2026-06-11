import os
import json
from groq import Groq

import string

def get_groq_client():
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable is not set")
    return Groq(api_key=api_key)

def evaluate_interview_answer(question: str, answer_text: str, role: str) -> dict:
    # FAST-PATH: Catch empty answers or copy-pasted questions instantly
    clean_q = question.strip().lower().translate(str.maketrans('', '', string.punctuation))
    clean_a = answer_text.strip().lower().translate(str.maketrans('', '', string.punctuation))
    
    if not clean_a or clean_a == clean_q or len(answer_text.split()) < 3:
        return {
            "technical_score": 0,
            "communication_score": 0,
            "confidence_score": 0,
            "role_fit_score": 0,
            "overall_answer_score": 0,
            "feedback_text": "You did not provide a valid answer. Repeating or copying the question results in a zero score.",
            "strengths": "N/A",
            "weaknesses": "Did not attempt to answer the question in your own words.",
            "improved_sample_answer": "Please attempt to answer the question using your own knowledge.",
            "skill_gap_detected": "Unable to assess due to lack of answer.",
            "filler_words_used": 0
        }

    client = get_groq_client()
    prompt = f"""
    You are an expert interviewer evaluating a candidate's answer.
    
    Target Role: {role}
    Question Asked: {question}
    Candidate's Answer: {answer_text}
    
    Evaluate the answer and provide constructive, transparent feedback.
    
    CRITICAL SCORING RULES:
    1. If the Candidate's Answer is empty, extremely short (under 5 words), if they merely repeat/read back the Question Asked, OR if they copy and paste the exact question as their answer, you MUST give a score of 0 for ALL score fields.
    2. In such cases, explicitly state in the feedback that they did not answer the question or just repeated it.
    3. If the candidate uses more than 3 filler words (e.g. 'um', 'uh', 'like', 'you know'), you MUST explicitly mention this in their feedback and weaknesses. Suggest that they "pause and think instead of using filler words to show confidence."
    
    You MUST output valid JSON only. The JSON must be an object with the following keys:
    - "technical_score": Number (0-100)
    - "communication_score": Number (0-100)
    - "confidence_score": Number (0-100)
    - "role_fit_score": Number (0-100)
    - "overall_answer_score": Number (0-100)
    - "feedback_text": String (General constructive feedback)
    - "strengths": String (What they did well)
    - "weaknesses": String (What they missed or did poorly)
    - "improved_sample_answer": String (A better way to answer the question)
    - "skill_gap_detected": String (Any missing skills or knowledge areas identified)
    - "filler_words_used": Number (Count the exact number of filler words used like 'um', 'uh', 'like', 'you know'. E.g. 0, 3, 5)
    """
    
    response = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.1-8b-instant", # Free tier model
        response_format={"type": "json_object"},
        temperature=0.3
    )
    
    content = response.choices[0].message.content
    try:
        data = json.loads(content)
        # Validate and fill missing fields
        expected_keys = [
            "technical_score", "communication_score", "confidence_score", 
            "role_fit_score", "overall_answer_score", "feedback_text", 
            "strengths", "weaknesses", "improved_sample_answer", "skill_gap_detected",
            "filler_words_used"
        ]
        for key in expected_keys:
            if key not in data:
                data[key] = 0 if "score" in key else ""
                
        # Fallback: forcefully inject filler word feedback if AI missed it
        if data.get("filler_words_used", 0) > 3:
            if "pause and think" not in data.get("weaknesses", "").lower() and "pause and think" not in data.get("feedback_text", "").lower():
                filler_msg = " Note: You used several filler words. Try to pause and think instead of using filler words to show confidence."
                data["weaknesses"] = str(data.get("weaknesses", "")) + filler_msg
                
        return data
    except json.JSONDecodeError:
        print("Failed to decode JSON from Groq:", content)
        return {}
