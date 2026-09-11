import React, { useState, useEffect } from 'react';
import { Navbar, NavPage } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AttendancePage } from './pages/AttendancePage';
import { EventsPage } from './pages/EventsPage';
import { QueueLessPage } from './pages/QueueLessPage';
import { BorrowBoxPage } from './pages/BorrowBoxPage';
import { mockStudentProfile } from './data/mockData';

export const App: React.FC = () => {
  // Read initial page from hash if available
  const getInitialPage = (): NavPage => {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (['home', 'attendance', 'events', 'queueless', 'borrowbox'].includes(hash)) {
      return hash as NavPage;
    }
    return 'home';
  };

  const [currentPage, setCurrentPage] = useState<NavPage>(getInitialPage);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>('cs301');

  // Handle hash change for browser back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (['home', 'attendance', 'events', 'queueless', 'borrowbox'].includes(hash)) {
        setCurrentPage(hash as NavPage);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Custom navigation handler
  const handleNavigate = (page: NavPage, subjectId?: string) => {
    setCurrentPage(page);
    if (subjectId) {
      setSelectedSubjectId(subjectId);
    }
    window.location.hash = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render the active view
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'attendance':
        return <AttendancePage key={selectedSubjectId} initialSubjectId={selectedSubjectId} />;
      case 'events':
        return <EventsPage />;
      case 'queueless':
        return <QueueLessPage />;
      case 'borrowbox':
        return <BorrowBoxPage />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Persistent Navbar across all pages */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        overallPercentage={mockStudentProfile.overallPercentage}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {renderCurrentPage()}
      </main>

      {/* Unified Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export default App;
