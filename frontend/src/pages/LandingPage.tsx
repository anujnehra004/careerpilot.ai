import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileSearch,
  Briefcase,
  Zap,
  MessagesSquare,
  Compass,
  ChevronDown,
  Star,
  Award,
  TrendingUp,
  Cpu,
  Layers,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How accurate is the ATS compatibility score?',
      a: 'CareerPilot AI models the exact parsing algorithms used by modern Applicant Tracking Systems (Workday, Greenhouse, Lever, Taleo). It evaluates font structure, section hierarchies, tabular parsing vulnerability, and keyword frequency. While employer ATS setups vary, our score provides an industry-standard estimate to maximize your interview callback rate.'
    },
    {
      q: 'Does CareerPilot AI invent or fabricate experience on my resume?',
      a: 'Never. Our AI Resume Studio enhances your existing achievements using powerful action verbs, active voice, and quantified metrics structures (e.g. Google X-Y-Z formula), but strictly respects your actual background without fabricating companies, degrees, or unearned credentials.'
    },
    {
      q: 'What types of interview formats can I practice?',
      a: 'You can practice four targeted categories: Technical (Algorithms, System Design, REST APIs, Databases), HR/Screening, Behavioral (STAR method), and Project-Based deep dives. Questions are dynamically generated from your uploaded resume and target job role.'
    },
    {
      q: 'Are my resume files kept private and secure?',
      a: 'Yes. All user resumes and evaluations are safeguarded with PostgreSQL Row Level Security (RLS). Only your authenticated account has permission to view, edit, or delete your resumes and historical analyses.'
    },
    {
      q: 'Can I match my resume against any job description?',
      a: 'Absolutely. Simply paste any job posting from LinkedIn, Indeed, or company careers portals into our Job Matcher. The engine analyzes skill intersections, identifies missing keywords, and flags qualification gaps in seconds.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* Navbar */}
      <nav className="w-full border-b border-slate-800/80 bg-[#090e1c]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('/')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-purple-300 bg-clip-text text-transparent">
              CareerPilot<span className="text-purple-400">.AI</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-slate-300 font-medium">
            <a href="#features" className="hover:text-purple-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-purple-400 transition-colors">How It Works</a>
            <a href="#benefits" className="hover:text-purple-400 transition-colors">For Job Seekers</a>
            <a href="#faq" className="hover:text-purple-400 transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/login')}
              className="px-4 py-2 text-sm text-slate-300 hover:text-white font-medium transition-colors"
            >
              Log In
            </button>
            <button
              onClick={() => onNavigate('/dashboard')}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/25 transition-all"
            >
              Open Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-36">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-purple-600/20 via-indigo-600/20 to-blue-600/10 blur-[130px] pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-purple-500/10 border border-purple-500/30 text-purple-300 mb-8 shadow-inner">
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span>Powered by Google Gemini 3.8 Flash & Official Gen AI SDK</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.12]">
            Your Resume Deserves More Than a Guess.{' '}
            <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
              Get Career-Ready with AI.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Stop sending resumes into the black hole. Analyze ATS parseability, match job descriptions, improve bullet points with action metrics, and practice interactive mock interviews.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('/upload')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5"
            >
              <span>Analyze My Resume</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => onNavigate('/interview')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-medium bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition-all"
            >
              <MessagesSquare className="w-5 h-5 text-purple-400" />
              <span>Practice AI Interview</span>
            </button>
          </div>

          {/* Social Proof Stats */}
          <div className="mt-14 pt-10 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div>
              <p className="text-3xl font-extrabold text-white">88%</p>
              <p className="text-xs text-slate-400 mt-1">Average ATS Callback Boost</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-purple-400">10,000+</p>
              <p className="text-xs text-slate-400 mt-1">Resumes Analyzed</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-cyan-400">4 Formats</p>
              <p className="text-xs text-slate-400 mt-1">Tech, HR & Behavioral Prep</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-emerald-400">100%</p>
              <p className="text-xs text-slate-400 mt-1">Data Privacy with Supabase RLS</p>
            </div>
          </div>
        </div>

        {/* Animated Product Preview Dashboard Card */}
        <div className="mt-16 max-w-5xl mx-auto px-6">
          <div className="p-3 rounded-2xl bg-gradient-to-b from-slate-700/40 via-slate-800/20 to-transparent border border-slate-700/50 shadow-2xl">
            <div className="rounded-xl bg-[#0b1021] border border-slate-800 p-6 sm:p-8 space-y-6">
              {/* Fake top bar */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs text-slate-400 ml-2 font-mono">careerpilot.ai/live-analysis</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ATS Match Ready: 86/100
                </div>
              </div>

              {/* Preview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Overall Resume Score</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-white">84</span>
                    <span className="text-slate-400 font-medium">/ 100</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full w-[84%]" />
                  </div>
                  <p className="text-[11px] text-slate-400">Above average for Full Stack & Cloud roles.</p>
                </div>

                <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">ATS Parseability</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-emerald-400">92%</span>
                    <span className="text-xs text-emerald-300 font-medium bg-emerald-500/10 px-2 py-0.5 rounded">Optimal</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full w-[92%]" />
                  </div>
                  <p className="text-[11px] text-slate-400">Clean single-column parsing format detected.</p>
                </div>

                <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Target Role Match</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-purple-400">79%</span>
                    <span className="text-xs text-purple-300 font-medium bg-purple-500/10 px-2 py-0.5 rounded">High Alignment</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full w-[79%]" />
                  </div>
                  <p className="text-[11px] text-slate-400">14 matching skills, 3 keywords recommended.</p>
                </div>
              </div>

              {/* Action Verbs Preview */}
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white">AI Suggestion: Transform Passive Bullet Points</p>
                    <p className="text-xs text-slate-400">Turn &quot;Assisted in backend tasks&quot; into &quot;Architected FastAPI microservices reducing query latency by 35%&quot;.</p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('/improve')}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shrink-0"
                >
                  Try Studio
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[#090d1a] border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-purple-400">End-to-End Placement Suite</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              Everything You Need to Land Your Dream Offer
            </p>
            <p className="text-slate-400 mt-4 text-sm sm:text-base">
              Engineered for students, recent graduates, and career changers preparing for competitive technology and corporate hiring cycles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-7 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <FileSearch className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mt-5">Algorithmic ATS Analyzer</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Scan your resume against modern ATS parser requirements. Detect missing sections, unparseable tables, and low-density keyword zones before applying.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mt-5">Job Description Matcher</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Paste any job posting. Our engine matches your skills against employer requirements, highlights missing keywords, and flags qualification gaps.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mt-5">Resume Improvement Studio</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Side-by-side rewriting of executive summaries and bullet points. Automatically inject powerful action verbs and quantifiable results placeholders.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <MessagesSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mt-5">AI Mock Interview Simulator</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Engage in one-on-one simulated interviews for Technical, HR, and Behavioral rounds. Receive immediate grading, feedback, and model benchmark answers.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mt-5">Skill Gap & Learning Roadmap</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Discover the exact technical and soft skills your resume is lacking for your target role. Track acquired skills and follow a 4-phase learning roadmap.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-pink-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-pink-600/10 border border-pink-500/20 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mt-5">Enterprise Security & Privacy</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Protected by PostgreSQL Row Level Security (RLS). Your resume data is isolated and strictly confidential—never shared or used for public model training.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-[#070a13]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-purple-400">Streamlined Process</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              Three Steps to Interview Readiness
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
              <div className="w-10 h-10 rounded-full bg-purple-600/20 text-purple-400 font-bold flex items-center justify-center text-lg border border-purple-500/30">
                1
              </div>
              <h4 className="text-xl font-bold text-white">Upload & Extract</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Drop your PDF or DOCX file. Our PyMuPDF parser extracts sections, education, skills, and work history within milliseconds.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
              <div className="w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center text-lg border border-indigo-500/30">
                2
              </div>
              <h4 className="text-xl font-bold text-white">Deep AI Analysis & Match</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Gemini evaluates ATS score, identifies keyword gaps, grades grammar and descriptions, and prioritizes your highest-yield improvements.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
              <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-lg border border-blue-500/30">
                3
              </div>
              <h4 className="text-xl font-bold text-white">Polish & Practice</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Upgrade bullet points in the Resume Studio, fill identified skill gaps with our roadmap, and master questions in mock interview simulations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits for Students & Job Seekers */}
      <section id="benefits" className="py-24 bg-[#090d1a] border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20 mb-4">
                <Award className="w-3.5 h-3.5 text-blue-400" />
                <span>Placement Advantage</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Designed Specifically for Competitive Tech Placement
              </h2>
              <p className="text-slate-300 mt-4 leading-relaxed text-sm sm:text-base">
                Campus placement cells and online job boards are flooded with hundreds of identical applicants. CareerPilot AI equips you with the exact technical language and recruiter-tested structure needed to stand out.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  'Turn vague project descriptions into quantified engineering accomplishments.',
                  'Know your ATS parseability score before submitting to top tier companies.',
                  'Prepare for technical questions tailored precisely to your own resume projects.',
                  'Bridge knowledge gaps with step-by-step role roadmaps.'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-200">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <button
                  onClick={() => onNavigate('/upload')}
                  className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/30 inline-flex items-center gap-2 transition-all"
                >
                  <span>Start Free Analysis</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-tr from-purple-900/20 via-slate-900 to-indigo-900/20 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-sm text-purple-400 font-bold">
                <TrendingUp className="w-4 h-4" />
                <span>Real Placement Outcome Impact</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-sm space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Before CareerPilot</span>
                  <span className="text-red-400 font-bold">ATS Score: 54/100</span>
                </div>
                <p className="text-xs text-slate-300 italic">
                  &quot;Responsible for frontend web app development and fixing bugs.&quot;
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-sm space-y-2">
                <div className="flex items-center justify-between text-xs text-emerald-300">
                  <span className="font-semibold">After CareerPilot Studio</span>
                  <span className="text-emerald-400 font-bold">ATS Score: 89/100</span>
                </div>
                <p className="text-xs text-emerald-200 font-medium">
                  &quot;Architected modular React/TypeScript client with state caching, reducing load latency by 42% and eliminating 85+ production defects.&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-[#070a13] border-t border-slate-800/80">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-purple-400">Frequently Asked Questions</h2>
            <p className="text-3xl font-extrabold text-white mt-2">Everything You Need to Know</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between text-white font-semibold text-sm hover:text-purple-300 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-purple-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-slate-300 leading-relaxed border-t border-slate-800/50 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-20 bg-gradient-to-b from-[#090e1e] to-[#060810] border-t border-slate-800/80 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl sm:text-5xl font-black text-white">
            Ready to Accelerate Your Career?
          </h2>
          <p className="text-slate-300 mt-4 max-w-xl mx-auto text-sm sm:text-base">
            Upload your resume now for an instant ATS scan and interview prep session.
          </p>
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => onNavigate('/upload')}
              className="px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-xl shadow-purple-600/30 flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5"
            >
              <span>Analyze My Resume Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-[#05070e] border-t border-slate-900 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="font-bold text-slate-300">CareerPilot AI</span>
            <span>— Intelligent Resume Analyzer & Placement Assistant</span>
          </div>
          <div className="flex items-center gap-6 text-slate-400">
            <span className="hover:text-white cursor-pointer" onClick={() => onNavigate('/dashboard')}>Dashboard</span>
            <span className="hover:text-white cursor-pointer" onClick={() => onNavigate('/interview')}>Interview</span>
            <span className="hover:text-white cursor-pointer" onClick={() => onNavigate('/settings')}>API Status</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
