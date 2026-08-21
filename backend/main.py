from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import traceback
import json

from db import init_db, cache_get, cache_set, save_resume
from auth import get_current_user_optional, get_current_user, CurrentUser
from parser import parse_resume
from extractor import extract_skills
from rag import analyze_gaps, ROLE_LABELS
from scorer import get_placement_score
from roadmap import generate_roadmap
from jd_matcher import extract_jd_requirements, match_resume_to_jd
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# 1. Initialize the Rate Limiter
limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(
    title="Trajekt API",
    description="AI-powered placement readiness analyzer for engineering freshers",
    version="2.1.0",
    lifespan=lifespan,
)

# 2. Attach limiter to the FastAPI app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://placewise-ai.vercel.app",
        "http://localhost:3000",
        "http://localhost:3002",
        "https://trajekt.in",
        "https://www.trajekt.in",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VALID_ROLES = list(ROLE_LABELS.keys())
VALID_TRACKS = ["internship", "full_time"]


class SaveResumePayload(BaseModel):
    extracted_data: dict
    role: str
    track: str
    score: float


@app.get("/")
@limiter.limit("60/minute")
def root(request: Request):
    return {"status": "Trajekt API running", "version": "2.1.0"}


@app.get("/roles")
@limiter.limit("60/minute")
def get_roles(request: Request):
    return {"roles": [{"key": k, "label": v} for k, v in ROLE_LABELS.items()]}

@app.post("/match-jd")
@limiter.limit("10/minute")
async def match_jd_endpoint(
    request: Request,
    jd_text: str = Form(...),
    file: Optional[UploadFile] = File(None),
    extracted_data: Optional[str] = Form(None),
):
    if extracted_data:
        extracted = json.loads(extracted_data)
    elif file:
        pdf_bytes = await file.read()
        parsed = parse_resume(pdf_bytes)
        extracted = extract_skills(parsed)
    else:
        raise HTTPException(status_code=400, detail="Provide either a resume file or extracted_data")

    jd_data = extract_jd_requirements(jd_text, cache_get=cache_get, cache_set=cache_set)
    match_result = match_resume_to_jd(extracted, jd_data)

    return {"status": "success", "jd_match": match_result}

@app.post("/parse")
@limiter.limit("20/minute")
async def parse_endpoint(request: Request, file: UploadFile = File(...)):
    """Day 1 endpoint — parses resume PDF into structured sections."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    pdf_bytes = await file.read()
    if len(pdf_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max 5MB.")
    try:
        parsed = parse_resume(pdf_bytes)
        return {"status": "success", "parsed": parsed}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parsing failed: {str(e)}")


@app.post("/extract")
@limiter.limit("10/minute")
async def extract_endpoint(request: Request, file: UploadFile = File(...)):
    """Day 2 endpoint — extracts skills via Groq LLM."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    pdf_bytes = await file.read()
    try:
        parsed = parse_resume(pdf_bytes)
        extracted = extract_skills(parsed)
        return {"status": "success", "extracted": extracted}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")


@app.post("/analyze")
@limiter.limit("5/minute")
async def analyze_endpoint(
    request: Request,
    file: UploadFile = File(...),
    role: str = Form(...),
    track: str = Form("full_time"),
    jd_text: Optional[str] = Form(None),   # optional JD paste
    user: Optional[CurrentUser] = Depends(get_current_user_optional),  # optional login, not used to auto-save
):
    """
    Main endpoint — full pipeline:
    PDF → parse → LLM extract → RAG gap analysis → (optional JD match) → ML score → roadmap
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    if role not in VALID_ROLES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid role. Choose from: {', '.join(VALID_ROLES)}"
        )

    if track not in VALID_TRACKS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid track. Choose from: {', '.join(VALID_TRACKS)}"
        )

    pdf_bytes = await file.read()
    if len(pdf_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max 5MB.")

    try:
        # Step 1 — Parse resume
        parsed = parse_resume(pdf_bytes)

        # Step 2 — LLM skill extraction
        extracted = extract_skills(parsed)

        # Step 3 — RAG gap analysis
        gap_analysis = analyze_gaps(extracted, role, track)

        # Step 3.5 — JD matching (only if a JD was provided)
        jd_match = None
        gaps_for_scoring = gap_analysis["gaps"]

        if jd_text:
            jd_data = extract_jd_requirements(
                jd_text,
                cache_get=cache_get,
                cache_set=cache_set,
            )
            jd_match = match_resume_to_jd(extracted, jd_data)

            jd_gaps = [
                f"Missing for {jd_match['role_title'] or 'this role'}: {s}"
                for s in jd_match["roadmap_gaps"]
            ]
            gaps_for_scoring = jd_gaps + gap_analysis["gaps"]  # JD gaps prioritized first

        # Step 4 — ML placement score
        placement = get_placement_score(extracted, role, gaps_for_scoring, track)

        # Step 5 — LLM roadmap generation
        roadmap = generate_roadmap(
            extracted=extracted,
            role=role,
            role_label=gap_analysis["role_label"],
            score=placement["score"],
            band_label=placement["band_label"],
            gaps=gaps_for_scoring,
            strengths=gap_analysis["strengths"]
        )

        return {
            "status": "success",
            "candidate_name": parsed.get("candidate_name", ""),
            "role": role,
            "track": track,
            "role_label": gap_analysis["role_label"],
            "score": placement["score"],
            "confidence": placement["confidence"],
            "score_factors": placement["factors"],
            "benchmark": placement["benchmark"],
            "recommendations": gap_analysis["recommendations"],
            "strengths": gap_analysis["strengths"],
            "weaknesses": gap_analysis["gaps"],
            "extractedData": {
                "skills": extracted.get("technical_skills", []),
                "projects_count": extracted.get("total_projects_count", 0),
                "internships": extracted.get("internships", []),
                "internship_count": extracted.get("internship_count", 0),
                "cgpa": extracted.get("cgpa"),
                "certifications": extracted.get("certifications", []),
                "tech_stack": extracted.get("technical_skills", []),
                "github_present": extracted.get("github_present", False),
                "linkedin_present": extracted.get("linkedin_present", False),
            },
            "placement_score": placement,
            "skills": {
                "technical": extracted.get("technical_skills", []),
                "soft": extracted.get("soft_skills", []),
                "strongest_area": extracted.get("strongest_skill_area", "unknown"),
                "dsa_signals": extracted.get("dsa_signals", []),
                "certifications": extracted.get("certifications", []),
            },
            "profile": {
                "cgpa": extracted.get("cgpa"),
                "college": extracted.get("college"),
                "branch": extracted.get("branch"),
                "year": extracted.get("year_of_study"),
                "internship_count": extracted.get("internship_count", 0),
                "project_count": extracted.get("total_projects_count", 0),
                "github_present": extracted.get("github_present", False),
                "linkedin_present": extracted.get("linkedin_present", False),
            },
            "projects": extracted.get("projects", []),
            "gap_analysis": {
                "gaps": gap_analysis["gaps"],
                "gap_categories": gap_analysis["gap_categories"],
                "strengths": gap_analysis["strengths"],
                "recommendations": gap_analysis["recommendations"],
            },
            "jd_match": jd_match,
            "logged_in": user is not None,
            "roadmap": roadmap
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.post("/save-resume")
@limiter.limit("10/minute")
async def save_resume_endpoint(
    request: Request,
    payload: SaveResumePayload,
    user: CurrentUser = Depends(get_current_user),  # login required — 401s otherwise
):
    """
    Explicit save, called only after the user chooses to sign in on the
    results page.
    """
    resume_id = save_resume(
        user_id=user.user_id,
        extracted_data=payload.extracted_data,
        role=payload.role,
        track=payload.track,
        score=payload.score,
    )
    return {"status": "saved", "resume_id": resume_id}