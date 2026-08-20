import os
import numpy as np
import joblib
from pathlib import Path

MODEL_PATH = Path(__file__).parent / "model.joblib"


def _safe_float(value) -> float:
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0.0


def _normalize_cgpa(raw_cgpa) -> tuple:
    """
    Returns (normalized_cgpa_on_10_scale, was_converted_from_gpa)
    Handles: None, 0, 4.0 scale, already 10-scale, string forms
    """
    if raw_cgpa is None:
        return 0.0, False

    cgpa = _safe_float(raw_cgpa)

    if cgpa == 0:
        return 0.0, False

    # 4.0 scale detection — only if strictly <= 4.0 and > 0
    if 0 < cgpa <= 4.0:
        return round(cgpa * 2.5, 1), True

    # Already on 10-point scale
    if 4.0 < cgpa <= 10.0:
        return round(cgpa, 1), False

    # Percentage accidentally passed (shouldn't happen after extractor fix, but safety net)
    if cgpa > 10:
        return round(cgpa / 10, 1), True

    return cgpa, False


def _heuristic_score(extracted: dict, role: str, gaps: list, track: str = "full_time") -> float:
    score = 25.0  # base

    # CGPA contribution (max +20)
    cgpa, _ = _normalize_cgpa(extracted.get("cgpa"))
    if cgpa >= 9.0:
        score += 20
    elif cgpa >= 8.5:
        score += 17
    elif cgpa >= 8.0:
        score += 14
    elif cgpa >= 7.5:
        score += 10
    elif cgpa >= 7.0:
        score += 6
    elif cgpa >= 6.0:
        score += 2
    # cgpa == 0 (not detected) → no contribution, no penalty here (penalty in factors)

    # Skills contribution (max +15)
    skill_count = len(extracted.get("technical_skills", []))
    score += min(skill_count * 1, 15)

    # Projects contribution (max +15)
    project_count = extracted.get("total_projects_count", 0)
    projects = extracted.get("projects", [])
    high_quality = sum(1 for p in projects if p.get("has_impact_metrics") or p.get("complexity") == "high")
    score += min(project_count * 3, 9)
    score += min(high_quality * 3, 6)

    # Internship contribution (max +10) — not applicable when the candidate
    # is themselves seeking an internship; redistribute that weight to
    # projects/skills instead, since that's what internship recruiters
    # actually screen on for candidates with no prior internship.
    if track == "internship":
        project_count_bonus = min(project_count * 2, 6)
        score += project_count_bonus
    else:
        internship_count = extracted.get("internship_count", 0)
        score += min(internship_count * 6, 10)

    # DSA signals
    if extracted.get("has_dsa_signals") and role in ["faang_sde", "product_company"]:
        score += 8
    elif extracted.get("has_dsa_signals"):
        score += 3

    # GitHub presence (+3)
    if extracted.get("github_present"):
        score += 3

    # Year of study penalty — only applies to full-time track. Internship
    # postings target 1st/2nd/3rd year students by design, so being early
    # in the degree is not a negative signal there.
    if track != "internship":
        year = str(extracted.get("year_of_study") or "")
        if "1st" in year or year.strip() == "1":
            score -= 12
        elif "2nd" in year or year.strip() == "2":
            score -= 8
        elif "3rd" in year or year.strip() == "3":
            score -= 4

    # Gap penalty
    score -= len(gaps) * 2

    return round(min(max(score, 5), 97), 1)


def _ml_score(extracted: dict, role: str) -> float:
    if not MODEL_PATH.exists():
        return None
    try:
        model = joblib.load(MODEL_PATH)
        features = _build_feature_vector(extracted, role)
        prob = model.predict_proba([features])[0][1]
        return round(prob * 100, 1)
    except Exception:
        return None


def _build_feature_vector(extracted: dict, role: str) -> list:
    cgpa, _ = _normalize_cgpa(extracted.get("cgpa"))
    skill_count = len(extracted.get("technical_skills", []))
    project_count = extracted.get("total_projects_count", 0)
    internship_count = extracted.get("internship_count", 0)
    has_dsa = 1 if extracted.get("has_dsa_signals") else 0
    has_github = 1 if extracted.get("github_present") else 0
    projects = extracted.get("projects", [])
    impact_projects = sum(1 for p in projects if p.get("has_impact_metrics"))
    high_complexity = sum(1 for p in projects if p.get("complexity") == "high")
    role_encoding = {
        "faang_sde": 0, "product_company": 1, "service_company": 2,
        "ml_data_role": 3, "core_engineering": 4
    }
    role_num = role_encoding.get(role, 1)
    return [cgpa, skill_count, project_count, internship_count,
            has_dsa, has_github, impact_projects, high_complexity, role_num]


def _build_score_breakdown(extracted: dict, role: str, gaps: list, track: str = "full_time") -> dict:
    """
    Returns a score breakdown dict showing each component's contribution.
    This is the core of transparent scoring (#2).
    """
    cgpa, was_converted = _normalize_cgpa(extracted.get("cgpa"))
    raw_cgpa = extracted.get("cgpa")
    skill_count = len(extracted.get("technical_skills", []))
    project_count = extracted.get("total_projects_count", 0) or len(extracted.get("projects", []))
    projects = extracted.get("projects", [])
    internship_count = extracted.get("internship_count", 0)
    high_quality = sum(1 for p in projects if p.get("has_impact_metrics") or p.get("complexity") == "high")
    has_dsa = bool(extracted.get("has_dsa_signals"))
    has_github = bool(extracted.get("github_present"))
    year = str(extracted.get("year_of_study") or "")

    # Calculate each component exactly as heuristic does
    cgpa_pts = 0
    if cgpa >= 9.0: cgpa_pts = 20
    elif cgpa >= 8.5: cgpa_pts = 17
    elif cgpa >= 8.0: cgpa_pts = 14
    elif cgpa >= 7.5: cgpa_pts = 10
    elif cgpa >= 7.0: cgpa_pts = 6
    elif cgpa >= 6.0: cgpa_pts = 2

    skills_pts = min(skill_count * 1, 15)
    projects_pts = min(project_count * 3, 9) + min(high_quality * 3, 6)

    # Internship track redistributes the internship-experience weight into
    # projects, since prior internship experience isn't a fair ask here.
    if track == "internship":
        internship_pts = min(project_count * 2, 6)
        internship_label_max = 6
    else:
        internship_pts = min(internship_count * 6, 10)
        internship_label_max = 10

    dsa_pts = 0
    if has_dsa and role in ["faang_sde", "product_company"]:
        dsa_pts = 8
    elif has_dsa:
        dsa_pts = 3

    github_pts = 3 if has_github else 0

    year_penalty = 0
    if track != "internship":
        if "1st" in year or year.strip() == "1": year_penalty = -12
        elif "2nd" in year or year.strip() == "2": year_penalty = -8
        elif "3rd" in year or year.strip() == "3": year_penalty = -4

    gap_penalty = -(len(gaps) * 2)

    return {
        "base": 25,
        "track": track,
        "cgpa": {"points": cgpa_pts, "max": 20, "value": cgpa, "converted": was_converted, "raw": raw_cgpa},
        "skills": {"points": skills_pts, "max": 15, "count": skill_count},
        "projects": {"points": projects_pts, "max": 15, "count": project_count, "high_quality": high_quality},
        "internships": {
            "points": internship_pts, "max": internship_label_max, "count": internship_count,
            "note": "Redistributed to project evidence for internship track" if track == "internship" else None,
        },
        "dsa": {"points": dsa_pts, "max": 8, "present": has_dsa},
        "github": {"points": github_pts, "max": 3, "present": has_github},
        "year_penalty": year_penalty,
        "gap_penalty": gap_penalty,
        "total_before_cap": 25 + cgpa_pts + skills_pts + projects_pts + internship_pts + dsa_pts + github_pts + year_penalty + gap_penalty,
    }


def _build_score_factors(extracted: dict, role: str, gaps: list, track: str = "full_time") -> list:
    raw_cgpa = extracted.get("cgpa")
    cgpa, was_converted = _normalize_cgpa(raw_cgpa)
    skill_count = len(extracted.get("technical_skills", []))
    project_count = extracted.get("total_projects_count", 0) or len(extracted.get("projects", []))
    internship_count = extracted.get("internship_count", 0)
    projects = extracted.get("projects", [])
    impact_projects = sum(1 for p in projects if p.get("has_impact_metrics"))
    high_complexity = sum(1 for p in projects if p.get("complexity") == "high")
    has_dsa = bool(extracted.get("has_dsa_signals"))
    has_github = bool(extracted.get("github_present"))
    year = str(extracted.get("year_of_study") or "")

    factors = []

    # GPA conversion notice
    if was_converted and raw_cgpa is not None:
        factors.append({
            "name": "GPA converted to 10-point scale",
            "impact": 0,
            "type": "info",
            "evidence": f"Detected 4.0 scale GPA ({_safe_float(raw_cgpa)}) → converted to {cgpa}/10 for scoring"
        })

    # CGPA
    if cgpa == 0:
        factors.append({
        "name": "CGPA not detected",
        "impact": 0,
        "type": "warning",
        "evidence": "CGPA not found on resume. Add it clearly — many campus drives use CGPA during shortlisting."
    })

    elif cgpa < 7.0:
        factors.append({
        "name": "CGPA below common shortlisting range",
        "impact": -10,
        "type": "negative",
        "evidence": f"CGPA: {cgpa}/10. Some companies apply eligibility cutoffs around 7.0 or higher."
    })

    elif cgpa < 7.5:
        factors.append({
        "name": "Moderate academic profile",
        "impact": -4,
        "type": "neutral",
        "evidence": f"CGPA: {cgpa}/10. Meets many opportunities, but higher CGPA can improve shortlisting odds."
    })

    elif cgpa < 8.0:
        factors.append({
        "name": "Good academic signal",
        "impact": 6,
        "type": "positive",
        "evidence": f"CGPA: {cgpa}/10. Competitive for many campus placement opportunities."
    })

    else:
        factors.append({
        "name": "Strong academic signal",
        "impact": 12,
        "type": "positive",
        "evidence": f"CGPA: {cgpa}/10. Above most campus shortlisting thresholds."
    })

    # Skills
    if skill_count >= 8:
        factors.append({"name": "Broad technical skill coverage", "impact": 10, "type": "positive",
                        "evidence": f"{skill_count} technical skills detected"})
    elif skill_count >= 4:
        factors.append({"name": "Moderate technical skills", "impact": 5, "type": "positive",
                        "evidence": f"{skill_count} technical skills detected"})
    else:
        factors.append({"name": "Limited visible technical skills", "impact": -8, "type": "negative",
                        "evidence": f"Only {skill_count} technical skills detected"})

    # Projects
    if project_count >= 3 or impact_projects > 0 or high_complexity > 0:
        factors.append({"name": "Project evidence is strong", "impact": 12, "type": "positive",
                        "evidence": f"{project_count} project(s), {impact_projects} with measurable impact"})
    elif project_count > 0:
        factors.append({"name": "Some project evidence", "impact": 5, "type": "positive",
                        "evidence": f"{project_count} project(s) detected"})
    else:
        factors.append({"name": "No projects extracted", "impact": -10, "type": "negative",
                        "evidence": "Projects were not clearly detected — check formatting."})

    # Internship
    if internship_count > 0:
        factors.append({"name": "Internship experience", "impact": min(internship_count * 7, 12),
                        "type": "positive", "evidence": f"{internship_count} internship(s) detected"})
    elif track != "internship":
        factors.append({"name": "No internship signal", "impact": -8, "type": "negative",
                        "evidence": "No internship detected — a high priority for placement readiness."})
    # else: applying for an internship with no prior internship is expected,
    # not a gap — no factor added either way.

    # DSA (tech roles only)
    if role in ["faang_sde", "product_company"]:
        if has_dsa:
            factors.append({"name": "DSA / coding practice signal", "impact": 8, "type": "positive",
                            "evidence": "LeetCode / competitive programming signal detected"})
        else:
            factors.append({"name": "Missing DSA proof", "impact": -9, "type": "negative",
                            "evidence": "No LeetCode, CP, or DSA signal found — critical for SDE roles"})

    # GitHub
    if has_github:
        factors.append({"name": "GitHub profile present", "impact": 3, "type": "positive",
                        "evidence": "GitHub link detected"})
    else:
        factors.append({"name": "GitHub not visible", "impact": -3, "type": "negative",
                        "evidence": "No GitHub link — add it, it's a quick win"})

    # Year of study — full-time track only. Internship postings are
    # designed for exactly this stage of the degree, so it isn't penalized.
    if track != "internship":
        if "1st" in year or year.strip() == "1":
            factors.append({"name": "Very early in degree", "impact": -12, "type": "negative",
                            "evidence": "1st year — placements are far, but start building now"})
        elif "2nd" in year or year.strip() == "2":
            factors.append({"name": "Early in degree", "impact": -8, "type": "negative",
                            "evidence": "2nd year — 2 years to placement. Time is your asset."})
        elif "3rd" in year or year.strip() == "3":
            factors.append({"name": "Approaching placement year", "impact": -4, "type": "negative",
                            "evidence": "3rd year — accelerate internships and projects now"})

    # Gaps
    if gaps:
        factors.append({"name": "Role-specific gaps identified", "impact": -min(len(gaps) * 3, 15),
                        "type": "negative", "evidence": f"{len(gaps)} missing signal(s) for selected role"})

    return factors


def _confidence_score(extracted: dict, model_used: str) -> int:
    signal_count = 0
    signal_count += 1 if extracted.get("cgpa") else 0
    signal_count += 1 if extracted.get("technical_skills") else 0
    signal_count += 1 if extracted.get("projects") else 0
    signal_count += 1 if extracted.get("internship_count", 0) > 0 else 0
    signal_count += 1 if extracted.get("github_present") or extracted.get("linkedin_present") else 0
    base = 58 + signal_count * 7
    if model_used == "ml+heuristic":
        base += 7
    return min(base, 92)


def _benchmark_for_score(score: float, role: str) -> dict:
    role_average = {
        "faang_sde": 68,
        "product_company": 64,
        "service_company": 58,
        "ml_data_role": 62,
        "core_engineering": 60,
    }.get(role, 62)
    percentile = max(10, min(95, round(50 + (score - role_average) * 1.2)))
    return {
        "role_average": role_average,
        "candidate_score": score,
        "percentile": percentile,
        "label": "Above benchmark" if score >= role_average else "Below benchmark",
        "explanation": "Compared against historical placement-readiness patterns for this target role."
    }


def get_placement_score(extracted: dict, role: str, gaps: list, track: str = "full_time") -> dict:
    ml_result = _ml_score(extracted, role)
    heuristic_result = _heuristic_score(extracted, role, gaps, track)

    if ml_result is not None:
        final_score = round(ml_result * 0.6 + heuristic_result * 0.4, 1)
        model_used = "ml+heuristic"
    else:
        final_score = heuristic_result
        model_used = "heuristic"

    if final_score >= 75:
        band = "high"
        band_label = "Strong chance"
        color = "green"
    elif final_score >= 50:
        band = "medium"
        band_label = "Moderate chance"
        color = "amber"
    else:
        band = "low"
        band_label = "Needs work"
        color = "red"

    return {
        "score": final_score,
        "track": track,
        "band": band,
        "band_label": band_label,
        "color": color,
        "model_used": model_used,
        "confidence": _confidence_score(extracted, model_used),
        "factors": _build_score_factors(extracted, role, gaps, track),
        "score_breakdown": _build_score_breakdown(extracted, role, gaps, track),
        "benchmark": _benchmark_for_score(final_score, role),
        "explanation": "Score combines extracted resume signals, role-specific gaps, and the placement model when available."
    }