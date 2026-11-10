import React, { useEffect, useState } from 'react';
import {
  FileSearch,
  Sparkles,
  Award,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Layers,
  Zap,
  Target,
  ShieldAlert,
  Sliders,
} from 'lucide-react';
import { api } from '../services/api';
import { ResumeAnalysisResult } from '../types';

interface ResumeAnalysisPageProps {
  onNavigate: (path: string) => void;
  activeResumeId?: string | null;
}

export const ResumeAnalysisPage: React.FC<ResumeAnalysisPageProps> = ({
  onNavigate,
  activeResumeId,
}) => {
  const [analysis, setAnalysis] = useState<ResumeAnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [targetRole, setTargetRole] = useState<string>('Full Stack Engineer');
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>(activeResumeId || '');

  useEffect(() => {
    loadResumesAndAnalysis();
  }, [activeResumeId]);

  const loadResumesAndAnalysis = async () => {
    setLoading(true);
    try {
      const list = await api.listResumes();
      setResumes(list);

      const targetId = activeResumeId || selectedResumeId || (list.length > 0 ? list[0].id : 'demo-resume-01');
      setSelectedResumeId(targetId);

      const result = await api.getResumeAnalysis(targetId);
      setAnalysis(result);
    } catch (err) {
      console.error('Error fetching analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReanalyze = async () => {
    if (!selectedResumeId) return;
    setLoading(true);
    try {
      const result = await api.analyzeResume(selectedResumeId, targetRole);
      setAnalysis(result);
    } catch (err) {
      console.error('Reanalyze failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
        <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 animate-spin">
          <RefreshCw className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Analyzing Resume with Gemini AI...</h2>
        <p className="text-xs text-slate-400 max-w-sm">
          Scoring ATS parseability, reviewing grammar and metrics, and prioritizing recommendations.
        </p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center py-20 space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">No Analysis Available</h2>
        <p className="text-xs text-slate-400">Please upload a resume first to run the analysis.</p>
        <button
          onClick={() => onNavigate('/upload')}
          className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold"
        >
          Upload Resume
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0b1021] border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FileSearch className="w-6 h-6 text-purple-400" />
            Resume Intelligence & ATS Report
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            In-depth evaluation calibrated for modern Applicant Tracking Systems and senior hiring managers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Target Role Selector */}
          <select
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="Full Stack Engineer">Role: Full Stack Engineer</option>
            <option value="Frontend Developer">Role: Frontend Developer</option>
            <option value="Backend Engineer">Role: Backend Engineer</option>
            <option value="AI / ML Engineer">Role: AI / ML Engineer</option>
            <option value="DevOps / Cloud Architect">Role: DevOps / Cloud</option>
          </select>

          <button
            onClick={handleReanalyze}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Re-Analyze
          </button>
        </div>
      </div>

      {/* Hero Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* A. Overall Resume Score */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-purple-950/30 to-[#0b1021] border border-purple-500/30 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-purple-300">
            <span>Overall Resume Score</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-white">{analysis.overall_score}</span>
            <span className="text-slate-400 text-sm font-semibold">/ 100</span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 h-full"
              style={{ width: `${analysis.overall_score}%` }}
            />
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {analysis.overall_score_explanation}
          </p>
        </div>

        {/* B. Estimated ATS Compatibility Score */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-emerald-950/30 to-[#0b1021] border border-emerald-500/30 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-300">
            <span>Estimated ATS Compatibility</span>
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-emerald-400">{analysis.ats_compatibility_score}%</span>
            <span className="text-xs text-emerald-300 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
              High Parseability
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-400 h-full"
              style={{ width: `${analysis.ats_compatibility_score}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400 space-y-1">
            <p>• Standard chronological hierarchy</p>
            <p>• Clean headings recognizable by scanners</p>
          </div>
        </div>

        {/* Quick Studio Action */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-blue-950/30 to-[#0b1021] border border-blue-500/30 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-blue-300">
              <span>Next Steps</span>
              <Sparkles className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white mt-2">Ready to Boost Your Score?</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Use our AI Studio to rewrite weak bullet points into high-impact metric statements.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => onNavigate('/improve')}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/25"
            >
              <span>Open Resume Improvement Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('/job-matcher')}
              className="w-full py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              Match Specific Job Description
            </button>
          </div>
        </div>
      </div>

      {/* Score Breakdown Progress Bars */}
      <div className="p-6 rounded-2xl bg-[#0b1021] border border-slate-800 space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <Sliders className="w-4 h-4 text-purple-400" />
          Scoring Criteria Breakdown
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-xs">
          <div>
            <div className="flex justify-between mb-1 text-slate-300 font-semibold">
              <span>Content Impact & Action Verbs</span>
              <span className="text-purple-400">{analysis.score_breakdown.content_impact}/100</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full" style={{ width: `${analysis.score_breakdown.content_impact}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1 text-slate-300 font-semibold">
              <span>ATS Formatting & Hierarchy</span>
              <span className="text-emerald-400">{analysis.score_breakdown.ats_formatting}/100</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full" style={{ width: `${analysis.score_breakdown.ats_formatting}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1 text-slate-300 font-semibold">
              <span>Skills Breadth & Technology Alignment</span>
              <span className="text-blue-400">{analysis.score_breakdown.skills_breadth}/100</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full" style={{ width: `${analysis.score_breakdown.skills_breadth}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1 text-slate-300 font-semibold">
              <span>Brevity & Conciseness</span>
              <span className="text-cyan-400">{analysis.score_breakdown.brevity_conciseness}/100</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-cyan-400 h-full" style={{ width: `${analysis.score_breakdown.brevity_conciseness}%` }} />
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="flex justify-between mb-1 text-slate-300 font-semibold">
              <span>Section Completeness (Education, Experience, Projects)</span>
              <span className="text-indigo-400">{analysis.score_breakdown.sections_completeness}/100</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full" style={{ width: `${analysis.score_breakdown.sections_completeness}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* ATS Deep Dive: Formatting Issues, Missing Sections, Keyword Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Formatting Issues */}
        <div className="p-6 rounded-2xl bg-[#0b1021] border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            ATS Formatting Warnings
          </h4>
          <ul className="space-y-2 text-xs text-slate-300">
            {analysis.ats_formatting_issues.map((issue, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-400 shrink-0 font-bold">•</span>
                <span className="leading-relaxed">{issue}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Missing Sections */}
        <div className="p-6 rounded-2xl bg-[#0b1021] border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
            <XCircle className="w-4 h-4" />
            Missing or Weak Sections
          </h4>
          <ul className="space-y-2 text-xs text-slate-300">
            {analysis.ats_missing_sections.map((sec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-red-400 shrink-0 font-bold">•</span>
                <span className="leading-relaxed">{sec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* High-Value Keywords */}
        <div className="p-6 rounded-2xl bg-[#0b1021] border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Zap className="w-4 h-4" />
            High-Impact Keywords to Add
          </h4>
          <div className="flex flex-wrap gap-2 pt-1">
            {analysis.ats_keyword_suggestions.map((kw, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
              >
                + {kw}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Resume Quality Breakdown (Grammar, Summary, Experience, Projects, Skills) */}
      <div className="p-6 rounded-2xl bg-[#0b1021] border border-slate-800 space-y-4">
        <h3 className="font-bold text-white text-base">Resume Section Quality Audit</h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { label: 'Grammar & Tone', data: analysis.resume_quality.grammar_and_tone },
            { label: 'Summary', data: analysis.resume_quality.professional_summary },
            { label: 'Work Experience', data: analysis.resume_quality.experience_descriptions },
            { label: 'Key Projects', data: analysis.resume_quality.project_descriptions },
            { label: 'Skills Presentation', data: analysis.resume_quality.skills_presentation },
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
              <span className="text-slate-400 font-semibold block">{item.label}</span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-white">{item.data.score}/100</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  item.data.score >= 85 ? 'bg-emerald-500/10 text-emerald-400' :
                  item.data.score >= 70 ? 'bg-blue-500/10 text-blue-400' :
                  'bg-amber-500/10 text-amber-400'
                }`}>
                  {item.data.verdict}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{item.data.notes}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="p-6 rounded-2xl bg-[#0b1021] border border-emerald-500/20 space-y-3">
          <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Top Resume Strengths
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-300">
            {analysis.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                <span className="text-emerald-400 shrink-0 font-bold">✓</span>
                <span className="leading-relaxed">{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="p-6 rounded-2xl bg-[#0b1021] border border-amber-500/20 space-y-3">
          <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Vulnerabilities & Improvement Areas
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-300">
            {analysis.weaknesses.map((weak, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                <span className="text-amber-400 shrink-0 font-bold">!</span>
                <span className="leading-relaxed">{weak}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Prioritized Recommendations */}
      <div className="p-6 rounded-2xl bg-[#0b1021] border border-slate-800 space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <Target className="w-4 h-4 text-purple-400" />
          Prioritized Action Plan
        </h3>

        <div className="space-y-3">
          {analysis.recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-purple-500/30 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    rec.priority === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    rec.priority === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {rec.priority} Priority
                  </span>
                  <span className="text-xs font-semibold text-slate-400">[{rec.category}]</span>
                  <span className="text-xs font-bold text-white">{rec.title}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{rec.description}</p>
              </div>

              <button
                onClick={() => onNavigate('/improve')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white transition-all shrink-0"
              >
                Apply in Studio
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ATS Score Disclaimer Note */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-3">
        <HelpCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-300">ATS Estimation Disclaimer:</strong> {analysis.ats_disclaimer}
        </p>
      </div>
    </div>
  );
};
