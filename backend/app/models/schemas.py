from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

# ----------------- Resume Extraction & Parsing -----------------
class EducationItem(BaseModel):
    institution: str = ""
    degree: str = ""
    field_of_study: str = ""
    start_date: str = ""
    end_date: str = ""
    grade_or_gpa: str = ""

class ExperienceItem(BaseModel):
    company: str = ""
    position: str = ""
    location: str = ""
    start_date: str = ""
    end_date: str = ""
    description: List[str] = Field(default_factory=list)

class ProjectItem(BaseModel):
    title: str = ""
    technologies: List[str] = Field(default_factory=list)
    description: List[str] = Field(default_factory=list)
    link: str = ""

class ResumeParsedData(BaseModel):
    name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    summary: str = ""
    education: List[EducationItem] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    work_experience: List[ExperienceItem] = Field(default_factory=list)
    projects: List[ProjectItem] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    achievements: List[str] = Field(default_factory=list)

class ResumeUploadResponse(BaseModel):
    id: str
    file_name: str
    file_size: int
    file_type: str
    extracted_text: str
    parsed_data: ResumeParsedData
    created_at: str
    file_path: Optional[str] = ""

# ----------------- Resume Analysis & ATS -----------------
class ScoreBreakdown(BaseModel):
    content_impact: int = Field(ge=0, le=100, description="Impact of achievements and action verbs")
    ats_formatting: int = Field(ge=0, le=100, description="ATS parseability and structural clarity")
    skills_breadth: int = Field(ge=0, le=100, description="Relevance and coverage of modern technical/soft skills")
    brevity_conciseness: int = Field(ge=0, le=100, description="Concision, readability, and avoiding fluff")
    sections_completeness: int = Field(ge=0, le=100, description="Completeness of key sections")

class QualityMetric(BaseModel):
    score: int = Field(ge=0, le=100)
    verdict: str  # e.g., 'Strong', 'Needs Improvement', 'Average'
    notes: str

class ResumeQualityBreakdown(BaseModel):
    grammar_and_tone: QualityMetric
    professional_summary: QualityMetric
    experience_descriptions: QualityMetric
    project_descriptions: QualityMetric
    skills_presentation: QualityMetric

class RecommendationItem(BaseModel):
    priority: str = Field(description="'high', 'medium', or 'low'")
    category: str = Field(description="e.g., 'Formatting', 'Keywords', 'Action Verbs', 'Impact Metrics'")
    title: str
    description: str

class ResumeAnalysisResult(BaseModel):
    id: Optional[str] = None
    resume_id: str
    overall_score: int = Field(ge=0, le=100)
    overall_score_explanation: str
    score_breakdown: ScoreBreakdown
    ats_compatibility_score: int = Field(ge=0, le=100)
    ats_formatting_issues: List[str] = Field(default_factory=list)
    ats_missing_sections: List[str] = Field(default_factory=list)
    ats_keyword_suggestions: List[str] = Field(default_factory=list)
    resume_quality: ResumeQualityBreakdown
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    recommendations: List[RecommendationItem] = Field(default_factory=list)
    ats_disclaimer: str = (
        "Note: ATS scores are simulated estimates based on standard algorithmic parsing rules "
        "and modern industry benchmarks. They do not represent an official proprietary score from any single employer."
    )
    is_demo_mode: bool = False
    created_at: Optional[str] = None

class ResumeAnalyzeRequest(BaseModel):
    resume_id: str
    target_role: Optional[str] = "Software Engineer"

# ----------------- Job Description Matching -----------------
class JobMatchRequest(BaseModel):
    resume_id: str
    company_name: str
    job_title: str
    experience_level: str = "Mid-Level"
    job_description: str

class JobMatchResult(BaseModel):
    id: Optional[str] = None
    resume_id: str
    company_name: str
    job_title: str
    experience_level: str
    compatibility_score: int = Field(ge=0, le=100)
    matching_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    relevant_experience: List[str] = Field(default_factory=list)
    missing_keywords: List[str] = Field(default_factory=list)
    qualification_gaps: List[str] = Field(default_factory=list)
    improvement_suggestions: List[str] = Field(default_factory=list)
    is_demo_mode: bool = False
    created_at: Optional[str] = None

# ----------------- Resume Improvement Studio -----------------
class ImproveResumeRequest(BaseModel):
    section: str = Field(description="e.g. 'summary', 'experience_bullet', 'project_bullet'")
    original_text: str
    target_role: Optional[str] = ""
    instruction: Optional[str] = "Make it more impactful with action verbs and quantifiable results."

class ImproveResumeResponse(BaseModel):
    section: str
    original_text: str
    improved_text: str
    key_changes: List[str] = Field(default_factory=list)
    action_verbs_used: List[str] = Field(default_factory=list)
    tone_enhancement: str
    is_demo_mode: bool = False

# ----------------- Interview Preparation -----------------
class InterviewStartRequest(BaseModel):
    resume_id: Optional[str] = None
    interview_type: str = "Technical"  # Technical, HR, Behavioral, Project-based
    difficulty: str = "Intermediate"    # Beginner, Intermediate, Advanced
    target_role: str = "Software Engineer"
    num_questions: int = 5

class InterviewQuestion(BaseModel):
    id: str
    question_order: int
    question_text: str
    context: Optional[str] = None

class InterviewStartResponse(BaseModel):
    session_id: str
    interview_type: str
    difficulty: str
    target_role: str
    total_questions: int
    first_question: InterviewQuestion
    is_demo_mode: bool = False

class InterviewAnswerRequest(BaseModel):
    session_id: str
    question_id: str
    question_text: str
    user_answer: str
    target_role: str
    interview_type: str

class InterviewAnswerResponse(BaseModel):
    question_id: str
    score: int = Field(ge=0, le=100)
    feedback: str
    strong_points: List[str] = Field(default_factory=list)
    areas_for_improvement: List[str] = Field(default_factory=list)
    suggested_answer: str
    follow_up_question: Optional[str] = None
    next_question: Optional[InterviewQuestion] = None
    is_completed: bool = False
    average_session_score: Optional[float] = None
    is_demo_mode: bool = False

class InterviewSessionItem(BaseModel):
    id: str
    interview_type: str
    difficulty: str
    target_role: str
    status: str
    average_score: float
    created_at: str

# ----------------- Skill Gap Analyzer -----------------
class SkillGapRequest(BaseModel):
    resume_id: Optional[str] = None
    target_role: str = "Full Stack Developer"

class RoadmapStep(BaseModel):
    phase: str
    title: str
    duration: str
    topics: List[str]
    suggested_projects: List[str]

class SkillGapResponse(BaseModel):
    target_role: str
    resume_skills: List[str]
    required_technical_skills: List[str]
    required_soft_skills: List[str]
    missing_technical_skills: List[str]
    missing_soft_skills: List[str]
    match_percentage: int
    roadmap: List[RoadmapStep]
    is_demo_mode: bool = False

# ----------------- Dashboard & Stats -----------------
class RecentAnalysisItem(BaseModel):
    id: str
    resume_id: str
    file_name: str
    overall_score: int
    ats_compatibility_score: int
    created_at: str

class DashboardStatsResponse(BaseModel):
    total_resumes: int
    latest_ats_score: Optional[int] = None
    average_resume_score: Optional[int] = None
    total_interviews: int
    average_interview_score: Optional[float] = None
    completed_skills_count: int
    total_skills_count: int
    skill_progress_pct: int
    recent_analyses: List[RecentAnalysisItem] = Field(default_factory=list)
    recommended_improvements: List[RecommendationItem] = Field(default_factory=list)
    api_status: Dict[str, Any] = Field(default_factory=dict)

# ----------------- User Profile -----------------
class UserProfile(BaseModel):
    id: str
    email: str
    full_name: str = ""
    avatar_url: str = ""
    career_objective: str = ""
    preferred_roles: List[str] = Field(default_factory=list)
    education: str = ""
    experience_level: str = "Entry"
    skills: List[str] = Field(default_factory=list)
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
