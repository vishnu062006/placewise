import json
import re
import os
import hashlib

from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Canonical skill aliases — maps variants, ecosystems, and abbreviations to one normalized token
SKILL_ALIASES = {
    # JavaScript / TypeScript Ecosystem
    "react.js": "react",
    "reactjs": "react",
    "react js": "react",
    "next.js": "nextjs",
    "nextjs": "nextjs",
    "next js": "nextjs",
    "node.js": "nodejs",
    "nodejs": "nodejs",
    "node js": "nodejs",
    "vue.js": "vue",
    "vuejs": "vue",
    "express.js": "express",
    "expressjs": "express",
    "angular.js": "angular",
    "angularjs": "angular",
    "js": "javascript",
    "ts": "typescript",

    # Python / ML / AI Ecosystem
    "py": "python",
    "tf": "tensorflow",
    "tensor flow": "tensorflow",
    "pytorch": "pytorch",
    "py torch": "pytorch",
    "scikit-learn": "scikit learn",
    "sklearn": "scikit learn",
    "ml": "machine learning",
    "ai": "artificial intelligence",
    "nlp": "natural language processing",
    "cv": "computer vision",

    # Core CS & Languages
    "c plus plus": "c++",
    "cpp": "c++",
    "golang": "go",
    "c#": "c sharp",
    "csharp": "c sharp",
    "dsa": "data structures and algorithms",
    "data structures & algorithms": "data structures and algorithms",
    "data structures": "data structures and algorithms",
    "algorithms": "data structures and algorithms",
    "oop": "object oriented programming",
    "oops": "object oriented programming",
    "dbms": "database management systems",
    "os": "operating systems",

    # Databases & Backend
    "postgres": "postgresql",
    "postgre": "postgresql",
    "psql": "postgresql",
    "mongo": "mongodb",
    "mssql": "sql server",
    "microsoft sql server": "sql server",
    "rest": "rest api",
    "restful": "rest api",
    "restful api": "rest api",
    "rest apis": "rest api",

    # Cloud, DevOps & Tools
    "aws": "amazon web services",
    "gcp": "google cloud platform",
    "google cloud": "google cloud platform",
    "azure": "microsoft azure",
    "k8s": "kubernetes",
    "kube": "kubernetes",
    "ci/cd": "cicd",
    "ci cd": "cicd",
    "docker containers": "docker",
}

JD_EXTRACTION_PROMPT = """
You are a technical recruiter analyzing a job description for an Indian campus placement/internship role.
Extract structured requirements from the JD text below and return ONLY valid JSON.
Do not include markdown, explanations, or backticks.

Job Description:
{jd_text}

Return this exact JSON structure:
{{
  "role_title": "",
  "required_skills": [],
  "preferred_skills": [],
  "min_cgpa": null,
  "experience_level": "fresher",
  "key_responsibilities": [],
  "role_category": "unknown"
}}

Rules:
- Only include information explicitly present in the JD.
- required_skills = skills explicitly stated as mandatory/must-have.
- preferred_skills = skills stated as "good to have" / "bonus" / "nice to have".
- min_cgpa: extract numeric value only if explicitly stated (e.g. "7.0+ CGPA" -> 7.0). Convert percentage to 10-point scale if given as %.
- experience_level must be one of: fresher/intern/experienced/unknown
- role_category must be one of: frontend/backend/fullstack/ml_ai/data/mobile/devops/core_cs/unknown
- Do not hallucinate or infer skills not explicitly listed.
- Return ONLY valid JSON.
"""


def _normalize_skill(skill: str) -> str:
    """Canonicalize a skill string for accurate deterministic matching."""
    s = skill.strip().lower()
    s = re.sub(r"[^\w\s+.#]", "", s)
    return SKILL_ALIASES.get(s, s)


# Built from _normalize_skill so these can never drift out of sync with SKILL_ALIASES.
# Must be defined AFTER _normalize_skill and SKILL_ALIASES.
CORE_TECH_HINTS = {
    _normalize_skill(s) for s in {
        "python", "java", "javascript", "typescript", "c++", "c#", "go", "golang",
        "react", "angular", "vue", "nextjs", "nodejs", "django", "flask", "spring",
        "spring boot", "express", "sql", "postgresql", "mysql", "mongodb",
        "aws", "gcp", "azure", "docker", "kubernetes", "machine learning",
        "tensorflow", "pytorch", "data structures", "algorithms", "dsa",
    }
}

SOFT_SKILL_HINTS = {
    _normalize_skill(s) for s in {
        "communication", "teamwork", "leadership", "collaboration",
        "problem solving", "adaptability", "time management", "presentation",
    }
}


def _skill_weight(skill: str) -> float:
    """Assign importance weight to a required/preferred skill for scoring."""
    normalized = _normalize_skill(skill)
    if normalized in SOFT_SKILL_HINTS:
        return 0.5
    if normalized in CORE_TECH_HINTS:
        return 2.0
    return 1.0  # default: unrecognized/tooling skill (Git, Postman, etc.)


def _hash_text(text: str) -> str:
    """Stable hash for cache keys."""
    normalized = re.sub(r"\s+", " ", text.strip().lower())
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def _parse_llm_json(raw_output: str) -> dict:
    if not raw_output:
        raise ValueError("LLM returned an empty response")

    raw_output = raw_output.strip()
    raw_output = re.sub(r"```(?:json)?", "", raw_output, flags=re.IGNORECASE)
    raw_output = raw_output.replace("```", "").strip()

    json_start = raw_output.find("{")
    json_end = raw_output.rfind("}")

    if json_start == -1 or json_end == -1 or json_end <= json_start:
        raise ValueError("LLM response does not contain a valid JSON object")

    json_text = raw_output[json_start:json_end + 1]
    return json.loads(json_text)


def _normalize_jd_data(data: dict) -> dict:
    if not isinstance(data, dict):
        raise ValueError("LLM response is not a JSON object")

    defaults = {
        "role_title": "",
        "required_skills": [],
        "preferred_skills": [],
        "min_cgpa": None,
        "experience_level": "fresher",
        "key_responsibilities": [],
        "role_category": "unknown",
    }

    for key, value in defaults.items():
        if key not in data:
            data[key] = value

    for field in ["required_skills", "preferred_skills", "key_responsibilities"]:
        if not isinstance(data.get(field), list):
            data[field] = []

    allowed_categories = {
        "frontend", "backend", "fullstack", "ml_ai",
        "data", "mobile", "devops", "core_cs", "unknown",
    }
    if data.get("role_category") not in allowed_categories:
        data["role_category"] = "unknown"

    allowed_exp = {"fresher", "intern", "experienced", "unknown"}
    if data.get("experience_level") not in allowed_exp:
        data["experience_level"] = "unknown"

    return data


def extract_jd_requirements(jd_text: str, cache_get=None, cache_set=None) -> dict:
    """Extract structured requirements from a job description with caching support."""
    if not jd_text or not jd_text.strip():
        raise ValueError("JD text cannot be empty")
    if len(jd_text) > 10000:
        raise ValueError("JD text exceeds maximum allowed length (10,000 characters)")

    jd_text = jd_text.encode("utf-8", "ignore").decode()
    jd_text = re.sub(r"\s+", " ", jd_text).strip()[:8000]

    cache_key = f"jd_extract:{_hash_text(jd_text)}"

    if cache_get is not None:
        cached = cache_get(cache_key)
        if cached is not None:
            return cached

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {
                    "role": "user",
                    "content": JD_EXTRACTION_PROMPT.format(jd_text=jd_text),
                }
            ],
            temperature=0,
            max_tokens=2000,
            extra_body={"reasoning_effort": "low"},
            response_format={"type": "json_object"},
        )

        raw_output = response.choices[0].message.content or ""
        extracted = _parse_llm_json(raw_output)
        extracted = _normalize_jd_data(extracted)

        if cache_set is not None:
            cache_set(cache_key, extracted)

        return extracted

    except Exception as e:
        print("=" * 80)
        print("JD EXTRACTION ERROR:")
        print(f"{type(e).__name__}: {e}")
        print("Using fallback extraction.")
        print("=" * 80)
        return _fallback_jd_extraction(jd_text)


def _fallback_jd_extraction(jd_text: str) -> dict:
    text = jd_text.lower()

    common_tech = [
        "python", "java", "c++", "javascript", "typescript", "react",
        "nextjs", "nodejs", "express", "mongodb", "mysql", "postgresql",
        "sql", "html", "css", "tailwind", "spring", "spring boot",
        "docker", "kubernetes", "aws", "gcp", "azure", "firebase",
        "flutter", "kotlin", "swift", "git", "machine learning",
        "tensorflow", "pytorch", "data structures", "algorithms",
    ]

    found = [tech for tech in common_tech if tech in text]

    return {
        "role_title": "",
        "required_skills": found,
        "preferred_skills": [],
        "min_cgpa": None,
        "experience_level": "unknown",
        "key_responsibilities": [],
        "role_category": "unknown",
    }


def match_resume_to_jd(resume_data: dict, jd_data: dict) -> dict:
    """Diff resume-extracted skills against JD requirements using normalized matching and weighted scoring."""
    resume_skills_raw = [s for s in resume_data.get("technical_skills", []) if s]
    resume_skills_normalized = {_normalize_skill(s) for s in resume_skills_raw}

    required = [s.strip() for s in jd_data.get("required_skills", []) if s]
    preferred = [s.strip() for s in jd_data.get("preferred_skills", []) if s]

    matched_required = [s for s in required if _normalize_skill(s) in resume_skills_normalized]
    missing_required = [s for s in required if _normalize_skill(s) not in resume_skills_normalized]

    matched_preferred = [s for s in preferred if _normalize_skill(s) in resume_skills_normalized]
    missing_preferred = [s for s in preferred if _normalize_skill(s) not in resume_skills_normalized]

    # Weighted score instead of flat percentage
    total_weight = sum(_skill_weight(s) for s in required)
    matched_weight = sum(_skill_weight(s) for s in matched_required)
    match_score = (
        round((matched_weight / total_weight) * 100, 1)
        if total_weight > 0
        else None
    )

    cgpa_ok = True
    min_cgpa = jd_data.get("min_cgpa")
    resume_cgpa = resume_data.get("cgpa")
    if min_cgpa is not None and resume_cgpa is not None:
        cgpa_ok = resume_cgpa >= min_cgpa

    return {
        "role_title": jd_data.get("role_title", ""),
        "match_score": match_score,
        "matched_required_skills": matched_required,
        "missing_required_skills": missing_required,
        "matched_preferred_skills": matched_preferred,
        "missing_preferred_skills": missing_preferred,
        "cgpa_requirement_met": cgpa_ok,
        "min_cgpa_required": min_cgpa,
        "role_category": jd_data.get("role_category", "unknown"),
        # Feed straight into your existing roadmap generator:
        # roadmap_gaps = missing_required_skills + missing_preferred_skills
        "roadmap_gaps": missing_required + missing_preferred,
    }