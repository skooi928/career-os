from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.question_generator import generate_interview_questions
from app.evaluation_service import evaluate_interview_answer

router = APIRouter(prefix="/interview", tags=["Mock Interview"])

class GenerateQuestionsRequest(BaseModel):
    targetRole: str
    industry: str
    seniorityLevel: str
    skills: List[str]

class QuestionResponse(BaseModel):
    question_text: str
    question_tag: str
    question_type: str
    difficulty_level: str

class EvaluateAnswerRequest(BaseModel):
    question: str
    answer_text: str
    role: str

@router.post("/generate-questions", response_model=dict)
def generate_questions(req: GenerateQuestionsRequest):
    try:
        questions = generate_interview_questions(
            target_role=req.targetRole,
            industry=req.industry,
            seniority_level=req.seniorityLevel,
            skills=req.skills
        )
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate questions: {str(e)}")

@router.post("/evaluate", response_model=dict)
def evaluate_answer(req: EvaluateAnswerRequest):
    try:
        evaluation = evaluate_interview_answer(
            question=req.question,
            answer_text=req.answer_text,
            role=req.role
        )
        return {"evaluation": evaluation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to evaluate answer: {str(e)}")
