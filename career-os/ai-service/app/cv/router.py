# """
# cv/router.py

# FastAPI router for CV preview and generation.

# Endpoints:
#   GET  /cv/preview/{user_id}   → returns CVData JSON for Angular preview + edit
#   POST /cv/generate            → accepts edited CVData, returns PDF download
#   POST /cv/preview-html/{user_id} → returns rendered HTML string for in-browser preview
# """

# from fastapi import APIRouter, HTTPException
# from fastapi.responses import Response, HTMLResponse

# from .fetcher import fetch_cv_data
# from .generator import generate_pdf
# from .models import CVData, CVGenerateRequest

# router = APIRouter(prefix="/cv", tags=["CV"])


# # ── GET /cv/preview/{user_id} ─────────────────────────────────────────────────

# @router.get("/preview/{user_id}", response_model=CVData)
# async def get_cv_preview(user_id: str):
#     """
#     Fetch latest profile data from Supabase and return as structured JSON.
#     Angular uses this to show the preview + edit screen before generating.
#     """
#     try:
#         cv_data = fetch_cv_data(user_id)
#     except ValueError as e:
#         raise HTTPException(status_code=500, detail=str(e))
#     except Exception as e:
#         raise HTTPException(
#             status_code=502,
#             detail=f"Failed to fetch profile data: {str(e)}"
#         )

#     if not cv_data.name and not cv_data.experience and not cv_data.education:
#         raise HTTPException(
#             status_code=404,
#             detail="No profile data found for this user. Please upload a resume first."
#         )

#     return cv_data


# # ── POST /cv/preview-html/{user_id} ──────────────────────────────────────────

# @router.get("/preview-html/{user_id}", response_class=HTMLResponse)
# async def get_cv_preview_html(user_id: str):
#     """
#     Returns the rendered HTML so Angular can show an iframe preview
#     of exactly how the CV will look before downloading.
#     """
#     try:
#         cv_data = fetch_cv_data(user_id)
#     except Exception as e:
#         raise HTTPException(status_code=502, detail=str(e))

#     from .renderer import render_cv_html
#     html = render_cv_html(cv_data)
#     return HTMLResponse(content=html)


# # ── POST /cv/generate ─────────────────────────────────────────────────────────

# @router.post("/generate")
# async def generate_cv(request: CVGenerateRequest):
#     """
#     Accept edited CVData from Angular, generate PDF, return as download.

#     Request body:
#       {
#         "user_id": "uuid-string",
#         "cv_data": { ...CVData fields... }
#       }

#     Response: PDF file download
#     """
#     try:
#         pdf_bytes = generate_pdf(request.cv_data)
#     except Exception as e:
#         import traceback
#         traceback.print_exc()
#         raise HTTPException(
#             status_code=500,
#             detail=f"PDF generation failed: {str(e)}"
#         )

#     # Sanitise filename
#     name = (request.cv_data.name or "CV").replace(" ", "_")
#     filename = f"{name}_CV.pdf"

#     return Response(
#         content=pdf_bytes,
#         media_type="application/pdf",
#         headers={
#             "Content-Disposition": f'attachment; filename="{filename}"',
#             "Content-Length": str(len(pdf_bytes)),
#         }
#     )
"""
cv/router.py

FastAPI router for CV preview and generation.

Endpoints:
  GET  /cv/preview/{user_id}          → returns CVData JSON for Angular preview + edit
  GET  /cv/preview-html/{user_id}     → returns beautiful HTML for iframe preview
  POST /cv/generate                   → accepts edited CVData, returns ATS PDF download
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response, HTMLResponse
from jinja2 import Template
import os

from .fetcher import fetch_cv_data
from .generator import generate_pdf
from .renderer import render_cv_html
from .models import CVData, CVGenerateRequest

router = APIRouter(prefix="/cv", tags=["CV"])


def _load_preview_template() -> Template:
    """
    Load the beautiful HTML template (ats_resume.html) used for
    browser iframe preview only. This template uses full CSS (flex,
    grid, Google Fonts) and is NOT passed to xhtml2pdf.
    """
    template_path = os.path.join(os.path.dirname(__file__), "ats_resume.html")
    with open(template_path, "r", encoding="utf-8") as f:
        return Template(f.read())


def _cv_data_to_preview_dict(cv: CVData) -> dict:
    """
    Convert CVData model into the flat dict that ats_resume.html expects.
    ats_resume.html uses {{ data.X }} so we nest everything under 'data'.
    """
    return {
        "data": {
            "name": cv.name,
            "email": cv.email,
            "phone": cv.phone,
            "location": cv.location,
            "linkedin": cv.linkedin,
            "github": cv.github,
            "website": cv.website,
            "bio": cv.summary,  # ats_resume.html uses data.bio

            "education": [
                {
                    "institution": e.institution,
                    "degree": e.degree,
                    "field": e.field,
                    "start_date": e.start_date,
                    "end_date": e.end_date,
                    "is_current": e.is_current,
                    "cgpa": e.cgpa,
                    "grades": e.grades,
                    "minor": e.minor,
                }
                for e in cv.education
            ],

            "experience": [
                {
                    "job_title": e.job_title,
                    "company": e.company,
                    "start_date": e.start_date,
                    "end_date": e.end_date,
                    "is_current": e.is_current,
                    "description": e.description,
                }
                for e in cv.experience
            ],

            "projects": [
                {
                    "title": p.title,
                    "description": p.description,
                    "technologies": p.technologies,
                    "link": p.link,
                    "start_date": p.start_date,
                    "end_date": p.end_date,
                }
                for p in cv.projects
            ],

            "skills": [
                {
                    "name": s.name,
                    "proficiency": s.proficiency,
                }
                for s in cv.skills
            ],

            "languages": [
                {
                    "name": l.name,
                    "proficiency": l.proficiency,
                    "raw_score": l.raw_score,
                }
                for l in cv.languages
            ],

            "awards": [
                {
                    "title": a.title,
                    "issuer": a.issuer,
                    "year": a.year,
                    "level": a.level,
                }
                for a in cv.awards
            ],

            "activities": [
                {
                    "title": a.title,
                    "organization": a.organization,
                    "role": a.role,
                    "year": a.year,
                    "duration": a.duration,
                    "description": a.description,
                }
                for a in cv.activities
            ],

            "certifications": [
                {
                    "name": c.name,
                    "issuer": c.issuer,
                    "year": c.year,
                    "expiry": c.expiry,
                    "credential_id": c.credential_id,
                }
                for c in cv.certifications
            ],

            "references": [
                {
                    "name": r.name,
                    "title": r.title,
                    "organization": r.organization,
                    "email": r.email,
                    "phone": r.phone,
                }
                for r in cv.references
            ],
        }
    }


# ── GET /cv/preview/{user_id} ─────────────────────────────────────────────────

@router.get("/preview/{user_id}", response_model=CVData)
async def get_cv_preview(user_id: str):
    """
    Fetch latest profile data from Supabase and return as structured JSON.
    Angular uses this to populate the preview + edit form before generating.
    """
    try:
        cv_data = fetch_cv_data(user_id)
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch profile data: {str(e)}"
        )

    if not cv_data.name and not cv_data.experience and not cv_data.education:
        raise HTTPException(
            status_code=404,
            detail="No profile data found for this user. Please upload a resume first."
        )

    return cv_data


# ── GET /cv/preview-html/{user_id} ───────────────────────────────────────────

@router.get("/preview-html/{user_id}", response_class=HTMLResponse)
async def get_cv_preview_html(user_id: str):
    """
    Returns beautifully styled HTML (ats_resume.html) for Angular iframe preview.
    Uses full modern CSS — flex, grid, Google Fonts. NOT used for PDF generation.
    """
    try:
        cv_data = fetch_cv_data(user_id)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

    try:
        template = _load_preview_template()
        context = _cv_data_to_preview_dict(cv_data)
        html = template.render(**context)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to render preview HTML: {str(e)}"
        )

    return HTMLResponse(content=html)

# ── POST /cv/preview-html-from-data ──────────────────────────────────────────
 
@router.post("/preview-html-from-data", response_class=HTMLResponse)
async def get_cv_preview_html_from_data(cv_data: CVData):
    """
    Accept edited CVData from Angular, return updated HTML for iframe.
    Called every time the user edits a field — debounced on the Angular side.
    """
    try:
        html = render_cv_html(cv_data)
        return HTMLResponse(content=html)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Render failed: {str(e)}")
    
# ── POST /cv/preview-html (from edited CVData) ────────────────────────────────

@router.post("/preview-html", response_class=HTMLResponse)
async def post_cv_preview_html(request: CVGenerateRequest):
    """
    Same as GET preview-html but accepts edited CVData from Angular.
    Call this after user makes edits so the iframe updates in real time
    without saving back to Supabase yet.
    """
    try:
        template = _load_preview_template()
        context = _cv_data_to_preview_dict(request.cv_data)
        html = template.render(**context)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to render preview HTML: {str(e)}"
        )

    return HTMLResponse(content=html)


# ── POST /cv/generate ─────────────────────────────────────────────────────────

@router.post("/generate")
async def generate_cv(request: CVGenerateRequest):
    """
    Accept edited CVData from Angular, generate ATS-safe PDF via xhtml2pdf,
    return as a file download.

    The PDF uses renderer.py (ATS_CV_TEMPLATE) — single-column, no flex/grid,
    clean selectable text. This is separate from the iframe preview HTML.

    Request body:
      {
        "user_id": "uuid-string",
        "cv_data": { ...CVData fields... }
      }

    Response: PDF file download
    """
    try:
        pdf_bytes = generate_pdf(request.cv_data)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"PDF generation failed: {str(e)}"
        )

    # Sanitise filename — replace spaces with underscores
    name = (request.cv_data.name or "CV").replace(" ", "_")
    filename = f"{name}_CV.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Length": str(len(pdf_bytes)),
        }
    )