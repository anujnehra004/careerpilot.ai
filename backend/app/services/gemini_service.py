import json
import uuid
from typing import List, Dict, Any, Optional
from google import genai
from google.genai import types

from app.core.config import settings
from app.utils.logger import logger
from app.models.schemas import (
    ResumeAnalysisResult,
    ScoreBreakdown,
    ResumeQualityBreakdown,
    QualityMetric,
    RecommendationItem,
    JobMatchResult,
    ImproveResumeResponse,
    InterviewQuestion,
    InterviewAnswerResponse,
    SkillGapResponse,
    RoadmapStep,
)


class GeminiService:
    def __init__(self):
        self._client: Optional[genai.Client] = None
        if settings.is_gemini_configured:
            try:
                self._client = genai.Client(api_key=settings.GEMINI_API_KEY)
                logger.info("Google GenAI client initialized with configured GEMINI_API_KEY.")
            except Exception as e:
                logger.error(f"Failed to initialize Google GenAI client: {e}")
                self._client = None
        else:
            logger.warning("GEMINI_API_KEY is not configured. GeminiService will run in intelligent demo fallback mode.")

    @property
    def is_live(self) -> bool:
        return self._client is not None

    def analyze_resume(self, resume_text: str, resume_id: str, target_role: str = "Software Engineer") -> ResumeAnalysisResult:
        """Analyze resume for overall score, ATS compatibility, quality metrics, strengths, weaknesses, and prioritized recommendations."""
        if self.is_live:
            prompt = f"""
You are an expert Chief Talent Officer, Senior Technical Recruiter, and ATS Systems Architect.
Analyze the following resume thoroughly for the target role: "{target_role}".

Resume Text:
\"\"\"
{resume_text[:6000]}
\"\"\"

Provide an in-depth analysis adhering strictly to the JSON schema:
- Overall score between 0 and 100 with a detailed multi-paragraph explanation.
- Score breakdown: content_impact, ats_formatting, skills_breadth, brevity_conciseness, sections_completeness (all 0-100).
- ATS compatibility score (0-100), list of ATS formatting issues, list of missing standard sections, and list of high-value keywords to add.
- Resume quality breakdown for grammar_and_tone, professional_summary, experience_descriptions, project_descriptions, and skills_presentation. Each must have score (0-100), verdict ('Strong', 'Needs Improvement', etc.), and specific notes.
- Strengths: list at least 4 specific standout highlights.
- Weaknesses: list at least 4 actionable vulnerabilities or missing data points.
- Recommendations: 4-6 prioritized recommendations with priority ('high', 'medium', 'low'), category, title, and actionable description.
Do not invent facts or hallucinate experience the candidate does not have.
"""
            try:
                response = self._client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_json_schema=ResumeAnalysisResult.model_json_schema(),
                        temperature=0.2,
                    ),
                )
                data = json.loads(response.text)
                data["id"] = str(uuid.uuid4())
                data["resume_id"] = resume_id
                data["is_demo_mode"] = False
                return ResumeAnalysisResult(**data)
            except Exception as e:
                logger.error(f"Gemini analyze_resume call failed: {e}. Falling back to demo mode.")

        # Intelligent domain-realistic fallback if Gemini is not configured or fails
        return ResumeAnalysisResult(
            id=str(uuid.uuid4()),
            resume_id=resume_id,
            overall_score=82,
            overall_score_explanation=(
                f"Your resume demonstrates strong technical foundations for a {target_role} role with clean structural "
                "readability. You have solid experience and project bullet points, but several impact descriptions "
                "lack quantifiable business metrics (e.g. latency reductions, percentage speedups, active user numbers). "
                "Refining the action verbs and optimizing keywords for specific job descriptions will significantly elevate your standing."
            ),
            score_breakdown=ScoreBreakdown(
                content_impact=78,
                ats_formatting=88,
                skills_breadth=84,
                brevity_conciseness=80,
                sections_completeness=90,
            ),
            ats_compatibility_score=86,
            ats_formatting_issues=[
                "Multi-column or table layouts can occasionally confuse legacy ATS scanners; single-column chronological layout is optimal.",
                "Ensure standard section headings like 'Work Experience', 'Education', and 'Technical Skills' are used verbatim."
            ],
            ats_missing_sections=[
                "Certifications or Cloud Accreditations section could be highlighted more prominently.",
                "Professional Summary could emphasize your domain specializations more clearly."
            ],
            ats_keyword_suggestions=[
                "CI/CD Pipeline",
                "Cloud Infrastructure (AWS/GCP)",
                "System Architecture & Microservices",
                "Unit & Integration Testing (TDD)",
                "Performance Optimization & Benchmarking"
            ],
            resume_quality=ResumeQualityBreakdown(
                grammar_and_tone=QualityMetric(score=89, verdict="Strong", notes="Tone is professional and grammatically articulate throughout."),
                professional_summary=QualityMetric(score=75, verdict="Needs Improvement", notes="Summary is descriptive but could focus more heavily on unique value propositions."),
                experience_descriptions=QualityMetric(score=81, verdict="Good", notes="Good technical descriptions; needs more explicit percentages and dollar/time metric impacts."),
                project_descriptions=QualityMetric(score=85, verdict="Strong", notes="Projects clearly outline technical stacks and functional achievements."),
                skills_presentation=QualityMetric(score=86, verdict="Strong", notes="Categorized cleanly by languages, frameworks, and tooling."),
            ),
            strengths=[
                "Strong foundational technology stack aligned with modern industry benchmarks.",
                "Clear project descriptions demonstrating end-to-end full-stack development capability.",
                "Clean, parseable section divisions that ensure reliable recruiter readability.",
                "Demonstrated proficiency with collaborative tools including Git, GitHub, and REST APIs."
            ],
            weaknesses=[
                "Several bullet points focus on tasks executed rather than measurable business outcomes achieved.",
                "Missing explicit metrics (e.g., 'reduced API response time by 35%', 'served 10,000+ monthly active requests').",
                "Keywords for modern containerization (Docker, Kubernetes) and cloud deployments could be deepened.",
                "Summary does not explicitly state target role seniority or specific domain ambition."
            ],
            recommendations=[
                RecommendationItem(
                    priority="high",
                    category="Impact Metrics",
                    title="Quantify Project & Experience Outcomes",
                    description="Rewrite bullet points to incorporate the Google 'X-Y-Z' formula: Accomplished [X], as measured by [Y], by doing [Z]."
                ),
                RecommendationItem(
                    priority="high",
                    category="Keywords",
                    title="Incorporate Cloud & DevOps Keywords",
                    description="Integrate relevant keywords such as Docker, Kubernetes, CI/CD pipelines, and automated testing frameworks."
                ),
                RecommendationItem(
                    priority="medium",
                    category="Professional Summary",
                    title="Sharpen Executive Summary Hook",
                    description="Craft a high-impact 3-line summary declaring your core engineering focus, primary stack, and quantifiable achievements."
                ),
                RecommendationItem(
                    priority="low",
                    category="Formatting",
                    title="Enforce Consistent Date and Location Formatting",
                    description="Standardize dates to 'Month Year' format (e.g., 'May 2023 – Present') across all education and experience entries."
                ),
            ],
            is_demo_mode=True,
        )

    def match_job(self, resume_text: str, resume_id: str, company_name: str, job_title: str, experience_level: str, job_description: str) -> JobMatchResult:
        """Compare resume text against a specific target job description."""
        if self.is_live:
            prompt = f"""
You are an expert Technical Hiring Manager at {company_name}.
Evaluate this candidate's resume for the role: "{job_title}" ({experience_level}).

Candidate Resume:
\"\"\"
{resume_text[:5000]}
\"\"\"

Job Description:
\"\"\"
{job_description[:5000]}
\"\"\"

Adhere strictly to the JSON schema:
- compatibility_score: 0 to 100 based on genuine qualification match.
- matching_skills: List of skills present in both resume and job description.
- missing_skills: Core required skills explicitly called for in the job description that the candidate is missing.
- relevant_experience: Highlight areas where candidate's past work directly transfers to the job.
- missing_keywords: Important industry or domain keywords present in the JD but absent in the resume.
- qualification_gaps: Required years of experience, specific degrees, or must-have certifications not found.
- improvement_suggestions: 4-6 specific actionable tips to tailor this resume specifically for {company_name}.
Do not invent credentials the candidate does not have.
"""
            try:
                response = self._client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_json_schema=JobMatchResult.model_json_schema(),
                        temperature=0.2,
                    ),
                )
                data = json.loads(response.text)
                data["id"] = str(uuid.uuid4())
                data["resume_id"] = resume_id
                data["company_name"] = company_name
                data["job_title"] = job_title
                data["experience_level"] = experience_level
                data["is_demo_mode"] = False
                return JobMatchResult(**data)
            except Exception as e:
                logger.error(f"Gemini match_job call failed: {e}. Falling back to demo mode.")

        # Realistic fallback
        return JobMatchResult(
            id=str(uuid.uuid4()),
            resume_id=resume_id,
            company_name=company_name,
            job_title=job_title,
            experience_level=experience_level,
            compatibility_score=78,
            matching_skills=[
                "Python", "TypeScript", "React", "REST APIs", "PostgreSQL", "Git / GitHub", "Tailwind CSS"
            ],
            missing_skills=[
                "Docker & Containerization", "Kubernetes", "AWS ECS / Lambda", "GraphQL", "Redis Caching"
            ],
            relevant_experience=[
                f"Full-stack web application development matching {job_title} requirements.",
                "API design and database schema engineering corresponding with backend responsibilities.",
                "Experience working with responsive, modern user interfaces in React."
            ],
            missing_keywords=[
                "High-Throughput Distributed Systems",
                "CI/CD Workflow Automation",
                "End-to-End Testing (Cypress / Playwright)",
                "Agile / Scrum Sprint Cycles"
            ],
            qualification_gaps=[
                "Job requests 2+ years of production experience managing cloud-hosted microservices.",
                "Specific familiarity with asynchronous task queues (Celery/RabbitMQ) not explicitly documented in resume."
            ],
            improvement_suggestions=[
                f"Align your professional summary directly with {company_name}'s mission and {job_title} role.",
                "Elevate any personal or academic projects that utilized Docker, Redis, or cloud deployment.",
                "Rephrase your database project bullets to emphasize performance optimization and relational query design.",
                "Explicitly mention testing frameworks (e.g. PyTest, Jest) in your technical skills list."
            ],
            is_demo_mode=True,
        )

    def improve_content(self, section: str, original_text: str, target_role: str, instruction: str) -> ImproveResumeResponse:
        """Rewrite and improve bullet points or summaries with action verbs and metrics."""
        if self.is_live:
            prompt = f"""
You are an executive resume writer and career coach.
Improve the following resume content for a candidate targeting "{target_role or 'Software Engineer'}".

Section Type: {section}
Original Content:
\"\"\"
{original_text}
\"\"\"

Special User Instruction: {instruction}

Strictly follow these rules:
1. Make it significantly more impactful, concise, and professional.
2. Use strong, assertive action verbs (e.g., Architected, Spearheaded, Optimized, Orchestrated, Engineered).
3. Where appropriate, provide realistic placeholders for quantifiable metrics like [X%, $Y, Z users] so the user can insert their actual numbers.
4. NEVER fabricate false degrees, non-existent job titles, or fictional employers.
5. Provide a list of key changes made, action verbs used, and tone enhancement notes.
"""
            try:
                response = self._client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_json_schema=ImproveResumeResponse.model_json_schema(),
                        temperature=0.3,
                    ),
                )
                data = json.loads(response.text)
                data["section"] = section
                data["original_text"] = original_text
                data["is_demo_mode"] = False
                return ImproveResumeResponse(**data)
            except Exception as e:
                logger.error(f"Gemini improve_content call failed: {e}. Falling back to demo mode.")

        # Fallback enhancement
        return ImproveResumeResponse(
            section=section,
            original_text=original_text,
            improved_text=(
                "Architected and deployed high-performance full-stack web services using FastAPI and React, "
                "reducing API response latency by 38% and supporting 15,000+ daily active user interactions with 99.9% uptime."
            ),
            key_changes=[
                "Replaced passive voice ('Worked on building...') with authoritative action verb ('Architected and deployed').",
                "Incorporated quantifiable performance metrics (38% latency reduction, 15,000+ daily users).",
                "Emphasized reliability and architectural robustness (99.9% uptime)."
            ],
            action_verbs_used=["Architected", "Deployed", "Optimized", "Engineered"],
            tone_enhancement="Elevated from routine task execution to high-impact strategic software engineering.",
            is_demo_mode=True,
        )

    def generate_interview_questions(self, resume_text: str, interview_type: str, difficulty: str, target_role: str, num_questions: int = 5) -> List[InterviewQuestion]:
        """Generate tailored interview questions based on candidate's background and selected interview parameters."""
        if self.is_live:
            prompt = f"""
You are an expert Principal Interviewer conducting a {interview_type} interview for a {target_role} ({difficulty} level).
Generate {num_questions} personalized, progressive interview questions tailored to the candidate's background.

Candidate Resume Snippet:
\"\"\"
{resume_text[:4000] if resume_text else 'Targeting ' + target_role}
\"\"\"

Requirements:
- Each question must be rigorous, realistic, and relevant to {interview_type} ({difficulty}).
- Formatted as a JSON list of objects with:
  id (string), question_order (integer 1 to {num_questions}), question_text (string), context (brief note on what this tests).
"""
            try:
                response = self._client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.4,
                    ),
                )
                items = json.loads(response.text)
                if isinstance(items, dict) and "questions" in items:
                    items = items["questions"]
                questions = []
                for idx, q in enumerate(items):
                    questions.append(
                        InterviewQuestion(
                            id=q.get("id", str(uuid.uuid4())),
                            question_order=q.get("question_order", idx + 1),
                            question_text=q.get("question_text", f"Question {idx+1}"),
                            context=q.get("context", f"Assessing {interview_type} proficiency")
                        )
                    )
                return questions[:num_questions]
            except Exception as e:
                logger.error(f"Gemini generate_interview_questions call failed: {e}. Falling back to demo mode.")

        # Default questions based on interview type
        type_lower = interview_type.lower()
        if "technical" in type_lower:
            return [
                InterviewQuestion(
                    id=str(uuid.uuid4()),
                    question_order=1,
                    question_text=f"How do you design a scalable RESTful API with authentication and rate limiting in {target_role} applications?",
                    context="Evaluates system design principles, security, and scalability."
                ),
                InterviewQuestion(
                    id=str(uuid.uuid4()),
                    question_order=2,
                    question_text="Walk me through how database indexing works under the hood and how you diagnose slow queries in PostgreSQL.",
                    context="Assesses data storage depth and query performance tuning."
                ),
                InterviewQuestion(
                    id=str(uuid.uuid4()),
                    question_order=3,
                    question_text="Explain the differences between synchronous and asynchronous request handling in modern web services.",
                    context="Tests concurrency models, event loops, and non-blocking I/O."
                ),
                InterviewQuestion(
                    id=str(uuid.uuid4()),
                    question_order=4,
                    question_text="How would you design a caching layer using Redis to prevent cache stampedes and stale data?",
                    context="Probes caching strategies (TTL, write-through, cache-aside)."
                ),
                InterviewQuestion(
                    id=str(uuid.uuid4()),
                    question_order=5,
                    question_text="Describe how you test your applications. What is your strategy for unit, integration, and end-to-end tests?",
                    context="Tests software quality assurance and CI/CD discipline."
                ),
            ]
        elif "hr" in type_lower or "behavioral" in type_lower:
            return [
                InterviewQuestion(
                    id=str(uuid.uuid4()),
                    question_order=1,
                    question_text=f"Tell me about a time you faced a tight engineering deadline for a {target_role} project. How did you prioritize tasks?",
                    context="Assesses time management, stress tolerance, and trade-off decisions under pressure."
                ),
                InterviewQuestion(
                    id=str(uuid.uuid4()),
                    question_order=2,
                    question_text="Describe a disagreement you had with a team member or tech lead regarding an architectural decision. How did you resolve it?",
                    context="Evaluates interpersonal communication and constructive conflict resolution."
                ),
                InterviewQuestion(
                    id=str(uuid.uuid4()),
                    question_order=3,
                    question_text="Can you share an example of a project that did not go as planned or failed in production? What did you learn?",
                    context="Probes accountability, resilience, and post-mortem growth mindset."
                ),
                InterviewQuestion(
                    id=str(uuid.uuid4()),
                    question_order=4,
                    question_text="Why are you particularly interested in transitioning into or leveling up as a {target_role}?",
                    context="Measures career alignment, intrinsic motivation, and professional trajectory."
                ),
                InterviewQuestion(
                    id=str(uuid.uuid4()),
                    question_order=5,
                    question_text="Where do you see your engineering craftsmanship evolving over the next 2-3 years?",
                    context="Assesses long-term vision and commitment to continuous technical improvement."
                ),
            ]
        else: # Project-based
            return [
                InterviewQuestion(
                    id=str(uuid.uuid4()),
                    question_order=1,
                    question_text="Pick the most complex project on your resume: What was the architectural rationale behind your tech stack choices?",
                    context="Evaluates deliberate technology selection and architectural trade-offs."
                ),
                InterviewQuestion(
                    id=str(uuid.uuid4()),
                    question_order=2,
                    question_text="What was the most challenging technical bug or bottleneck you encountered in that project, and how did you resolve it?",
                    context="Tests debugging methodology, root cause analysis, and persistence."
                ),
                InterviewQuestion(
                    id=str(uuid.uuid4()),
                    question_order=3,
                    question_text="If you were given 3 more weeks and had to scale this project to 100,000 active users, what would you re-architect first?",
                    context="Examines scalability awareness, bottleneck identification, and future-proofing."
                ),
                InterviewQuestion(
                    id=str(uuid.uuid4()),
                    question_order=4,
                    question_text="How did you handle state management and data consistency between your frontend client and backend services?",
                    context="Probes client-server synchronization, caching, and state predictability."
                ),
                InterviewQuestion(
                    id=str(uuid.uuid4()),
                    question_order=5,
                    question_text="How was your deployment pipeline set up? Did you utilize automated continuous integration and health monitoring?",
                    context="Assesses DevOps fluency, automated deployments, and observability."
                ),
            ]

    def evaluate_interview_answer(self, question_text: str, user_answer: str, target_role: str, interview_type: str) -> InterviewAnswerResponse:
        """Evaluate a candidate's answer with Gemini, scoring and providing actionable feedback."""
        if self.is_live:
            prompt = f"""
You are an expert interviewer evaluating a candidate for a {target_role} ({interview_type} interview).

Question Asked:
\"{question_text}\"

Candidate Answer:
\"{user_answer}\"

Adhere strictly to the JSON schema:
- score: 0 to 100 based on completeness, technical accuracy, clarity, and depth.
- feedback: 2-3 sentence overview of answer quality.
- strong_points: List of 2-3 specific things the candidate handled well.
- areas_for_improvement: List of 2-3 things that could have made the answer better.
- suggested_answer: A model benchmark answer that demonstrates how an expert would respond.
- follow_up_question: A thoughtful, natural follow-up question digging deeper into the candidate's response.
"""
            try:
                response = self._client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_json_schema=InterviewAnswerResponse.model_json_schema(),
                        temperature=0.2,
                    ),
                )
                data = json.loads(response.text)
                data["is_demo_mode"] = False
                return InterviewAnswerResponse(**data)
            except Exception as e:
                logger.error(f"Gemini evaluate_interview_answer call failed: {e}. Falling back to demo mode.")

        # Realistic fallback evaluation
        ans_len = len(user_answer.split())
        calculated_score = min(92, max(60, 50 + ans_len * 2))
        return InterviewAnswerResponse(
            question_id=str(uuid.uuid4()),
            score=calculated_score,
            feedback=(
                "Your answer shows a good conceptual understanding and addresses the primary question directly. "
                "To make it truly interview-ready, structure your answer using the STAR method (Situation, Task, Action, Result) "
                "and reference specific industry tools or production metrics."
            ),
            strong_points=[
                "Directly answered the core premise of the question without excessive digression.",
                "Demonstrated practical familiarity with modern engineering concepts and workflow.",
                "Maintained a confident, professional communication tone."
            ],
            areas_for_improvement=[
                "Incorporate more specific quantitative outcomes or benchmark figures.",
                "Elaborate on edge cases, failure scenarios, and error recovery strategies.",
                "Explicitly mention security implications (e.g. input sanitization, token expiration)."
            ],
            suggested_answer=(
                "When architecting scalable REST APIs, I begin by enforcing strict separation of concerns through layered architecture "
                "(controller, service, repository). For authentication, I implement stateless JWTs with short expiry paired with rotating refresh tokens "
                "stored in HTTP-only cookies. To protect against denial of service, I integrate a token-bucket rate limiter at the API gateway or reverse proxy level "
                "using Redis, enforcing tiered throttling by IP and authenticated user ID."
            ),
            follow_up_question="How would you handle distributed rate limiting if your API is deployed across multiple global regions?",
            is_demo_mode=True,
        )

    def analyze_skill_gap(self, resume_skills: List[str], target_role: str) -> SkillGapResponse:
        """Analyze existing skills vs target role requirements and construct a structured learning roadmap."""
        if self.is_live:
            prompt = f"""
You are a senior tech career coach and hiring curriculum designer.
Analyze the candidate's existing skills for the target role: "{target_role}".

Candidate Skills Extracted From Resume:
{json.dumps(resume_skills)}

Return strict JSON adhering to the schema:
- target_role: "{target_role}"
- resume_skills: existing skills identified
- required_technical_skills: 8-12 core industry-standard technical skills expected for {target_role}
- required_soft_skills: 4-6 essential collaboration/communication skills
- missing_technical_skills: required technical skills not present in resume
- missing_soft_skills: soft skills that should be highlighted
- match_percentage: 0 to 100 representing current readiness
- roadmap: 4 progressive phases (e.g. 'Foundations & Tooling', 'Deep Dives & Architecture', 'Production Reliability & Cloud', 'Portfolio & System Design Capstone'). Each with phase, title, duration, topics (list), suggested_projects (list).
"""
            try:
                response = self._client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_json_schema=SkillGapResponse.model_json_schema(),
                        temperature=0.2,
                    ),
                )
                data = json.loads(response.text)
                data["is_demo_mode"] = False
                return SkillGapResponse(**data)
            except Exception as e:
                logger.error(f"Gemini analyze_skill_gap call failed: {e}. Falling back to demo mode.")

        # Default role-based roadmap
        all_req_tech = [
            "TypeScript", "React", "Node.js", "Python", "FastAPI / Express",
            "PostgreSQL", "Docker", "Kubernetes", "AWS / Cloud Infrastructure",
            "Redis Caching", "CI/CD (GitHub Actions)", "System Design & Architecture"
        ]
        all_req_soft = [
            "Cross-functional Communication", "Agile & Scrum Methodologies",
            "Technical Writing & Documentation", "Constructive Code Reviews", "Problem Decomposition"
        ]

        resume_skills_lower = [s.lower() for s in resume_skills]
        missing_tech = [s for s in all_req_tech if s.lower() not in resume_skills_lower]
        missing_soft = [s for s in all_req_soft if s.lower() not in resume_skills_lower]
        
        match_pct = max(35, min(90, int(((len(all_req_tech) - len(missing_tech)) / len(all_req_tech)) * 100)))

        return SkillGapResponse(
            target_role=target_role,
            resume_skills=resume_skills if resume_skills else ["Python", "JavaScript", "React", "Git", "SQL"],
            required_technical_skills=all_req_tech,
            required_soft_skills=all_req_soft,
            missing_technical_skills=missing_tech if missing_tech else ["Docker", "Kubernetes", "Redis", "AWS"],
            missing_soft_skills=missing_soft if missing_soft else ["Technical Writing", "Constructive Code Reviews"],
            match_percentage=match_pct,
            roadmap=[
                RoadmapStep(
                    phase="Phase 1",
                    title="Containerization & DevOps Fundamentals",
                    duration="2-3 Weeks",
                    topics=["Docker containerization", "Multi-stage builds", "Docker Compose local environments", "GitHub Actions CI/CD pipelines"],
                    suggested_projects=["Containerize a full-stack web app with automated linting and testing in CI."]
                ),
                RoadmapStep(
                    phase="Phase 2",
                    title="Distributed Caching & High Performance Databases",
                    duration="3 Weeks",
                    topics=["Redis caching strategies (Cache-aside, write-through)", "PostgreSQL indexing & EXPLAIN query optimization", "Database connection pooling"],
                    suggested_projects=["Build an API with Redis sub/pub and cached query invalidation handling 5,000 req/sec."]
                ),
                RoadmapStep(
                    phase="Phase 3",
                    title="Cloud Orchestration & Microservices",
                    duration="3-4 Weeks",
                    topics=["Kubernetes pods, services, and deployments", "AWS ECS / EKS or GCP Cloud Run", "Infrastructure as Code (Terraform)"],
                    suggested_projects=["Deploy a resilient microservices architecture with auto-scaling and health checks."]
                ),
                RoadmapStep(
                    phase="Phase 4",
                    title="System Design Mastery & Portfolio Polish",
                    duration="2 Weeks",
                    topics=["Distributed consensus & CAP theorem", "Event-driven architecture with Kafka/RabbitMQ", "Interview system design mock interviews"],
                    suggested_projects=["Author an architectural RFC and create a public technical demo showcase."]
                ),
            ],
            is_demo_mode=True,
        )

gemini_service = GeminiService()
