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


def _heuristic_score(extracted: dict, role: str, gaps: list) -> float:
    score = 25.0  # base

    # CGPA contribution (max +20)
    cgpa = _safe_float(extracted.get("cgpa"))
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

    # Skills contribution (max +15)
    skill_count = len(extracted.get("technical_skills", []))
    score += min(skill_count * 1, 15)

    # Projects contribution (max +15)
    project_count = extracted.get("total_projects_count", 0)
    projects = extracted.get("projects", [])
    high_quality = sum(1 for p in projects if p.get("has_impact_metrics") or p.get("complexity") == "high")
    score += min(project_count * 3, 9)
    score += min(high_quality * 3, 6)

    # Internship contribution (max +10)
    internship_count = extracted.get("internship_count", 0)
    score += min(internship_count * 6, 10)

    # DSA signals (max +8, mostly for tech roles)
    if extracted.get("has_dsa_signals") and role in ["faang_sde", "product_company"]:
        score += 8
    elif extracted.get("has_dsa_signals"):
        score += 3

    # GitHub presence (+3)
    if extracted.get("github_present"):
        score += 3

    # Year of study penalty — honest calibration for early-stage students
    year = str(extracted.get("year_of_study") or "")
    if "1st" in year or year.strip() == "1":
        score -= 12
    elif "2nd" in year or year.strip() == "2":
        score -= 8
    elif "3rd" in year or year.strip() == "3":
        score -= 4
    # 4th year = no penalty

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
    cgpa = _safe_float(extracted.get("cgpa"))
    skill_count = len(extracted.get("technical_skills", []))
    project_count = extracted.get("total_projects_count", 0)
    internship_count = extracted.get("internship_count", 0)
    has_dsa = 1 if extracted.get("has_dsa_signals") else 0
    has_github = 1 if extracted.get("github_present") else 0
    projects = extracted.get("projects", [])
    impact_projects = sum(1 for p in projects if p.get("has_impact_metrics"))
    high_complexity = sum(1 for p in projects if p.get("complexity") == "high")
    role_encoding = {
        "faang_sde": 0,
        "product_company": 1,
        "service_company": 2,
        "ml_data_role": 3,
        "core_engineering": 4
    }
    role_num = role_encoding.get(role, 1)
    return [cgpa, skill_count, project_count, internship_count,
            has_dsa, has_github, impact_projects, high_complexity, role_num]


def _build_score_factors(extracted: dict, role: str, gaps: list) -> list:
    cgpa = _safe_float(extracted.get("cgpa"))
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

    # CGPA
    if cgpa >= 8:
        factors.append({"name": "Strong academic signal", "impact": 12, "type": "positive",
                        "evidence": f"CGPA detected: {cgpa}"})
    elif cgpa >= 7:
        factors.append({"name": "Acceptable CGPA", "impact": 6, "type": "positive",
                        "evidence": f"CGPA detected: {cgpa}"})
    elif cgpa > 0:
        factors.append({"name": "CGPA below common shortlisting bar", "impact": -8, "type": "negative",
                        "evidence": f"CGPA detected: {cgpa}"})
    else:
        factors.append({"name": "CGPA not found", "impact": -5, "type": "negative",
                        "evidence": "No CGPA signal was extracted from the resume."})

    # Skills
    if skill_count >= 8:
        factors.append({"name": "Broad technical skill coverage", "impact": 10, "type": "positive",
                        "evidence": f"{skill_count} technical skills detected"})
    elif skill_count >= 4:
        factors.append({"name": "Moderate technical skill coverage", "impact": 5, "type": "positive",
                        "evidence": f"{skill_count} technical skills detected"})
    else:
        factors.append({"name": "Limited visible technical skills", "impact": -8, "type": "negative",
                        "evidence": f"{skill_count} technical skills detected"})

    # Projects
    if project_count >= 3 or impact_projects > 0 or high_complexity > 0:
        factors.append({"name": "Project evidence is visible", "impact": 12, "type": "positive",
                        "evidence": f"{project_count} project(s), {impact_projects} with measurable impact"})
    elif project_count > 0:
        factors.append({"name": "Some project evidence", "impact": 5, "type": "positive",
                        "evidence": f"{project_count} project(s) detected"})
    else:
        factors.append({"name": "No project depth extracted", "impact": -10, "type": "negative",
                        "evidence": "Projects were not clearly detected."})

    # Internship
    if internship_count > 0:
        factors.append({"name": "Internship experience", "impact": min(internship_count * 7, 12),
                        "type": "positive", "evidence": f"{internship_count} internship(s) detected"})
    else:
        factors.append({"name": "No internship signal", "impact": -8, "type": "negative",
                        "evidence": "No internship was extracted from the resume."})

    # DSA (tech roles only)
    if role in ["faang_sde", "product_company"]:
        if has_dsa:
            factors.append({"name": "DSA / coding practice signal", "impact": 8, "type": "positive",
                            "evidence": "Coding practice or DSA signal present"})
        else:
            factors.append({"name": "Missing DSA proof", "impact": -9, "type": "negative",
                            "evidence": "No LeetCode, CP, or DSA signal found"})

    # GitHub
    if has_github:
        factors.append({"name": "GitHub profile present", "impact": 3, "type": "positive",
                        "evidence": "GitHub link detected"})
    else:
        factors.append({"name": "GitHub not visible", "impact": -3, "type": "negative",
                        "evidence": "No GitHub link detected"})

    # Year of study — honest calibration
    if "1st" in year or year.strip() == "1":
        factors.append({"name": "Very early in degree", "impact": -12, "type": "negative",
                        "evidence": "1st year students have time — focus on fundamentals and first projects"})
    elif "2nd" in year or year.strip() == "2":
        factors.append({"name": "Early in degree", "impact": -8, "type": "negative",
                        "evidence": "2nd year — strong foundation, but placements are 2 years away. Keep building."})
    elif "3rd" in year or year.strip() == "3":
        factors.append({"name": "Approaching placement year", "impact": -4, "type": "negative",
                        "evidence": "3rd year — time to accelerate internships and projects"})

    # Gaps
    if gaps:
        factors.append({"name": "Role-specific gaps identified", "impact": -min(len(gaps) * 3, 15),
                        "type": "negative", "evidence": f"{len(gaps)} missing signal(s) for the selected role"})

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


def get_placement_score(extracted: dict, role: str, gaps: list) -> dict:
    ml_result = _ml_score(extracted, role)
    heuristic_result = _heuristic_score(extracted, role, gaps)

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
        "band": band,
        "band_label": band_label,
        "color": color,
        "model_used": model_used,
        "confidence": _confidence_score(extracted, model_used),
        "factors": _build_score_factors(extracted, role, gaps),
        "benchmark": _benchmark_for_score(final_score, role),
        "explanation": "Score combines extracted resume signals, role-specific gaps, and the placement model when available."
    }