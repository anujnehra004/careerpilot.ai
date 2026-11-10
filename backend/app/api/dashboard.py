from fastapi import APIRouter, Depends
from app.core.security import get_current_user, UserPayload
from app.services.supabase_service import supabase_service
from app.models.schemas import DashboardStatsResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(
    current_user: UserPayload = Depends(get_current_user)
):
    """
    Get aggregate dashboard metrics: resumes analyzed, latest ATS score,
    average score, interview count, skill progress, and recommendations.
    """
    return supabase_service.get_dashboard_stats(current_user.id)
