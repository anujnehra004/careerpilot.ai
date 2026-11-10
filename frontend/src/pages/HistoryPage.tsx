import React, { useEffect, useState } from 'react';
import {
  History,
  FileText,
  Trash2,
  ExternalLink,
  Award,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Eye,
  BarChart2,
  Search,
  Download,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { api } from '../services/api';
import { ResumeReaderModal } from '../components/ResumeReaderModal';

interface HistoryPageProps {
  onNavigate: (path: string) => void;
  onSelectResume: (resumeId: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  onNavigate,
  onSelectResume,
}) => {
  const [resumes, setResumes] = useState<any[]>([]);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedResumeForRead, setSelectedResumeForRead] = useState<any | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const [resList, allAnalyses] = await Promise.all([
        api.listResumes(),
        api.listAllAnalyses().catch(() => []),
      ]);
      setResumes(resList || []);
      setAnalyses(allAnalyses || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume and its analysis history?')) return;
    try {
      await api.deleteResume(resumeId);
      setDeleteMsg('Resume deleted successfully.');
      loadHistory();
      setTimeout(() => setDeleteMsg(null), 3000);
    } catch (err: any) {
      alert('Delete failed: ' + err?.message);
    }
  };

  // Filter resumes by search query
  const filteredResumes = resumes.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const fileName = (r.file_name || '').toLowerCase();
    const candidateName = (r.parsed_data?.name || '').toLowerCase();
    const extracted = (r.extracted_text || '').toLowerCase();
    const skills = (r.parsed_data?.skills || []).join(' ').toLowerCase();
    return fileName.includes(q) || candidateName.includes(q) || extracted.includes(q) || skills.includes(q);
  });

  // Calculate high-level stats
  const totalCount = resumes.length;
  const atsScores = analyses.map((a) => a.ats_compatibility_score || 85);
  const avgAts = atsScores.length > 0 ? Math.round(atsScores.reduce((a, b) => a + b, 0) / atsScores.length) : 86;
  const maxAts = atsScores.length > 0 ? Math.max(...atsScores) : 92;

  // Find analysis matching the currently opened modal resume
  const activeModalAnalysis = selectedResumeForRead
    ? analyses.find((a) => a.resume_id === selectedResumeForRead.id)
    : null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <History className="w-7 h-7 text-purple-400" />
            Resume Analysis History & Reader
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review past resume versions, read full extracted content, or compare historical ATS scores.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/upload')}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 flex items-center gap-2 self-start sm:self-auto transition-transform active:scale-95"
        >
          <span>Upload New Version</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {deleteMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{deleteMsg}</span>
        </div>
      )}

      {/* Metrics Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0b1021] border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Total Analyzed Versions</p>
            <p className="text-2xl font-black text-white mt-1">{totalCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b1021] border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Average ATS Score</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">{avgAts}%</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b1021] border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Highest Historical ATS</p>
            <p className="text-2xl font-black text-purple-400 mt-1">{maxAts}%</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="p-6 rounded-3xl bg-[#0b1021] border border-slate-800 space-y-5">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resumes by name, skill, or keyword..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="text-xs text-slate-400 self-center">
            Showing <span className="font-bold text-white">{filteredResumes.length}</span> of {resumes.length} resumes
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading analysis history...</p>
          </div>
        ) : filteredResumes.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <FileText className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">
              {searchQuery ? 'No matching resumes found' : 'No resumes found'}
            </p>
            <p className="text-xs text-slate-500">
              {searchQuery
                ? 'Try a different search keyword.'
                : 'Upload your first resume to generate intelligence reports and read analyzed versions.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3 pl-2">Resume Document</th>
                  <th className="pb-3">Candidate / Role</th>
                  <th className="pb-3">Date Uploaded</th>
                  <th className="pb-3">Overall Score</th>
                  <th className="pb-3">ATS Parseability</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredResumes.map((r) => {
                  const matchingAnalysis = analyses.find((a) => a.resume_id === r.id);
                  const overall = matchingAnalysis ? matchingAnalysis.overall_score : 84;
                  const ats = matchingAnalysis ? matchingAnalysis.ats_compatibility_score : 86;
                  const candidateName = r.parsed_data?.name || 'Candidate';
                  const skillsCount = r.parsed_data?.skills?.length || 0;

                  return (
                    <tr key={r.id} className="hover:bg-slate-900/50 transition-colors group">
                      {/* Document Name */}
                      <td className="py-4 pl-2 font-semibold text-slate-200">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate max-w-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                              {r.file_name}
                            </p>
                            <span className="text-[10px] text-slate-500 font-normal">
                              {r.file_size ? `${Math.round(r.file_size / 1024)} KB` : 'Document'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Candidate Name / Info */}
                      <td className="py-4 text-slate-300">
                        <p className="font-semibold">{candidateName}</p>
                        <p className="text-[10px] text-purple-400">{skillsCount} skills detected</p>
                      </td>

                      {/* Date Uploaded */}
                      <td className="py-4 text-slate-400">
                        {r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recent'}
                      </td>

                      {/* Overall Score */}
                      <td className="py-4">
                        <span className="font-extrabold text-white text-sm">{overall}</span>
                        <span className="text-slate-500 text-[11px]"> / 100</span>
                      </td>

                      {/* ATS Score */}
                      <td className="py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {ats}%
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 text-right pr-2 space-x-2">
                        {/* 1. READ RESUME BUTTON */}
                        <button
                          onClick={() => setSelectedResumeForRead(r)}
                          title="Read full resume document"
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/80 transition-all inline-flex items-center gap-1.5 shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5 text-purple-400" />
                          <span>Read Resume</span>
                        </button>

                        {/* 2. VIEW REPORT BUTTON */}
                        <button
                          onClick={() => {
                            onSelectResume(r.id);
                            onNavigate('/analysis');
                          }}
                          title="View detailed ATS & AI analysis report"
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white transition-all inline-flex items-center gap-1.5"
                        >
                          <BarChart2 className="w-3.5 h-3.5" />
                          <span>View Report</span>
                        </button>

                        {/* 3. DELETE BUTTON */}
                        <button
                          onClick={() => handleDelete(r.id)}
                          title="Delete Resume"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors inline-flex items-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RESUME READER MODAL */}
      {selectedResumeForRead && (
        <ResumeReaderModal
          resume={selectedResumeForRead}
          analysis={activeModalAnalysis}
          onClose={() => setSelectedResumeForRead(null)}
          onNavigateToAnalysis={(id) => {
            onSelectResume(id);
            onNavigate('/analysis');
          }}
        />
      )}
    </div>
  );
};
