# # """
# # cv/fetcher.py

# # Fetches all resume data for a user from Supabase dbo schema.
# # Uses the service key to bypass Row Level Security.
# # """

# # import os
# # from typing import Optional
# # from dotenv import load_dotenv
# # from supabase import create_client, Client
# # from .models import (
# #     CVData, CVEducation, CVExperience, CVProject, CVSkill,
# #     CVLanguage, CVAward, CVActivity, CVCertification, CVReference
# # )

# # load_dotenv()

# # def _get_supabase() -> Client:
# #     url = os.getenv("SUPABASE_URL")
# #     key = os.getenv("SUPABASE_SERVICE_KEY")
# #     if not url or not key:
# #         raise ValueError(
# #             "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in your .env file. "
# #             "Use the service_role key from Supabase → Settings → API."
# #         )
# #     return create_client(url, key)


# # def _fetch_table(sb: Client, table: str, user_id: str) -> list:
# #     """Fetch all rows for a user from a dbo schema table."""
# #     try:
# #         res = (
# #             sb.schema("dbo")
# #             .table(table)
# #             .select("*")
# #             .eq("user_id", user_id)
# #             .execute()
# #         )
# #         return res.data or []
# #     except Exception as e:
# #         print(f"[fetcher] Warning: could not fetch dbo.{table}: {e}")
# #         return []


# # def _fetch_one(sb: Client, table: str, user_id: str) -> Optional[dict]:
# #     rows = _fetch_table(sb, table, user_id)
# #     return rows[0] if rows else None


# # def fetch_cv_data(user_id: str) -> CVData:
# #     """
# #     Fetch all resume sections for a user and return as CVData.
# #     user_id is the Supabase Auth UUID string.
# #     """
# #     sb = _get_supabase()

# #     profile = _fetch_one(sb, "user_profiles", user_id)
# #     raw_edu     = _fetch_table(sb, "education",             user_id)
# #     raw_exp     = _fetch_table(sb, "experience",            user_id)
# #     raw_proj    = _fetch_table(sb, "projects",              user_id)
# #     raw_skills  = _fetch_table(sb, "skills",                user_id)
# #     raw_langs   = _fetch_table(sb, "resume_languages",      user_id)
# #     raw_awards  = _fetch_table(sb, "resume_awards",         user_id)
# #     raw_acts    = _fetch_table(sb, "resume_activities",     user_id)
# #     raw_certs   = _fetch_table(sb, "resume_certifications", user_id)
# #     raw_refs    = _fetch_table(sb, "resume_references",     user_id)

# #     # Build full name
# #     first = (profile or {}).get("first_name", "")
# #     last  = (profile or {}).get("last_name", "")
# #     name  = f"{first} {last}".strip() or None

# #     return CVData(
# #         name=name,
# #         email=(profile or {}).get("email"),
# #         phone=(profile or {}).get("phone"),
# #         location=(profile or {}).get("location"),
# #         linkedin=(profile or {}).get("linkedin"),
# #         github=(profile or {}).get("github"),
# #         website=(profile or {}).get("website"),
# #         summary=(profile or {}).get("bio"),

# #         education=[
# #             CVEducation(
# #                 id=e.get("id"),
# #                 institution=e.get("institution"),
# #                 degree=e.get("degree"),
# #                 field=e.get("field"),
# #                 start_date=str(e["start_date"]) if e.get("start_date") else None,
# #                 end_date=str(e["end_date"]) if e.get("end_date") else None,
# #                 is_current=e.get("is_current"),
# #                 cgpa=e.get("cgpa"),
# #                 grades=e.get("grades"),
# #                 minor=e.get("minor"),
# #             )
# #             for e in raw_edu
# #         ],

# #         experience=[
# #             CVExperience(
# #                 id=e.get("id"),
# #                 job_title=e.get("job_title"),
# #                 company=e.get("company"),
# #                 start_date=str(e["start_date"]) if e.get("start_date") else None,
# #                 end_date=str(e["end_date"]) if e.get("end_date") else None,
# #                 is_current=e.get("is_current"),
# #                 description=e.get("description"),
# #             )
# #             for e in raw_exp
# #         ],

# #         projects=[
# #             CVProject(
# #                 id=p.get("id"),
# #                 title=p.get("title"),
# #                 description=p.get("description"),
# #                 technologies=p.get("technologies"),
# #                 link=p.get("link"),
# #                 start_date=str(p["start_date"]) if p.get("start_date") else None,
# #                 end_date=str(p["end_date"]) if p.get("end_date") else None,
# #             )
# #             for p in raw_proj
# #         ],

# #         skills=[
# #             CVSkill(
# #                 id=s.get("id"),
# #                 name=s.get("name"),
# #                 proficiency=s.get("proficiency"),
# #             )
# #             for s in raw_skills
# #         ],

# #         languages=[
# #             CVLanguage(
# #                 id=l.get("id"),
# #                 name=l.get("name"),
# #                 proficiency=l.get("proficiency"),
# #                 raw_score=l.get("raw_score"),
# #             )
# #             for l in raw_langs
# #         ],

# #         awards=[
# #             CVAward(
# #                 id=a.get("id"),
# #                 title=a.get("title"),
# #                 issuer=a.get("issuer"),
# #                 year=a.get("year"),
# #                 level=a.get("level"),
# #             )
# #             for a in raw_awards
# #         ],

# #         activities=[
# #             CVActivity(
# #                 id=a.get("id"),
# #                 title=a.get("title"),
# #                 organization=a.get("organization"),
# #                 role=a.get("role"),
# #                 year=a.get("year"),
# #                 duration=a.get("duration"),
# #                 description=a.get("description"),
# #             )
# #             for a in raw_acts
# #         ],

# #         certifications=[
# #             CVCertification(
# #                 id=c.get("id"),
# #                 name=c.get("name"),
# #                 issuer=c.get("issuer"),
# #                 year=c.get("year"),
# #                 expiry=c.get("expiry"),
# #                 credential_id=c.get("credential_id"),
# #             )
# #             for c in raw_certs
# #         ],

# #         references=[
# #             CVReference(
# #                 id=r.get("id"),
# #                 name=r.get("name"),
# #                 title=r.get("title"),
# #                 organization=r.get("organization"),
# #                 email=r.get("email"),
# #                 phone=r.get("phone"),
# #             )
# #             for r in raw_refs
# #         ],
# #     )
# """
# cv/fetcher.py

# Fetches all resume data for a user from Supabase dbo schema.
# Uses the service key to bypass Row Level Security.
# """

# import os
# from typing import Optional
# from dotenv import load_dotenv
# from supabase import create_client, Client
# from .models import (
#     CVData, CVEducation, CVExperience, CVProject, CVSkill,
#     CVLanguage, CVAward, CVActivity, CVCertification, CVReference
# )

# load_dotenv()


# def _get_supabase() -> Client:
#     url = os.getenv("SUPABASE_URL")
#     key = os.getenv("SUPABASE_SERVICE_KEY")
    
#     if not url or not key:
#         raise ValueError(
#             "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in your .env file. "
#             "Use the service_role key from Supabase → Settings → API."
#         )
#     return create_client(url, key)


# def _fetch_table(sb: Client, table: str, user_id: str) -> list:
#     """Fetch all rows for a user from a dbo schema table."""
#     try:
#         res = (
#             sb.schema("dbo")
#             .table(table)
#             .select("*")
#             .eq("user_id", user_id)
#             .execute()
#         )
#         return res.data or []
#     except Exception as e:
#         print(f"[fetcher] Warning: could not fetch dbo.{table}: {e}")
#         return []


# def _fetch_one(sb: Client, table: str, user_id: str) -> Optional[dict]:
#     rows = _fetch_table(sb, table, user_id)
#     return rows[0] if rows else None


# def fetch_cv_data(user_id: str) -> CVData:
#     """
#     Fetch all resume sections for a user and return as CVData.
#     user_id is the Supabase Auth UUID string.
#     """
#     sb = _get_supabase()

#     profile = _fetch_one(sb, "user_profiles", user_id)
#     raw_edu     = _fetch_table(sb, "education",             user_id)
#     raw_exp     = _fetch_table(sb, "experience",            user_id)
#     raw_proj    = _fetch_table(sb, "projects",              user_id)
#     raw_skills  = _fetch_table(sb, "skills",                user_id)
#     raw_langs   = _fetch_table(sb, "resume_languages",      user_id)
#     raw_awards  = _fetch_table(sb, "resume_awards",         user_id)
#     raw_acts    = _fetch_table(sb, "resume_activities",     user_id)
#     raw_certs   = _fetch_table(sb, "resume_certifications", user_id)
#     raw_refs    = _fetch_table(sb, "resume_references",     user_id)

#     # Build full name
#     first = (profile or {}).get("first_name", "")
#     last  = (profile or {}).get("last_name", "")
#     name  = f"{first} {last}".strip() or None

#     return CVData(
#         name=name,
#         email=(profile or {}).get("email"),
#         phone=(profile or {}).get("phone"),
#         location=(profile or {}).get("location"),
#         linkedin=(profile or {}).get("linkedin"),
#         github=(profile or {}).get("github"),
#         website=(profile or {}).get("website"),
#         summary=(profile or {}).get("bio"),

#         education=[
#             CVEducation(
#                 id=e.get("id"),
#                 institution=e.get("institution"),
#                 degree=e.get("degree"),
#                 field=e.get("field"),
#                 start_date=str(e["start_date"]) if e.get("start_date") else None,
#                 end_date=str(e["end_date"]) if e.get("end_date") else None,
#                 is_current=e.get("is_current"),
#                 cgpa=e.get("cgpa"),
#                 grades=e.get("grades"),
#                 minor=e.get("minor"),
#             )
#             for e in raw_edu
#         ],

#         experience=[
#             CVExperience(
#                 id=e.get("id"),
#                 job_title=e.get("job_title"),
#                 company=e.get("company"),
#                 start_date=str(e["start_date"]) if e.get("start_date") else None,
#                 end_date=str(e["end_date"]) if e.get("end_date") else None,
#                 is_current=e.get("is_current"),
#                 description=e.get("description"),
#             )
#             for e in raw_exp
#         ],

#         projects=[
#             CVProject(
#                 id=p.get("id"),
#                 title=p.get("title"),
#                 description=p.get("description"),
#                 technologies=p.get("technologies"),
#                 link=p.get("link"),
#                 start_date=str(p["start_date"]) if p.get("start_date") else None,
#                 end_date=str(p["end_date"]) if p.get("end_date") else None,
#             )
#             for p in raw_proj
#         ],

#         skills=[
#             CVSkill(
#                 id=s.get("id"),
#                 name=s.get("name"),
#                 proficiency=s.get("proficiency"),
#             )
#             for s in raw_skills
#         ],

#         languages=[
#             CVLanguage(
#                 id=l.get("id"),
#                 name=l.get("name"),
#                 proficiency=l.get("proficiency"),
#                 raw_score=l.get("raw_score"),
#             )
#             for l in raw_langs
#         ],

#         awards=[
#             CVAward(
#                 id=a.get("id"),
#                 title=a.get("title"),
#                 issuer=a.get("issuer"),
#                 year=a.get("year"),
#                 level=a.get("level"),
#             )
#             for a in raw_awards
#         ],

#         activities=[
#             CVActivity(
#                 id=a.get("id"),
#                 title=a.get("title"),
#                 organization=a.get("organization"),
#                 role=a.get("role"),
#                 year=a.get("year"),
#                 duration=a.get("duration"),
#                 description=a.get("description"),
#             )
#             for a in raw_acts
#         ],

#         certifications=[
#             CVCertification(
#                 id=c.get("id"),
#                 name=c.get("name"),
#                 issuer=c.get("issuer"),
#                 year=c.get("year"),
#                 expiry=c.get("expiry"),
#                 credential_id=c.get("credential_id"),
#             )
#             for c in raw_certs
#         ],

#         references=[
#             CVReference(
#                 id=r.get("id"),
#                 name=r.get("name"),
#                 title=r.get("title"),
#                 organization=r.get("organization"),
#                 email=r.get("email"),
#                 phone=r.get("phone"),
#             )
#             for r in raw_refs
#         ],
#     )
import os
from typing import Optional
from dotenv import load_dotenv
from supabase import create_client, Client
from supabase.client import ClientOptions
from .models import (
    CVData, CVEducation, CVExperience, CVProject, CVSkill,
    CVLanguage, CVAward, CVActivity, CVCertification, CVReference
)

load_dotenv()


def _get_supabase() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    
    if not url or not key:
        raise ValueError(
            "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in your .env file. "
            "Use the service_role key from Supabase → Settings → API."
        )

    opts = ClientOptions(schema="dbo")
    return create_client(url, key, options=opts)


def _fetch_table(sb: Client, table: str, user_id: str) -> list:
    """Fetch all rows for a user from a dbo schema table."""
    try:
        res = (
            sb.table(table)
            .select("*")
            .eq("user_id", user_id)
            .execute()
        )
        return res.data or []
    except Exception as e:
        print(f"[fetcher] Warning: could not fetch dbo.{table}: {e}")
        return []


def _fetch_one(sb: Client, table: str, user_id: str) -> Optional[dict]:
    rows = _fetch_table(sb, table, user_id)
    return rows[0] if rows else None


def fetch_cv_data(user_id: str) -> CVData:
    """
    Fetch all resume sections for a user and return as CVData.
    user_id is the Supabase Auth UUID string.
    """
    sb = _get_supabase()

    profile = _fetch_one(sb, "user_profiles", user_id)
    raw_edu     = _fetch_table(sb, "education",             user_id)
    raw_exp     = _fetch_table(sb, "experience",            user_id)
    raw_proj    = _fetch_table(sb, "projects",              user_id)
    raw_skills  = _fetch_table(sb, "skills",                user_id)
    raw_langs   = _fetch_table(sb, "resume_languages",      user_id)
    raw_awards  = _fetch_table(sb, "resume_awards",         user_id)
    raw_acts    = _fetch_table(sb, "resume_activities",     user_id)
    raw_certs   = _fetch_table(sb, "resume_certifications", user_id)
    raw_refs    = _fetch_table(sb, "resume_references",     user_id)

    # Build full name
    first = (profile or {}).get("first_name", "")
    last  = (profile or {}).get("last_name", "")
    name  = f"{first} {last}".strip() or None

    return CVData(
        name=name,
        email=(profile or {}).get("email"),
        phone=(profile or {}).get("phone"),
        location=(profile or {}).get("location"),
        linkedin=(profile or {}).get("linkedin"),
        github=(profile or {}).get("github"),
        website=(profile or {}).get("website"),
        summary=(profile or {}).get("bio"),

        education=[
            CVEducation(
                id=e.get("id"),
                institution=e.get("institution"),
                degree=e.get("degree"),
                field=e.get("field"),
                start_date=str(e["start_date"]) if e.get("start_date") else None,
                end_date=str(e["end_date"]) if e.get("end_date") else None,
                is_current=e.get("is_current"),
                cgpa=e.get("cgpa"),
                grades=e.get("grades"),
                minor=e.get("minor"),
            )
            for e in raw_edu
        ],

        experience=[
            CVExperience(
                id=e.get("id"),
                job_title=e.get("job_title"),
                company=e.get("company"),
                start_date=str(e["start_date"]) if e.get("start_date") else None,
                end_date=str(e["end_date"]) if e.get("end_date") else None,
                is_current=e.get("is_current"),
                description=e.get("description"),
            )
            for e in raw_exp
        ],

        projects=[
            CVProject(
                id=p.get("id"),
                title=p.get("title"),
                description=p.get("description"),
                technologies=p.get("technologies"),
                link=p.get("link"),
                start_date=str(p["start_date"]) if p.get("start_date") else None,
                end_date=str(p["end_date"]) if p.get("end_date") else None,
            )
            for p in raw_proj
        ],

        skills=[
            CVSkill(
                id=s.get("id"),
                name=s.get("name"),
                proficiency=s.get("proficiency"),
            )
            for s in raw_skills
        ],

        languages=[
            CVLanguage(
                id=l.get("id"),
                name=l.get("name"),
                proficiency=l.get("proficiency"),
                raw_score=l.get("raw_score"),
            )
            for l in raw_langs
        ],

        awards=[
            CVAward(
                id=a.get("id"),
                title=a.get("title"),
                issuer=a.get("issuer"),
                year=a.get("year"),
                level=a.get("level"),
            )
            for a in raw_awards
        ],

        activities=[
            CVActivity(
                id=a.get("id"),
                title=a.get("title"),
                organization=a.get("organization"),
                role=a.get("role"),
                year=a.get("year"),
                duration=a.get("duration"),
                description=a.get("description"),
            )
            for a in raw_acts
        ],

        certifications=[
            CVCertification(
                id=c.get("id"),
                name=c.get("name"),
                issuer=c.get("issuer"),
                year=c.get("year"),
                expiry=c.get("expiry"),
                credential_id=c.get("credential_id"),
            )
            for c in raw_certs
        ],

        references=[
            CVReference(
                id=r.get("id"),
                name=r.get("name"),
                title=r.get("title"),
                organization=r.get("organization"),
                email=r.get("email"),
                phone=r.get("phone"),
            )
            for r in raw_refs
        ],
    )