from fastapi import FastAPI, UploadFile, File, HTTPException
import os
import shutil
import json

from app.extract_text import extract_resume_text, get_extraction_quality
from app.clean_text import clean_resume_text
from app.llm_parser import extract_structured_resume
from app.schema import ResumeData
from app.normalize import normalize_resume

app = FastAPI(
    title="Living Portfolio AI Service",
    description="Resume extraction and roadmap service",
    version="1.0"
)

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


