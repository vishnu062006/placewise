# placewise ✨

**Explainable placement-readiness scoring for engineering students.**

Upload a resume, choose a target role, and get:
- a placement-readiness score
- role-specific strengths and gaps
- an actionable 4-week roadmap

---

## Why placewise?

placewise is built for students preparing for campus placements across multiple tracks:

- ⚡ FAANG / top-tier SDE
- 🚀 Product-company SDE
- 🏢 Service-company drives
- 🤖 Data / ML roles
- ⚙️ Core engineering roles

The output is not just a number — it explains *why* the score is high/low and what to fix next.

---

## What it does

1. **Parses PDF resumes**
2. **Extracts structured signals** (skills, projects, internships, CGPA, links)
3. **Compares profile with role requirements**
4. **Computes placement-readiness score** (ML + heuristic fallback)
5. **Generates a personalized 4-week roadmap**

---

## Tech stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** FastAPI, Python 3.11
- **LLM:** Groq (LLaMA 3.3 70B)
- **RAG/Knowledge:** ChromaDB + sentence-transformers
- **Scoring:** XGBoost (when model exists) + deterministic heuristic scoring
- **PDF parsing:** PyMuPDF

---

## Repository structure

```text
placewise/
├── backend/   # FastAPI service, extraction, scoring, roadmap generation, role KB
└── frontend/  # Next.js app (landing, upload flow, result dashboard)
```

---

## Local setup

### 1) Backend (FastAPI)

```bash
cd /home/runner/work/placewise/placewise/backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create `/home/runner/work/placewise/placewise/backend/.env`:

```env
GROQ_API_KEY=your_groq_key_here
```

Run backend:

```bash
uvicorn main:app --reload --port 8000
```

Backend docs: `http://localhost:8000/docs`

### 2) Frontend (Next.js)

```bash
cd /home/runner/work/placewise/placewise/frontend
npm install
```

Create `/home/runner/work/placewise/placewise/frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run frontend:

```bash
npm run dev
```

Open: `http://localhost:3000`

---

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/` | Health check |
| `GET` | `/roles` | Supported role keys + labels |
| `POST` | `/parse` | Parse PDF into normalized resume text |
| `POST` | `/extract` | LLM-based structured skill/profile extraction |
| `POST` | `/analyze` | End-to-end analysis pipeline |

### `POST /analyze` input

- `file`: PDF resume (max 5MB)
- `role`: one of:
  - `faang_sde`
  - `product_company`
  - `service_company`
  - `ml_data_role`
  - `core_engineering`

---

## Deploy

### Backend → Railway
- Deploy `backend/`
- Set `GROQ_API_KEY`

### Frontend → Vercel
- Deploy `frontend/`
- Set `NEXT_PUBLIC_API_URL` to your deployed backend URL

---

## Notes

- If `backend/model.joblib` is not present, scoring automatically uses the heuristic path.
- CORS is preconfigured for localhost and the hosted frontend domain.
