"""
cv/generator.py

Converts rendered HTML into a PDF using xhtml2pdf.

xhtml2pdf is chosen as a drop-in replacement for WeasyPrint because:
  - Pure Python — no system/GTK dependencies
  - Produces clean, selectable text (ATS-safe)
  - Works cross-platform without extra installs

Install:
  pip install xhtml2pdf
"""

from io import BytesIO
from xhtml2pdf import pisa

from .models import CVData
from .renderer import render_cv_html


def generate_pdf(cv_data: CVData) -> bytes:
    """
    Render CVData to HTML then convert to PDF bytes.
    Returns raw PDF bytes ready to stream as a response.
    """
    html_string = render_cv_html(cv_data)

    pdf_buffer = BytesIO()
    result = pisa.CreatePDF(
        src=html_string,
        dest=pdf_buffer,
        encoding="utf-8",
    )

    if result.err:
        raise RuntimeError(
            f"xhtml2pdf encountered {result.err} error(s) during PDF generation."
        )

    return pdf_buffer.getvalue()