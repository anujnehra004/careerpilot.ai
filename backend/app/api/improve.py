from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import get_current_user, UserPayload
from app.services.gemini_service import gemini_service
from app.models.schemas import (
    ImproveResumeRequest,
    ImproveResumeResponse,
)

router = APIRouter(prefix="/resume", tags=["Resume Improvement"])


@router.post("/improve", response_model=ImproveResumeResponse)
async def improve_resume_content(
    req: ImproveResumeRequest,
    current_user: UserPayload = Depends(get_current_user)
):
    """
    Enhance resume bullets, summaries, action verbs, and quantify achievements.
    Provides side-by-side original vs AI-improved text.
    """
    if not req.original_text or len(req.original_text.strip()) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Original text is too short to optimize."
        )

    improved = gemini_service.improve_content(
        section=req.section,
        original_text=req.original_text,
        target_role=req.target_role or "Software Engineer",
        instruction=req.instruction or "Enhance clarity, action verbs, and quantitative impact."
    )

    return improved
