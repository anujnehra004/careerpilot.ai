import sqlite3
import json
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from app.utils.logger import logger

DB_PATH = Path(__file__).resolve().parent.parent.parent / "careerpilot.db"

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize persistent SQLite database tables matching Supabase schema."""
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Profiles
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        full_name TEXT DEFAULT '',
        avatar_url TEXT DEFAULT '',
        career_objective TEXT DEFAULT '',
        preferred_roles TEXT DEFAULT '[]',
        education TEXT DEFAULT '',
        experience_level TEXT DEFAULT 'Entry',
        skills TEXT DEFAULT '[]',
        created_at TEXT,
        updated_at TEXT
    )
    """)

    # 2. Resumes
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS resumes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_path TEXT DEFAULT '',
        file_size INTEGER DEFAULT 0,
        file_type TEXT NOT NULL,
        extracted_text TEXT NOT NULL,
        parsed_data TEXT DEFAULT '{}',
        created_at TEXT,
        updated_at TEXT
    )
    """)

    # 3. Resume Analyses
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS resume_analyses (
        id TEXT PRIMARY KEY,
        resume_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        overall_score INTEGER NOT NULL,
        overall_score_explanation TEXT DEFAULT '',
        score_breakdown TEXT DEFAULT '{}',
        ats_compatibility_score INTEGER NOT NULL,
        ats_formatting_issues TEXT DEFAULT '[]',
        ats_missing_sections TEXT DEFAULT '[]',
        ats_keyword_suggestions TEXT DEFAULT '[]',
        resume_quality TEXT DEFAULT '{}',
        strengths TEXT DEFAULT '[]',
        weaknesses TEXT DEFAULT '[]',
        recommendations TEXT DEFAULT '[]',
        created_at TEXT,
        FOREIGN KEY (resume_id) REFERENCES resumes (id) ON DELETE CASCADE
    )
    """)

    # 4. Job Descriptions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS job_descriptions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        company_name TEXT NOT NULL,
        job_title TEXT NOT NULL,
        experience_level TEXT DEFAULT 'Mid-Level',
        description_text TEXT NOT NULL,
        created_at TEXT
    )
    """)

    # 5. Job Matches
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS job_matches (
        id TEXT PRIMARY KEY,
        resume_id TEXT NOT NULL,
        job_id TEXT,
        user_id TEXT NOT NULL,
        company_name TEXT NOT NULL,
        job_title TEXT NOT NULL,
        experience_level TEXT DEFAULT 'Mid-Level',
        compatibility_score INTEGER NOT NULL,
        matching_skills TEXT DEFAULT '[]',
        missing_skills TEXT DEFAULT '[]',
        relevant_experience TEXT DEFAULT '[]',
        missing_keywords TEXT DEFAULT '[]',
        qualification_gaps TEXT DEFAULT '[]',
        improvement_suggestions TEXT DEFAULT '[]',
        created_at TEXT,
        FOREIGN KEY (resume_id) REFERENCES resumes (id) ON DELETE CASCADE
    )
    """)

    # 6. Interview Sessions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS interview_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        resume_id TEXT,
        interview_type TEXT NOT NULL,
        difficulty TEXT DEFAULT 'Intermediate',
        target_role TEXT NOT NULL,
        status TEXT DEFAULT 'in_progress',
        average_score REAL DEFAULT 0.0,
        created_at TEXT
    )
    """)

    # 7. Interview Questions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS interview_questions (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        question_order INTEGER NOT NULL,
        question_text TEXT NOT NULL,
        user_answer TEXT DEFAULT '',
        score INTEGER DEFAULT 0,
        feedback TEXT DEFAULT '',
        suggested_answer TEXT DEFAULT '',
        follow_up_question TEXT DEFAULT '',
        created_at TEXT,
        FOREIGN KEY (session_id) REFERENCES interview_sessions (id) ON DELETE CASCADE
    )
    """)

    # 8. Skill Profiles
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS skill_profiles (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        target_role TEXT NOT NULL,
        technical_skills TEXT DEFAULT '[]',
        soft_skills TEXT DEFAULT '[]',
        roadmap TEXT DEFAULT '[]',
        created_at TEXT,
        updated_at TEXT
    )
    """)

    # 9. Learning Progress
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS learning_progress (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        skill_name TEXT NOT NULL,
        category TEXT DEFAULT 'technical',
        is_completed INTEGER DEFAULT 0,
        completed_at TEXT,
        UNIQUE(user_id, skill_name)
    )
    """)

    # Indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_resumes_user ON resumes(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_analyses_resume ON resume_analyses(resume_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_analyses_user ON resume_analyses(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_matches_user ON job_matches(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_interview_session ON interview_sessions(user_id)")

    conn.commit()

    # Seed initial demo profile and resume if table is empty
    cursor.execute("SELECT COUNT(*) FROM profiles")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO profiles (id, email, full_name, avatar_url, career_objective, preferred_roles, education, experience_level, skills, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "00000000-0000-0000-0000-000000000001",
            "alex.morgan@careerpilot.ai",
            "Alex Morgan",
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            "Aspiring Full Stack Engineer eager to build scalable web platforms and AI-integrated developer tools.",
            json.dumps(["Full Stack Engineer", "Backend Developer", "Frontend Engineer", "AI/ML Engineer"]),
            "B.S. in Computer Science, University of Technology (2020 - 2024)",
            "Entry to Mid-Level",
            json.dumps(["Python", "JavaScript", "TypeScript", "React", "FastAPI", "PostgreSQL", "Docker", "Git"]),
            datetime.now(timezone.utc).isoformat(),
            datetime.now(timezone.utc).isoformat(),
        ))
        conn.commit()

    # Seed initial skills
    cursor.execute("SELECT COUNT(*) FROM learning_progress")
    if cursor.fetchone()[0] == 0:
        initial_skills = [
            ("Docker", 1),
            ("Git", 1),
            ("TypeScript", 1),
            ("REST APIs", 1),
            ("Kubernetes", 0),
            ("Redis Caching", 0),
            ("AWS ECS / Lambda", 0),
            ("CI/CD Pipelines", 0),
        ]
        for skill, completed in initial_skills:
            cursor.execute("""
            INSERT OR IGNORE INTO learning_progress (id, user_id, skill_name, category, is_completed, completed_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """, (
                f"skill-{skill}",
                "00000000-0000-0000-0000-000000000001",
                skill,
                "technical",
                completed,
                datetime.now(timezone.utc).isoformat() if completed else None
            ))
        conn.commit()

    conn.close()
    logger.info(f"Persistent database initialized at {DB_PATH}")

# Call init_db on module import
init_db()
