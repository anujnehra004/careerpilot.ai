import json
import uuid
from app.services.supabase_service import supabase_service
from app.models.schemas import (
    ResumeParsedData,
    ResumeAnalysisResult,
    ScoreBreakdown,
    ResumeQualityBreakdown,
    QualityMetric,
    RecommendationItem,
)

def test_persistence():
    user_id = "00000000-0000-0000-0000-000000000001"
    print("Testing SQLite persistence...")

    # 1. Resume save and retrieval
    parsed = ResumeParsedData(
        name="Test User",
        email="test@user.com",
        phone="1234567890",
        location="India",
        summary="Experienced Developer",
        skills=["Python", "FastAPI", "SQLite"],
        education=[],
        work_experience=[],
        projects=[],
        certifications=[],
        achievements=[],
    )
    saved_resume = supabase_service.save_resume(
        user_id=user_id,
        file_name="test_resume.pdf",
        file_size=1024,
        file_type="application/pdf",
        extracted_text="Experienced Developer with Python, FastAPI, SQLite",
        parsed_data=parsed,
    )
    print(f"[OK] Saved resume: {saved_resume.id}")

    # Check resume in DB
    retrieved_resume = supabase_service.get_resume(saved_resume.id, user_id)
    assert retrieved_resume is not None, "Resume not found in DB!"
    assert retrieved_resume["file_name"] == "test_resume.pdf"
    print(f"[OK] Retrieved resume: {retrieved_resume['file_name']}")

    # 2. Save Analysis
    metric = QualityMetric(score=88, verdict="Strong", notes="Looks great")
    quality = ResumeQualityBreakdown(
        grammar_and_tone=metric,
        professional_summary=metric,
        experience_descriptions=metric,
        project_descriptions=metric,
        skills_presentation=metric,
    )
    analysis = ResumeAnalysisResult(
        id=str(uuid.uuid4()),
        resume_id=saved_resume.id,
        overall_score=85,
        overall_score_explanation="Strong technical background.",
        score_breakdown=ScoreBreakdown(
            content_impact=85,
            ats_formatting=90,
            skills_breadth=80,
            brevity_conciseness=85,
            sections_completeness=90,
        ),
        ats_compatibility_score=88,
        ats_formatting_issues=[],
        ats_missing_sections=[],
        ats_keyword_suggestions=["Cloud", "Docker"],
        resume_quality=quality,
        strengths=["Clear concise bullet points"],
        weaknesses=["Need more quantitative metrics"],
        recommendations=[
            RecommendationItem(
                priority="high",
                category="Metrics",
                title="Add quantitative results",
                description="Show metrics",
            )
        ],
    )
    supabase_service.save_analysis(user_id, analysis)
    print(f"[OK] Saved analysis: {analysis.id}")

    # Check analysis by resume
    retrieved_analysis = supabase_service.get_analysis_by_resume(saved_resume.id, user_id)
    assert retrieved_analysis is not None, "Analysis not found in DB!"
    assert retrieved_analysis["overall_score"] == 85
    print(f"[OK] Retrieved analysis overall score: {retrieved_analysis['overall_score']}")

    # 3. Check Dashboard Stats
    stats = supabase_service.get_dashboard_stats(user_id)
    assert stats.total_resumes >= 2, f"Expected at least 2 resumes, got {stats.total_resumes}"
    assert len(stats.recent_analyses) >= 1, "Expected recent analyses in dashboard"
    assert stats.recent_analyses[0].file_name == "test_resume.pdf"
    print(f"[OK] Dashboard stats confirmed! Total resumes: {stats.total_resumes}, Recent analysis: {stats.recent_analyses[0].file_name}")

    # 4. Check Skill Toggle
    initial_progress = supabase_service.get_skill_progress(user_id)
    toggled = supabase_service.toggle_skill(user_id, "Docker")
    after_progress = supabase_service.get_skill_progress(user_id)
    print(f"[OK] Skill progress toggled Docker to: {toggled} (Completed: {after_progress['completed_count']}/{after_progress['total_count']})")

    # 5. Profile Update
    updated_profile = supabase_service.update_profile(user_id, {"career_objective": "Senior Cloud Solutions Architect"})
    assert updated_profile.career_objective == "Senior Cloud Solutions Architect"
    print(f"[OK] Profile updated in SQLite: {updated_profile.career_objective}")

    print("\n>>> ALL PERSISTENCE TESTS COMPLETED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    test_persistence()
