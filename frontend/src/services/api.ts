import {
  ResumeUploadResponse,
  ResumeAnalysisResult,
  JobMatchResult,
  ImproveResumeResponse,
  InterviewStartResponse,
  InterviewAnswerResponse,
  InterviewSessionItem,
  SkillGapResponse,
  DashboardStats,
  UserProfile,
  SystemHealth,
} from '../types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('careerpilot_token') || 'demo-token';
  return {
    Authorization: `Bearer ${token}`,
  };
}

export const api = {
  // System Health
  async getHealth(): Promise<SystemHealth> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/dashboard/stats`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  // Resumes
  async uploadResume(file: File): Promise<ResumeUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const headers = getAuthHeaders();
    // Do not set Content-Type header so browser sets multipart boundary automatically

    const res = await fetch(`${API_BASE}/resumes/upload`, {
      method: 'POST',
      headers: {
        Authorization: headers['Authorization' as keyof HeadersInit] as string,
      },
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || 'Failed to upload and parse resume');
    }
    return res.json();
  },

  async analyzeResume(resumeId: string, targetRole: string = 'Software Engineer'): Promise<ResumeAnalysisResult> {
    const res = await fetch(`${API_BASE}/resumes/analyze`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resume_id: resumeId, target_role: targetRole }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to analyze resume');
    }
    return res.json();
  },

  async listResumes(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/resumes`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to list resumes');
    return res.json();
  },

  async listAllAnalyses(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/resumes/analyses`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to list analyses');
    return res.json();
  },

  getResumeFileUrl(resumeId: string): string {
    return `${API_BASE}/resumes/${resumeId}/file`;
  },

  async getResume(resumeId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/resumes/${resumeId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch resume');
    return res.json();
  },

  async getResumeAnalysis(resumeId: string): Promise<ResumeAnalysisResult> {
    const res = await fetch(`${API_BASE}/resumes/${resumeId}/analysis`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch resume analysis');
    return res.json();
  },

  async deleteResume(resumeId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/resumes/${resumeId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete resume');
    return res.json();
  },

  // Job Matcher
  async matchJob(data: {
    resume_id: string;
    company_name: string;
    job_title: string;
    experience_level: string;
    job_description: string;
  }): Promise<JobMatchResult> {
    const res = await fetch(`${API_BASE}/jobs/match`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to match job description');
    }
    return res.json();
  },

  async listJobMatches(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/jobs/matches`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to list job matches');
    return res.json();
  },

  // Resume Improvement Studio
  async improveContent(data: {
    section: string;
    original_text: string;
    target_role?: string;
    instruction?: string;
  }): Promise<ImproveResumeResponse> {
    const res = await fetch(`${API_BASE}/resume/improve`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to improve resume content');
    }
    return res.json();
  },

  // Interview Preparation
  async startInterview(data: {
    resume_id?: string;
    interview_type: string;
    difficulty: string;
    target_role: string;
    num_questions?: number;
  }): Promise<InterviewStartResponse> {
    const res = await fetch(`${API_BASE}/interview/start`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to start interview session');
    }
    return res.json();
  },

  async submitInterviewAnswer(data: {
    session_id: string;
    question_id: string;
    question_text: string;
    user_answer: string;
    target_role: string;
    interview_type: string;
  }): Promise<InterviewAnswerResponse> {
    const res = await fetch(`${API_BASE}/interview/answer`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to evaluate interview answer');
    }
    return res.json();
  },

  async getInterviewHistory(): Promise<InterviewSessionItem[]> {
    const res = await fetch(`${API_BASE}/interview/history`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch interview history');
    return res.json();
  },

  // Skill Gap Analyzer
  async getSkillProfile(targetRole: string = 'Full Stack Engineer', resumeId?: string): Promise<SkillGapResponse> {
    let url = `${API_BASE}/skills/profile?target_role=${encodeURIComponent(targetRole)}`;
    if (resumeId) {
      url += `&resume_id=${encodeURIComponent(resumeId)}`;
    }
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch skill gap profile');
    return res.json();
  },

  async toggleSkill(skillName: string): Promise<{ skill_name: string; is_completed: boolean; progress: any }> {
    const res = await fetch(`${API_BASE}/skills/toggle`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ skill_name: skillName }),
    });
    if (!res.ok) throw new Error('Failed to toggle skill');
    return res.json();
  },

  // User Profile
  async getUserProfile(): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/profile`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  async updateUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },
};
