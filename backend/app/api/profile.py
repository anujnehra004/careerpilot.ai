from fastapi import APIRouter, Depends, Body
from app.core.security import get_current_user, UserPayload
from app.services.supabase_service import supabase_service
from app.models.schemas import UserProfile

router = APIRouter(prefix="/profile", tags=["User Profile"])


@router.get("", response_model=UserProfile)
async def get_user_profile(
    current_user: UserPayload = Depends(get_current_user)
):
    """Get the current user's profile details."""
    return supabase_service.get_profile(current_user.id)


@router.put("", response_model=UserProfile)
async def update_user_profile(
    profile_data: dict = Body(...),
    current_user: UserPayload = Depends(get_current_user)
):
    """Update profile information (career objective, preferred roles, skills, etc.)."""
    return supabase_service.update_profile(current_user.id, profile_data)
