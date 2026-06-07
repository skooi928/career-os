import re

def clean_resume_text(text):

    # Remove extra spaces
    text = re.sub(r'[ \t]+', ' ', text)

    # Remove repeated empty lines
    text = re.sub(r'\n+', '\n', text)

    # Remove leading/trailing spaces
    text = text.strip()

    # Remove pymupdf4llm picture placeholders
    text = re.sub(r'==> picture \[.*?\] intentionally omitted <==\n?', '', text)

    # Convert bullet symbols into standard bullet
    bullets = ['•', '▪', '◦', '●', '–', '—']

    for b in bullets:
        text = text.replace(b, '-')

    # Fix broken words split by line breaks
    text = re.sub(r'(\w)\n(\w)', r'\1 \2', text)

    return text