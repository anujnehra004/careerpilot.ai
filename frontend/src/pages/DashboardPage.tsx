import React, { useEffect, useState } from 'react';
import {
  FileText,
  FileUp,
  FileSearch,
  Briefcase,
  MessagesSquare,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  AlertTriangle,
  Award,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DashboardStats } from '../types';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sample trend data for charts
  const performanceTrendData = [
    { name: 'Initial', score: 62, ats: 58 },
    { name: 'Rev 1', score: 71, ats: 72 },
    { name: 'Rev 2', score: 78, ats: 80 },
    { name: 'Current', score: stats?.average_resume_score || 84, ats: stats?.latest_ats_score || 86 },
  ];

  const radarMetrics = [
    { subject: 'Impact Verbs', score: 82, fullMark: 100 },
    { subject: 'ATS Structure', score: stats?.latest_ats_score || 86, fullMark: 100 },
    { subject: 'Tech Skills', score: 88, fullMark: 100 },
    { subject: 'Conciseness', score: 76, fullMark: 100 },
    { subject: 'Formatting', score: 92, fullMark: 100 },
    { subject: 'Completeness', score: 90, fullMark: 100 },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-[#0b1022] border border-purple-500/20 p-6 md:p-8 shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 border border-purple-500/30 text-purple-300">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Career Placement Readiness Score: 86%</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent">{user?.full_name || 'Candidate'}</span> 👋
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Your resume is optimized for high-growth tech roles. Review your latest ATS parseability scores, close active skill gaps, and run targeted mock interviews below.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('/upload')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all"
            >
              <FileUp className="w-4 h-4" />
              Upload Resume
            </button>
            <button
              onClick={() => onNavigate('/job-matcher')}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all"
            >
              <Briefcase className="w-4 h-4 text-blue-400" />
              Match Job
            </button>
          </div>
        </div>
      </div>

      {/* 4 Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Upload Resume',
            desc: 'Extract and parse PDF/Word',
            icon: FileUp,
            path: '/upload',
            color: 'from-purple-600/20 to-purple-800/10 border-purple-500/30 text-purple-400',
          },
          {
            title: 'Analyze Resume',
            desc: 'ATS score & quality audit',
            icon: FileSearch,
            path: '/analysis',
            color: 'from-blue-600/20 to-blue-800/10 border-blue-500/30 text-blue-400',
          },
          {
            title: 'Match Job Description',
            desc: 'Intersections & missing keywords',
            icon: Briefcase,
            path: '/job-matcher',
            color: 'from-cyan-600/20 to-cyan-800/10 border-cyan-500/30 text-cyan-400',
          },
          {
            title: 'Start Interview Practice',
            desc: 'AI-evaluated questions',
            icon: MessagesSquare,
            path: '/interview',
            color: 'from-emerald-600/20 to-emerald-800/10 border-emerald-500/30 text-emerald-400',
          },
        ].map((action, idx) => {
          const Icon = action.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigate(action.path)}
              className={`p-5 rounded-2xl bg-gradient-to-br ${action.color} border hover:border-white/40 cursor-pointer transition-all transform hover:-translate-y-1 shadow-lg group`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-slate-900/80 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-bold text-sm text-white">{action.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{action.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Key Metric Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Resumes */}
        <div className="p-6 rounded-2xl bg-[#0b1021] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Total Resumes</span>
            <FileText className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{stats?.total_resumes || 1}</span>
            <span className="text-xs text-emerald-400 font-medium">+1 this week</span>
          </div>
          <p className="text-xs text-slate-400">Target role: Full Stack Engineer</p>
        </div>

        {/* Latest ATS Score */}
        <div className="p-6 rounded-2xl bg-[#0b1021] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Latest ATS Score</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">{stats?.latest_ats_score || 86}</span>
            <span className="text-xs text-slate-400 font-medium">/ 100</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full" style={{ width: `${stats?.latest_ats_score || 86}%` }} />
          </div>
          <p className="text-[11px] text-slate-400">Estimated parser compatibility</p>
        </div>

        {/* Average Resume Score */}
        <div className="p-6 rounded-2xl bg-[#0b1021] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Average Resume Score</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{stats?.average_resume_score || 82}</span>
            <span className="text-xs text-slate-400 font-medium">/ 100</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full" style={{ width: `${stats?.average_resume_score || 82}%` }} />
          </div>
          <p className="text-[11px] text-slate-400">Content, impact, & conciseness</p>
        </div>

        {/* Total Interviews & Skills */}
        <div className="p-6 rounded-2xl bg-[#0b1021] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Skill Progress</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-cyan-400">{stats?.skill_progress_pct || 64}%</span>
            <span className="text-xs text-slate-400">({stats?.completed_skills_count || 5}/{stats?.total_skills_count || 8})</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-cyan-400 h-full" style={{ width: `${stats?.skill_progress_pct || 64}%` }} />
          </div>
          <p className="text-[11px] text-slate-400">Tracked in Skill Gap Analyzer</p>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Progression History Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0b1021] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Resume Score Progression</h3>
              <p className="text-xs text-slate-400">Historical performance across revisions and optimizations</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-purple-400">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                Overall Score
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                ATS Compatibility
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="atsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} domain={[40, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreGrad)" />
                <Area type="monotone" dataKey="ats" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#atsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart: Resume Dimensions */}
        <div className="p-6 rounded-2xl bg-[#0b1021] border border-slate-800 space-y-4">
          <div>
            <h3 className="font-bold text-white text-base">Scoring Dimensions</h3>
            <p className="text-xs text-slate-400">Balance across ATS, impact, and clarity</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarMetrics}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" tick={false} />
                <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recommended Improvements & Recent Analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Career Improvements */}
        <div className="p-6 rounded-2xl bg-[#0b1021] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-white text-base">Priority Recommendations</h3>
            </div>
            <button
              onClick={() => onNavigate('/analysis')}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
            >
              Full Analysis →
            </button>
          </div>

          <div className="space-y-3">
            {stats?.recommended_improvements.map((rec, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5 hover:border-purple-500/30 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{rec.title}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    rec.priority === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    rec.priority === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {rec.priority} Priority
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{rec.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Resume Analyses */}
        <div className="p-6 rounded-2xl bg-[#0b1021] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-white text-base">Recent Analyses</h3>
            </div>
            <button
              onClick={() => onNavigate('/history')}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
            >
              View History →
            </button>
          </div>

          <div className="space-y-3">
            {stats?.recent_analyses && stats.recent_analyses.length > 0 ? (
              stats.recent_analyses.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onNavigate('/analysis')}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between cursor-pointer hover:border-purple-500/30 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">{item.file_name}</p>
                      <p className="text-[10px] text-slate-400">Analyzed recently</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs font-extrabold text-white">{item.overall_score}/100</p>
                      <p className="text-[10px] text-emerald-400 font-semibold">ATS: {item.ats_compatibility_score}%</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                No previous resumes uploaded yet. Click &quot;Upload Resume&quot; to begin.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
