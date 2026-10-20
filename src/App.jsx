import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FloatingAiWidget from './components/FloatingAiWidget';
import Toast from './components/Toast';
import Dashboard from './pages/Dashboard';
import EventManagement from './pages/EventManagement';
import StudentRegistration from './pages/StudentRegistration';
import AttendanceTracker from './pages/AttendanceTracker';
import BudgetFinance from './pages/BudgetFinance';
import Reports from './pages/Reports';
import PostgresConsole from './pages/PostgresConsole';
import LoginPage from './pages/LoginPage';
import Footer from './components/Footer';

const PAGES = {
  dashboard: Dashboard,
  events: EventManagement,
  registration: StudentRegistration,
  attendance: AttendanceTracker,
  budget: BudgetFinance,
  reports: Reports,
  postgres: PostgresConsole,
  login: LoginPage,
};

function AppLayout() {
  const [activePage, setActivePage] = useState('dashboard');
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [isDarkMode, setIsDarkMode] = useState(false);
  const PageComponent = PAGES[activePage] || Dashboard;

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
    document.documentElement.classList.toggle('dark');
  };

  const handleNavigate = (page, params) => {
    setActivePage(page);
    if (page === 'login') {
      setAuthMode(params?.mode || 'login');
    }
  };

  return (
    <div className={`prithvi-app-layout ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Top Navigation Bar */}
      <Navbar
        activePage={activePage}
        onNavigate={handleNavigate}
        onOpenNewEvent={() => handleNavigate('events')}
        onOpenRegister={() => {
          setActivePage('login');
          setAuthMode('register');
        }}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="prithvi-main-content">
        {/* Render Hero Section only on Dashboard/Home */}
        {activePage === 'dashboard' && (
          <HeroSection
            onNavigate={handleNavigate}
            onSearch={(query, venue) => {
              if (query.trim()) {
                handleNavigate('events');
              }
            }}
          />
        )}

        <div className={activePage === 'login' ? 'login-fullbleed-wrapper' : 'page-wrapper-container'}>
          <PageComponent onNavigate={handleNavigate} initialMode={authMode} />
        </div>
      </main>

      {/* Modern Footer with Campus Mela Brand & Tagline (Hidden on Login screen) */}
      {activePage !== 'login' && <Footer onNavigate={setActivePage} />}

      {/* Floating AI Widget in Bottom Right */}
      <FloatingAiWidget onNavigate={setActivePage} />

      {/* Toast Notifications */}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
}
