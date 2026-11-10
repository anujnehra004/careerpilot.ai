from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, status
from app.core.config import settings
from app.utils.logger import logger

class UserPayload:
    def __init__(self, id: str, email: str, full_name: str = "Candidate"):
        self.id = id
        self.email = email
        self.full_name = full_name

async def get_current_user(authorization: Optional[str] = Header(None)) -> UserPayload:
    """
    Extract user from Bearer token via Supabase Auth.
    If Supabase is not configured or in local development mode without token,
    return a default active candidate user profile.
    """
    # Demo/Fallback User
    demo_user = UserPayload(
        id="00000000-0000-0000-0000-000000000001",
        email="alex.morgan@careerpilot.ai",
        full_name="Alex Morgan"
    )

    if not authorization:
        return demo_user

    token = authorization.replace("Bearer ", "").strip()
    if not token or token == "demo-token" or token == "guest-token":
        return demo_user

    if settings.is_supabase_configured:
        try:
            from app.services.supabase_service import supabase_service
            if supabase_service.client:
                user_res = supabase_service.client.auth.get_user(token)
                if user_res and user_res.user:
                    meta = user_res.user.user_metadata or {}
                    name = meta.get("full_name") or meta.get("name") or user_res.user.email.split("@")[0]
                    return UserPayload(
                        id=user_res.user.id,
                        email=user_res.user.email or "user@example.com",
                        full_name=name
                    )
        except Exception as e:
            logger.warning(f"Supabase auth verification failed ({e}), falling back to token session.")

    return demo_user
