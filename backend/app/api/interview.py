from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import get_current_user, UserPayload
from app.services.gemini_service import gemini_service
from app.services.supabase_service import supabase_service
from app.models.schemas import (
    InterviewStartRequest,
    InterviewStartResponse,
    InterviewAnswerRequest,
    InterviewAnswerResponse,
    InterviewQuestion,
)

router = APIRouter(prefix="/interview", tags=["Interview Prep"])

# Store active in-flight session questions in memory for sequential delivery
SESSION_QUESTIONS_STORE: Dict[str, List[InterviewQuestion]] = {}
SESSION_CURRENT_INDEX: Dict[str, int] = {}


@router.post("/start", response_model=InterviewStartResponse)
async def start_interview_session(
    req: InterviewStartRequest,
    current_user: UserPayload = Depends(get_current_user)
):
    """
    Initiate an AI interview session. Generates personalized questions based on resume, role, and difficulty.
    """
    resume_text = ""
    if req.resume_id:
        resume_record = supabase_service.get_resume(req.resume_id, current_user.id)
        if resume_record:
            resume_text = resume_record.get("extracted_text", "")

    # Generate questions with Gemini
    questions = gemini_service.generate_interview_questions(
        resume_text=resume_text,
        interview_type=req.interview_type,
        difficulty=req.difficulty,
        target_role=req.target_role,
        num_questions=req.num_questions
    )

    if not questions:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate interview questions. Please try again."
        )

    # Create session in db
    session_id = supabase_service.create_interview_session(
        user_id=current_user.id,
        interview_type=req.interview_type,
        difficulty=req.difficulty,
        target_role=req.target_role,
        resume_id=req.resume_id
    )

    # Save questions to session store
    SESSION_QUESTIONS_STORE[session_id] = questions
    SESSION_CURRENT_INDEX[session_id] = 0

    first_q = questions[0]
    supabase_service.record_interview_question(session_id, first_q)

    return InterviewStartResponse(
        session_id=session_id,
        interview_type=req.interview_type,
        difficulty=req.difficulty,
        target_role=req.target_role,
        total_questions=len(questions),
        first_question=first_q,
        is_demo_mode=gemini_service.is_live is False
    )


@router.post("/answer", response_model=InterviewAnswerResponse)
async def submit_interview_answer(
    req: InterviewAnswerRequest,
    current_user: UserPayload = Depends(get_current_user)
):
    """
    Evaluate candidate's answer to a question and supply feedback, score, and the next question.
    """
    if not req.user_answer or len(req.user_answer.strip()) < 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide an answer before submitting."
        )

    # Evaluate answer with Gemini AI
    eval_res = gemini_service.evaluate_interview_answer(
        question_text=req.question_text,
        user_answer=req.user_answer,
        target_role=req.target_role,
        interview_type=req.interview_type
    )
    eval_res.question_id = req.question_id

    # Update database
    supabase_service.update_interview_answer(
        session_id=req.session_id,
        question_id=req.question_id,
        user_answer=req.user_answer,
        eval_res=eval_res
    )

    # Check for next question in sequence
    session_questions = SESSION_QUESTIONS_STORE.get(req.session_id, [])
    current_idx = SESSION_CURRENT_INDEX.get(req.session_id, 0)
    next_idx = current_idx + 1

    if next_idx < len(session_questions):
        next_q = session_questions[next_idx]
        SESSION_CURRENT_INDEX[req.session_id] = next_idx
        eval_res.next_question = next_q
        eval_res.is_completed = False
        supabase_service.record_interview_question(req.session_id, next_q)
    else:
        eval_res.is_completed = True
        eval_res.next_question = None

    # Calculate current average
    session_info = supabase_service.memory_interview_sessions.get(req.session_id)
    if session_info:
        eval_res.average_session_score = session_info.get("average_score")

    return eval_res


@router.get("/history", response_model=List[dict])
async def get_interview_history(
    current_user: UserPayload = Depends(get_current_user)
):
    """Retrieve all past interview practice sessions."""
    return supabase_service.list_interview_history(current_user.id)
