
"""
extract_text.py

Multi-strategy PDF text extractor for resume parsing.

Strategy order (best to worst for resume layouts):
  1. pymupdf4llm  — converts PDF to clean Markdown, handles multi-column layouts
  2. pdfplumber   — character-level extraction, good for tables and structured layouts
  3. PyMuPDF raw  — fast fallback, basic text dump (your original approach)

"""

from __future__ import annotations
import re

try:
    import fitz
    import pymupdf4llm
    _FITZ_AVAILABLE = True
except ImportError:
    _FITZ_AVAILABLE = False

try:
    import pdfplumber
    _PDFPLUMBER_AVAILABLE = True
except ImportError:
    _PDFPLUMBER_AVAILABLE = False

#quality scoring function
def _text_quality_score(text: str) -> float:

    if not text or len(text.strip()) < 100:
        return 0.0

    #calculation ratio of normal characters
    alnum = sum(c.isalnum() or c.isspace() or c in ".,@+-:/()" for c in text)
    ratio = alnum / len(text)

    #normal present keywords that boost the score
    keywords = ["education", "experience", "skill", "project", "email", "phone",
                "university", "college", "work", "summary", "objective"]
    keyword_hits = sum(1 for kw in keywords if kw in text.lower())
    keyword_bonus = min(keyword_hits / len(keywords), 0.3)

    return min(ratio + keyword_bonus, 1.0)

#clean the text again
def _clean_extracted_text(text: str) -> str:

    # Remove control characters except newline and tab
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)
    # Normalize line endings
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    # Strip trailing whitespace per line
    lines = [line.rstrip() for line in text.split("\n")]
    # Collapse 3+ consecutive blank lines into 2
    text = re.sub(r"\n{3,}", "\n\n", "\n".join(lines))
    
    return text.strip()


# ---------------------------------------------------------------------------
# Strategy 1 -> pymupdf4llm, converts PDF to clean Markdown, handles multi-column layouts
# ---------------------------------------------------------------------------
def _extract_with_pymupdf4llm(pdf_path: str) -> str | None:
    try:
        md_text = pymupdf4llm.to_markdown(pdf_path)
        
        #keep the markdown file readable by removing some syntax
        text = re.sub(r"#{1,6}\s*", "", md_text) #headings
        text = re.sub(r"\*{1,2}(.+?)\*{1,2}", r"\1", text) #bold/italic
        text = re.sub(r"`(.+?)`", r"\1", text) #inline code
        text = re.sub(r"!\[.*?\]\(.*?\)", "", text) #images
        text = re.sub(r"\[(.+?)\]\(.+?\)", r"\1", text) #links need keep label
        return _clean_extracted_text(text)
    
    except ImportError:
        return None
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Strategy 2 -> pdfplumber, do character-level extraction like tables and multi-column layouts
# ---------------------------------------------------------------------------
def _extract_with_pdfplumber(pdf_path: str) -> str | None:
    try:
        with pdfplumber.open(pdf_path) as pdf:
            pages_text = []
            for page in pdf.pages:
                #try table extraction first
                tables = page.extract_tables()
                table_text = ""
                if tables:
                    for table in tables:
                        for row in table:
                            row_cells = [cell or "" for cell in row]
                            table_text += "  |  ".join(row_cells) + "\n" #join the table using |

                #extract remaining text
                page_text = page.extract_text(
                    x_tolerance=3,
                    y_tolerance=3,
                    layout=True,
                    x_density=7.25,
                    y_density=13,
                ) or ""

                combined = (table_text + "\n" + page_text).strip()
                if combined:
                    pages_text.append(combined)

            full_text = "\n\n".join(pages_text)
            return _clean_extracted_text(full_text) if full_text.strip() else None
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Strategy 3 -> PyMuPDF raw, original approach, basic text dump
# ---------------------------------------------------------------------------
def _extract_with_pymupdf_raw(pdf_path: str) -> str | None:
    try:
        doc = fitz.open(pdf_path)
        pages_text = []
        for page in doc:
            pages_text.append(page.get_text())
        doc.close()
        full_text = "\n".join(pages_text)
        return _clean_extracted_text(full_text) if full_text.strip() else None
    except Exception:
        return None

# ---------------------------------------------------------------------------
# Main function
# ---------------------------------------------------------------------------
QUALITY_THRESHOLD = 0.55 #below this standard threshold, try the next strategy

def extract_resume_text(pdf_path: str) -> str:
    #use best strategy based on the quality score, if the score is below the threshold, try the next strategy until we get a good enough score or run out of strategies
    strategies = [
        ("pymupdf4llm", _extract_with_pymupdf4llm),
        ("pdfplumber",  _extract_with_pdfplumber),
        ("pymupdf_raw", _extract_with_pymupdf_raw),
    ]

    best_text = None
    best_score = 0.0
    best_strategy = None

    for name, strategy_fn in strategies:
        text = strategy_fn(pdf_path)
        if not text:
            continue

        score = _text_quality_score(text)

        if score > best_score:
            best_score = score
            best_text = text
            best_strategy = name

        if score >= QUALITY_THRESHOLD:
            break

    if not best_text:
        raise ValueError(
            "Could not extract readable text from the PDF. "
            "Please upload a text-based (ATS-friendly) PDF, not a scanned image."
        )

    #attach metadata for logging/debugging (stripped before returning)
    print(f"[extract_text] Used strategy: {best_strategy} | Quality score: {best_score:.2f}")

    return best_text


# ---------------------------------------------------------------------------
# Quality assessment —> used by main.py for user-facing warnings
# ---------------------------------------------------------------------------
def get_extraction_quality(pdf_path: str, extracted_text: str) -> dict:
    #later warning user if quality is low
    score = _text_quality_score(extracted_text)
    issues = []

    if score < 0.4:
        issues.append("Text quality is very low — PDF may be scanned or image-based.")
    if len(extracted_text) < 300:
        issues.append("Very little text was extracted — resume may be mostly graphics.")
    if not any(kw in extracted_text.lower() for kw in ["education", "university", "college", "school"]):
        issues.append("No education section detected.")
    if not any(kw in extracted_text.lower() for kw in ["skill", "experience", "work", "project"]):
        issues.append("No skills or experience section detected.")

    return {
        "quality_score": round(score, 2),
        "acceptable": score >= QUALITY_THRESHOLD,
        "issues": issues,
        "recommendation": (
            "For best results, upload a single-column, text-based PDF "
            "(ATS-friendly format, no tables, text boxes, or graphics)."
        ) if issues else None,
    }