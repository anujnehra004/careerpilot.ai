from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import get_current_user, UserPayload
from app.services.gemini_service import gemini_service
from app.services.supabase_service import supabase_service
from app.models.schemas import (
    JobMatchRequest,
    JobMatchResult,
)

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.post("/match", response_model=JobMatchResult)
async def match_job_description(
    req: JobMatchRequest,
    current_user: UserPayload = Depends(get_current_user)
):
    """
    Match candidate resume against target job description.
    Computes compatibility score, matching skills, missing skills, keyword gaps, and suggestions.
    """
    resume_record = supabase_service.get_resume(req.resume_id, current_user.id)
    if not resume_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Specified resume not found. Please select or upload a valid resume."
        )

    if not req.job_description or len(req.job_description.strip()) < 30:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description is too short. Please paste a more detailed job posting."
        )

    match_result = gemini_service.match_job(
        resume_text=resume_record.get("extracted_text", ""),
        resume_id=req.resume_id,
        company_name=req.company_name or "Target Company",
        job_title=req.job_title or "Software Engineer",
        experience_level=req.experience_level or "Mid-Level",
        job_description=req.job_description
    )

    supabase_service.save_job_match(current_user.id, match_result)
    return match_result


@router.get("/matches", response_model=List[dict])
async def list_matches(
    current_user: UserPayload = Depends(get_current_user)
):
    """List all previous job description matches."""
    return supabase_service.list_job_matches(current_user.id)
