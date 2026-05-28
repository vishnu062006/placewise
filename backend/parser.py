import fitz  # PyMuPDF
import re
from typing import Optional


SECTION_HEADERS = {
    "education": [
        r"\beducation\b", r"\bacademic[s]?\b", r"\bqualification[s]?\b"
    ],
    "skills": [
        r"\bskills?\b", r"\btechnical skills?\b", r"\bcore competencies\b",
        r"\btechnologies\b", r"\btech stack\b"
    ],
    "projects": [
        r"\bprojects?\b", r"\bacademic projects?\b", r"\bpersonal projects?\b",
        r"\bwork samples?\b"
    ],
    "experience": [
        r"\bexperience\b", r"\binternship[s]?\b", r"\bwork experience\b",
        r"\bemployment\b", r"\bindustry experience\b"
    ],
    "achievements": [
        r"\bachievements?\b", r"\bawards?\b", r"\bhonors?\b",
        r"\bcertifications?\b", r"\baccomplishments?\b"
    ],
    "summary": [
        r"\bsummary\b", r"\bobjective\b", r"\babout\b", r"\bprofile\b"
    ]
}


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    full_text = ""
    for page in doc:
        full_text += page.get_text("text") + "\n"
    doc.close()
    return full_text.strip()


def is_section_header(line: str) -> Optional[str]:
    cleaned = line.strip().lower()
    if not cleaned or len(cleaned) > 60:
        return None
    for section, patterns in SECTION_HEADERS.items():
        for pattern in patterns:
            if re.search(pattern, cleaned, re.IGNORECASE):
                return section
    return None


def parse_resume(pdf_bytes: bytes) -> dict:
    raw_text = extract_text_from_pdf(pdf_bytes)
    lines = raw_text.split("\n")

    sections: dict = {
        "education": [],
        "skills": [],
        "projects": [],
        "experience": [],
        "achievements": [],
        "summary": [],
        "raw_text": raw_text
    }

    current_section = "summary"

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        detected = is_section_header(stripped)
        if detected:
            current_section = detected
            continue

        sections[current_section].append(stripped)

    # Join each section into a single string
    for key in sections:
        if key != "raw_text" and isinstance(sections[key], list):
            sections[key] = " ".join(sections[key]).strip()

    # Extract name from first non-empty lines (heuristic)
    name_candidate = ""
    for line in lines[:6]:
        stripped = line.strip()
        if stripped and len(stripped.split()) <= 5 and not any(
            c in stripped for c in ["@", "http", "+", "/"]
        ):
            name_candidate = stripped
            break

    sections["candidate_name"] = name_candidate

    return sections