from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from fastapi.responses import Response
import os
from dotenv import load_dotenv

load_dotenv(override=True)
import shutil
import json
# import weasyprint

from app.extract_text import extract_resume_text, get_extraction_quality
from app.clean_text import clean_resume_text
from app.llm_parser import extract_structured_resume, generate_roadmap_suggestions
from app.schema import ResumeData
from app.normalize import normalize_resume
from app.cv import router as cv_router

# from app.supabase_client import fetch_profile_data, update_resume_preview
# from app.cv_generator import generate_cv_html
# from fastapi.responses import Response
# from dotenv import load_dotenv
# load_dotenv()
from app.interview_router import router as interview_router
from app.survey_insights_router import router as survey_insights_router
from app.fair_pay_router import router as fair_pay_router

app = FastAPI(
    title="Living Portfolio AI Service",
    description="Resume extraction, roadmap generation, and CV download service",
    version="2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://career-os-mauve-three.vercel.app/",
        "https://career-os-production-6ab0.up.railway.app/", # yet to add the actual deployed backend url
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
 
app.include_router(cv_router)
app.include_router(interview_router)
app.include_router(survey_insights_router)
app.include_router(fair_pay_router)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.get("/")
def home():
    return {"message": "AI Service Running"}

@app.post("/upload-resume", response_model=None)
async def upload_file(file: UploadFile = File(...)):

    #save to file
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    #extract text with error handling
    try:
        extracted_text = extract_resume_text(file_path)
    except ValueError as e:
        # Unreadable PDF — tell the user clearly
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not read file: {str(e)}")

    #get the quality of report, if low warning to the user that the extraction might be wrong as the resume might consists of messy information
    quality_report = get_extraction_quality(file_path, extracted_text)
 
    #clean the extracted text
    cleaned_text = clean_resume_text(extracted_text)

    if not cleaned_text or len(cleaned_text.strip()) < 50:
        raise HTTPException(status_code=422, detail="Resume appears to be empty or unreadable.")

    #pass the cleaned extracted text to llm parser to extract into structured data
    try:
        structured_data = extract_structured_resume(cleaned_text)
    except json.JSONDecodeError as e: #error handling
        raise HTTPException(status_code=502, detail=f"AI returned malformed response: {str(e)}")
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=502, detail=f"AI extraction failed: {type(e).__name__}: {str(e)}")

    #normalize the structured data into consistent format
    normalized_data = normalize_resume(structured_data)

    #validation done using pydantic schema, if it fails return error to the user
    try:
        validated_resume = ResumeData(**{
            k: v for k, v in normalized_data.items()
            if k in ResumeData.model_fields
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Schema validation failed: {str(e)}")

    #return resume data and quality report to the user
    return {
        "data": validated_resume.model_dump(),
        "extraction_quality": quality_report,
    }

class RoadmapRequest(BaseModel):
    targetRole: str
    currentSkills: List[str]
    education: List[str]
    experience: List[str]
    bio: str

class SkillSuggestion(BaseModel):
    name: str
    why_it_matters: str
    estimated_learning_time: str
    type: str

class RoadmapResponse(BaseModel):
    suggestions: List[SkillSuggestion]

@app.post("/roadmap/generate", response_model=RoadmapResponse)
def generate_roadmap(req: RoadmapRequest):
    try:
        # Call your LLM parser to generate suggestions dynamically
        suggestions = generate_roadmap_suggestions(
            target_role=req.targetRole,
            current_skills=req.currentSkills,
            education=req.education,
            experience=req.experience,
            bio=req.bio
        )
        return {"suggestions": suggestions}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Roadmap generation failed: {str(e)}")
    
# @app.get("/resume-preview/{user_id}")
# def resume_preview(user_id: str):

#     data = fetch_profile_data(user_id)

#     return {
#         "success": True,
#         "data": data
#     }

# @app.post("/resume-preview/update")
# def update_resume_preview(
#     payload: ResumePreview
# ):
#     # Here you would typically update the resume preview in your database
#     # For this example, we'll just return the received data

#     return {
#         "success": True,
#         "message": "Resume preview updated successfully",
#         "data": payload.dict()
#     }

# @app.post("/generate-cv")
# def generate_cv(payload: ResumePreview):

#     html = generate_cv_html(payload.model_dump())

#     pdf = weasyprint.HTML(
#         string=html
#     ).write_pdf()

#     return Response(
#         content=pdf,
#         media_type="application/pdf",
#         headers={
#             "Content-Disposition":
#             "attachment; filename=careeros_cv.pdf"
#         }
#     )

class CareerAnalysisRequest(BaseModel):
    supabaseUid: str
    bio: str
    education: List[dict]
    experience: List[dict]
    skills: List[dict]

@app.post("/career-analysis/analyze")
def analyze_career_profile(req: CareerAnalysisRequest):
    try:
        from app.llm_parser import generate_career_predictions
        prediction = generate_career_predictions(
            education=req.education,
            experience=req.experience,
            skills=req.skills,
            bio=req.bio
        )
        prediction["userId"] = req.supabaseUid
        from datetime import date
        prediction["analysisDate"] = date.today().isoformat()
        return prediction
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Career analysis failed: {str(e)}")
