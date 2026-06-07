from pydantic import BaseModel
from typing import List, Optional

class ResumeSection(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

class Skill(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None

class Experience(BaseModel):
    role: Optional[str] = None
    company: Optional[str] = None 
    duration: Optional[str] = None
    start_date: Optional[str] = None 
    end_date: Optional[str] = None 
    is_current: Optional[bool] = None
    description: Optional[str] = None
    responsibilities: List[str] = [] 

class HumanLanguage(BaseModel):
    name: Optional[str] = None
    proficiency: Optional[str] = None
    raw_score: Optional[str]=None

class Education(BaseModel):
    institution: Optional[str] = None
    qualification: Optional[str] = None
    field_of_study: Optional[str] = None 
    year: Optional[str] = None   
    start_year: Optional[str] = None
    cgpa: Optional[str] = None
    grades: Optional[str] = None
    is_current: Optional[bool] = None

class Project(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tools_and_methods: List[str] = []
    url: Optional[str] = None
    year: Optional[str] = None

class Award(BaseModel):
    title: Optional[str] = None
    issuer: Optional[str] = None
    year: Optional[str] = None
    level: Optional[str] = None #school, regional, national, international

class Activity(BaseModel):
    """
    Co-curricular activities, leadership roles, club memberships,
    volunteer work, committee positions — anything that is a ROLE held,
    not an award won.
    """
    title: Optional[str] = None
    organization: Optional[str] = None
    role: Optional[str] = None
    year: Optional[str] = None
    duration: Optional[str] = None
    description: Optional[str] = None

class Certification(BaseModel):
    name: Optional[str] = None
    issuer: Optional[str] = None
    year: Optional[str] = None
    expiry: Optional[str] = None
    credential_id: Optional[str] = None

class Reference(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    organization: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

class ResumeData(BaseModel):
    #contact info
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None

    #core sections
    summary: Optional[str] = None
    skills: List[Skill] = []
    experience: List[Experience] = []
    education: List[Education] = []
    projects: List[Project] = []
    human_languages: List[HumanLanguage] = []

    #achievements and participation
    awards: List[Award] = []
    activities: List[Activity] = []

    certifications: List[Certification] = []
    references: List[Reference] = []

    #raw sections for any content that doesn't fit above
    sections: List[ResumeSection] = []