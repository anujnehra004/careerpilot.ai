import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Check,
  X,
  Copy,
  CheckCheck,
  RefreshCw,
  Wand2,
  FileText,
  Sliders,
  Zap,
  Info,
} from 'lucide-react';
import { api } from '../services/api';
import { ImproveResumeResponse } from '../types';

interface ResumeImprovePageProps {
  onNavigate: (path: string) => void;
}

export const ResumeImprovePage: React.FC<ResumeImprovePageProps> = ({ onNavigate }) => {
  const [section, setSection] = useState<string>('experience_bullet');
  const [targetRole, setTargetRole] = useState<string>('Full Stack Engineer');
  const [instruction, setInstruction] = useState<string>('Make it more impactful with action verbs and quantifiable results.');
  const [originalText, setOriginalText] = useState<string>(
    'Worked on building frontend components in React and handled backend API calls with FastAPI to store data in database.'
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [improvedResult, setImprovedResult] = useState<ImproveResumeResponse | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [accepted, setAccepted] = useState<boolean | null>(null);

  const handleImprove = async () => {
    if (!originalText.trim()) return;
    setLoading(true);
    setAccepted(null);
    try {
      const res = await api.improveContent({
        section,
        original_text: originalText,
        target_role: targetRole,
        instruction,
      });
      setImprovedResult(res);
    } catch (err) {
      console.error('Improvement error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!improvedResult) return;
    navigator.clipboard.writeText(improvedResult.improved_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Sparkles className="w-7 h-7 text-purple-400" />
          Resume Improvement Studio
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Elevate bullet points and summaries from passive task descriptions to compelling, quantifiable achievements using active recruiter verbs.
        </p>
      </div>

      {/* Control Configuration Bar */}
      <div className="p-6 rounded-2xl bg-[#0b1021] border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Section Type</label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="experience_bullet">Work Experience Bullet Point</option>
              <option value="project_bullet">Project Description Bullet</option>
              <option value="summary">Professional Summary / Objective</option>
              <option value="achievement">Achievement / Award Entry</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Role</label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Full Stack Engineer"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Optimization Goal</label>
            <select
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="Make it more impactful with action verbs and quantifiable results.">
                Quantify Impact & Strong Verbs
              </option>
              <option value="Make descriptions more concise, eliminating filler words.">
                Maximum Concision & Brevity
              </option>
              <option value="Elevate to executive senior engineering leadership tone.">
                Senior / Leadership Tone
              </option>
              <option value="Optimize for ATS keywords and cloud infrastructure terminology.">
                ATS & Cloud Keyword Optimization
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Editor & Comparison Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Content Input */}
        <div className="p-6 rounded-2xl bg-[#0b1021] border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Original Content
              </span>
              <button
                type="button"
                onClick={() => setOriginalText('Engineered REST APIs in Python and built React components for search filtering.')}
                className="text-[11px] text-purple-400 hover:text-purple-300"
              >
                Insert Sample
              </button>
            </div>
            <textarea
              rows={8}
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              placeholder="Paste the bullet point or professional summary you wish to improve..."
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono leading-relaxed resize-none"
            />
          </div>

          <button
            onClick={handleImprove}
            disabled={loading}
            className="w-full py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Wand2 className="w-4 h-4" />
            {loading ? 'Crafting High-Impact Rewrite...' : 'Generate AI-Improved Version'}
          </button>
        </div>

        {/* AI Improved Content Result */}
        <div className="p-6 rounded-2xl bg-[#0b1021] border border-purple-500/30 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI-Suggested Content
              </span>
              {improvedResult && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  >
                    {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              )}
            </div>

            {improvedResult ? (
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-100 font-medium leading-relaxed min-h-[160px] flex items-center">
                &quot;{improvedResult.improved_text}&quot;
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-500 text-center min-h-[160px] flex flex-col items-center justify-center gap-2">
                <Wand2 className="w-6 h-6 text-slate-600" />
                <span>Click &quot;Generate AI-Improved Version&quot; to view side-by-side enhancements.</span>
              </div>
            )}
          </div>

          {/* Accept / Reject Buttons */}
          {improvedResult && (
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setAccepted(true)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  accepted === true
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>{accepted === true ? 'Suggestion Accepted!' : 'Accept Suggestion'}</span>
              </button>
              <button
                onClick={() => setAccepted(false)}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  accepted === false
                    ? 'bg-slate-700 text-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                }`}
              >
                <X className="w-4 h-4" />
                <span>Dismiss</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Changes Breakdown & Action Verbs */}
      {improvedResult && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Action Verbs */}
          <div className="p-5 rounded-2xl bg-[#0b1021] border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Action Verbs Injected
            </h4>
            <div className="flex flex-wrap gap-2">
              {improvedResult.action_verbs_used.map((verb, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                >
                  {verb}
                </span>
              ))}
            </div>
          </div>

          {/* Key Changes */}
          <div className="p-5 rounded-2xl bg-[#0b1021] border border-slate-800 space-y-3 md:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Key Enhancements Applied
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {improvedResult.key_changes.map((change, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
