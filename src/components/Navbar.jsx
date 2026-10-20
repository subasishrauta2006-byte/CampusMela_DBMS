import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Navbar({ activePage, onNavigate, onOpenNewEvent, onOpenRegister, isDarkMode, onToggleTheme }) {
  const { dbStatus, currentUser, logoutUser } = useApp();
  const [selectedCampus, setSelectedCampus] = useState('NIST University');
  const [showCampusMenu, setShowCampusMenu] = useState(false);

  const campuses = [
    'NIST University',
    'IIT Bhubaneswar',
    'NIT Rourkela',
    'Silicon University',
    'SOA ITER',
    'KIIT University',
    'Roland College',
    'Khordha District (GPS)',
    'Bhubaneswar Campus',
    'Cuttack Tech Hub',
    'Main University Campus',
  ];

  return (
    <header className="prithvi-navbar">
      <div className="navbar-container">
        {/* Brand Logo */}
        <div className="navbar-brand" onClick={() => onNavigate('dashboard')} role="button" tabIndex={0}>
          <img src="/logo.png" alt="Campus Mela" className="brand-logo-img" />
          <div className="brand-text-group">
            <div className="brand-title">
              <span className="brand-main">CAMPUS</span>
              <span className="brand-badge-mela">Mela</span>
            </div>
            <span className="brand-tagline">Track the Fest, Manage the Rest</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="navbar-nav">
          <button
            className={`nav-pill ${activePage === 'dashboard' ? 'active' : ''}`}
            onClick={() => onNavigate('dashboard')}
          >
            Home
          </button>
          <button
            className={`nav-pill ${activePage === 'events' ? 'active' : ''}`}
            onClick={() => onNavigate('events')}
          >
            Services & Booking
          </button>
          <button
            className={`nav-pill ${activePage === 'budget' ? 'active' : ''}`}
            onClick={() => onNavigate('budget')}
          >
            Rate Card
          </button>
          <button
            className={`nav-pill ${activePage === 'registration' ? 'active' : ''}`}
            onClick={() => onNavigate('registration')}
          >
            Registration
          </button>
          <button
            className={`nav-pill ${activePage === 'attendance' ? 'active' : ''}`}
            onClick={() => onNavigate('attendance')}
          >
            Attendance
          </button>
          <button
            className={`nav-pill ${activePage === 'reports' ? 'active' : ''}`}
            onClick={() => onNavigate('reports')}
          >
            Reports
          </button>
          <button
            className={`nav-pill ${activePage === 'postgres' ? 'active' : ''}`}
            onClick={() => onNavigate('postgres')}
          >
            SQL Console
          </button>
        </nav>

        {/* Right Controls */}
        <div className="navbar-actions">
          {/* Location Selector Pill */}
          <div className="dropdown-pill-wrapper">
            <button
              className="pill-selector location-pill"
              onClick={() => setShowCampusMenu(!showCampusMenu)}
            >
              <span className="pill-dot">📍</span>
              <span className="pill-text">{selectedCampus}</span>
              <span className="chevron">▾</span>
            </button>
            {showCampusMenu && (
              <div className="dropdown-menu">
                {campuses.map(campus => (
                  <div
                    key={campus}
                    className={`dropdown-item ${campus === selectedCampus ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedCampus(campus);
                      setShowCampusMenu(false);
                    }}
                  >
                    📍 {campus}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Database Live Status Pill */}
          <div
            className={`db-status-pill ${dbStatus?.connected ? 'connected' : 'offline'}`}
            title="PostgreSQL 18 Connection Status"
            onClick={() => onNavigate('postgres')}
          >
            <span className="status-indicator-dot"></span>
            <span className="status-label">
              {dbStatus?.connected ? 'PostgreSQL 18' : 'Local Cache'}
            </span>
          </div>

          {/* Theme Toggle */}
          <button
            className="icon-pill-btn"
            onClick={onToggleTheme}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          {/* User Profile or Login Buttons */}
          {currentUser ? (
            <div className="user-profile-badge">
              <span className="user-avatar">{currentUser.name.charAt(0).toUpperCase()}</span>
              <div className="user-info-text">
                <span className="user-name">{currentUser.name.split(' ')[0]}</span>
                <span className="user-role">{currentUser.role.split(' ')[0]}</span>
              </div>
              <button
                className="user-logout-icon"
                onClick={logoutUser}
                title="Sign Out"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              className="btn-dark-pill"
              onClick={() => onNavigate('login')}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
