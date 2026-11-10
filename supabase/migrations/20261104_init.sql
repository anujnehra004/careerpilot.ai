-- CareerPilot AI - Initial Supabase Schema Migration
-- Includes all 9 core tables with Row Level Security (RLS) and automatic profile provisioning

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    career_objective TEXT DEFAULT '',
    preferred_roles JSONB DEFAULT '[]'::jsonb,
    education TEXT DEFAULT '',
    experience_level TEXT DEFAULT 'Entry',
    skills JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Trigger to create profile upon new Supabase auth sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. RESUMES TABLE
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT DEFAULT '',
    file_size INTEGER DEFAULT 0,
    file_type TEXT NOT NULL,
    extracted_text TEXT NOT NULL,
    parsed_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own resumes"
    ON public.resumes FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_created_at ON public.resumes(created_at DESC);


-- 3. RESUME ANALYSES TABLE
CREATE TABLE IF NOT EXISTS public.resume_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    overall_score INTEGER NOT NULL,
    overall_score_explanation TEXT DEFAULT '',
    score_breakdown JSONB DEFAULT '{}'::jsonb,
    ats_compatibility_score INTEGER NOT NULL,
    ats_formatting_issues JSONB DEFAULT '[]'::jsonb,
    ats_missing_sections JSONB DEFAULT '[]'::jsonb,
    ats_keyword_suggestions JSONB DEFAULT '[]'::jsonb,
    resume_quality JSONB DEFAULT '{}'::jsonb,
    strengths JSONB DEFAULT '[]'::jsonb,
    weaknesses JSONB DEFAULT '[]'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own analyses"
    ON public.resume_analyses FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_analyses_resume_id ON public.resume_analyses(resume_id);
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON public.resume_analyses(user_id);


-- 4. JOB DESCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.job_descriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    job_title TEXT NOT NULL,
    experience_level TEXT DEFAULT 'Mid-Level',
    description_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.job_descriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own job descriptions"
    ON public.job_descriptions FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON public.job_descriptions(user_id);


-- 5. JOB MATCHES TABLE
CREATE TABLE IF NOT EXISTS public.job_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.job_descriptions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    compatibility_score INTEGER NOT NULL,
    matching_skills JSONB DEFAULT '[]'::jsonb,
    missing_skills JSONB DEFAULT '[]'::jsonb,
    relevant_experience JSONB DEFAULT '[]'::jsonb,
    missing_keywords JSONB DEFAULT '[]'::jsonb,
    qualification_gaps JSONB DEFAULT '[]'::jsonb,
    improvement_suggestions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.job_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own job matches"
    ON public.job_matches FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_matches_user_id ON public.job_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_resume_id ON public.job_matches(resume_id);


-- 6. INTERVIEW SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.interview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    interview_type TEXT NOT NULL, -- Technical, HR, Behavioral, Project-based
    difficulty TEXT DEFAULT 'Intermediate', -- Beginner, Intermediate, Advanced
    target_role TEXT NOT NULL,
    status TEXT DEFAULT 'in_progress', -- in_progress, completed
    average_score NUMERIC(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own interview sessions"
    ON public.interview_sessions FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON public.interview_sessions(user_id);


-- 7. INTERVIEW QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.interview_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
    question_order INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    user_answer TEXT DEFAULT '',
    score INTEGER DEFAULT 0,
    feedback TEXT DEFAULT '',
    suggested_answer TEXT DEFAULT '',
    follow_up_question TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their interview questions via session"
    ON public.interview_questions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.interview_sessions s
            WHERE s.id = interview_questions.session_id AND s.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.interview_sessions s
            WHERE s.id = interview_questions.session_id AND s.user_id = auth.uid()
        )
    );

CREATE INDEX IF NOT EXISTS idx_questions_session_id ON public.interview_questions(session_id);


-- 8. SKILL PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.skill_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_role TEXT NOT NULL,
    technical_skills JSONB DEFAULT '[]'::jsonb,
    soft_skills JSONB DEFAULT '[]'::jsonb,
    roadmap JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.skill_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own skill profiles"
    ON public.skill_profiles FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_skills_user_id ON public.skill_profiles(user_id);


-- 9. LEARNING PROGRESS TABLE
CREATE TABLE IF NOT EXISTS public.learning_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    category TEXT DEFAULT 'technical',
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, skill_name)
);

ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own learning progress"
    ON public.learning_progress FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_progress_user_id ON public.learning_progress(user_id);
