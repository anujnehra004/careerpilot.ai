import React, { useState, useEffect } from 'react';
import {
  MessagesSquare,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  RotateCcw,
  Award,
  Zap,
  Target,
  Clock,
  ThumbsUp,
  TrendingUp,
} from 'lucide-react';
import { api } from '../services/api';
import {
  InterviewStartResponse,
  InterviewAnswerResponse,
  InterviewQuestion,
} from '../types';

interface InterviewPrepPageProps {
  onNavigate: (path: string) => void;
  activeResumeId?: string | null;
}

export const InterviewPrepPage: React.FC<InterviewPrepPageProps> = ({
  onNavigate,
  activeResumeId,
}) => {
  // Session configuration
  const [interviewType, setInterviewType] = useState<string>('Technical');
  const [difficulty, setDifficulty] = useState<string>('Intermediate');
  const [targetRole, setTargetRole] = useState<string>('Full Stack Software Engineer');

  // Active session states
  const [session, setSession] = useState<InterviewStartResponse | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [answerEvaluation, setAnswerEvaluation] = useState<InterviewAnswerResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [sessionAnswers, setSessionAnswers] = useState<Array<{ q: InterviewQuestion; a: string; eval: InterviewAnswerResponse }>>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const startSession = async () => {
    setLoading(true);
    setAnswerEvaluation(null);
    setSessionAnswers([]);
    setIsCompleted(false);
    setUserAnswer('');
    try {
      const res = await api.startInterview({
        resume_id: activeResumeId || 'demo-resume-01',
        interview_type: interviewType,
        difficulty: difficulty,
        target_role: targetRole,
        num_questions: 5,
      });
      setSession(res);
      setCurrentQuestion(res.first_question);
    } catch (err) {
      console.error('Failed to start interview:', err);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim() || !session || !currentQuestion) return;
    setEvaluating(true);
    try {
      const evalRes = await api.submitInterviewAnswer({
        session_id: session.session_id,
        question_id: currentQuestion.id,
        question_text: currentQuestion.question_text,
        user_answer: userAnswer,
        target_role: targetRole,
        interview_type: interviewType,
      });

      setAnswerEvaluation(evalRes);
      setSessionAnswers((prev) => [
        ...prev,
        { q: currentQuestion, a: userAnswer, eval: evalRes },
      ]);

      if (evalRes.is_completed || !evalRes.next_question) {
        setIsCompleted(true);
      }
    } catch (err) {
      console.error('Answer evaluation failed:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const advanceToNextQuestion = () => {
    if (answerEvaluation?.next_question) {
      setCurrentQuestion(answerEvaluation.next_question);
      setUserAnswer('');
      setAnswerEvaluation(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <MessagesSquare className="w-7 h-7 text-indigo-400" />
          Interactive AI Interview Simulator
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Practice one-on-one mock interviews calibrated to your resume and desired role. Receive real-time evaluations, benchmark answers, and tactical feedback.
        </p>
      </div>

      {/* Setup View (when no session active) */}
      {!session && (
        <div className="p-8 rounded-3xl bg-[#0b1021] border border-slate-800 space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Configure Your Interview Round
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Interview Format */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Round Type</label>
              <div className="space-y-2">
                {['Technical', 'HR / Culture', 'Behavioral (STAR)', 'Project Deep Dive'].map((t) => (
                  <div
                    key={t}
                    onClick={() => setInterviewType(t)}
                    className={`p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                      interviewType === t
                        ? 'border-purple-500 bg-purple-950/20 text-white'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Difficulty Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Difficulty Tier</label>
              <div className="space-y-2">
                {[
                  { level: 'Beginner', desc: 'Core fundamentals & syntax' },
                  { level: 'Intermediate', desc: 'System tradeoffs & real scenarios' },
                  { level: 'Advanced', desc: 'Distributed scale & architectural edge-cases' },
                ].map((d) => (
                  <div
                    key={d.level}
                    onClick={() => setDifficulty(d.level)}
                    className={`p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                      difficulty === d.level
                        ? 'border-indigo-500 bg-indigo-950/20 text-white'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold">{d.level}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{d.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Role */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Target Job Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Full Stack Engineer"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500 mb-4"
              />
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                <p className="font-semibold text-slate-300">Session Structure:</p>
                <p>• 5 sequential questions</p>
                <p>• One question presented at a time</p>
                <p>• AI grades completeness, depth & metrics</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={startSession}
              disabled={loading}
              className="px-8 py-3.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-xl shadow-purple-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              {loading ? 'Generating Personalized Questions...' : 'Begin Mock Interview'}
            </button>
          </div>
        </div>
      )}

      {/* Active Question Flow */}
      {session && !isCompleted && currentQuestion && (
        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>
              Question {currentQuestion.question_order} of {session.total_questions} ({session.interview_type} • {session.difficulty})
            </span>
            <button
              onClick={() => setSession(null)}
              className="text-xs text-slate-500 hover:text-red-400 transition-colors"
            >
              End Session
            </button>
          </div>

          {/* Question Card */}
          <div className="p-6 md:p-8 rounded-3xl bg-[#0b1021] border border-purple-500/30 shadow-xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Interviewer Question</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white leading-relaxed">
              &quot;{currentQuestion.question_text}&quot;
            </h2>
            {currentQuestion.context && (
              <p className="text-xs text-slate-400 italic">
                Context: {currentQuestion.context}
              </p>
            )}
          </div>

          {/* User Answer Textarea & Submit */}
          {!answerEvaluation && (
            <div className="p-6 rounded-2xl bg-[#0b1021] border border-slate-800 space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Your Answer (Use the STAR framework where applicable)
              </label>
              <textarea
                rows={6}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your response here as you would speak it to an interviewer..."
                className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
              />
              <div className="flex justify-between items-center pt-2">
                <span className="text-[11px] text-slate-500">
                  {userAnswer.split(/\s+/).filter(Boolean).length} words
                </span>
                <button
                  onClick={submitAnswer}
                  disabled={evaluating || !userAnswer.trim()}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {evaluating ? 'Grading Response with AI...' : 'Submit Answer for Grading'}
                </button>
              </div>
            </div>
          )}

          {/* AI Answer Evaluation Card */}
          {answerEvaluation && (
            <div className="p-6 md:p-8 rounded-3xl bg-[#0b1021] border border-emerald-500/30 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">AI Evaluation</span>
                    <h3 className="text-xl font-bold text-white">Score: {answerEvaluation.score}/100</h3>
                  </div>
                </div>

                {answerEvaluation.next_question && (
                  <button
                    onClick={advanceToNextQuestion}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-2 transition-all shadow-lg shadow-purple-600/30"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Feedback Summary */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Feedback Overview</span>
                <p className="text-xs text-slate-300 leading-relaxed">{answerEvaluation.feedback}</p>
              </div>

              {/* Strong Points vs Areas to Improve */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    What You Handled Well
                  </span>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {answerEvaluation.strong_points.map((pt, idx) => (
                      <li key={idx}>• {pt}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-2">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    How to Make It Stronger
                  </span>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {answerEvaluation.areas_for_improvement.map((pt, idx) => (
                      <li key={idx}>• {pt}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Model Suggested Answer */}
              <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Model Benchmark Answer
                </span>
                <p className="text-xs text-purple-100 leading-relaxed italic">
                  &quot;{answerEvaluation.suggested_answer}&quot;
                </p>
              </div>

              {/* Follow-up Question */}
              {answerEvaluation.follow_up_question && (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <span className="font-semibold text-indigo-400 block">Potential Follow-Up Question:</span>
                  <p>{answerEvaluation.follow_up_question}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Completed Session Summary View */}
      {isCompleted && (
        <div className="p-8 rounded-3xl bg-[#0b1021] border border-purple-500/30 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400 shadow-xl">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Interview Completed</span>
            <h2 className="text-3xl font-extrabold text-white mt-1">Round Complete!</h2>
            <p className="text-xs text-slate-400 mt-1">
              You answered all {sessionAnswers.length} questions for {targetRole}.
            </p>
          </div>

          <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-around">
            <div>
              <span className="text-xs text-slate-500 block">Questions Answered</span>
              <span className="text-xl font-bold text-white">{sessionAnswers.length}</span>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <span className="text-xs text-slate-500 block">Average Score</span>
              <span className="text-xl font-bold text-emerald-400">
                {sessionAnswers.length > 0
                  ? Math.round(sessionAnswers.reduce((a, b) => a + b.eval.score, 0) / sessionAnswers.length)
                  : 85}
                /100
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={() => {
                setSession(null);
                setCurrentQuestion(null);
                setIsCompleted(false);
              }}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200"
            >
              Start Another Round
            </button>
            <button
              onClick={() => onNavigate('/dashboard')}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
