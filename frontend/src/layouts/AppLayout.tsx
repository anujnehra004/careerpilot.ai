import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileUp,
  FileSearch,
  Briefcase,
  Sparkles,
  MessagesSquare,
  Compass,
  History,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Bot,
  Database,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { SystemHealth } from '../types';

interface AppLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentPath,
  onNavigate,
  children,
}) => {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [health, setHealth] = useState<SystemHealth | null>(null);

  useEffect(() => {
    api.getHealth()
      .then(setHealth)
      .catch(() => {
        // Fallback info if API hasn't loaded yet
        setHealth({
          status: 'online',
          service: 'CareerPilot AI',
          version: '1.0.0',
          environment: 'development',
          gemini: { configured: false, model: 'gemini-3.8-flash', mode: 'demo_fallback' },
          supabase: { configured: false, mode: 'memory_store' },
        });
      });
  }, []);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Upload Resume', path: '/upload', icon: FileUp },
    { label: 'ATS Analysis', path: '/analysis', icon: FileSearch },
    { label: 'Job Matcher', path: '/job-matcher', icon: Briefcase },
    { label: 'Resume Studio', path: '/improve', icon: Sparkles },
    { label: 'AI Interview Prep', path: '/interview', icon: MessagesSquare },
    { label: 'Skill Gap & Roadmap', path: '/skills', icon: Compass },
    { label: 'Analysis History', path: '/history', icon: History },
    { label: 'My Profile', path: '/profile', icon: User },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col md:flex-row antialiased selection:bg-purple-500 selection:text-white">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0d1322] border-b border-slate-800/80 sticky top-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('/')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-purple-300 bg-clip-text text-transparent">
            CareerPilot<span className="text-purple-400">.AI</span>
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar for Desktop */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#0a0f1d] border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('/')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-white block leading-tight">
                Career<span className="text-purple-400">Pilot</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-purple-300/70 font-semibold">
                AI Placement Suite
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  onNavigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white border border-purple-500/30 shadow-md shadow-purple-900/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-purple-400' : 'text-slate-400 group-hover:text-purple-300'
                  }`}
                />
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-purple-400" />}
              </button>
            );
          })}
        </div>

        {/* System Health / API Indicator */}
        <div className="p-3 mx-3 mb-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-medium flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              Gemini AI
            </span>
            {health?.gemini.configured ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live 3.8
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20" title="Add GEMINI_API_KEY to backend/.env">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Demo Mode
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-medium flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              Database
            </span>
            {health?.supabase.configured ? (
              <span className="text-[10px] text-emerald-400 font-medium">Supabase RLS</span>
            ) : (
              <span className="text-[10px] text-slate-400 font-medium">Local Storage</span>
            )}
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-800/80 flex items-center justify-between bg-[#080d1a]">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user?.full_name || 'User'}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-purple-500/30"
            />
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.full_name || 'Candidate'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || 'alex@careerpilot.ai'}</p>
            </div>
          </div>
          <button
            onClick={() => {
              signOut();
              onNavigate('/login');
            }}
            title="Sign out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        {/* Top bar on Desktop */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-[#0a0f1d]/60 backdrop-blur-md border-b border-slate-800/60 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Industry-Grade ATS & Interview Engine</span>
            </div>
            {!health?.gemini.configured && (
              <div
                onClick={() => onNavigate('/settings')}
                className="cursor-pointer px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1.5 hover:bg-amber-500/20 transition-colors"
                title="Click to view API settings"
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Demo AI Mode Active (Click to Configure API Key)</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('/upload')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-purple-600/25 flex items-center gap-2 transition-all"
            >
              <FileUp className="w-3.5 h-3.5" />
              Upload New Resume
            </button>
            <button
              onClick={() => onNavigate('/interview')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 flex items-center gap-2 transition-all"
            >
              <MessagesSquare className="w-3.5 h-3.5 text-blue-400" />
              Mock Interview
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
