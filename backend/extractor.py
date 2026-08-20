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


def _parse_llm_json(raw_output: str) -> dict:
    """
    Safely parse JSON returned by the LLM.

    Handles:
    - <think>...</think>
    - markdown code fences
    - accidental text before/after JSON
    """

    if not raw_output:
        raise ValueError("LLM returned an empty response")

    raw_output = raw_output.strip()

    # Remove reasoning blocks if the model still returns them
    raw_output = re.sub(
        r"<think>.*?</think>",
        "",
        raw_output,
        flags=re.DOTALL | re.IGNORECASE,
    ).strip()

    # Remove markdown fences if present
    raw_output = re.sub(
        r"```(?:json)?",
        "",
        raw_output,
        flags=re.IGNORECASE,
    )

    raw_output = raw_output.replace("```", "").strip()

    # Find the JSON object
    json_start = raw_output.find("{")
    json_end = raw_output.rfind("}")

    if json_start == -1:
        raise ValueError("LLM response does not contain a JSON object")

    if json_end == -1:
        raise ValueError("LLM response contains an incomplete JSON object")

    if json_end <= json_start:
        raise ValueError("Invalid JSON boundaries")

    json_text = raw_output[json_start:json_end + 1]

    try:
        return json.loads(json_text)

    except json.JSONDecodeError as e:
        print("=" * 80)
        print("JSON PARSING FAILED")
        print(f"Error: {e}")
        print(f"Line: {e.lineno}")
        print(f"Column: {e.colno}")
        print(f"Position: {e.pos}")
        print("=" * 80)
        print("JSON RECEIVED:")
        print(json_text[:10000])
        print("=" * 80)
        raise


def extract_skills(parsed_resume: dict) -> dict:
    raw_text = parsed_resume.get("raw_text", "")

    # Clean invalid UTF-8 characters
    raw_text = raw_text.encode(
        "utf-8",
        "ignore"
    ).decode()

    # Normalize whitespace
    raw_text = re.sub(
        r"\s+",
        " ",
        raw_text
    ).strip()

    # Prevent excessively large prompts
    resume_text = raw_text[:15000]

    print("=" * 80)
    print("RAW RESUME TEXT:")
    print(resume_text[:5000])
    print("=" * 80)

    try:
        response = client.chat.completions.create(
            # Switched off qwen/qwen3.6-27b. Groq serves it as a PREVIEW
            # multimodal model, not intended for production — that's the
            # real cause of the repeated json_validate_failed /
            # empty failed_generation errors, not a params issue.
            # openai/gpt-oss-120b is Groq's actual recommended production
            # replacement for llama-3.3-70b-versatile and has solid JSON
            # mode + reasoning_effort support.
            model="openai/gpt-oss-120b",

            messages=[
                {
                    "role": "user",
                    "content": EXTRACTION_PROMPT.format(
                        resume_text=resume_text
                    ),
                }
            ],

            temperature=0,

            max_tokens=4000,

            # reasoning_effort isn't in this installed groq SDK's typed
            # create() signature (TypeError otherwise) -> pass via
            # extra_body instead. gpt-oss models accept low/medium/high,
            # default medium. "low" keeps reasoning brief so more of the
            # token budget goes to the actual JSON output.
            extra_body={
                "reasoning_effort": "low",
            },

            # Force JSON output
            response_format={
                "type": "json_object"
            },
        )

        raw_output = (
            response.choices[0].message.content
            or ""
        )

        print("=" * 80)
        print("LLM RAW OUTPUT:")
        print(raw_output[:10000])
        print("=" * 80)

        # Parse JSON
        extracted = _parse_llm_json(
            raw_output
        )

        # Normalize structure
        extracted = _normalize_extracted_data(
            extracted
        )

        # Post-process CGPA
        extracted["cgpa"] = _parse_cgpa_value(
            extracted.get("cgpa"),
            raw_text,
        )

        # Keep counts consistent
        extracted["internship_count"] = len(
            extracted.get("internships", [])
        )

        extracted["total_projects_count"] = len(
            extracted.get("projects", [])
        )

        print("=" * 80)
        print("FINAL PARSED JSON:")
        print(
            json.dumps(
                extracted,
                indent=2
            )
        )
        print("=" * 80)

        return extracted

    except Exception as e:

        print("=" * 80)
        print("EXTRACTION ERROR:")
        print(
            f"{type(e).__name__}: {e}"
        )
        print("Using fallback extraction.")
        print("=" * 80)

        return _fallback_extraction(
            raw_text
        )


def _parse_cgpa_value(
    raw_cgpa,
    raw_text: str = ""
):
    """
    Parse CGPA from:

    8.75
    8.75/10
    8.75 / 10
    3.5/4
    87%
    87.5%
    """

    # ---------------------------------------------------------
    # 1. Try LLM-provided value
    # ---------------------------------------------------------

    if raw_cgpa is not None:

        cgpa_str = str(
            raw_cgpa
        ).strip()

        # X / 10
        slash_match = re.match(
            r"^(\d+\.?\d*)\s*/\s*10",
            cgpa_str
        )

        if slash_match:

            return float(
                slash_match.group(1)
            )

        # X / 4
        slash4_match = re.match(
            r"^(\d+\.?\d*)\s*/\s*4",
            cgpa_str
        )

        if slash4_match:

            value = float(
                slash4_match.group(1)
            )

            return round(
                value * 2.5,
                2
            )

        # Percentage
        percentage_match = re.match(
            r"^(\d+\.?\d*)\s*%",
            cgpa_str
        )

        if percentage_match:

            return round(
                float(
                    percentage_match.group(1)
                ) / 10,
                2
            )

        # Plain number
        try:

            value = float(
                cgpa_str
            )

            if value > 0:
                return value

        except (
            ValueError,
            TypeError
        ):
            pass

    # ---------------------------------------------------------
    # 2. Regex fallback from raw resume
    # ---------------------------------------------------------

    if raw_text:

        text = raw_text.lower()

        # CGPA: 8.75
        # CGPA 8.75/10
        match = re.search(
            r"cgpa\s*[:\-]?\s*(\d+\.?\d*)\s*(?:/\s*10)?",
            text
        )

        if match:

            return float(
                match.group(1)
            )

        # GPA: 3.5/4
        match = re.search(
            r"\bgpa\s*[:\-]?\s*(\d+\.?\d*)\s*(?:/\s*4\.?0?)?",
            text
        )

        if match:

            value = float(
                match.group(1)
            )

            if 0 < value <= 4.0:

                return round(
                    value * 2.5,
                    2
                )

            return value

        # Percentage
        match = re.search(
            r"(?:percentage|aggregate)\s*[:\-]?\s*(\d{2,3}\.?\d*)\s*%?",
            text
        )

        if match:

            value = float(
                match.group(1)
            )

            if value > 10:

                return round(
                    value / 10,
                    2
                )

            return value

    return None


def _normalize_extracted_data(
    data: dict
) -> dict:

    if not isinstance(
        data,
        dict
    ):
        raise ValueError(
            "LLM response is not a JSON object"
        )

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

    # Add missing fields
    for key, value in defaults.items():

        if key not in data:
            data[key] = value

    # ---------------------------------------------------------
    # Arrays
    # ---------------------------------------------------------

    array_fields = [
        "technical_skills",
        "soft_skills",
        "projects",
        "internships",
        "dsa_signals",
        "certifications",
    ]

    for field in array_fields:

        if not isinstance(
            data.get(field),
            list
        ):
            data[field] = []

    # ---------------------------------------------------------
    # Booleans
    # ---------------------------------------------------------

    boolean_fields = [
        "has_dsa_signals",
        "github_present",
        "linkedin_present",
    ]

    for field in boolean_fields:

        if not isinstance(
            data.get(field),
            bool
        ):
            data[field] = bool(
                data.get(field)
            )

    # ---------------------------------------------------------
    # Skill area
    # ---------------------------------------------------------

    allowed_skill_areas = {
        "frontend",
        "backend",
        "fullstack",
        "ml_ai",
        "data",
        "mobile",
        "devops",
        "core_cs",
        "unknown",
    }

    if (
        data.get(
            "strongest_skill_area"
        )
        not in allowed_skill_areas
    ):
        data[
            "strongest_skill_area"
        ] = "unknown"

    # ---------------------------------------------------------
    # Normalize projects
    # ---------------------------------------------------------

    normalized_projects = []

    for project in data["projects"]:

        if not isinstance(
            project,
            dict
        ):
            continue

        complexity = project.get(
            "complexity",
            "low"
        )

        if complexity not in {
            "low",
            "medium",
            "high",
        }:
            complexity = "low"

        tech_used = project.get(
            "tech_used",
            []
        )

        if not isinstance(
            tech_used,
            list
        ):
            tech_used = []

        normalized_projects.append(
            {
                "name": project.get(
                    "name",
                    ""
                ),
                "tech_used": tech_used,
                "has_impact_metrics": bool(
                    project.get(
                        "has_impact_metrics",
                        False
                    )
                ),
                "complexity": complexity,
                "description": project.get(
                    "description",
                    ""
                ),
            }
        )

    data["projects"] = (
        normalized_projects
    )

    # ---------------------------------------------------------
    # Normalize internships
    # ---------------------------------------------------------

    normalized_internships = []

    for internship in data["internships"]:

        if not isinstance(
            internship,
            dict
        ):
            continue

        normalized_internships.append(
            {
                "company": internship.get(
                    "company",
                    ""
                ),
                "role": internship.get(
                    "role",
                    ""
                ),
                "duration": internship.get(
                    "duration",
                    ""
                ),
            }
        )

    data["internships"] = (
        normalized_internships
    )

    return data


def _fallback_extraction(
    raw_text: str
) -> dict:

    """
    Basic deterministic fallback.

    Used only when the LLM fails.
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

    found_skills = [
        tech
        for tech in common_tech
        if tech in text
    ]

    cgpa = _parse_cgpa_value(
        None,
        raw_text
    )

    dsa_keywords = [
        "leetcode",
        "codeforces",
        "competitive programming",
        "data structures",
        "algorithms",
        "problem solving",
        "hackerrank",
    ]

    dsa_found = [
        keyword
        for keyword in dsa_keywords
        if keyword in text
    ]

    return {
        "technical_skills": list(
            set(found_skills)
        ),
        "soft_skills": [],
        "projects": [],
        "cgpa": cgpa,
        "internships": [],
        "internship_count": 0,
        "has_dsa_signals": (
            len(dsa_found) > 0
        ),
        "dsa_signals": dsa_found,
        "certifications": [],
        "college": None,
        "branch": None,
        "year_of_study": None,
        "github_present": (
            "github" in text
        ),
        "linkedin_present": (
            "linkedin" in text
        ),
        "total_projects_count": 0,
        "strongest_skill_area": (
            _detect_skill_area(
                found_skills
            )
        ),
    }


def _detect_skill_area(
    skills: list
) -> str:

    skills = [
        s.lower()
        for s in skills
    ]

    if any(
        s in skills
        for s in [
            "react",
            "nextjs",
            "html",
            "css",
            "tailwind",
        ]
    ):
        return "frontend"

    if any(
        s in skills
        for s in [
            "nodejs",
            "express",
            "spring",
            "spring boot",
            "mongodb",
            "sql",
            "postgresql",
        ]
    ):
        return "backend"

    if any(
        s in skills
        for s in [
            "tensorflow",
            "pytorch",
            "machine learning",
        ]
    ):
        return "ml_ai"

    if any(
        s in skills
        for s in [
            "flutter",
            "kotlin",
            "swift",
        ]
    ):
        return "mobile"

    return "unknown"