import fitz
import re
from typing import Dict


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Robust PDF text extraction
    """

    doc = fitz.open(stream=pdf_bytes, filetype="pdf")

    pages = []

    for page in doc:
        # Better extraction for multi-column resumes
        text = page.get_text("text", sort=True)

        # Fallback to blocks if extraction weak
        if len(text.strip()) < 50:
            blocks = page.get_text("blocks")

            if isinstance(blocks, list):
                text = " ".join(
                    block[4]
                    for block in blocks
                    if len(block) > 4
                )

        pages.append(text)

    doc.close()

    full_text = "\n".join(pages)

    # Cleanup
    full_text = re.sub(r"\s+", " ", full_text)
    full_text = full_text.encode(
        "utf-8",
        "ignore"
    ).decode()

    return full_text.strip()


def extract_candidate_name(lines):
    """
    Heuristic candidate name extraction
    """

    for line in lines[:10]:
        stripped = line.strip()

        if (
            stripped
            and len(stripped.split()) <= 4
            and not any(
                x in stripped.lower()
                for x in [
                    "@",
                    "linkedin",
                    "github",
                    "http",
                    "+91",
                    ".com"
                ]
            )
        ):
            return stripped

    return ""


def parse_resume(pdf_bytes: bytes) -> Dict:
    """
    Lightweight parser.
    Let the LLM do semantic understanding.
    """

    raw_text = extract_text_from_pdf(pdf_bytes)

    print("=" * 80)
    print("RAW EXTRACTED TEXT:")
    print(raw_text[:5000])
    print("=" * 80)

    lines = raw_text.split("\n")

    parsed = {
        "raw_text": raw_text,
        "candidate_name": extract_candidate_name(lines),
    }

    return parsed