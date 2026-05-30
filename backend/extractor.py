import json
import re
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

EXTRACTION_PROMPT = """
You are a technical recruiter analyzing a student resume for campus placements in India.

Extract structured information from the resume text below and return ONLY valid JSON.
Do not include markdown, explanations, or backticks.

Resume Text:
{resume_text}

Return this exact JSON structure:
{{
  "technical_skills": [],
  "soft_skills": [],
  "projects": [
    {{
      "name": "",
      "tech_used": [],
      "has_impact_metrics": false,
      "complexity": "low",
      "description": ""
    }}
  ],
  "cgpa": null,
  "internships": [
    {{
      "company": "",
      "role": "",
      "duration": ""
    }}
  ],
  "internship_count": 0,
  "has_dsa_signals": false,
  "dsa_signals": [],
  "certifications": [],
  "college": null,
  "branch": null,
  "year_of_study": null,
  "github_present": false,
  "linkedin_present": false,
  "total_projects_count": 0,
  "strongest_skill_area": "unknown"
}}

Rules:
- Only include information explicitly present in the resume.
- Do not hallucinate.
- technical_skills should include programming languages, frameworks, tools, databases, cloud, libraries.
- strongest_skill_area must be one of:
  frontend/backend/fullstack/ml_ai/data/mobile/devops/core_cs/unknown
- Return ONLY valid JSON.
"""


def extract_skills(parsed_resume: dict) -> dict:
    """
    Main structured extraction function
    """

    # Use ONLY raw text
    raw_text = parsed_resume.get("raw_text", "")

    # Safety cleanup
    raw_text = raw_text.encode("utf-8", "ignore").decode()
    raw_text = re.sub(r"\s+", " ", raw_text).strip()

    # Increase text limit
    resume_text = raw_text[:15000]

    print("=" * 80)
    print("RAW RESUME TEXT:")
    print(resume_text[:5000])
    print("=" * 80)

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "user",
                    "content": EXTRACTION_PROMPT.format(
                        resume_text=resume_text
                    ),
                }
            ],
            temperature=0.1,
            max_tokens=2000,
        )

        raw_output = response.choices[0].message.content.strip()

        print("=" * 80)
        print("LLM RAW OUTPUT:")
        print(raw_output)
        print("=" * 80)

        # Remove markdown fences if model adds them
        raw_output = re.sub(r"```json|```", "", raw_output).strip()

        extracted = json.loads(raw_output)

        # Safety normalization
        extracted = _normalize_extracted_data(extracted)

        print("=" * 80)
        print("FINAL PARSED JSON:")
        print(json.dumps(extracted, indent=2))
        print("=" * 80)

        return extracted

    except Exception as e:
        print("EXTRACTION ERROR:", str(e))

        # fallback extraction
        return _fallback_extraction(raw_text)


def _normalize_extracted_data(data: dict) -> dict:
    """
    Prevent frontend crashes from missing keys
    """

    defaults = {
        "technical_skills": [],
        "soft_skills": [],
        "projects": [],
        "cgpa": None,
        "internships": [],
        "internship_count": 0,
        "has_dsa_signals": False,
        "dsa_signals": [],
        "certifications": [],
        "college": None,
        "branch": None,
        "year_of_study": None,
        "github_present": False,
        "linkedin_present": False,
        "total_projects_count": 0,
        "strongest_skill_area": "unknown",
    }

    for key, value in defaults.items():
        if key not in data:
            data[key] = value

    # Ensure arrays are arrays
    array_fields = [
        "technical_skills",
        "soft_skills",
        "projects",
        "internships",
        "dsa_signals",
        "certifications",
    ]

    for field in array_fields:
        if not isinstance(data.get(field), list):
            data[field] = []

    return data


def _fallback_extraction(raw_text: str) -> dict:
    """
    Simple regex + keyword fallback if LLM fails
    """

    text = raw_text.lower()

    common_tech = [
        "python",
        "java",
        "c",
        "c++",
        "javascript",
        "typescript",
        "react",
        "nextjs",
        "nodejs",
        "express",
        "mongodb",
        "mysql",
        "postgresql",
        "sql",
        "html",
        "css",
        "tailwind",
        "spring",
        "spring boot",
        "docker",
        "kubernetes",
        "aws",
        "firebase",
        "flutter",
        "kotlin",
        "swift",
        "git",
        "github",
        "machine learning",
        "tensorflow",
        "pytorch",
    ]

    found_skills = []

    for tech in common_tech:
        if tech in text:
            found_skills.append(tech)

    # CGPA extraction
    cgpa_match = re.search(
        r"(cgpa|gpa)[^\d]{0,10}(\d+(\.\d+)?)",
        text,
        re.IGNORECASE,
    )

    cgpa = None

    if cgpa_match:
        cgpa = cgpa_match.group(2)

    # DSA signals
    dsa_keywords = [
        "leetcode",
        "codeforces",
        "competitive programming",
        "data structures",
        "algorithms",
        "problem solving",
        "hackerrank",
    ]

    dsa_found = [k for k in dsa_keywords if k in text]

    return {
        "technical_skills": list(set(found_skills)),
        "soft_skills": [],
        "projects": [],
        "cgpa": cgpa,
        "internships": [],
        "internship_count": 0,
        "has_dsa_signals": len(dsa_found) > 0,
        "dsa_signals": dsa_found,
        "certifications": [],
        "college": None,
        "branch": None,
        "year_of_study": None,
        "github_present": "github" in text,
        "linkedin_present": "linkedin" in text,
        "total_projects_count": 0,
        "strongest_skill_area": _detect_skill_area(found_skills),
    }


def _detect_skill_area(skills: list) -> str:
    skills = [s.lower() for s in skills]

    if any(
        s in skills
        for s in ["react", "nextjs", "html", "css", "tailwind"]
    ):
        return "frontend"

    if any(
        s in skills
        for s in ["nodejs", "express", "spring", "mongodb", "sql"]
    ):
        return "backend"

    if any(
        s in skills
        for s in ["tensorflow", "pytorch", "machine learning"]
    ):
        return "ml_ai"

    if any(
        s in skills
        for s in ["flutter", "kotlin", "swift"]
    ):
        return "mobile"

    return "unknown"