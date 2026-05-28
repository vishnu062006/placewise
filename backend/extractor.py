import json
import re
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

EXTRACTION_PROMPT = """You are a technical recruiter analyzing a student resume for campus placements in India.

Extract structured information from the resume text below and return ONLY valid JSON — no explanation, no markdown, no backticks.

Resume Text:
{resume_text}

Return this exact JSON structure:
{{
  "technical_skills": ["list of technical skills found — languages, frameworks, tools, databases"],
  "soft_skills": ["communication", "teamwork", etc if mentioned],
  "projects": [
    {{
      "name": "project name",
      "tech_used": ["tech1", "tech2"],
      "has_impact_metrics": true/false,
      "complexity": "low/medium/high",
      "description": "one line summary"
    }}
  ],
  "cgpa": "numeric string or null if not found",
  "internships": [
    {{
      "company": "company name",
      "role": "role title",
      "duration": "duration if mentioned"
    }}
  ],
  "internship_count": 0,
  "has_dsa_signals": true/false,
  "dsa_signals": ["leetcode", "competitive programming", "problem solving" — any DSA-related signals found],
  "certifications": ["list of certifications"],
  "college": "college name if found or null",
  "branch": "engineering branch if found or null",
  "year_of_study": "1st/2nd/3rd/4th year or null",
  "github_present": true/false,
  "linkedin_present": true/false,
  "total_projects_count": 0,
  "strongest_skill_area": "one of: frontend/backend/fullstack/ml_ai/data/mobile/devops/core_cs/unknown"
}}

Rules:
- Only include what is explicitly present in the resume. Do not infer or hallucinate.
- has_impact_metrics means the project mentions numbers, users, performance improvements, etc.
- has_dsa_signals means any mention of competitive programming, LeetCode, HackerRank, problem solving, algorithms, data structures, etc.
- Return ONLY the JSON object, nothing else."""


def extract_skills(parsed_resume: dict) -> dict:
    resume_text = f"""
EDUCATION: {parsed_resume.get('education', '')}
SKILLS: {parsed_resume.get('skills', '')}
PROJECTS: {parsed_resume.get('projects', '')}
EXPERIENCE: {parsed_resume.get('experience', '')}
ACHIEVEMENTS: {parsed_resume.get('achievements', '')}
SUMMARY: {parsed_resume.get('summary', '')}
FULL TEXT SNIPPET: {parsed_resume.get('raw_text', '')[:2000]}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": EXTRACTION_PROMPT.format(resume_text=resume_text)}
        ],
        temperature=0.1,
        max_tokens=1500,
    )

    raw_output = response.choices[0].message.content.strip()

    # Strip markdown code fences if present
    raw_output = re.sub(r"```json|```", "", raw_output).strip()

    try:
        extracted = json.loads(raw_output)
    except json.JSONDecodeError:
        # Fallback: return a safe default structure
        extracted = _fallback_extraction(parsed_resume)

    return extracted


def _fallback_extraction(parsed_resume: dict) -> dict:
    skills_text = parsed_resume.get("skills", "").lower()
    common_tech = [
        "python", "java", "c", "c++", "javascript", "typescript", "react",
        "nodejs", "spring", "sql", "html", "css", "git", "docker", "aws",
        "flutter", "kotlin", "swift", "golang", "rust", "nextjs", "mongodb"
    ]
    found = [t for t in common_tech if t in skills_text]

    return {
        "technical_skills": found,
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
        "github_present": "github" in parsed_resume.get("raw_text", "").lower(),
        "linkedin_present": "linkedin" in parsed_resume.get("raw_text", "").lower(),
        "total_projects_count": 0,
        "strongest_skill_area": "unknown"
    }