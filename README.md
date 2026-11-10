# CareerPilot AI — Intelligent Resume Analyzer & Placement Assistant

> **"Your Resume Deserves More Than a Guess. Get Career-Ready with AI."**

CareerPilot AI is an industry-grade full-stack career platform engineered to help students, recent graduates, and software engineers break through Applicant Tracking Systems (ATS) and excel in technical, HR, and behavioral interviews.

---

## 🌟 Key Highlights & Capabilities

- **Algorithmic ATS Parseability Engine**: Evaluates resume formatting, hierarchy, missing sections, and keyword density using PyMuPDF and python-docx.
- **Google Gemini 3.8 Flash Integration**: Leverages the official `google-genai` Python SDK with strict Pydantic structured output schemas.
- **Job Description Matcher**: Analyzes job postings line-by-line, highlighting matching vs. missing skills, qualification gaps, and company-specific tailoring strategies.
- **Resume Improvement Studio**: Side-by-side interactive bullet point rewrite studio. Injects high-impact action verbs and quantified metrics (e.g. Google X-Y-Z formula) without fabricating false credentials.
- **Interactive AI Mock Interviews**: Dynamic sequential question flow (Technical, HR, Behavioral STAR, and Project Deep Dives) with instant grading, model benchmark answers, and tactical feedback.
- **Career Skill Gap Analyzer & Learning Roadmap**: Identifies unaddressed technical and soft competencies and renders an interactive 4-phase learning curriculum.
- **Enterprise-Grade Security**: PostgreSQL Row Level Security (RLS) migration ensuring each candidate can only access their own resumes, evaluations, and mock sessions.

---

## 🏗️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, Framer Motion |
| **Backend** | Python 3.14+, FastAPI, Uvicorn, Pydantic v2, PyMuPDF (fitz), python-docx |
| **AI Engine** | Google Gemini API (`gemini-3.8-flash`) via the official `google-genai` SDK |
| **Database & Auth** | Supabase (PostgreSQL 15+, Row Level Security, Supabase Auth, JWT verification) |
| **Development** | In-memory zero-config fallback store for instant local testing |

---

## 📁 Project Architecture

```
careerpilot-ai/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── resumes.py        # /api/resumes/upload, /analyze, list, delete
│   │   │   ├── jobs.py           # /api/jobs/match, matches history
│   │   │   ├── improve.py        # /api/resume/improve
│   │   │   ├── interview.py      # /api/interview/start, /answer, history
│   │   │   ├── skills.py         # /api/skills/profile, toggle
│   │   │   ├── dashboard.py      # /api/dashboard/stats
│   │   │   └── profile.py        # /api/profile GET & PUT
│   │   ├── core/
│   │   │   ├── config.py         # App environment & secret settings
│   │   │   └── security.py       # Supabase bearer token & user resolver
│   │   ├── models/
│   │   │   └── schemas.py        # Pydantic structured schemas
│   │   ├── services/
│   │   │   ├── gemini_service.py # Gemini 3.8 Flash structured API client
│   │   │   ├── parser_service.py # PyMuPDF & python-docx extractor
│   │   │   └── supabase_service.py # DB persistence & demo repository
│   │   ├── utils/
│   │   │   └── logger.py
│   │   └── main.py               # FastAPI application & middleware
│   ├── requirements.txt
│   ├── test_api.py               # End-to-end 9-step test pipeline
│   ├── .env.example
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   │   └── AuthContext.tsx   # Supabase & demo session state
│   │   ├── layouts/
│   │   │   └── AppLayout.tsx     # Responsive sidebar & status topbar
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx   # Conversion hero, preview & FAQ
│   │   │   ├── LoginPage.tsx     # Auth login with demo auto-fill
│   │   │   ├── SignUpPage.tsx    # User registration
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   ├── DashboardPage.tsx # Metric cards, charts & quick actions
│   │   │   ├── ResumeUploadPage.tsx # PDF/DOCX dropzone & parser
│   │   │   ├── ResumeAnalysisPage.tsx # ATS score, breakdown & strengths
│   │   │   ├── JobMatcherPage.tsx   # JD comparison & skill overlap
│   │   │   ├── ResumeImprovePage.tsx # Side-by-side rewriting studio
│   │   │   ├── InterviewPrepPage.tsx # Interactive AI mock interviews
│   │   │   ├── SkillGapPage.tsx     # Roadmap & acquired skill tracker
│   │   │   ├── HistoryPage.tsx      # Past analyses & deletion
│   │   │   ├── ProfilePage.tsx      # Candidate details & target roles
│   │   │   └── SettingsPage.tsx     # Gemini & Supabase connection audits
│   │   ├── services/
│   │   │   ├── api.ts            # Typed REST client
│   │   │   └── supabase.ts       # Supabase JS client
│   │   ├── types/
│   │   │   └── index.ts          # TypeScript interfaces
│   │   ├── App.tsx               # Client router & navigation
│   │   └── index.css             # Dark neon sleek styling
│   ├── package.json
│   └── vite.config.ts
├── supabase/
│   └── migrations/
│       └── 20261104_init.sql     # Full SQL schema with 9 tables & RLS
├── .env.example
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start & Local Setup

> **🚀 One‑Click Setup**
> 
> The project works out‑of‑the‑box with **SQLite persistence** – no Supabase credentials required. All data (resumes, analyses, job matches, interview sessions, profile info) is stored in `backend/app/careerpilot.db` and survives server restarts.
>
> If you have a Supabase instance you can still connect it by filling the values in `.env`. The app will automatically switch to Supabase when the `SUPABASE_URL` environment variable is present.
>
> The unified server serves both the React SPA and the FastAPI API on **http://localhost:8000/**. No extra ports are needed.

### 1. Prerequisites
- **Node.js**: v18+ (tested on v24)
- **Python**: v3.10+ (tested on v3.14)
- **Git**

### 2. Backend Setup

```bash
cd careerpilot-ai/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# (Or on Windows without activating venv: use `.\venv\Scripts\python.exe` directly)
# macOS / Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run SQLite persistence tests
python test_db_persistence.py

# Start Unified FastAPI server (serves both React frontend & API on port 8000)
# Option A (Active venv):
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
# Option B (Direct Windows command in VS Code terminal):
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be live at:
- **Root**: `http://localhost:8000/`
- **Swagger Interactive API Docs**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/api/health`

### 3. Frontend Setup

```bash
cd careerpilot-ai/frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🔑 Environment Configuration

Copy `.env.example` to `backend/.env`:

```env
# Server
ENVIRONMENT=development
PORT=8000
HOST=0.0.0.0

# Google Gemini API
# Get your free key at: https://aistudio.google.com/
GEMINI_API_KEY=your_actual_gemini_api_key
GEMINI_MODEL=gemini-3.8-flash

# Supabase PostgreSQL (Optional for local testing; in-memory store is active by default)
# Get credentials at: https://supabase.com/
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
```

> **Note on Zero-Config Demo Mode:**
> If `GEMINI_API_KEY` or `SUPABASE_URL` are not yet supplied, CareerPilot AI will automatically operate in **Intelligent Demo Mode**. It generates realistic, domain-accurate scoring data and displays an informative banner so you can test every button and page immediately!

---

## 🗄️ Supabase PostgreSQL Setup & RLS

When connecting your Supabase project:
1. Create a project at [supabase.com](https://supabase.com/).
2. Navigate to the **SQL Editor** tab.
3. Open `careerpilot-ai/supabase/migrations/20261104_init.sql`.
4. Run the script. This creates:
   - `profiles` (with automatic trigger upon auth signup)
   - `resumes`
   - `resume_analyses`
   - `job_descriptions`
   - `job_matches`
   - `interview_sessions`
   - `interview_questions`
   - `skill_profiles`
   - `learning_progress`
   - Strict Row Level Security (`auth.uid() = user_id`) policies on all tables.

---

## 🧪 Automated Testing Checklist

Run `python test_api.py` to verify:

- [x] **Health Audit**: Returns online status and API key configuration flag.
- [x] **Dashboard Metrics**: Computes aggregate resume count, latest ATS score, and recommendations.
- [x] **Resume Upload & Parsing**: Creates a real PDF in-memory, parses text with PyMuPDF, and extracts skills, education, and experience.
- [x] **Gemini Resume Analysis**: Verifies overall score (/100), ATS parseability, quality audit, strengths, weaknesses, and prioritized recommendations.
- [x] **Job Matching Engine**: Compares resume text to a job description, computing compatibility and skill overlap.
- [x] **Resume Improvement Studio**: Rewrites bullet points with strong action verbs and metrics placeholders.
- [x] **AI Mock Interview Simulator**: Generates sequential questions and grades responses with benchmark model answers.
- [x] **Career Skill Gap Analyzer**: Compares skills against target roles and constructs a 4-phase curriculum.
- [x] **Profile Management**: Tests profile updates and career objective persistence.
- [x] **Frontend Production Build**: `tsc -b && vite build` succeeds with zero errors.

---

## 🚀 Deployment Instructions

### Frontend (Vercel / Netlify / Cloudflare Pages)
1. Push repository to GitHub.
2. Link the `frontend/` directory to Vercel or Netlify.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Set environment variable: `VITE_API_URL=https://your-backend-url.com`

### Backend (Railway / Render / Google Cloud Run)
1. Connect the `backend/` directory to Railway or Render.
2. Build command: `pip install -r requirements.txt`
3. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Set environment variables: `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_KEY`.

---

## ⚖️ License
MIT License. Built for students and job seekers worldwide.
