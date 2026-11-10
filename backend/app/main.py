from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
from app.core.config import settings
from app.utils.logger import logger
from app.api.resumes import router as resumes_router
from app.api.jobs import router as jobs_router
from app.api.improve import router as improve_router
from app.api.interview import router as interview_router
from app.api.skills import router as skills_router
from app.api.dashboard import router as dashboard_router
from app.api.profile import router as profile_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="CareerPilot AI — Intelligent Resume Analyzer, Job Matcher & Placement Assistant API",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred while processing your request. Please try again or check the system logs.",
            "path": request.url.path,
        }
    )

# 1. API Endpoints
app.include_router(dashboard_router, prefix=settings.API_PREFIX)
app.include_router(resumes_router, prefix=settings.API_PREFIX)
app.include_router(jobs_router, prefix=settings.API_PREFIX)
app.include_router(improve_router, prefix=settings.API_PREFIX)
app.include_router(interview_router, prefix=settings.API_PREFIX)
app.include_router(skills_router, prefix=settings.API_PREFIX)
app.include_router(profile_router, prefix=settings.API_PREFIX)


@app.get("/api/health")
async def health_check():
    """System health check and configuration audit."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "gemini": {
            "configured": settings.is_gemini_configured,
            "model": settings.GEMINI_MODEL,
            "mode": "live" if settings.is_gemini_configured else "demo_fallback"
        },
        "supabase": {
            "configured": settings.is_supabase_configured,
            "mode": "live_postgres" if settings.is_supabase_configured else "memory_store"
        }
    }


# 2. Unified Static Frontend Hosting
frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
assets_dir = frontend_dist / "assets"

if assets_dir.exists():
    app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="static-assets")

@app.get("/")
async def serve_index():
    index_file = frontend_dist / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs": "/docs",
        "health": "/api/health"
    }

# SPA Fallback for client-side routing (/dashboard, /upload, /interview, etc.)
@app.get("/{full_path:path}", include_in_schema=False)
async def serve_spa_route(full_path: str):
    # Check if a static file directly in dist exists (e.g. favicon.svg, icons.svg)
    direct_file = frontend_dist / full_path
    if full_path and direct_file.is_file():
        return FileResponse(direct_file)

    # Return index.html for all client-side page transitions
    index_file = frontend_dist / "index.html"
    if index_file.exists():
        return FileResponse(index_file)

    return JSONResponse(status_code=404, content={"message": "Frontend build not found"})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
