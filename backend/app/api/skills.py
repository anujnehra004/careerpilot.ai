from typing import Optional
from fastapi import APIRouter, Depends, Query, Body
from app.core.security import get_current_user, UserPayload
from app.services.gemini_service import gemini_service
from app.services.supabase_service import supabase_service
from app.models.schemas import (
    SkillGapResponse,
)

router = APIRouter(prefix="/skills", tags=["Skill Gap"])


@router.get("/profile", response_model=SkillGapResponse)
async def get_skill_gap_profile(
    target_role: str = Query("Full Stack Engineer", description="Target job role"),
    resume_id: Optional[str] = Query(None, description="Optional resume ID"),
    current_user: UserPayload = Depends(get_current_user)
):
    """
    Extract resume skills, compare against target role, compute skill gaps, and return learning roadmap.
    """
    resume_skills = []
    if resume_id:
        resume_record = supabase_service.get_resume(resume_id, current_user.id)
        if resume_record:
            parsed = resume_record.get("parsed_data", {})
            resume_skills = parsed.get("skills", [])
    else:
        # Check if user has any resumes
        resumes = supabase_service.list_resumes(current_user.id)
        if resumes:
            parsed = resumes[0].get("parsed_data", {})
            resume_skills = parsed.get("skills", [])

    return gemini_service.analyze_skill_gap(resume_skills, target_role)


@router.post("/toggle")
async def toggle_skill_status(
    payload: dict = Body(...),
    current_user: UserPayload = Depends(get_current_user)
):
    """
    Toggle a skill's completed/acquired status in the user's learning tracker.
    """
    skill_name = payload.get("skill_name", "")
    new_status = supabase_service.toggle_skill(current_user.id, skill_name)
    progress = supabase_service.get_skill_progress(current_user.id)
    return {
        "skill_name": skill_name,
        "is_completed": new_status,
        "progress": progress
    }
