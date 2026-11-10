import React, { useState, useEffect } from 'react';
import {
  Compass,
  Sparkles,
  CheckCircle2,
  Circle,
  Award,
  Layers,
  ArrowRight,
  TrendingUp,
  BookOpen,
  Calendar,
  Check,
  ChevronDown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { api } from '../services/api';
import { SkillGapResponse } from '../types';

interface SkillGapPageProps {
  onNavigate: (path: string) => void;
  activeResumeId?: string | null;
}

export const SkillGapPage: React.FC<SkillGapPageProps> = ({
  onNavigate,
  activeResumeId,
}) => {
  const [targetRole, setTargetRole] = useState<string>('Full Stack Engineer');
  const [data, setData] = useState<SkillGapResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [completedSkills, setCompletedSkills] = useState<Record<string, boolean>>({
    'Docker': true,
    'Git': true,
    'TypeScript': true,
    'REST APIs': true,
  });

  useEffect(() => {
    loadSkillProfile();
  }, [targetRole]);

  const loadSkillProfile = async () => {
    setLoading(true);
    try {
      const res = await api.getSkillProfile(targetRole, activeResumeId || undefined);
      setData(res);
    } catch (err) {
      console.error('Failed to load skill profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSkill = async (skill: string) => {
    try {
      const res = await api.toggleSkill(skill);
      setCompletedSkills((prev) => ({
        ...prev,
        [skill]: res.is_completed,
      }));
    } catch {
      // Local fallback toggle
      setCompletedSkills((prev) => ({
        ...prev,
        [skill]: !prev[skill],
      }));
    }
  };

  const chartData = [
    { name: 'Core Languages', match: 90, required: 100 },
    { name: 'Frontend Frameworks', match: 85, required: 100 },
    { name: 'Database & SQL', match: 80, required: 100 },
    { name: 'Cloud & Docker', match: 50, required: 100 },
    { name: 'System Design', match: 60, required: 100 },
    { name: 'CI/CD Pipelines', match: 45, required: 100 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Compass className="w-7 h-7 text-cyan-400" />
            Career Skill Gap Analyzer & Learning Roadmap
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Compare your resume skills against industry requirements, flag missing capabilities, and follow a personalized curriculum.
          </p>
        </div>

        <select
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none focus:border-cyan-500"
        >
          <option value="Full Stack Engineer">Role: Full Stack Engineer</option>
          <option value="Backend Architect">Role: Backend Architect</option>
          <option value="Frontend Specialist">Role: Frontend Specialist</option>
          <option value="AI / ML Engineer">Role: AI / ML Engineer</option>
          <option value="DevOps & Cloud Engineer">Role: DevOps & Cloud</option>
        </select>
      </div>

      {loading || !data ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading career gap analysis...</div>
      ) : (
        <div className="space-y-8">
          {/* Readiness Score Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/30 via-blue-950/20 to-[#0b1021] border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex flex-col items-center justify-center text-cyan-400 shadow-lg shrink-0">
                <span className="text-3xl font-black">{data.match_percentage}%</span>
                <span className="text-[10px] uppercase font-bold text-slate-400">Readiness</span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">{data.target_role}</span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {data.match_percentage >= 75 ? 'Strong Role Readiness' : 'Clear Bridgeable Gap Detected'}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  You possess {data.resume_skills.length} confirmed skills from your resume with {data.missing_technical_skills.length} technical competencies remaining to acquire.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('/interview')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/25 flex items-center gap-2 transition-all shrink-0"
            >
              <span>Practice Questions on Missing Skills</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Categorized Skills (Technical vs Soft Skills) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Technical Skills Gap */}
            <div className="p-6 rounded-2xl bg-[#0b1021] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Technical Competencies
                </h3>
                <span className="text-[11px] text-slate-400">Click to toggle acquired</span>
              </div>

              <div className="space-y-2">
                {data.required_technical_skills.map((skill, idx) => {
                  const isAcquired = completedSkills[skill] || data.resume_skills.some(s => s.toLowerCase() === skill.toLowerCase());
                  return (
                    <div
                      key={idx}
                      onClick={() => handleToggleSkill(skill)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isAcquired
                          ? 'border-emerald-500/30 bg-emerald-950/20 text-slate-200'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-semibold">{skill}</span>
                      <div className="flex items-center gap-2">
                        {isAcquired ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                            <Check className="w-3.5 h-3.5" />
                            Acquired
                          </span>
                        ) : (
                          <span className="text-[11px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded">
                            Missing
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Soft Skills & Visual Comparison Chart */}
            <div className="space-y-6">
              {/* Soft Skills */}
              <div className="p-6 rounded-2xl bg-[#0b1021] border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Leadership & Behavioral Competencies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data.required_soft_skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bar Chart Visualization */}
              <div className="p-6 rounded-2xl bg-[#0b1021] border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Competency Domain Coverage</h3>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={9} domain={[0, 100]} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '0.5rem',
                          fontSize: '11px',
                          color: '#fff',
                        }}
                      />
                      <Bar dataKey="match" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* 4-Phase Structured Learning Roadmap */}
          <div className="p-6 md:p-8 rounded-3xl bg-[#0b1021] border border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Curriculum</span>
                <h3 className="text-xl font-bold text-white mt-0.5">4-Phase Role Learning Roadmap</h3>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>Estimated Duration: 10-12 Weeks</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.roadmap.map((step, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded text-[11px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {step.phase} • {step.duration}
                    </span>
                  </div>

                  <h4 className="font-bold text-white text-sm">{step.title}</h4>

                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Key Concepts:</span>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {step.topics.map((t, tIdx) => (
                        <li key={tIdx}>• {t}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-xs">
                    <span className="text-[11px] font-semibold text-cyan-400 block mb-1">Recommended Milestone Project:</span>
                    <p className="text-slate-300 italic">{step.suggested_projects[0]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
