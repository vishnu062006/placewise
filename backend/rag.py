
import os
import chromadb
from chromadb.utils import embedding_functions
from pathlib import Path
from typing import Dict, List

KNOWLEDGE_BASE_DIR = Path(__file__).parent / "knowledge_base"

ROLE_TO_FILE = {
    "faang_sde": "faang_sde.txt",
    "product_company": "product_company.txt",
    "service_company": "service_company.txt",
    "ml_data_role": "ml_data_role.txt",
    "core_engineering": "core_engineering.txt",
}

ROLE_LABELS = {
    "faang_sde": "FAANG / Top-Tier Tech",
    "product_company": "Product Company SDE",
    "service_company": "Service Company",
    "ml_data_role": "ML / Data Role",
    "core_engineering": "Core Engineering",
}

_chroma_client = None
_collection = None


def _get_collection():
    global _chroma_client, _collection
    if _collection is not None:
        return _collection

    _chroma_client = chromadb.PersistentClient(
    path=str(KNOWLEDGE_BASE_DIR / "chroma_db")
)
    ef = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="all-MiniLM-L6-v2"
    )
    _collection = _chroma_client.get_or_create_collection(
        name="role_requirements",
        embedding_function=ef
    )

    # Load knowledge base docs if collection is empty
    if _collection.count() == 0:
        _load_knowledge_base(_collection)

    return _collection


def _load_knowledge_base(collection):
    docs, ids, metadatas = [], [], []
    for role_key, filename in ROLE_TO_FILE.items():
        filepath = KNOWLEDGE_BASE_DIR / filename
        if not filepath.exists():
            continue
        content = filepath.read_text(encoding="utf-8")
        # Chunk by paragraph for better retrieval
        paragraphs = [p.strip() for p in content.split("\n\n") if p.strip()]
        for i, para in enumerate(paragraphs):
            docs.append(para)
            ids.append(f"{role_key}_{i}")
            metadatas.append({"role": role_key, "chunk_index": i})

    if docs:
        collection.add(documents=docs, ids=ids, metadatas=metadatas)


def get_role_requirements(role: str) -> str:
    filename = ROLE_TO_FILE.get(role)
    if not filename:
        return ""
    filepath = KNOWLEDGE_BASE_DIR / filename
    if not filepath.exists():
        return ""
    return filepath.read_text(encoding="utf-8")


def analyze_gaps(extracted_skills: Dict, role: str) -> Dict:
    collection = _get_collection()

    # Build a query string from the candidate's skills
    tech_skills = extracted_skills.get("technical_skills", [])
    projects = extracted_skills.get("projects", [])
    project_tech = []
    for p in projects:
        project_tech.extend(p.get("tech_used", []))

    candidate_profile = " ".join(tech_skills + project_tech)
    if not candidate_profile.strip():
        candidate_profile = "no skills listed"

    # Query the knowledge base for this role
    results = collection.query(
        query_texts=[candidate_profile],
        n_results=5,
        where={"role": role}
    )

    relevant_chunks = results["documents"][0] if results["documents"] else []
    full_requirements = get_role_requirements(role)

    # Identify gaps by comparing skill sets
    gaps = _compute_gaps(extracted_skills, role, full_requirements)
    recommendations = _build_recommendations(gaps["missing_skills"], role)

    return {
        "role": role,
        "role_label": ROLE_LABELS.get(role, role),
        "relevant_context": relevant_chunks,
        "gaps": gaps["missing_skills"],
        "gap_categories": gaps["categories"],
        "strengths": gaps["strengths"],
        "recommendations": recommendations,
        "full_requirements_summary": full_requirements[:500]
    }


def _build_recommendations(missing_skills: List[str], role: str) -> List[Dict]:
    role_context = {
        "faang_sde": "top-tier SDE shortlists",
        "product_company": "product-company interviews",
        "service_company": "service-company campus drives",
        "ml_data_role": "ML/data fresher roles",
        "core_engineering": "core engineering shortlists",
    }.get(role, "this target role")

    recommendations = []
    for gap in missing_skills[:5]:
        lower_gap = gap.lower()
        if "dsa" in lower_gap or "leetcode" in lower_gap:
            action = "Add a DSA section with LeetCode count, core topics covered, and 2-3 contest or coding-platform links."
        elif "backend" in lower_gap:
            action = "Ship one backend-heavy project with authentication, database schema, API documentation, and deployment link."
        elif "frontend" in lower_gap:
            action = "Show one polished frontend project with responsive UI, state handling, and a live demo link."
        elif "database" in lower_gap or "sql" in lower_gap:
            action = "Add SQL/database proof through schema design, joins, indexing, or a project with persistent storage."
        elif "internship" in lower_gap:
            action = "Add internship-like evidence through open-source contribution, freelance work, or a production-style capstone."
        elif "project" in lower_gap:
            action = "Rewrite project bullets with scale, complexity, tech stack, and measurable impact."
        elif "github" in lower_gap:
            action = "Add a GitHub link and pin repositories that match your selected role."
        elif "cgpa" in lower_gap:
            action = "Offset the academic gap with stronger project proof, coding signals, and certifications relevant to the role."
        else:
            action = f"Make this signal explicit on the resume: {gap}."

        recommendations.append({
            "title": gap,
            "action": action,
            "why": f"This is commonly checked for {role_context}."
        })

    return recommendations


def _compute_gaps(extracted: Dict, role: str, requirements_text: str) -> Dict:
    tech_skills_lower = [s.lower() for s in extracted.get("technical_skills", [])]
    has_dsa = extracted.get("has_dsa_signals", False)
    cgpa_str = extracted.get("cgpa") or "0"
    try:
        cgpa = float(cgpa_str)
    except ValueError:
        cgpa = 0.0
    internship_count = extracted.get("internship_count", 0)
    project_count = extracted.get("total_projects_count", 0)
    projects = extracted.get("projects", [])
    has_github = extracted.get("github_present", False)

    missing_skills = []
    strengths = []
    categories = {}

    if role == "faang_sde":
        if not has_dsa:
            missing_skills.append("DSA proof (LeetCode count, competitive programming)")
            categories["DSA"] = "critical"
        else:
            strengths.append("Has DSA / competitive programming signals")

        if cgpa >= 8.0:
            strengths.append(f"Strong CGPA ({cgpa})")
        elif cgpa >= 7.5:
            strengths.append(f"Good CGPA ({cgpa})")
        else:
            missing_skills.append(f"CGPA below 7.5 (current: {cgpa or 'not found'})")
            categories["CGPA"] = "important"

        cs_fundamentals = ["os", "operating system", "dbms", "database", "networks", "networking", "cn"]
        if not any(f in tech_skills_lower for f in cs_fundamentals):
            missing_skills.append("CS fundamentals on resume (OS, DBMS, CN)")
            categories["CS Fundamentals"] = "important"

        if internship_count == 0:
            missing_skills.append("Tech internship experience")
            categories["Internship"] = "recommended"
        else:
            strengths.append(f"{internship_count} internship(s)")

        impact_projects = [p for p in projects if p.get("has_impact_metrics")]
        if len(impact_projects) == 0:
            missing_skills.append("Projects with measurable impact (user count, performance gains)")
            categories["Projects"] = "important"
        else:
            strengths.append(f"{len(impact_projects)} project(s) with impact metrics")

        if not has_github:
            missing_skills.append("GitHub profile link on resume")
            categories["GitHub"] = "recommended"
        else:
            strengths.append("GitHub profile present")

    elif role == "product_company":
        backend_skills = ["spring", "node", "express", "django", "fastapi", "flask", "spring boot"]
        frontend_skills = ["react", "next", "vue", "angular", "nextjs"]
        db_skills = ["sql", "postgresql", "mysql", "mongodb", "redis", "postgres"]

        if not any(b in tech_skills_lower for b in backend_skills):
            missing_skills.append("Backend framework (Spring Boot, Node.js, Django, FastAPI)")
            categories["Backend"] = "critical"
        else:
            strengths.append("Backend framework experience")

        if not any(f in tech_skills_lower for f in frontend_skills):
            missing_skills.append("Frontend framework (React, Next.js, Vue)")
            categories["Frontend"] = "recommended"
        else:
            strengths.append("Frontend framework experience")

        if not any(d in tech_skills_lower for d in db_skills):
            missing_skills.append("Database skills (SQL or NoSQL)")
            categories["Database"] = "important"
        else:
            strengths.append("Database experience")

        deployed_projects = [p for p in projects if p.get("complexity") in ["medium", "high"]]
        if len(deployed_projects) == 0:
            missing_skills.append("At least 1 medium/complex deployed project")
            categories["Projects"] = "important"

        if cgpa < 7.0:
            missing_skills.append(f"CGPA below 7.0 (current: {cgpa or 'not found'})")
            categories["CGPA"] = "important"
        else:
            strengths.append(f"CGPA {cgpa} meets product company bar")

    elif role == "service_company":
        basic_langs = ["java", "python", "c", "c++"]
        if not any(l in tech_skills_lower for l in basic_langs):
            missing_skills.append("At least one programming language (Java, Python, C/C++)")
            categories["Programming"] = "critical"
        else:
            strengths.append("Programming language present")

        if "sql" not in tech_skills_lower:
            missing_skills.append("Basic SQL knowledge")
            categories["SQL"] = "important"
        else:
            strengths.append("SQL skills present")

        if cgpa < 6.0:
            missing_skills.append(f"CGPA below 6.0 cutoff (current: {cgpa or 'not found'})")
            categories["CGPA"] = "critical"
        else:
            strengths.append(f"CGPA {cgpa} meets service company cutoff")

        if project_count == 0:
            missing_skills.append("At least 1 academic project")
            categories["Projects"] = "important"
        else:
            strengths.append(f"{project_count} project(s) on resume")

    elif role == "ml_data_role":
        ml_skills = ["python", "pandas", "numpy", "scikit", "sklearn", "tensorflow", "pytorch", "xgboost"]
        if not any(m in tech_skills_lower for m in ml_skills):
            missing_skills.append("Python ML stack (pandas, numpy, scikit-learn)")
            categories["ML Stack"] = "critical"
        else:
            strengths.append("ML/data tools present")

        if "sql" not in tech_skills_lower:
            missing_skills.append("SQL skills (critical for data roles)")
            categories["SQL"] = "critical"
        else:
            strengths.append("SQL present — good for data roles")

        ml_projects = [p for p in projects if any(
            t in ["python", "ml", "tensorflow", "pytorch", "scikit", "data", "pandas"]
            for t in [x.lower() for x in p.get("tech_used", [])]
        )]
        if len(ml_projects) == 0:
            missing_skills.append("End-to-end ML project (not just a notebook)")
            categories["Projects"] = "critical"
        else:
            strengths.append(f"{len(ml_projects)} ML/data project(s)")

        if "kaggle" not in " ".join(tech_skills_lower):
            missing_skills.append("Kaggle profile or competition participation")
            categories["Kaggle"] = "recommended"

    elif role == "core_engineering":
        embedded_skills = ["arduino", "esp32", "stm32", "embedded", "verilog", "vhdl", "fpga", "rtos", "microcontroller"]
        mech_skills = ["solidworks", "autocad", "catia", "ansys", "matlab", "fusion 360", "cad", "fea"]

        has_embedded = any(e in tech_skills_lower for e in embedded_skills)
        has_mech = any(m in tech_skills_lower for m in mech_skills)

        if not has_embedded and not has_mech:
            missing_skills.append("Domain-specific tools (Arduino/Verilog for ECE, SolidWorks/MATLAB for Mech)")
            categories["Domain Tools"] = "critical"
        else:
            if has_embedded:
                strengths.append("Embedded/hardware tools present")
            if has_mech:
                strengths.append("Mechanical CAD/simulation tools present")

        if project_count == 0:
            missing_skills.append("Hardware or simulation project")
            categories["Projects"] = "critical"

    return {
        "missing_skills": missing_skills,
        "strengths": strengths,
        "categories": categories
    }
if __name__ == "__main__":

    sample_resume = {
        "technical_skills": [
            "Python",
            "React",
            "SQL",
            "FastAPI"
        ],
        "projects": [
            {
                "tech_used": ["React", "FastAPI", "MongoDB"],
                "complexity": "high",
                "has_impact_metrics": True
            }
        ],
        "cgpa": "8.2",
        "internship_count": 1,
        "total_projects_count": 2,
        "github_present": True,
        "has_dsa_signals": True
    }

    result = analyze_gaps(
        sample_resume,
        "product_company"
    )

    print("\n=== GAP ANALYSIS ===")
    print(result)
