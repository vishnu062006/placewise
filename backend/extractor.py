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
- For cgpa: extract the numeric value only (e.g. 8.75, not "8.75/10"). If written as percentage (e.g. 87%), convert to 10-point scale by dividing by 10.
- Return ONLY valid JSON.
"""


def extract_skills(parsed_resume: dict) -> dict:
    raw_text = parsed_resume.get("raw_text", "")
    raw_text = raw_text.encode("utf-8", "ignore").decode()
    raw_text = re.sub(r"\s+", " ", raw_text).strip()
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
                    "content": EXTRACTION_PROMPT.format(resume_text=resume_text),
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

        raw_output = re.sub(r"```json|```", "", raw_output).strip()
        extracted = json.loads(raw_output)
        extracted = _normalize_extracted_data(extracted)

        # Post-process CGPA from LLM output
        extracted["cgpa"] = _parse_cgpa_value(extracted.get("cgpa"), raw_text)

        print("=" * 80)
        print("FINAL PARSED JSON:")
        print(json.dumps(extracted, indent=2))
        print("=" * 80)

        return extracted

    except Exception as e:
        print("EXTRACTION ERROR:", str(e))
        return _fallback_extraction(raw_text)


def _parse_cgpa_value(raw_cgpa, raw_text: str = ""):
    """
    Robustly parse CGPA from various formats:
    - 8.75  (already clean)
    - "8.75/10"
    - "8.75 / 10"
    - 3.5 (4.0 scale) → converted
    - "87%" or "87.5%" → divide by 10
    - None / 0 → attempt regex on raw text as fallback
    """
    # If LLM gave us something, try to clean it first
    if raw_cgpa is not None:
        cgpa_str = str(raw_cgpa).strip()

        # Handle "X/10" or "X / 10" format
        slash_match = re.match(r"^(\d+\.?\d*)\s*/\s*10", cgpa_str)
        if slash_match:
            return float(slash_match.group(1))

        # Handle "X/4" or "X / 4" format (4.0 scale)
        slash4_match = re.match(r"^(\d+\.?\d*)\s*/\s*4", cgpa_str)
        if slash4_match:
            val = float(slash4_match.group(1))
            return round(val * 2.5, 2)

        # Handle percentage "87%" or "87.5%"
        pct_match = re.match(r"^(\d+\.?\d*)\s*%", cgpa_str)
        if pct_match:
            return round(float(pct_match.group(1)) / 10, 2)

        # Plain number
        try:
            val = float(cgpa_str)
            if val > 0:
                return val
        except (ValueError, TypeError):
            pass

    # LLM missed it — try regex on raw text
    if raw_text:
        text = raw_text.lower()

        # "CGPA: 8.75" or "CGPA 8.75/10"
        m = re.search(r"cgpa\s*[:\-]?\s*(\d+\.?\d*)\s*(?:/\s*10)?", text)
        if m:
            return float(m.group(1))

        # "GPA: 3.5/4" or "GPA 3.5"
        m = re.search(r"\bgpa\s*[:\-]?\s*(\d+\.?\d*)\s*(?:/\s*4\.?0?)?", text)
        if m:
            val = float(m.group(1))
            if 0 < val <= 4.0:
                return round(val * 2.5, 2)
            return val

        # Percentage formats: "87.5%" or "Percentage: 87.5"
        m = re.search(r"(?:percentage|aggregate)\s*[:\-]?\s*(\d{2,3}\.?\d*)\s*%?", text)
        if m:
            val = float(m.group(1))
            if val > 10:  # it's a percentage
                return round(val / 10, 2)
            return val

    return None


def _normalize_extracted_data(data: dict) -> dict:
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

    array_fields = [
        "technical_skills", "soft_skills", "projects",
        "internships", "dsa_signals", "certifications",
    ]

    for field in array_fields:
        if not isinstance(data.get(field), list):
            data[field] = []

    return data


def _fallback_extraction(raw_text: str) -> dict:
    text = raw_text.lower()

    common_tech = [
        "python", "java", "c", "c++", "javascript", "typescript",
        "react", "nextjs", "nodejs", "express", "mongodb", "mysql",
        "postgresql", "sql", "html", "css", "tailwind", "spring",
        "spring boot", "docker", "kubernetes", "aws", "firebase",
        "flutter", "kotlin", "swift", "git", "github",
        "machine learning", "tensorflow", "pytorch",
    ]

    found_skills = [tech for tech in common_tech if tech in text]

    cgpa = _parse_cgpa_value(None, raw_text)

    dsa_keywords = [
        "leetcode", "codeforces", "competitive programming",
        "data structures", "algorithms", "problem solving", "hackerrank",
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
    if any(s in skills for s in ["react", "nextjs", "html", "css", "tailwind"]):
        return "frontend"
    if any(s in skills for s in ["nodejs", "express", "spring", "mongodb", "sql"]):
        return "backend"
    if any(s in skills for s in ["tensorflow", "pytorch", "machine learning"]):
        return "ml_ai"
    if any(s in skills for s in ["flutter", "kotlin", "swift"]):
        return "mobile"
    return "unknown"