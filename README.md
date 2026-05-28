# PlaceWise 🎯
**AI-powered placement readiness analyzer for engineering freshers in India**

Upload your resume → pick your target role → get a placement probability score, skill gap report, and personalized 4-week roadmap.

Supports: FAANG/Top-tier SDE, Product Company SDE, Service Company, ML/Data Roles, Core Engineering (ECE/EE/Mech)

---

## Tech Stack
- **Backend**: FastAPI, Python 3.11
- **LLM**: Groq API (LLaMA 3.3 70B) — free tier
- **PDF Parsing**: PyMuPDF
- **RAG**: ChromaDB + sentence-transformers
- **ML Score**: XGBoost (heuristic fallback until model is trained)
- **Frontend**: Next.js 14 + Tailwind CSS
- **Deploy**: Railway (backend) + Vercel (frontend)

---

## Local Setup

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp ../.env.example .env
# Add your GROQ_API_KEY to .env

uvicorn main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### Frontend
```bash
cd frontend
npm install
# Create .env.local with:
# NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/roles` | List all supported roles |
| POST | `/parse` | Parse resume PDF → sections |
| POST | `/extract` | Extract skills via Groq LLM |
| POST | `/analyze` | Full analysis pipeline |

### /analyze request (multipart/form-data)
- `file`: PDF resume (max 5MB)
- `role`: one of `faang_sde`, `product_company`, `service_company`, `ml_data_role`, `core_engineering`

---

## Train the ML Model (Day 4)
Open `ml_training.ipynb` in Google Colab:
1. Download [Campus Recruitment Dataset](https://www.kaggle.com/datasets/benroshan/factors-affecting-campus-placement) from Kaggle
2. Run all cells
3. Download `model.joblib` and place in `backend/`

---

## Deploy

### Backend → Railway
```bash
# In Railway dashboard: New Project → Deploy from GitHub → select placewise/backend
# Add env var: GROQ_API_KEY
```

### Frontend → Vercel
```bash
# In Vercel dashboard: New Project → Import from GitHub → select placewise/frontend
# Add env var: NEXT_PUBLIC_API_URL=https://your-railway-url.up.railway.app
```