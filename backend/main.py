from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import traceback

from parser import parse_resume
from extractor import extract_skills
from rag import analyze_gaps, ROLE_LABELS
from scorer import get_placement_score
from roadmap import generate_roadmap

app = FastAPI(
    title="PlaceWise API",
    description="AI-powered placement readiness analyzer for engineering freshers",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3002", "https://placewise.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VALID_ROLES = list(ROLE_LABELS.keys())


@app.get("/")
def root():
    return {"status": "PlaceWise API running", "version": "1.0.0"}


@app.get("/roles")
def get_roles():
    return {"roles": [{"key": k, "label": v} for k, v in ROLE_LABELS.items()]}


@app.post("/parse")
async def parse_endpoint(file: UploadFile = File(...)):
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
async def extract_endpoint(file: UploadFile = File(...)):
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
async def analyze_endpoint(
    file: UploadFile = File(...),
    role: str = Form(...)
):
    """
    Main endpoint — full pipeline:
    PDF → parse → LLM extract → RAG gap analysis → ML score → roadmap
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    if role not in VALID_ROLES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid role. Choose from: {', '.join(VALID_ROLES)}"
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
        gap_analysis = analyze_gaps(extracted, role)

        # Step 4 — ML placement score
        placement = get_placement_score(extracted, role, gap_analysis["gaps"])

        # Step 5 — LLM roadmap generation
        roadmap = generate_roadmap(
            extracted=extracted,
            role=role,
            role_label=gap_analysis["role_label"],
            score=placement["score"],
            band_label=placement["band_label"],
            gaps=gap_analysis["gaps"],
            strengths=gap_analysis["strengths"]
        )

        return {
            "status": "success",
            "candidate_name": parsed.get("candidate_name", ""),
            "role": role,
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
            "roadmap": roadmap
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
