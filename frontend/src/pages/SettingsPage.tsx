import React, { useEffect, useState } from 'react';
import {
  Settings,
  Bot,
  Database,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Terminal,
  Cpu,
  Key,
} from 'lucide-react';
import { api } from '../services/api';
import { SystemHealth } from '../types';

export const SettingsPage: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    refreshHealth();
  }, []);

  const refreshHealth = async () => {
    setLoading(true);
    try {
      const data = await api.getHealth();
      setHealth(data);
    } catch {
      setHealth({
        status: 'online',
        service: 'CareerPilot AI',
        version: '1.0.0',
        environment: 'development',
        gemini: { configured: false, model: 'gemini-3.8-flash', mode: 'demo_fallback' },
        supabase: { configured: false, mode: 'memory_store' },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearLocalSession = () => {
    localStorage.removeItem('careerpilot_active_resume_id');
    alert('Active resume cache cleared.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Settings className="w-7 h-7 text-slate-300" />
          System Settings & Cloud Integration
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Inspect backend service health, AI model configuration, and database connectivity.
        </p>
      </div>

      {/* Integration Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Google Gemini Card */}
        <div className="p-6 rounded-3xl bg-[#0b1021] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Google Gemini AI</h3>
                <p className="text-[11px] text-slate-400">Official Google Gen AI SDK</p>
              </div>
            </div>

            {health?.gemini.configured ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Live AI Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <AlertTriangle className="w-3.5 h-3.5" />
                Demo Mode
              </span>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Active Model</span>
              <span className="text-white font-mono">{health?.gemini.model || 'gemini-3.8-flash'}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Execution Mode</span>
              <span className="text-purple-300 font-semibold">{health?.gemini.mode}</span>
            </div>
          </div>

          <div className="text-xs text-slate-400 space-y-2">
            <p className="leading-relaxed">
              To enable live AI resume analysis, add your Gemini API key to <code className="text-purple-300 bg-purple-950/40 px-1 py-0.5 rounded font-mono">backend/.env</code>:
            </p>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 select-all">
              GEMINI_API_KEY=your_key_here
            </div>
            <a
              href="https://aistudio.google.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-semibold"
            >
              <span>Get free Gemini API Key from Google AI Studio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Supabase Database Card */}
        <div className="p-6 rounded-3xl bg-[#0b1021] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Supabase PostgreSQL</h3>
                <p className="text-[11px] text-slate-400">Row Level Security & Auth</p>
              </div>
            </div>

            {health?.supabase.configured ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                PostgreSQL RLS Live
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                Local In-Memory
              </span>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Database Mode</span>
              <span className="text-white font-mono">{health?.supabase.mode}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Migration File</span>
              <span className="text-blue-300 font-mono text-[11px]">supabase/migrations/20261104_init.sql</span>
            </div>
          </div>

          <div className="text-xs text-slate-400 space-y-2">
            <p className="leading-relaxed">
              When ready for multi-tenant production storage, enter your Supabase URL & anon key in <code className="text-blue-300 bg-blue-950/40 px-1 py-0.5 rounded font-mono">backend/.env</code>:
            </p>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 select-all">
              SUPABASE_URL=https://...<br />
              SUPABASE_KEY=...
            </div>
            <a
              href="https://supabase.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              <span>Visit Supabase Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Developer API Tools */}
      <div className="p-6 rounded-3xl bg-[#0b1021] border border-slate-800 space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Terminal className="w-4 h-4 text-purple-400" />
          Developer REST Documentation
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          CareerPilot AI exposes documented OpenAPI 3.0 / Swagger interactive endpoints for resume upload, ATS parsing, and interview generation.
        </p>
        <div className="flex items-center gap-3">
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-2 transition-all shadow-md shadow-purple-600/25"
          >
            <span>Open Swagger UI (/docs)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={handleClearLocalSession}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          >
            Clear Active Resume Cache
          </button>
        </div>
      </div>
    </div>
  );
};
