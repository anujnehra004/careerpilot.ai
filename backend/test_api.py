import io
import json
import asyncio
import pymupdf
import httpx
from app.main import app

def create_sample_pdf() -> bytes:
    """Create a minimal real PDF with PyMuPDF for upload testing."""
    doc = pymupdf.open()
    page = doc.new_page()
    sample_text = """
Alex Morgan
Email: alex.morgan@careerpilot.ai | Phone: (555) 019-2834 | San Francisco, CA

Professional Summary
Passionate Full Stack Software Engineer with extensive experience in React, TypeScript, Python, and cloud infrastructure.

Technical Skills
Python, TypeScript, React, FastAPI, PostgreSQL, Docker, Git, REST APIs, Microservices

Work Experience
Software Engineer Intern at TechNova Solutions (2023 - 2024)
- Architected and deployed scalable REST endpoints with FastAPI and PostgreSQL.
- Implemented real-time telemetry dashboards in React and TypeScript.

Education
B.S. in Computer Science - University of Technology (2020 - 2024), GPA: 3.85

Projects
Distributed Task Queue: Built a high-throughput job queue in Go with Redis and automated retry logic.
"""
    page.insert_text((50, 50), sample_text, fontsize=11)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes

async def test_full_pipeline():
    print("\n================== TESTING CAREERPILOT AI SUITE ==================")
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Health check
        print("\n[1] Testing /api/health...")
        res = await client.get("/api/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        health_data = res.json()
        print("Health Status:", health_data["status"])
        print("Gemini Mode:", health_data["gemini"]["mode"])
        print("Supabase Mode:", health_data["supabase"]["mode"])

        # 2. Dashboard Stats
        print("\n[2] Testing /api/dashboard/stats...")
        res = await client.get("/api/dashboard/stats")
        assert res.status_code == 200, f"Dashboard stats failed: {res.text}"
        stats = res.json()
        print(f"Total Resumes: {stats['total_resumes']}, Latest ATS: {stats['latest_ats_score']}, Avg Score: {stats['average_resume_score']}")

        # 3. Resume Upload
        print("\n[3] Testing /api/resumes/upload with generated PDF...")
        pdf_bytes = create_sample_pdf()
        files = {"file": ("Alex_Morgan_Resume.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
        res = await client.post("/api/resumes/upload", files=files)
        assert res.status_code == 200, f"Upload failed: {res.text}"
        upload_data = res.json()
        resume_id = upload_data["id"]
        print(f"Uploaded Resume ID: {resume_id}")
        print(f"Parsed Name: {upload_data['parsed_data']['name']}")
        print(f"Extracted Skills Count: {len(upload_data['parsed_data']['skills'])}")
        print(f"Sample Extracted Skills: {upload_data['parsed_data']['skills'][:5]}")

        # 4. Resume Analyze (Gemini AI / Structured Schema)
        print("\n[4] Testing /api/resumes/analyze...")
        res = await client.post("/api/resumes/analyze", json={"resume_id": resume_id, "target_role": "Full Stack Engineer"})
        assert res.status_code == 200, f"Analyze failed: {res.text}"
        analysis = res.json()
        print(f"Overall Score: {analysis['overall_score']}/100")
        print(f"ATS Score: {analysis['ats_compatibility_score']}%")
        print(f"Strengths ({len(analysis['strengths'])}): {analysis['strengths'][0]}")
        print(f"Recommendations ({len(analysis['recommendations'])}): {analysis['recommendations'][0]['title']}")

        # 5. Job Description Matching
        print("\n[5] Testing /api/jobs/match...")
        jd = """
        We are seeking a Senior Backend Engineer proficient in Python, FastAPI, PostgreSQL, Docker, and Redis.
        Must have experience with microservice architecture, CI/CD, and distributed caching.
        """
        res = await client.post("/api/jobs/match", json={
            "resume_id": resume_id,
            "company_name": "CloudScale Inc",
            "job_title": "Senior Backend Engineer",
            "experience_level": "Mid-Level",
            "job_description": jd
        })
        assert res.status_code == 200, f"Job match failed: {res.text}"
        match_data = res.json()
        print(f"Job Compatibility Score: {match_data['compatibility_score']}%")
        print(f"Matching Skills: {match_data['matching_skills']}")
        print(f"Missing Skills: {match_data['missing_skills']}")

        # 6. Resume Improvement Studio
        print("\n[6] Testing /api/resume/improve...")
        res = await client.post("/api/resume/improve", json={
            "section": "experience_bullet",
            "original_text": "Worked on backend microservices with FastAPI and fixed bugs.",
            "target_role": "Full Stack Engineer",
            "instruction": "Inject quantifiable metrics and strong action verbs."
        })
        assert res.status_code == 200, f"Improvement failed: {res.text}"
        improve_data = res.json()
        print(f"Original: {improve_data['original_text']}")
        print(f"Improved: {improve_data['improved_text']}")
        print(f"Action Verbs: {improve_data['action_verbs_used']}")

        # 7. Interview Prep (Start + Answer)
        print("\n[7] Testing /api/interview/start & /api/interview/answer...")
        start_res = await client.post("/api/interview/start", json={
            "resume_id": resume_id,
            "interview_type": "Technical",
            "difficulty": "Intermediate",
            "target_role": "Full Stack Engineer",
            "num_questions": 5
        })
        assert start_res.status_code == 200, f"Interview start failed: {start_res.text}"
        interview_session = start_res.json()
        session_id = interview_session["session_id"]
        q1 = interview_session["first_question"]
        print(f"Session ID: {session_id}")
        print(f"Question 1: {q1['question_text']}")

        # Submit Answer
        answer_res = await client.post("/api/interview/answer", json={
            "session_id": session_id,
            "question_id": q1["id"],
            "question_text": q1["question_text"],
            "user_answer": "I enforce layered architecture with controllers, services, and repositories. I secure endpoints with short-lived JWTs and throttle traffic with Redis token-bucket rate limiting.",
            "target_role": "Full Stack Engineer",
            "interview_type": "Technical"
        })
        assert answer_res.status_code == 200, f"Interview answer failed: {answer_res.text}"
        answer_eval = answer_res.json()
        print(f"Answer Score: {answer_eval['score']}/100")
        print(f"Feedback: {answer_eval['feedback']}")
        print(f"Has Next Question: {answer_eval['next_question'] is not None}")

        # 8. Skill Gap & Roadmap
        print("\n[8] Testing /api/skills/profile...")
        res = await client.get(f"/api/skills/profile?target_role=Full+Stack+Engineer&resume_id={resume_id}")
        assert res.status_code == 200, f"Skill profile failed: {res.text}"
        skill_data = res.json()
        print(f"Match Percentage: {skill_data['match_percentage']}%")
        print(f"Roadmap Phases: {len(skill_data['roadmap'])} phases generated")

        # 9. User Profile Update
        print("\n[9] Testing /api/profile GET and PUT...")
        res = await client.get("/api/profile")
        assert res.status_code == 200, f"Profile get failed: {res.text}"
        p_data = res.json()
        print(f"Current Profile Name: {p_data['full_name']}")

        update_res = await client.put("/api/profile", json={"career_objective": "Lead Architect for high-performance cloud applications."})
        assert update_res.status_code == 200
        print("Updated Career Objective Successfully!")

        print("\n================== ALL PIPELINE TESTS PASSED (9/9) ==================\n")

if __name__ == "__main__":
    asyncio.run(test_full_pipeline())
