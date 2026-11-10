from typing import List
from pathlib import Path
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from fastapi.responses import FileResponse
from app.core.security import get_current_user, UserPayload
from app.services.parser_service import ParserService
from app.services.gemini_service import gemini_service
from app.services.supabase_service import supabase_service
from app.models.schemas import (
    ResumeUploadResponse,
    ResumeAnalyzeRequest,
    ResumeAnalysisResult,
)
from app.utils.logger import logger

router = APIRouter(prefix="/resumes", tags=["Resumes"])


@router.post("/upload", response_model=ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: UserPayload = Depends(get_current_user)
):
    """
    Upload and extract content from a PDF or DOCX resume.
    Validates file type and size (< 10MB).
    """
    # 1. Validate file extension & content type
    file_name = file.filename or "resume.pdf"
    content_type = file.content_type or ""
    allowed_exts = [".pdf", ".docx", ".doc"]
    
    if not any(file_name.lower().endswith(ext) for ext in allowed_exts):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Please upload a PDF (.pdf) or Word document (.docx)."
        )

    # 2. Read bytes and check size (limit 10MB)
    try:
        contents = await file.read()
    except Exception as e:
        logger.error(f"Error reading file upload: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to read the uploaded file."
        )

    file_size = len(contents)
    if file_size > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds the 10MB maximum limit."
        )

    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty. Please upload a valid resume."
        )

    # 3. Extract text
    try:
        extracted_text = ParserService.extract_text(contents, file_name)
    except Exception as e:
        logger.error(f"Text extraction failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unable to extract text from document: {str(e)}"
        )

    if not extracted_text or len(extracted_text.strip()) < 50:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not extract sufficient text from this file. Ensure the resume is not an image-only scan."
        )

    # 4. Parse resume structured data
    parsed_data = ParserService.parse_resume_structure(extracted_text)

    # 4.5 Save physical copy to uploads/ directory on disk
    uploads_dir = Path(__file__).resolve().parent.parent.parent / "uploads"
    uploads_dir.mkdir(parents=True, exist_ok=True)
    file_disk_path = uploads_dir / file_name
    try:
        with open(file_disk_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        logger.error(f"Failed to save physical file to uploads/: {e}")

    # 5. Persist resume in SQLite / Supabase store
    response = supabase_service.save_resume(
        user_id=current_user.id,
        file_name=file_name,
        file_size=file_size,
        file_type=content_type or "application/pdf",
        extracted_text=extracted_text,
        parsed_data=parsed_data,
        file_path=f"uploads/{file_name}",
    )

    return response


@router.post("/analyze", response_model=ResumeAnalysisResult)
async def analyze_resume(
    req: ResumeAnalyzeRequest,
    current_user: UserPayload = Depends(get_current_user)
):
    """
    Run Gemini AI ATS score, quality checks, strengths, weaknesses, and recommendations.
    """
    resume_record = supabase_service.get_resume(req.resume_id, current_user.id)
    if not resume_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found. Please upload a resume first."
        )

    extracted_text = resume_record.get("extracted_text", "")
    target_role = req.target_role or "Software Engineer"

    # Analyze with Gemini AI
    analysis_result = gemini_service.analyze_resume(
        resume_text=extracted_text,
        resume_id=req.resume_id,
        target_role=target_role
    )

    # Save analysis in database
    supabase_service.save_analysis(current_user.id, analysis_result)

    return analysis_result


@router.get("", response_model=List[dict])
async def list_resumes(
    current_user: UserPayload = Depends(get_current_user)
):
    """Retrieve all uploaded resumes for the current user."""
    return supabase_service.list_resumes(current_user.id)


@router.get("/analyses", response_model=List[dict])
async def list_all_analyses(
    current_user: UserPayload = Depends(get_current_user)
):
    """Retrieve all historical analyses for the current user."""
    return supabase_service.list_analyses(current_user.id)


@router.get("/{resume_id}/file")
async def get_resume_file(
    resume_id: str,
    current_user: UserPayload = Depends(get_current_user)
):
    """Download or view the original uploaded resume file."""
    resume_record = supabase_service.get_resume(resume_id, current_user.id)
    if not resume_record or not resume_record.get("file_path"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Original file path not found for this resume."
        )

    full_path = Path(__file__).resolve().parent.parent.parent / resume_record["file_path"]
    if not full_path.exists() or not full_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Physical file does not exist on disk."
        )

    return FileResponse(
        path=str(full_path),
        filename=resume_record.get("file_name", "resume.pdf"),
        media_type=resume_record.get("file_type", "application/pdf")
    )


@router.get("/{resume_id}")
async def get_resume(
    resume_id: str,
    current_user: UserPayload = Depends(get_current_user)
):
    """Get single resume details by ID."""
    resume_record = supabase_service.get_resume(resume_id, current_user.id)
    if not resume_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found."
        )
    return resume_record


@router.get("/{resume_id}/analysis", response_model=ResumeAnalysisResult)
async def get_resume_analysis(
    resume_id: str,
    current_user: UserPayload = Depends(get_current_user)
):
    """Get latest analysis for a specific resume."""
    analysis = supabase_service.get_analysis_by_resume(resume_id, current_user.id)
    if not analysis:
        # Generate on the fly
        resume_record = supabase_service.get_resume(resume_id, current_user.id)
        if not resume_record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")
        analysis = gemini_service.analyze_resume(resume_record.get("extracted_text", ""), resume_id)
        supabase_service.save_analysis(current_user.id, analysis)
        return analysis
    return analysis


@router.delete("/{resume_id}")
async def delete_resume(
    resume_id: str,
    current_user: UserPayload = Depends(get_current_user)
):
    """Delete a resume and associated analyses."""
    supabase_service.delete_resume(resume_id, current_user.id)
    return {"message": "Resume deleted successfully", "id": resume_id}
