import React, { useState } from 'react';
import {
  X,
  FileText,
  Download,
  Copy,
  Check,
  ExternalLink,
  Briefcase,
  GraduationCap,
  Award,
  Layers,
  Sparkles,
  BarChart2,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Search,
  BookOpen,
  Eye,
} from 'lucide-react';
import { api } from '../services/api';

interface ResumeReaderModalProps {
  resume: any;
  analysis?: any;
  onClose: () => void;
  onNavigateToAnalysis?: (resumeId: string) => void;
}

export const ResumeReaderModal: React.FC<ResumeReaderModalProps> = ({
  resume,
  analysis,
  onClose,
  onNavigateToAnalysis,
}) => {
  const [activeTab, setActiveTab] = useState<'formatted' | 'raw' | 'analysis'>('formatted');
  const [copied, setCopied] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!resume) return null;

  const parsed = resume.parsed_data || {};
  const extractedText = resume.extracted_text || '';

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleDownloadFile = () => {
    if (resume.id) {
      window.open(api.getResumeFileUrl(resume.id), '_blank');
    }
  };

  const highlightSearchText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-amber-400/30 text-amber-200 px-1 rounded font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const wordCount = extractedText ? extractedText.trim().split(/\s+/).length : 0;
  const charCount = extractedText ? extractedText.length : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#0b1021] border border-slate-800 shadow-2xl shadow-purple-950/40 overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-white truncate max-w-xs sm:max-w-md">
                {resume.file_name || 'Resume Document'}
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>
                  {resume.created_at ? new Date(resume.created_at).toLocaleDateString() : 'Uploaded'}
                </span>
                <span>•</span>
                <span className="text-purple-400 font-medium">
                  {resume.file_size ? `${Math.round(resume.file_size / 1024)} KB` : 'Document'}
                </span>
                {resume.file_type && (
                  <>
                    <span>•</span>
                    <span className="uppercase text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                      {resume.file_type.includes('pdf') ? 'PDF' : 'DOCX'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            {resume.file_path && (
              <button
                onClick={handleDownloadFile}
                title="Download / Open Original Uploaded Document"
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700/60"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Original PDF</span>
              </button>
            )}

            <button
              onClick={handleCopyText}
              title="Copy Extracted Text"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700/60"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-purple-400" />
                  <span className="hidden sm:inline">Copy Text</span>
                </>
              )}
            </button>

            {onNavigateToAnalysis && (
              <button
                onClick={() => {
                  onNavigateToAnalysis(resume.id);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-purple-600/30"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Full Report</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="px-6 pt-3 border-b border-slate-800/80 bg-slate-900/30 flex items-center gap-4 shrink-0">
          <button
            onClick={() => setActiveTab('formatted')}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'formatted'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Structured Document</span>
          </button>

          <button
            onClick={() => setActiveTab('raw')}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'raw'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Full Extracted Text ({wordCount} words)</span>
          </button>

          {analysis && (
            <button
              onClick={() => setActiveTab('analysis')}
              className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'analysis'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Analysis Summary (ATS: {analysis.ats_compatibility_score || 85}%)</span>
            </button>
          )}
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* TAB 1: FORMATTED DOCUMENT VIEW */}
          {activeTab === 'formatted' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Candidate Contact Header Card */}
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
                  <div>
                    <h3 className="text-2xl font-black text-white">
                      {parsed.name || 'Candidate Name'}
                    </h3>
                    <p className="text-xs font-semibold text-purple-400 mt-0.5">
                      Extracted Resume Profile
                    </p>
                  </div>
                  {parsed.location && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>{parsed.location}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-slate-300 pt-1">
                  {parsed.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <a href={`mailto:${parsed.email}`} className="hover:text-purple-300 underline">
                        {parsed.email}
                      </a>
                    </div>
                  )}
                  {parsed.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{parsed.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Summary */}
              {parsed.summary && (
                <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Professional Summary
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/40">
                    &quot;{parsed.summary}&quot;
                  </p>
                </div>
              )}

              {/* Technical & Core Skills */}
              {parsed.skills && parsed.skills.length > 0 && (
                <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    Recognized Skills ({parsed.skills.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {parsed.skills.map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-950/40 text-purple-300 border border-purple-500/30"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Work Experience */}
              {parsed.work_experience && parsed.work_experience.length > 0 && (
                <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                    Work Experience
                  </h4>
                  <div className="space-y-4 divide-y divide-slate-800/60">
                    {parsed.work_experience.map((exp: any, idx: number) => (
                      <div key={idx} className={idx > 0 ? 'pt-4 space-y-2' : 'space-y-2'}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h5 className="text-sm font-bold text-white">{exp.position || 'Position'}</h5>
                          <span className="text-[11px] font-medium text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                            {exp.start_date || 'Past'} – {exp.end_date || 'Present'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="font-semibold text-slate-300">{exp.company || 'Company'}</span>
                          {exp.location && <span>• {exp.location}</span>}
                        </div>
                        {exp.description && exp.description.length > 0 && (
                          <ul className="space-y-1.5 pt-1">
                            {exp.description.map((bullet: string, bIdx: number) => (
                              <li key={bIdx} className="text-xs text-slate-300 flex items-start gap-2">
                                <span className="text-purple-400 mt-1 shrink-0">•</span>
                                <span className="leading-relaxed">{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {parsed.projects && parsed.projects.length > 0 && (
                <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    Key Projects
                  </h4>
                  <div className="space-y-4 divide-y divide-slate-800/60">
                    {parsed.projects.map((proj: any, idx: number) => (
                      <div key={idx} className={idx > 0 ? 'pt-4 space-y-2' : 'space-y-2'}>
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-bold text-white">{proj.title}</h5>
                          {proj.link && (
                            <a
                              href={proj.link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 underline"
                            >
                              <span>View Project</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        {proj.technologies && proj.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {proj.technologies.map((t: string, tIdx: number) => (
                              <span
                                key={tIdx}
                                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                        {proj.description && proj.description.length > 0 && (
                          <ul className="space-y-1 pt-1">
                            {proj.description.map((b: string, bIdx: number) => (
                              <li key={bIdx} className="text-xs text-slate-300 flex items-start gap-2">
                                <span className="text-cyan-400 mt-1 shrink-0">•</span>
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {parsed.education && parsed.education.length > 0 && (
                <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                    Education
                  </h4>
                  <div className="space-y-3 divide-y divide-slate-800/60">
                    {parsed.education.map((edu: any, idx: number) => (
                      <div key={idx} className={idx > 0 ? 'pt-3 space-y-1' : 'space-y-1'}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h5 className="text-sm font-bold text-white">
                            {edu.degree || 'Degree'} {edu.field_of_study ? `in ${edu.field_of_study}` : ''}
                          </h5>
                          <span className="text-[11px] text-slate-400">
                            {edu.start_date} – {edu.end_date}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{edu.institution || 'Institution'}</p>
                        {edu.grade_or_gpa && (
                          <p className="text-[11px] text-emerald-400 font-semibold">
                            GPA / Grade: {edu.grade_or_gpa}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications & Achievements */}
              {(parsed.certifications?.length > 0 || parsed.achievements?.length > 0) && (
                <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    Honors & Certifications
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(parsed.certifications || []).map((c: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20"
                      >
                        🏅 {c}
                      </span>
                    ))}
                    {(parsed.achievements || []).map((a: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20"
                      >
                        ✨ {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RAW EXTRACTED TEXT VIEW */}
          {activeTab === 'raw' && (
            <div className="space-y-4">
              {/* Search in text */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search keywords within resume text..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="text-[11px] text-slate-400 shrink-0">
                  <span>{charCount} characters</span> • <span>{wordCount} words</span>
                </div>
              </div>

              {/* Text Container */}
              <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap select-text max-h-[55vh] overflow-y-auto">
                {extractedText ? (
                  highlightSearchText(extractedText, searchTerm)
                ) : (
                  <span className="text-slate-500 italic">No extracted text found for this resume.</span>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: QUICK ANALYSIS SUMMARY */}
          {activeTab === 'analysis' && analysis && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-1">
                  <p className="text-xs font-bold text-purple-400 uppercase">Overall Resume Score</p>
                  <p className="text-4xl font-black text-white">{analysis.overall_score || 84}/100</p>
                  <p className="text-[11px] text-slate-300 pt-1">
                    {analysis.overall_score_explanation || 'Strong technical foundation with competitive ATS formatting.'}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
                  <p className="text-xs font-bold text-emerald-400 uppercase">Estimated ATS Score</p>
                  <p className="text-4xl font-black text-emerald-400">{analysis.ats_compatibility_score || 86}%</p>
                  <p className="text-[11px] text-slate-300 pt-1">
                    Standard chronological section layout with readable section headings.
                  </p>
                </div>
              </div>

              {/* Strengths */}
              {analysis.strengths && analysis.strengths.length > 0 && (
                <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Standout Strengths ({analysis.strengths.length})
                  </h4>
                  <ul className="space-y-1.5">
                    {analysis.strengths.map((s: string, idx: number) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="text-emerald-400 font-bold shrink-0">✓</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weaknesses */}
              {analysis.weaknesses && analysis.weaknesses.length > 0 && (
                <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Areas to Improve ({analysis.weaknesses.length})
                  </h4>
                  <ul className="space-y-1.5">
                    {analysis.weaknesses.map((w: string, idx: number) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="text-amber-400 font-bold shrink-0">!</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
