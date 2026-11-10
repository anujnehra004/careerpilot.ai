import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './layouts/AppLayout';

// 14 Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { ResumeUploadPage } from './pages/ResumeUploadPage';
import { ResumeAnalysisPage } from './pages/ResumeAnalysisPage';
import { JobMatcherPage } from './pages/JobMatcherPage';
import { ResumeImprovePage } from './pages/ResumeImprovePage';
import { InterviewPrepPage } from './pages/InterviewPrepPage';
import { SkillGapPage } from './pages/SkillGapPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname && window.location.pathname !== '/'
      ? window.location.pathname
      : '/';
  });

  const [activeResumeId, setActiveResumeId] = useState<string | null>(() => {
    return localStorage.getItem('careerpilot_active_resume_id') || 'demo-resume-01';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    setCurrentPath(path);
    window.history.pushState({}, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectResume = (resumeId: string) => {
    setActiveResumeId(resumeId);
    localStorage.setItem('careerpilot_active_resume_id', resumeId);
  };

  // Standalone public pages without sidebar
  if (currentPath === '/') {
    return <LandingPage onNavigate={navigate} />;
  }

  if (currentPath === '/login') {
    return <LoginPage onNavigate={navigate} />;
  }

  if (currentPath === '/signup') {
    return <SignUpPage onNavigate={navigate} />;
  }

  if (currentPath === '/forgot-password') {
    return <ForgotPasswordPage onNavigate={navigate} />;
  }

  // Dashboard & workspace pages rendered within AppLayout
  return (
    <AppLayout currentPath={currentPath} onNavigate={navigate}>
      {currentPath === '/dashboard' && <DashboardPage onNavigate={navigate} />}
      {currentPath === '/upload' && (
        <ResumeUploadPage
          onNavigate={navigate}
          onSelectResumeForAnalysis={handleSelectResume}
        />
      )}
      {currentPath === '/analysis' && (
        <ResumeAnalysisPage
          onNavigate={navigate}
          activeResumeId={activeResumeId}
        />
      )}
      {currentPath === '/job-matcher' && (
        <JobMatcherPage
          onNavigate={navigate}
          activeResumeId={activeResumeId}
        />
      )}
      {currentPath === '/improve' && <ResumeImprovePage onNavigate={navigate} />}
      {currentPath === '/interview' && (
        <InterviewPrepPage
          onNavigate={navigate}
          activeResumeId={activeResumeId}
        />
      )}
      {currentPath === '/skills' && (
        <SkillGapPage
          onNavigate={navigate}
          activeResumeId={activeResumeId}
        />
      )}
      {currentPath === '/history' && (
        <HistoryPage
          onNavigate={navigate}
          onSelectResume={handleSelectResume}
        />
      )}
      {currentPath === '/profile' && <ProfilePage onNavigate={navigate} />}
      {currentPath === '/settings' && <SettingsPage />}
    </AppLayout>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
