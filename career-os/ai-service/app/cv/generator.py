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