# CareerPilot AI
### AI-Powered Resume Analysis & Career Preparation Platform

<p align="center">
  <strong>Build a stronger resume. Understand your skill gaps. Prepare with confidence.</strong>
</p>

<p align="center">
  <a href="https://careerpilota.netlify.app"><img src="https://img.shields.io/badge/Live%20Demo-Visit%20CareerPilot-16a34a?style=for-the-badge" alt="Live Demo"></a>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-7-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/FastAPI-Python-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/AI-Google%20Gemini-4285F4?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Google Gemini">
</p>

CareerPilot AI is a full-stack career assistant designed to help students, graduates, and job seekers improve their resumes and prepare for recruitment. It brings resume analysis, job-description matching, AI-assisted resume improvement, mock interviews, and skill-gap guidance into one platform.

**Live application:** [https://careerpilota.netlify.app](https://careerpilota.netlify.app)

---

## Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Database Setup](#database-setup)
- [Deployment](#deployment)
- [Testing](#testing)

---

## Features

| Feature | Description |
|---|---|
| **Resume Analysis** | Reviews resume content, structure, ATS readability, keywords, strengths, and areas to improve. |
| **Job Description Matcher** | Compares a resume with a job description and highlights relevant skills and potential gaps. |
| **Resume Improvement Studio** | Helps rewrite resume bullet points with clearer language, stronger action verbs, and measurable impact where information is provided. |
| **AI Mock Interviews** | Practice technical, HR, behavioral, and project-based interview questions with feedback on responses. |
| **Skill-Gap Analyzer** | Identifies skills to work on and suggests a structured learning roadmap. |
| **Career Dashboard** | Brings key career-preparation activities and progress into one place. |
| **Profile & History** | Manage candidate details and review previous activity. |

> AI-generated suggestions are intended to support your preparation. Review all generated content for accuracy before using it in an application.

---

## Technology Stack

| Layer | Tools and Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite |
| **Styling & UI** | Tailwind CSS, Lucide React, Framer Motion |
| **Charts** | Recharts |
| **Backend** | Python, FastAPI, Uvicorn, Pydantic |
| **AI Integration** | Google Gemini API, `google-genai` |
| **Document Processing** | PyMuPDF, python-docx |
| **Authentication & Database** | Supabase Auth, PostgreSQL, Row Level Security |
| **API Validation** | FastAPI / Swagger UI |

---

## How It Works

1. **Add your resume** — Upload your resume for parsing and analysis.
2. **Review your profile** — Explore the analysis, strengths, and improvement areas.
3. **Match a role** — Compare your resume with a job description to understand relevant skills and gaps.
4. **Improve your resume** — Use the improvement studio to refine selected content.
5. **Practice interviews** — Answer role-relevant questions and review the feedback.
6. **Build your skills** — Use the suggested roadmap to plan your next steps.

---

## Project Structure

```text
careerpilot.ai/
├── backend/
│   ├── app/
│   │   ├── api/          # Resume, jobs, interview, skills, profile APIs
│   │   ├── core/         # Configuration and security
│   │   ├── models/       # Pydantic schemas
│   │   ├── services/     # Gemini, parsing, and data services
│   │   ├── utils/        # Shared utilities
│   │   └── main.py       # FastAPI application
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   └── package.json
├── supabase/
│   └── migrations/       # Database schema and RLS policies
└── README.md
```

---

## Getting Started

Follow these steps to run the project locally.

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) 18 or later
- [Python](https://www.python.org/) 3.10 or later
- A Google Gemini API key for live AI-powered responses
- A Supabase project if you want to use Supabase authentication and database features

### 1. Clone the repository

```bash
git clone https://github.com/anujnehra004/careerpilot.ai.git
cd careerpilot.ai
```

### 2. Configure and start the backend

```bash
cd backend

# Create a virtual environment
python -m venv .venv

# Activate it (Windows PowerShell)
.venv\Scripts\Activate.ps1

# macOS / Linux
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create your local environment file
# Windows:
copy .env.example .env
# macOS / Linux:
# cp .env.example .env

# Start the API
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at `http://localhost:8000`.

### 3. Start the frontend

Open a **second terminal** from the project root:

```bash
cd frontend
npm install
npm run dev
```

Vite will display the local frontend URL in the terminal (usually `http://localhost:5173`).

---

## Environment Variables

Configure the backend in `backend/.env`. Use the example file as a template:

```env
ENVIRONMENT=development
HOST=0.0.0.0
PORT=8000

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.8-flash

# Supabase (configure when using Supabase services)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
```

Keep real credentials private. Do not commit your `.env` file or expose secret keys in frontend code.

The backend includes fallback behavior for development when external services are not configured. Features that depend on Gemini or Supabase require the corresponding credentials for live integration.

---

## API Documentation

With the backend running, open:

- **Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check:** [http://localhost:8000/api/health](http://localhost:8000/api/health)

The API is organized around resume analysis, job matching, resume improvement, interview preparation, skills, dashboard data, and candidate profiles.

---

## Database Setup

Supabase is supported for authentication and PostgreSQL-backed data storage.

1. Create a project at [Supabase](https://supabase.com/).
2. Add the project URL and API credentials to `backend/.env`.
3. Open the Supabase SQL Editor.
4. Run the migration in `supabase/migrations/`.
5. Review the Row Level Security policies before using the database with real user data.

If Supabase is not configured, the backend reports and uses its development fallback mode. Do not treat fallback/demo data as production storage.

---

## Deployment

### Frontend — Netlify

The frontend is deployed here:

**[https://careerpilota.netlify.app](https://careerpilota.netlify.app)**

For a new Netlify deployment, connect this GitHub repository and configure the frontend project settings:

- **Base directory:** `frontend`
- **Build command:** `npm run build`
- **Publish directory:** `dist`

Configure any frontend environment variables required by your deployment.

### Backend

The FastAPI backend can be deployed to a Python hosting provider such as Railway, Render, or another service that supports ASGI applications.

Typical start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Set the required Gemini and Supabase environment variables in the hosting provider's environment settings. Configure the frontend to call the deployed backend API.

---

## Testing

The repository includes backend API tests and a frontend production build script.

Run the backend test file from the `backend` directory when its test dependencies and configuration are available:

```bash
python test_api.py
```

Check the frontend production build:

```bash
cd frontend
npm install
npm run build
```

---

## License

This project is distributed under the MIT License.

---

<p align="center">
  <strong>CareerPilot AI</strong><br>
  Your journey towards smarter career preparation starts here.
</p>
