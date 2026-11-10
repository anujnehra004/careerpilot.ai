// TypeScript interfaces for CareerPilot AI

export interface EducationItem {
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  grade_or_gpa: string;
}

export interface ExperienceItem {
  company: string;
  position: string;
  location: string;
  start_date: string;
  end_date: string;
  description: string[];
}

export interface ProjectItem {
  title: string;
  technologies: string[];
  description: string[];
  link: string;
}

export interface ResumeParsedData {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  education: EducationItem[];
  skills: string[];
  work_experience: ExperienceItem[];
  projects: ProjectItem[];
  certifications: string[];
  achievements: string[];
}

export interface ResumeRecord {
  id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  extracted_text: string;
  parsed_data: ResumeParsedData;
  created_at: string;
}

export type ResumeUploadResponse = ResumeRecord;

export interface ScoreBreakdown {
  content_impact: number;
  ats_formatting: number;
  skills_breadth: number;
  brevity_conciseness: number;
  sections_completeness: number;
}

export interface QualityMetric {
  score: number;
  verdict: string;
  notes: string;
}

export interface ResumeQualityBreakdown {
  grammar_and_tone: QualityMetric;
  professional_summary: QualityMetric;
  experience_descriptions: QualityMetric;
  project_descriptions: QualityMetric;
  skills_presentation: QualityMetric;
}

export interface RecommendationItem {
  priority: 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
}

export interface ResumeAnalysisResult {
  id?: string;
  resume_id: string;
  overall_score: number;
  overall_score_explanation: string;
  score_breakdown: ScoreBreakdown;
  ats_compatibility_score: number;
  ats_formatting_issues: string[];
  ats_missing_sections: string[];
  ats_keyword_suggestions: string[];
  resume_quality: ResumeQualityBreakdown;
  strengths: string[];
  weaknesses: string[];
  recommendations: RecommendationItem[];
  ats_disclaimer: string;
  is_demo_mode: boolean;
  created_at?: string;
}

export interface JobMatchResult {
  id?: string;
  resume_id: string;
  company_name: string;
  job_title: string;
  experience_level: string;
  compatibility_score: number;
  matching_skills: string[];
  missing_skills: string[];
  relevant_experience: string[];
  missing_keywords: string[];
  qualification_gaps: string[];
  improvement_suggestions: string[];
  is_demo_mode: boolean;
  created_at?: string;
}

export interface ImproveResumeResponse {
  section: string;
  original_text: string;
  improved_text: string;
  key_changes: string[];
  action_verbs_used: string[];
  tone_enhancement: string;
  is_demo_mode: boolean;
}

export interface InterviewQuestion {
  id: string;
  question_order: number;
  question_text: string;
  context?: string;
}

export interface InterviewStartResponse {
  session_id: string;
  interview_type: string;
  difficulty: string;
  target_role: string;
  total_questions: number;
  first_question: InterviewQuestion;
  is_demo_mode: boolean;
}

export interface InterviewAnswerResponse {
  question_id: string;
  score: number;
  feedback: string;
  strong_points: string[];
  areas_for_improvement: string[];
  suggested_answer: string;
  follow_up_question?: string;
  next_question?: InterviewQuestion | null;
  is_completed: boolean;
  average_session_score?: number;
  is_demo_mode: boolean;
}

export interface InterviewSessionItem {
  id: string;
  interview_type: string;
  difficulty: string;
  target_role: string;
  status: string;
  average_score: number;
  created_at: string;
}

export interface RoadmapStep {
  phase: string;
  title: string;
  duration: string;
  topics: string[];
  suggested_projects: string[];
}

export interface SkillGapResponse {
  target_role: string;
  resume_skills: string[];
  required_technical_skills: string[];
  required_soft_skills: string[];
  missing_technical_skills: string[];
  missing_soft_skills: string[];
  match_percentage: number;
  roadmap: RoadmapStep[];
  is_demo_mode: boolean;
}

export interface DashboardStats {
  total_resumes: number;
  latest_ats_score: number | null;
  average_resume_score: number | null;
  total_interviews: number;
  average_interview_score: number | null;
  completed_skills_count: number;
  total_skills_count: number;
  skill_progress_pct: number;
  recent_analyses: Array<{
    id: string;
    resume_id: string;
    file_name: string;
    overall_score: number;
    ats_compatibility_score: number;
    created_at: string;
  }>;
  recommended_improvements: RecommendationItem[];
  api_status: {
    gemini_connected: boolean;
    gemini_model: string;
    supabase_connected: boolean;
    environment: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  career_objective: string;
  preferred_roles: string[];
  education: string;
  experience_level: string;
  skills: string[];
}

export interface SystemHealth {
  status: string;
  service: string;
  version: string;
  environment: string;
  gemini: {
    configured: boolean;
    model: string;
    mode: string;
  };
  supabase: {
    configured: boolean;
    mode: string;
  };
}
