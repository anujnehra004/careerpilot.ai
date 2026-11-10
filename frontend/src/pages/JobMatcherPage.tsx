import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Building,
  Target,
  FileText,
  Search,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import { JobMatchResult } from '../types';

interface JobMatcherPageProps {
  onNavigate: (path: string) => void;
  activeResumeId?: string | null;
}

export const JobMatcherPage: React.FC<JobMatcherPageProps> = ({
  onNavigate,
  activeResumeId,
}) => {
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>(activeResumeId || '');
  const [companyName, setCompanyName] = useState<string>('Stripe');
  const [jobTitle, setJobTitle] = useState<string>('Full Stack Software Engineer');
  const [experienceLevel, setExperienceLevel] = useState<string>('Mid-Level');
  const [jobDescription, setJobDescription] = useState<string>(
    `We are looking for a Full Stack Software Engineer to help build scalable payment interfaces and developer-facing APIs.
Requirements:
- 2+ years of experience with modern TypeScript and React frontend development.
- Strong proficiency in Python or Go for high-throughput distributed REST APIs.
- Deep familiarity with PostgreSQL schema design, indexing, and connection pooling.
- Experience with Docker containerization, Kubernetes orchestration, and cloud deployments (AWS/GCP).
- Knowledge of Redis distributed caching, message queues, and CI/CD pipelines.
- Excellent collaboration and constructive code review habits.`
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [matchResult, setMatchResult] = useState<JobMatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.listResumes().then((list) => {
      setResumes(list);
      if (list.length > 0 && !selectedResumeId) {
        setSelectedResumeId(list[0].id);
      }
    }).catch(console.error);
  }, []);

  const handleMatch = async () => {
    if (!jobDescription.trim()) {
      setError('Please provide a job description.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await api.matchJob({
        resume_id: selectedResumeId || 'demo-resume-01',
        company_name: companyName,
        job_title: jobTitle,
        experience_level: experienceLevel,
        job_description: jobDescription,
      });
      setMatchResult(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to match job description');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Briefcase className="w-7 h-7 text-blue-400" />
          Job Description Matcher & Tailoring Engine
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Paste any live job listing. Our AI compares your resume line-by-line, scores mutual compatibility, identifies keyword gaps, and recommends targeted tailoring.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="p-6 rounded-2xl bg-[#0b1021] border border-slate-800 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Role Parameters</h2>

            {/* Resume Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select Resume</label>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.file_name}
                  </option>
                ))}
                {resumes.length === 0 && <option value="demo-resume-01">Alex_Morgan_Software_Engineer_Resume.pdf</option>}
              </select>
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Google, Stripe, Meta"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Full Stack Engineer"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              >
                <option value="Internship / Entry-Level">Internship / Entry-Level (0-1 yrs)</option>
                <option value="Mid-Level">Mid-Level (2-4 yrs)</option>
                <option value="Senior">Senior Level (5+ yrs)</option>
                <option value="Staff / Lead">Staff / Principal / Lead</option>
              </select>
            </div>
          </div>
        </div>

        {/* Job Description Textarea */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0b1021] border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Job Description or Posting
              </label>
              <span className="text-[11px] text-slate-500">Paste raw text from LinkedIn, Indeed, etc.</span>
            </div>
            <textarea
              rows={9}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste requirements, tech stack details, and responsibilities here..."
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono leading-relaxed resize-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleMatch}
              disabled={loading}
              className="px-6 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? 'Comparing Resume against Job Posting...' : 'Run Compatibility Match'}
            </button>
          </div>
        </div>
      </div>

      {/* Match Results Output */}
      {matchResult && (
        <div className="space-y-6 pt-4">
          {/* Compatibility Score Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-[#0b1021] border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-blue-500"
                    strokeDasharray={`${matchResult.compatibility_score}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-black text-white">{matchResult.compatibility_score}%</span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Match</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                  {matchResult.company_name} • {matchResult.job_title}
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {matchResult.compatibility_score >= 80 ? 'Strong Candidate Fit' :
                   matchResult.compatibility_score >= 65 ? 'Competitive Match with Addressable Gaps' :
                   'Significant Keyword & Qualification Divergence'}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Experience level evaluated: <span className="text-purple-300 font-medium">{matchResult.experience_level}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('/improve')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 transition-all shadow-md shrink-0"
            >
              <span>Tailor Resume in Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Matching Skills vs Missing Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matching Skills */}
            <div className="p-6 rounded-2xl bg-[#0b1021] border border-emerald-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Matching Skills Identified ({matchResult.matching_skills.length})
                </h3>
                <span className="text-[10px] text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded font-semibold">
                  Found in Resume
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {matchResult.matching_skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1.5"
                  >
                    <Check className="w-3 h-3 text-emerald-400" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="p-6 rounded-2xl bg-[#0b1021] border border-red-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Missing Required Skills ({matchResult.missing_skills.length})
                </h3>
                <span className="text-[10px] text-red-300 bg-red-500/10 px-2 py-0.5 rounded font-semibold">
                  Required by JD
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {matchResult.missing_skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-red-500/10 text-red-300 border border-red-500/20"
                  >
                    - {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Relevant Experience & Missing Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Relevant Experience */}
            <div className="p-6 rounded-2xl bg-[#0b1021] border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Transferable Experience Highlights
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {matchResult.relevant_experience.map((item, idx) => (
                  <li key={idx} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Missing Keywords & Qualification Gaps */}
            <div className="p-6 rounded-2xl bg-[#0b1021] border border-slate-800 space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  Missing High-Frequency Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {matchResult.missing_keywords.map((kw, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg text-[11px] bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Qualification Gaps</h4>
                <ul className="space-y-1 text-xs text-slate-300">
                  {matchResult.qualification_gaps.map((gap, idx) => (
                    <li key={idx} className="leading-relaxed text-slate-400">• {gap}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Tailored Improvement Recommendations */}
          <div className="p-6 rounded-2xl bg-[#0b1021] border border-slate-800 space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Tailoring Strategy for {matchResult.company_name}
            </h3>
            <div className="space-y-2 text-xs text-slate-300">
              {matchResult.improvement_suggestions.map((sug, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold shrink-0 text-[11px]">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{sug}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
