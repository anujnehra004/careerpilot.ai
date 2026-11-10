import sqlite3
import json
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

from supabase import create_client, Client
from app.core import database
from app.core.config import settings
from app.utils.logger import logger
from app.models.schemas import (
    ResumeParsedData,
    ResumeUploadResponse,
    ResumeAnalysisResult,
    JobMatchResult,
    InterviewQuestion,
    InterviewAnswerResponse,
    DashboardStatsResponse,
    RecentAnalysisItem,
    RecommendationItem,
    UserProfile,
)


class SupabaseService:
    def __init__(self):
        self.client: Optional[Client] = None
        if settings.is_supabase_configured:
            try:
                self.client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
                logger.info("Supabase client initialized successfully.")
            except Exception as e:
                logger.error(f"Failed to initialize Supabase client: {e}")
                self.client = None
        else:
            logger.warning(
                "Supabase credentials not configured. Using high-fidelity in-memory persistence store."
            )

        # SQLite connection for fallback persistence
        self.conn = database.get_connection()

        # In-memory stores for demo mode (used when SQLite is unavailable or for quick access)
        self.memory_resumes: Dict[str, Dict[str, Any]] = {}
        self.memory_analyses: Dict[str, Dict[str, Any]] = {}
        self.memory_job_matches: Dict[str, Dict[str, Any]] = {}
        self.memory_interview_sessions: Dict[str, Dict[str, Any]] = {}
        self.memory_interview_questions: Dict[str, Dict[str, Any]] = {}
        self.memory_learning_progress: Dict[str, bool] = {
            "Docker": True,
            "Git": True,
            "TypeScript": True,
            "REST APIs": True,
            "Kubernetes": False,
            "Redis Caching": False,
            "AWS ECS / Lambda": False,
            "CI/CD Pipelines": False,
        }
        self.memory_profile: Dict[str, Any] = {
            "id": "00000000-0000-0000-0000-000000000001",
            "email": "alex.morgan@careerpilot.ai",
            "full_name": "Alex Morgan",
            "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            "career_objective": "Aspiring Full Stack Engineer eager to build scalable web platforms and AI-integrated developer tools.",
            "preferred_roles": ["Full Stack Engineer", "Backend Developer", "Frontend Engineer", "AI/ML Engineer"],
            "education": "B.S. in Computer Science, University of Technology (2020 - 2024)",
            "experience_level": "Entry to Mid-Level",
            "skills": ["Python", "JavaScript", "TypeScript", "React", "FastAPI", "PostgreSQL", "Docker", "Git"],
        }
        self._seed_initial_demo_data()

    # ---------------------------------------------------------------------
    # Helper methods for SQLite interaction
    # ---------------------------------------------------------------------
    def _execute(self, query: str, params: tuple = ()) -> sqlite3.Cursor:
        cur = self.conn.cursor()
        cur.execute(query, params)
        self.conn.commit()
        return cur

    def _fetch_one(self, query: str, params: tuple = ()) -> Optional[sqlite3.Row]:
        cur = self.conn.cursor()
        cur.execute(query, params)
        return cur.fetchone()

    def _fetch_all(self, query: str, params: tuple = ()) -> List[sqlite3.Row]:
        cur = self.conn.cursor()
        cur.execute(query, params)
        return cur.fetchall()

    # ---------------------------------------------------------------------
    # Demo data seeding (also writes into SQLite if empty)
    # ---------------------------------------------------------------------
    def _seed_initial_demo_data(self):
        row = self._fetch_one("SELECT COUNT(*) as cnt FROM resumes")
        if row and row[0] == 0:
            demo_resume_id = "demo-resume-01"
            demo_parsed = {
                "name": "Alex Morgan",
                "email": "alex.morgan@careerpilot.ai",
                "phone": "(555) 019-2834",
                "location": "San Francisco, CA",
                "summary": "Software Engineer with solid experience in Python, TypeScript, React, and modern cloud architectures.",
                "education": [{
                    "institution": "University of Technology",
                    "degree": "Bachelor of Science",
                    "field_of_study": "Computer Science",
                    "start_date": "2020",
                    "end_date": "2024",
                    "grade_or_gpa": "3.85 / 4.0",
                }],
                "skills": ["Python", "TypeScript", "React", "FastAPI", "PostgreSQL", "Docker", "Git", "REST APIs"],
                "work_experience": [{
                    "company": "TechNova Solutions",
                    "position": "Software Engineering Intern",
                    "location": "San Francisco, CA",
                    "start_date": "May 2023",
                    "end_date": "Aug 2024",
                    "description": [
                        "Engineered real-time dashboard components in React and TypeScript for 10,000+ internal users.",
                        "Developed high-throughput FastAPI REST endpoints connected to PostgreSQL with SQLAlchemy ORM.",
                    ],
                }],
                "projects": [{
                    "title": "Cloud-Native Task Manager",
                    "technologies": ["React", "FastAPI", "PostgreSQL", "Docker"],
                    "description": ["Implemented task distribution system with automated email alerts and telemetry."],
                    "link": "https://github.com/alexmorgan/cloud-task-manager",
                }],
                "certifications": ["AWS Certified Cloud Practitioner", "GitHub Foundations"],
                "achievements": ["1st Place, University Hackathon 2023", "Dean's Honor List (All Semesters)"],
            }
            created_at = datetime.now(timezone.utc).isoformat()
            self._execute(
                "INSERT INTO resumes (id, user_id, file_name, file_path, file_size, file_type, extracted_text, parsed_data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    demo_resume_id,
                    self.memory_profile["id"],
                    "Alex_Morgan_Software_Engineer_Resume.pdf",
                    "",
                    248900,
                    "application/pdf",
                    "[demo extracted text]",
                    json.dumps(demo_parsed),
                    created_at,
                    created_at,
                ),
            )
            self.memory_resumes[demo_resume_id] = {
                "id": demo_resume_id,
                "user_id": self.memory_profile["id"],
                "file_name": "Alex_Morgan_Software_Engineer_Resume.pdf",
                "file_path": "",
                "file_size": 248900,
                "file_type": "application/pdf",
                "extracted_text": "[demo extracted text]",
                "parsed_data": demo_parsed,
                "created_at": created_at,
                "updated_at": created_at,
            }

    # ---------------------------------------------------------------------
    # Resume CRUD
    # ---------------------------------------------------------------------
    def save_resume(
        self,
        user_id: str,
        file_name: str,
        file_size: int,
        file_type: str,
        extracted_text: str,
        parsed_data: ResumeParsedData,
        file_path: str = "",
    ) -> ResumeUploadResponse:
        resume_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()
        record = {
            "id": resume_id,
            "user_id": user_id,
            "file_name": file_name,
            "file_path": file_path,
            "file_size": file_size,
            "file_type": file_type,
            "extracted_text": extracted_text,
            "parsed_data": json.dumps(parsed_data.model_dump()),
            "created_at": created_at,
            "updated_at": created_at,
        }
        # SQLite persistence
        try:
            self._execute(
                "INSERT INTO resumes (id, user_id, file_name, file_path, file_size, file_type, extracted_text, parsed_data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    resume_id,
                    user_id,
                    file_name,
                    file_path,
                    file_size,
                    file_type,
                    extracted_text,
                    json.dumps(parsed_data.model_dump()),
                    created_at,
                    created_at,
                ),
            )
        except Exception as e:
            logger.error(f"SQLite save_resume failed: {e}")
        # Supabase fallback (if configured)
        if self.client:
            try:
                self.client.table("resumes").insert(record).execute()
            except Exception as e:
                logger.error(f"Supabase save_resume failed: {e}. Storing in memory.")
        self.memory_resumes[resume_id] = record
        return ResumeUploadResponse(
            id=resume_id,
            file_name=file_name,
            file_size=file_size,
            file_type=file_type,
            extracted_text=extracted_text,
            parsed_data=parsed_data,
            created_at=created_at,
            file_path=file_path,
        )

    def get_resume(self, resume_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        # Try SQLite first
        row = self._fetch_one("SELECT * FROM resumes WHERE id = ? AND user_id = ?", (resume_id, user_id))
        if row:
            resume = dict(row)
            if isinstance(resume.get("parsed_data"), str):
                try:
                    resume["parsed_data"] = json.loads(resume["parsed_data"])
                except Exception:
                    pass
            return resume
        # Supabase fallback
        if self.client:
            try:
                res = self.client.table("resumes").select("*").eq("id", resume_id).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                logger.error(f"Supabase get_resume failed: {e}")
        # In-memory fallback
        return self.memory_resumes.get(resume_id)

    def list_resumes(self, user_id: str) -> List[Dict[str, Any]]:
        rows = self._fetch_all("SELECT * FROM resumes WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
        resumes: List[Dict[str, Any]] = []
        for row in rows:
            rec = dict(row)
            if isinstance(rec.get("parsed_data"), str):
                try:
                    rec["parsed_data"] = json.loads(rec["parsed_data"])
                except Exception:
                    pass
            resumes.append(rec)
        if resumes:
            return resumes
        if self.client:
            try:
                res = self.client.table("resumes").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
                if res.data:
                    return res.data
            except Exception as e:
                logger.error(f"Supabase list_resumes failed: {e}")
        return list(self.memory_resumes.values())

    def delete_resume(self, resume_id: str, user_id: str) -> bool:
        try:
            self._execute("DELETE FROM resumes WHERE id = ? AND user_id = ?", (resume_id, user_id))
        except Exception as e:
            logger.error(f"SQLite delete_resume failed: {e}")
        if self.client:
            try:
                self.client.table("resumes").delete().eq("id", resume_id).execute()
            except Exception as e:
                logger.error(f"Supabase delete_resume failed: {e}")
        if resume_id in self.memory_resumes:
            del self.memory_resumes[resume_id]
            self.memory_analyses = {
                k: v for k, v in self.memory_analyses.items() if v.get("resume_id") != resume_id
            }
        return True

    # ---------------------------------------------------------------------
    # Resume analysis CRUD
    # ---------------------------------------------------------------------
    def save_analysis(self, user_id: str, analysis: ResumeAnalysisResult) -> None:
        analysis_id = analysis.id or str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()
        analysis.created_at = created_at
        record = {
            "id": analysis_id,
            "resume_id": analysis.resume_id,
            "user_id": user_id,
            "overall_score": analysis.overall_score,
            "overall_score_explanation": analysis.overall_score_explanation,
            "score_breakdown": json.dumps(analysis.score_breakdown.model_dump()),
            "ats_compatibility_score": analysis.ats_compatibility_score,
            "ats_formatting_issues": json.dumps(analysis.ats_formatting_issues),
            "ats_missing_sections": json.dumps(analysis.ats_missing_sections),
            "ats_keyword_suggestions": json.dumps(analysis.ats_keyword_suggestions),
            "resume_quality": json.dumps(analysis.resume_quality.model_dump()),
            "strengths": json.dumps(analysis.strengths),
            "weaknesses": json.dumps(analysis.weaknesses),
            "recommendations": json.dumps([r.model_dump() for r in analysis.recommendations]),
            "created_at": created_at,
        }
        try:
            self._execute(
                "INSERT INTO resume_analyses (id, resume_id, user_id, overall_score, overall_score_explanation, score_breakdown, ats_compatibility_score, ats_formatting_issues, ats_missing_sections, ats_keyword_suggestions, resume_quality, strengths, weaknesses, recommendations, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    analysis_id,
                    analysis.resume_id,
                    user_id,
                    analysis.overall_score,
                    analysis.overall_score_explanation,
                    json.dumps(analysis.score_breakdown.model_dump()),
                    analysis.ats_compatibility_score,
                    json.dumps(analysis.ats_formatting_issues),
                    json.dumps(analysis.ats_missing_sections),
                    json.dumps(analysis.ats_keyword_suggestions),
                    json.dumps(analysis.resume_quality.model_dump()),
                    json.dumps(analysis.strengths),
                    json.dumps(analysis.weaknesses),
                    json.dumps([r.model_dump() for r in analysis.recommendations]),
                    created_at,
                ),
            )
        except Exception as e:
            logger.error(f"SQLite save_analysis failed: {e}")
        if self.client:
            try:
                self.client.table("resume_analyses").insert(record).execute()
            except Exception as e:
                logger.error(f"Supabase save_analysis failed: {e}. Storing in memory.")
        self.memory_analyses[analysis_id] = record

    def get_analysis_by_resume(self, resume_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        row = self._fetch_one(
            "SELECT * FROM resume_analyses WHERE resume_id = ? ORDER BY created_at DESC LIMIT 1", (resume_id,)
        )
        if row:
            rec = dict(row)
            for key in [
                "score_breakdown",
                "ats_formatting_issues",
                "ats_missing_sections",
                "ats_keyword_suggestions",
                "resume_quality",
                "strengths",
                "weaknesses",
                "recommendations",
            ]:
                if isinstance(rec.get(key), str):
                    try:
                        rec[key] = json.loads(rec[key])
                    except Exception:
                        pass
            return rec
        if self.client:
            try:
                res = (
                    self.client.table("resume_analyses")
                    .select("*")
                    .eq("resume_id", resume_id)
                    .order("created_at", desc=True)
                    .limit(1)
                    .execute()
                )
                if res.data:
                    return res.data[0]
            except Exception as e:
                logger.error(f"Supabase get_analysis_by_resume failed: {e}")
        for item in self.memory_analyses.values():
            if item.get("resume_id") == resume_id:
                return item
        return None

    def list_analyses(self, user_id: str) -> List[Dict[str, Any]]:
        rows = self._fetch_all("SELECT * FROM resume_analyses WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
        analyses: List[Dict[str, Any]] = []
        for row in rows:
            rec = dict(row)
            for key in [
                "score_breakdown",
                "ats_formatting_issues",
                "ats_missing_sections",
                "ats_keyword_suggestions",
                "resume_quality",
                "strengths",
                "weaknesses",
                "recommendations",
            ]:
                if isinstance(rec.get(key), str):
                    try:
                        rec[key] = json.loads(rec[key])
                    except Exception:
                        pass
            analyses.append(rec)
        if analyses:
            return analyses
        if self.client:
            try:
                res = (
                    self.client.table("resume_analyses")
                    .select("*")
                    .order("created_at", desc=True)
                    .execute()
                )
                if res.data:
                    return res.data
            except Exception as e:
                logger.error(f"Supabase list_analyses failed: {e}")
        return list(self.memory_analyses.values())

    def delete_analysis(self, analysis_id: str, user_id: str) -> bool:
        try:
            self._execute("DELETE FROM resume_analyses WHERE id = ?", (analysis_id,))
        except Exception as e:
            logger.error(f"SQLite delete_analysis failed: {e}")
        if self.client:
            try:
                self.client.table("resume_analyses").delete().eq("id", analysis_id).execute()
            except Exception as e:
                logger.error(f"Supabase delete_analysis failed: {e}")
        if analysis_id in self.memory_analyses:
            del self.memory_analyses[analysis_id]
        return True

    # ---------------------------------------------------------------------
    # Job match CRUD
    # ---------------------------------------------------------------------
    def save_job_match(self, user_id: str, match: JobMatchResult) -> None:
        match_id = match.id or str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()
        record = {
            "id": match_id,
            "resume_id": match.resume_id,
            "user_id": user_id,
            "company_name": match.company_name,
            "job_title": match.job_title,
            "experience_level": match.experience_level,
            "compatibility_score": match.compatibility_score,
            "matching_skills": json.dumps(match.matching_skills),
            "missing_skills": json.dumps(match.missing_skills),
            "relevant_experience": json.dumps(match.relevant_experience),
            "missing_keywords": json.dumps(match.missing_keywords),
            "qualification_gaps": json.dumps(match.qualification_gaps),
            "improvement_suggestions": json.dumps(match.improvement_suggestions),
            "created_at": created_at,
        }
        try:
            self._execute(
                "INSERT INTO job_matches (id, resume_id, user_id, company_name, job_title, experience_level, compatibility_score, matching_skills, missing_skills, relevant_experience, missing_keywords, qualification_gaps, improvement_suggestions, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    match_id,
                    match.resume_id,
                    user_id,
                    match.company_name,
                    match.job_title,
                    match.experience_level,
                    match.compatibility_score,
                    json.dumps(match.matching_skills),
                    json.dumps(match.missing_skills),
                    json.dumps(match.relevant_experience),
                    json.dumps(match.missing_keywords),
                    json.dumps(match.qualification_gaps),
                    json.dumps(match.improvement_suggestions),
                    created_at,
                ),
            )
        except Exception as e:
            logger.error(f"SQLite save_job_match failed: {e}")
        if self.client:
            try:
                self.client.table("job_matches").insert(record).execute()
            except Exception as e:
                logger.error(f"Supabase save_job_match failed: {e}. Storing in memory.")
        self.memory_job_matches[match_id] = record

    def list_job_matches(self, user_id: str) -> List[Dict[str, Any]]:
        rows = self._fetch_all("SELECT * FROM job_matches WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
        matches: List[Dict[str, Any]] = []
        for row in rows:
            rec = dict(row)
            for key in [
                "matching_skills",
                "missing_skills",
                "relevant_experience",
                "missing_keywords",
                "qualification_gaps",
                "improvement_suggestions",
            ]:
                if isinstance(rec.get(key), str):
                    try:
                        rec[key] = json.loads(rec[key])
                    except Exception:
                        pass
            matches.append(rec)
        if matches:
            return matches
        if self.client:
            try:
                res = (
                    self.client.table("job_matches")
                    .select("*")
                    .eq("user_id", user_id)
                    .order("created_at", desc=True)
                    .execute()
                )
                if res.data:
                    return res.data
            except Exception as e:
                logger.error(f"Supabase list_job_matches failed: {e}")
        return list(self.memory_job_matches.values())

    # ---------------------------------------------------------------------
    # Interview session handling
    # ---------------------------------------------------------------------
    def create_interview_session(
        self, user_id: str, interview_type: str, difficulty: str, target_role: str, resume_id: Optional[str] = None
    ) -> str:
        session_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()
        record = {
            "id": session_id,
            "user_id": user_id,
            "resume_id": resume_id,
            "interview_type": interview_type,
            "difficulty": difficulty,
            "target_role": target_role,
            "status": "in_progress",
            "average_score": 0.0,
            "created_at": created_at,
        }
        try:
            self._execute(
                "INSERT INTO interview_sessions (id, user_id, resume_id, interview_type, difficulty, target_role, status, average_score, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    session_id,
                    user_id,
                    resume_id,
                    interview_type,
                    difficulty,
                    target_role,
                    "in_progress",
                    0.0,
                    created_at,
                ),
            )
        except Exception as e:
            logger.error(f"SQLite create_interview_session failed: {e}")
        if self.client:
            try:
                self.client.table("interview_sessions").insert(record).execute()
            except Exception as e:
                logger.error(f"Supabase create_interview_session failed: {e}")
        self.memory_interview_sessions[session_id] = record
        return session_id

    def record_interview_question(self, session_id: str, question: InterviewQuestion) -> None:
        record = {
            "id": question.id,
            "session_id": session_id,
            "question_order": question.question_order,
            "question_text": question.question_text,
            "user_answer": "",
            "score": 0,
            "feedback": "",
            "suggested_answer": "",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        try:
            self._execute(
                "INSERT INTO interview_questions (id, session_id, question_order, question_text, user_answer, score, feedback, suggested_answer, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    question.id,
                    session_id,
                    question.question_order,
                    question.question_text,
                    "",
                    0,
                    "",
                    "",
                    datetime.now(timezone.utc).isoformat(),
                ),
            )
        except Exception as e:
            logger.error(f"SQLite record_interview_question failed: {e}")
        if self.client:
            try:
                self.client.table("interview_questions").insert(record).execute()
            except Exception as e:
                logger.error(f"Supabase record_interview_question failed: {e}")
        self.memory_interview_questions[question.id] = record

    def update_interview_answer(
        self, session_id: str, question_id: str, user_answer: str, eval_res: InterviewAnswerResponse
    ) -> None:
        try:
            self._execute(
                "UPDATE interview_questions SET user_answer = ?, score = ?, feedback = ?, suggested_answer = ? WHERE id = ?",
                (user_answer, eval_res.score, eval_res.feedback, eval_res.suggested_answer, question_id),
            )
        except Exception as e:
            logger.error(f"SQLite update_interview_answer failed: {e}")
        if self.client:
            try:
                self.client.table("interview_questions").update(
                    {
                        "user_answer": user_answer,
                        "score": eval_res.score,
                        "feedback": eval_res.feedback,
                        "suggested_answer": eval_res.suggested_answer,
                    }
                ).eq("id", question_id).execute()
            except Exception as e:
                logger.error(f"Supabase update_interview_answer failed: {e}")
        if question_id in self.memory_interview_questions:
            q = self.memory_interview_questions[question_id]
            q["user_answer"] = user_answer
            q["score"] = eval_res.score
            q["feedback"] = eval_res.feedback
            q["suggested_answer"] = eval_res.suggested_answer
        # Recalculate session average score
        rows = self._fetch_all(
            "SELECT score FROM interview_questions WHERE session_id = ? AND score > 0", (session_id,)
        )
        scores = [r[0] for r in rows]
        avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0
        try:
            self._execute("UPDATE interview_sessions SET average_score = ? WHERE id = ?", (avg_score, session_id))
        except Exception as e:
            logger.error(f"SQLite update session average failed: {e}")
        if session_id in self.memory_interview_sessions:
            self.memory_interview_sessions[session_id]["average_score"] = avg_score

    def list_interview_history(self, user_id: str) -> List[Dict[str, Any]]:
        rows = self._fetch_all(
            "SELECT * FROM interview_sessions WHERE user_id = ? ORDER BY created_at DESC", (user_id,)
        )
        sessions = [dict(r) for r in rows]
        if sessions:
            return sessions
        if self.client:
            try:
                res = (
                    self.client.table("interview_sessions")
                    .select("*")
                    .eq("user_id", user_id)
                    .order("created_at", desc=True)
                    .execute()
                )
                if res.data:
                    return res.data
            except Exception as e:
                logger.error(f"Supabase list_interview_history failed: {e}")
        return list(self.memory_interview_sessions.values())

    # ---------------------------------------------------------------------
    # Skill progress (SQLite persistence with in-memory fallback)
    # ---------------------------------------------------------------------
    def toggle_skill(self, user_id: str, skill_name: str) -> bool:
        current = self.memory_learning_progress.get(skill_name, False)
        new_state = not current
        try:
            row = self._fetch_one(
                "SELECT is_completed FROM learning_progress WHERE user_id = ? AND skill_name = ?",
                (user_id, skill_name),
            )
            now = datetime.now(timezone.utc).isoformat()
            if row is not None:
                new_state = not bool(row["is_completed"])
                self._execute(
                    "UPDATE learning_progress SET is_completed = ?, completed_at = ? WHERE user_id = ? AND skill_name = ?",
                    (1 if new_state else 0, now if new_state else None, user_id, skill_name),
                )
            else:
                self._execute(
                    "INSERT INTO learning_progress (id, user_id, skill_name, category, is_completed, completed_at) VALUES (?, ?, ?, ?, ?, ?)",
                    (f"skill-{skill_name}", user_id, skill_name, "technical", 1 if new_state else 0, now if new_state else None),
                )
        except Exception as e:
            logger.error(f"SQLite toggle_skill failed: {e}")

        self.memory_learning_progress[skill_name] = new_state
        return new_state

    def get_skill_progress(self, user_id: str) -> Dict[str, Any]:
        try:
            rows = self._fetch_all(
                "SELECT skill_name, is_completed FROM learning_progress WHERE user_id = ?",
                (user_id,),
            )
            if rows:
                skills = {r["skill_name"]: bool(r["is_completed"]) for r in rows}
                completed = [k for k, v in skills.items() if v]
                total = len(skills)
                pct = int((len(completed) / total * 100)) if total > 0 else 0
                return {
                    "skills": skills,
                    "completed_count": len(completed),
                    "total_count": total,
                    "percentage": pct,
                }
        except Exception as e:
            logger.error(f"SQLite get_skill_progress failed: {e}")

        completed = [k for k, v in self.memory_learning_progress.items() if v]
        total = len(self.memory_learning_progress)
        pct = int((len(completed) / total * 100)) if total > 0 else 0
        return {
            "skills": self.memory_learning_progress,
            "completed_count": len(completed),
            "total_count": total,
            "percentage": pct,
        }

    # ---------------------------------------------------------------------
    # Dashboard stats (uses the list_* helpers above)
    # ---------------------------------------------------------------------
    def get_dashboard_stats(self, user_id: str) -> DashboardStatsResponse:
        resumes = self.list_resumes(user_id)
        analyses = self.list_analyses(user_id)
        interviews = self.list_interview_history(user_id)
        skill_prog = self.get_skill_progress(user_id)

        latest_ats = None
        avg_score = None
        if analyses:
            latest_ats = analyses[0].get("ats_compatibility_score")
            scores = [a.get("overall_score", 0) for a in analyses if "overall_score" in a]
            if scores:
                avg_score = int(sum(scores) / len(scores))

        avg_interview = None
        if interviews:
            scored = [i.get("average_score", 0) for i in interviews if i.get("average_score", 0) > 0]
            if scored:
                avg_interview = round(sum(scored) / len(scored), 1)

        recent_analyses: List[RecentAnalysisItem] = []
        for a in analyses[:5]:
            r_id = a.get("resume_id")
            f_name = "Resume.pdf"
            r_obj = self.get_resume(r_id, user_id)
            if r_obj and r_obj.get("file_name"):
                f_name = r_obj["file_name"]
            elif r_id in self.memory_resumes:
                f_name = self.memory_resumes[r_id].get("file_name", "Resume.pdf")

            recent_analyses.append(
                RecentAnalysisItem(
                    id=a.get("id", ""),
                    resume_id=r_id,
                    file_name=f_name,
                    overall_score=a.get("overall_score", 80),
                    ats_compatibility_score=a.get("ats_compatibility_score", 85),
                    created_at=a.get("created_at", ""),
                )
            )

        recommendations = [
            RecommendationItem(
                priority="high",
                category="Impact Metrics",
                title="Quantify Engineering Impact",
                description="Include quantitative results (e.g. latency, user volume, test coverage) in your experience section.",
            ),
            RecommendationItem(
                priority="high",
                category="Keywords",
                title="Highlight Cloud & CI/CD Tooling",
                description="Add explicit references to Docker containerization, AWS services, and GitHub Actions pipelines.",
            ),
            RecommendationItem(
                priority="medium",
                category="Mock Practice",
                title="Complete a Technical System Design Session",
                description="Practice answering questions on database indexing, microservice communication, and caching.",
            ),
        ]

        return DashboardStatsResponse(
            total_resumes=len(resumes),
            latest_ats_score=latest_ats if latest_ats is not None else 86,
            average_resume_score=avg_score if avg_score is not None else 82,
            total_interviews=len(interviews),
            average_interview_score=avg_interview if avg_interview is not None else 85.0,
            completed_skills_count=skill_prog["completed_count"],
            total_skills_count=skill_prog["total_count"],
            skill_progress_pct=skill_prog["percentage"],
            recent_analyses=recent_analyses,
            recommended_improvements=recommendations,
            api_status={
                "gemini_connected": settings.is_gemini_configured,
                "gemini_model": settings.GEMINI_MODEL,
                "supabase_connected": settings.is_supabase_configured,
                "environment": settings.ENVIRONMENT,
            },
        )

    # ---------------------------------------------------------------------
    # Profile (SQLite persistence with in-memory fallback)
    # ---------------------------------------------------------------------
    def get_profile(self, user_id: str) -> UserProfile:
        try:
            row = self._fetch_one("SELECT * FROM profiles WHERE id = ?", (user_id,))
            if not row:
                # Also check demo profile id
                row = self._fetch_one("SELECT * FROM profiles LIMIT 1")
            if row:
                rec = dict(row)
                for k in ["preferred_roles", "skills"]:
                    if isinstance(rec.get(k), str):
                        try:
                            rec[k] = json.loads(rec[k])
                        except Exception:
                            rec[k] = []
                return UserProfile(**rec)
        except Exception as e:
            logger.error(f"SQLite get_profile failed: {e}")

        return UserProfile(**self.memory_profile)

    def update_profile(self, user_id: str, profile_data: Dict[str, Any]) -> UserProfile:
        for k, v in profile_data.items():
            if k in self.memory_profile and v is not None:
                self.memory_profile[k] = v
        self.memory_profile["updated_at"] = datetime.now(timezone.utc).isoformat()

        try:
            now = datetime.now(timezone.utc).isoformat()
            row = self._fetch_one("SELECT id FROM profiles WHERE id = ?", (user_id,))
            if not row:
                row = self._fetch_one("SELECT id FROM profiles LIMIT 1")
                if row:
                    user_id = row["id"]

            if row:
                fields = []
                values = []
                for k, v in profile_data.items():
                    if k in ["full_name", "avatar_url", "career_objective", "education", "experience_level"]:
                        fields.append(f"{k} = ?")
                        values.append(v)
                    elif k in ["preferred_roles", "skills"]:
                        fields.append(f"{k} = ?")
                        values.append(json.dumps(v))
                if fields:
                    fields.append("updated_at = ?")
                    values.append(now)
                    values.append(user_id)
                    query = f"UPDATE profiles SET {', '.join(fields)} WHERE id = ?"
                    self._execute(query, tuple(values))
            else:
                self._execute(
                    """
                    INSERT INTO profiles (id, email, full_name, avatar_url, career_objective, preferred_roles, education, experience_level, skills, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        user_id,
                        self.memory_profile.get("email", "user@careerpilot.ai"),
                        self.memory_profile.get("full_name", "Alex Morgan"),
                        self.memory_profile.get("avatar_url", ""),
                        self.memory_profile.get("career_objective", ""),
                        json.dumps(self.memory_profile.get("preferred_roles", [])),
                        self.memory_profile.get("education", ""),
                        self.memory_profile.get("experience_level", "Entry"),
                        json.dumps(self.memory_profile.get("skills", [])),
                        now,
                        now,
                    ),
                )
        except Exception as e:
            logger.error(f"SQLite update_profile failed: {e}")

        return self.get_profile(user_id)


supabase_service = SupabaseService()
