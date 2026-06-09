"""
cv/models.py

Pydantic models for CV data flowing between:
  - Supabase (fetcher)
  - Preview endpoint (returned to Angular)
  - Generate endpoint (received from Angular after user edits)
"""

from pydantic import BaseModel
from typing import List, Optional

class CVEducation(BaseModel):
    id: Optional[int] = None
    institution: Optional[str] = None
    degree: Optional[str] = None
    field: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: Optional[bool] = None
    cgpa: Optional[str] = None
    grades: Optional[str] = None
    minor: Optional[str] = None


class CVExperience(BaseModel):
    id: Optional[int] = None
    job_title: Optional[str] = None
    company: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: Optional[bool] = None
    description: Optional[str] = None


class CVProject(BaseModel):
    id: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    technologies: Optional[str] = None   # comma-separated string from DB
    link: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class CVSkill(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None
    proficiency: Optional[str] = None    # Beginner/Intermediate/Advanced/Expert


class CVLanguage(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None
    proficiency: Optional[str] = None
    raw_score: Optional[str] = None


class CVAward(BaseModel):
    id: Optional[int] = None
    title: Optional[str] = None
    issuer: Optional[str] = None
    year: Optional[str] = None
    level: Optional[str] = None


class CVActivity(BaseModel):
    id: Optional[int] = None
    title: Optional[str] = None
    organization: Optional[str] = None
    role: Optional[str] = None
    year: Optional[str] = None
    duration: Optional[str] = None
    description: Optional[str] = None


class CVCertification(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None
    issuer: Optional[str] = None
    year: Optional[str] = None
    expiry: Optional[str] = None
    credential_id: Optional[str] = None


class CVReference(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None
    title: Optional[str] = None
    organization: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None


class CVSectionToggle(BaseModel):
    """Which sections to include in the generated CV."""
    summary: bool = True
    experience: bool = True
    education: bool = True
    skills: bool = True
    projects: bool = True
    languages: bool = True
    awards: bool = True
    activities: bool = True
    certifications: bool = True
    references: bool = True


class CVData(BaseModel):
    """
    Full CV data model — returned by /cv/preview and
    accepted by /cv/generate after user edits.
    """
    # Contact
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    website: Optional[str] = None
    summary: Optional[str] = None

    # Sections
    education: List[CVEducation] = []
    experience: List[CVExperience] = []
    projects: List[CVProject] = []
    skills: List[CVSkill] = []
    languages: List[CVLanguage] = []
    awards: List[CVAward] = []
    activities: List[CVActivity] = []
    certifications: List[CVCertification] = []
    references: List[CVReference] = []

    # Section visibility toggles
    sections: CVSectionToggle = CVSectionToggle()


class CVGenerateRequest(BaseModel):
    """Request body for POST /cv/generate"""
    user_id: str
    cv_data: CVData          # Edited CV data from Angular preview