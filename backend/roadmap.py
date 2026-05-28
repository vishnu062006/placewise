import os
import json
import re
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

ROADMAP_PROMPT = """You are a senior software engineer and placement mentor at a top Indian engineering college.

A student has analyzed their resume for campus placements. Based on their profile below, generate a practical, actionable 4-week preparation roadmap.

STUDENT PROFILE:
- Target Role: {role_label}
- Placement Score: {score}/100 ({band_label})
- Technical Skills: {skills}
- Projects: {projects}
- CGPA: {cgpa}
- Internships: {internships}
- Skill Gaps Identified: {gaps}
- Strengths: {strengths}

Generate a 4-week action plan as JSON. Return ONLY valid JSON, no markdown, no backticks.

{{
  "summary": "2-sentence honest assessment of where they stand and what matters most",
  "weeks": [
    {{
      "week": 1,
      "focus": "short theme for this week",
      "tasks": [
        "specific actionable task 1",
        "specific actionable task 2",
        "specific actionable task 3"
      ],
      "goal": "what they should have achieved by end of week 1"
    }},
    {{
      "week": 2,
      "focus": "...",
      "tasks": ["...", "...", "..."],
      "goal": "..."
    }},
    {{
      "week": 3,
      "focus": "...",
      "tasks": ["...", "...", "..."],
      "goal": "..."
    }},
    {{
      "week": 4,
      "focus": "...",
      "tasks": ["...", "...", "..."],
      "goal": "..."
    }}
  ],
  "resume_fixes": [
    "specific resume fix 1",
    "specific resume fix 2",
    "specific resume fix 3"
  ],
  "top_resources": [
    {{
      "name": "resource name",
      "why": "one line reason",
      "url_hint": "e.g. neetcode.io or youtube search term"
    }}
  ],
  "honest_verdict": "One direct sentence — what is the single most important thing this student must do to get placed at their target role"
}}

Rules:
- Be specific, not generic. Don't say "improve DSA" — say "solve 3 LeetCode mediums per day on arrays and trees".
- Tailor advice to Indian engineering students in 2025 — mention actual resources (Neetcode, Striver, Love Babbar, Abdul Bari, etc.)
- If CGPA is low, address it honestly but constructively.
- Return ONLY the JSON object."""


def generate_roadmap(
    extracted: dict,
    role: str,
    role_label: str,
    score: float,
    band_label: str,
    gaps: list,
    strengths: list
) -> dict:
    projects = extracted.get("projects", [])
    project_summary = "; ".join(
        [f"{p.get('name', 'unnamed')} ({', '.join(p.get('tech_used', []))})" for p in projects[:3]]
    ) or "none listed"

    prompt = ROADMAP_PROMPT.format(
        role_label=role_label,
        score=score,
        band_label=band_label,
        skills=", ".join(extracted.get("technical_skills", [])[:15]) or "none detected",
        projects=project_summary,
        cgpa=extracted.get("cgpa") or "not found",
        internships=extracted.get("internship_count", 0),
        gaps="; ".join(gaps[:6]) or "none identified",
        strengths="; ".join(strengths[:5]) or "none identified"
    )

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=1500,
    )

    raw = response.choices[0].message.content.strip()
    raw = re.sub(r"```json|```", "", raw).strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return _fallback_roadmap(role_label, gaps)


def _fallback_roadmap(role_label: str, gaps: list) -> dict:
    return {
        "summary": f"You are targeting {role_label}. Focus on closing the identified skill gaps systematically over the next 4 weeks.",
        "weeks": [
            {
                "week": 1,
                "focus": "Close critical skill gaps",
                "tasks": [f"Address: {gap}" for gap in gaps[:3]] or ["Review role requirements", "Set up study schedule", "Start one new project"],
                "goal": "Understand exactly what's missing and have a plan"
            },
            {"week": 2, "focus": "Build and code", "tasks": ["Work on a new project targeting your gaps", "Practice 2 problems daily", "Update GitHub regularly"], "goal": "New project 50% complete"},
            {"week": 3, "focus": "Resume and projects", "tasks": ["Complete the project", "Add impact metrics to existing projects", "Get resume reviewed by a peer"], "goal": "Resume updated and polished"},
            {"week": 4, "focus": "Interview prep", "tasks": ["Mock interview practice", "Revise fundamentals", "Apply to companies"], "goal": "Application-ready"}
        ],
        "resume_fixes": ["Add quantified impact to all projects", "Ensure GitHub is linked", "Keep resume to 1 page"],
        "top_resources": [{"name": "Neetcode 150", "why": "Best structured DSA practice", "url_hint": "neetcode.io"}],
        "honest_verdict": f"Focus on the critical gaps first: {', '.join(gaps[:2]) if gaps else 'polish your projects and resume'}."
    }