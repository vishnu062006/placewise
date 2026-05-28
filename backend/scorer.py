import os
import numpy as np
import joblib
from pathlib import Path

MODEL_PATH = Path(__file__).parent / "model.joblib"


def _heuristic_score(extracted: dict, role: str, gaps: list) -> float:
    """
    Fallback heuristic scorer used before the ML model is trained.
    Returns a 0–100 placement probability.
    """
    score = 40.0  # base

    # CGPA contribution (max +20)
    cgpa_str = extracted.get("cgpa") or "0"
    try:
        cgpa = float(cgpa_str)
    except ValueError:
        cgpa = 0.0

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
    score += min(skill_count * 1.5, 15)

    # Projects contribution (max +15)
    project_count = extracted.get("total_projects_count", 0)
    projects = extracted.get("projects", [])
    high_quality = sum(1 for p in projects if p.get("has_impact_metrics") or p.get("complexity") == "high")
    score += min(project_count * 3, 9)
    score += min(high_quality * 3, 6)

    # Internship contribution (max +10)
    internship_count = extracted.get("internship_count", 0)
    score += min(internship_count * 7, 10)

    # DSA signals (max +8, mostly for tech roles)
    if extracted.get("has_dsa_signals") and role in ["faang_sde", "product_company"]:
        score += 8
    elif extracted.get("has_dsa_signals"):
        score += 3

    # GitHub presence (+3)
    if extracted.get("github_present"):
        score += 3

    # Gap penalty (-3 per critical gap, -1 per minor gap)
    score -= len(gaps) * 2

    # Clamp to 0–100
    return round(min(max(score, 5), 97), 1)


def _ml_score(extracted: dict, role: str) -> float:
    """
    Use trained XGBoost model if available.
    """
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
    cgpa_str = extracted.get("cgpa") or "0"
    try:
        cgpa = float(cgpa_str)
    except ValueError:
        cgpa = 0.0

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

    return [
        cgpa,
        skill_count,
        project_count,
        internship_count,
        has_dsa,
        has_github,
        impact_projects,
        high_complexity,
        role_num
    ]


def get_placement_score(extracted: dict, role: str, gaps: list) -> dict:
    ml_result = _ml_score(extracted, role)
    heuristic_result = _heuristic_score(extracted, role, gaps)

    if ml_result is not None:
        final_score = round(ml_result * 0.6 + heuristic_result * 0.4, 1)
        model_used = "ml+heuristic"
    else:
        final_score = heuristic_result
        model_used = "heuristic"

    # Determine risk band
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
        "model_used": model_used
    }