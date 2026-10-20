import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function LoginPage({ onNavigate, initialMode = 'login' }) {
  const { db, loginUser, currentUser, logoutUser, addToast, refresh } = useApp();
  const organizers = db.getOrganizers();
  const participants = db.getParticipants();

  // Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState(initialMode || 'login');

  useEffect(() => {
    if (initialMode) {
      setAuthMode(initialMode);
    }
  }, [initialMode]);

  // Active Role tab: 'student' | 'faculty' | 'demo'
  const [activeRole, setActiveRole] = useState('student');

  // Testimonial Carousel Slide index
  const [activeSlide, setActiveSlide] = useState(0);

  const testimonials = [
    {
      quote: "With Campus Mela and PostgreSQL ACID transactions, our fest budget and attendance tracking were 100% transparent and error-free.",
      author: "Rahul Sarkar",
      role: "Faculty Coordinator",
    },
    {
      quote: "Managing venue bookings for Sankalp Ground and tracking 600+ students in Indoor Stadium has never been smoother.",
      author: "Subasish Rauta",
      role: "President",
    },
    {
      quote: "Live expense tracking and sponsor allocations make financial reconciliation effortless for student audit committees.",
      author: "Asutosh Mahapatra",
      role: "Treasurer",
    },
  ];

  // --- Login State ---
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginNotFoundNotice, setLoginNotFoundNotice] = useState(null);

  // --- Register State ---
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRoll, setRegRoll] = useState('');
  const [regDesignation, setRegDesignation] = useState('Event Volunteer');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regAlreadyExistsNotice, setRegAlreadyExistsNotice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fast Demo Personas
  const demoAccounts = [
    {
      name: 'Rahul Sarkar',
      email: 'rahul.sarkar@college.edu',
      role: 'Faculty Coordinator',
      avatar: '👨‍🏫',
      type: 'organizer',
    },
    {
      name: 'Subasish Rauta',
      email: 'subasish.rauta@college.edu',
      role: 'President',
      avatar: '👨‍💼',
      type: 'organizer',
    },
    {
      name: 'Asutosh Mahapatra',
      email: 'asutosh.mahapatra@college.edu',
      role: 'Treasurer',
      avatar: '💰',
      type: 'organizer',
    },
    {
      name: 'Dipten Sharma',
      email: 'dipten.s@student.edu',
      roll: 'CS2024016',
      role: 'Student (Participant)',
      avatar: '🎓',
      type: 'participant',
    },
  ];

  const handleQuickLogin = (acc) => {
    loginUser(acc);
    addToast(`Signed in as ${acc.name} (${acc.role})`, 'success');
    onNavigate('dashboard');
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Switch to Register with prefill
  const handleSwitchToRegister = () => {
    const raw = loginIdentifier.trim();
    if (raw.includes('@')) {
      setRegEmail(raw);
    } else if (raw) {
      setRegRoll(raw.toUpperCase());
    }
    setLoginNotFoundNotice(null);
    setAuthMode('register');
  };

  // Switch to Login with prefill
  const handleSwitchToLogin = (prefill) => {
    if (prefill) {
      setLoginIdentifier(prefill);
    }
    setRegAlreadyExistsNotice(null);
    setAuthMode('login');
  };

  // Login submission
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginNotFoundNotice(null);

    const query = loginIdentifier.trim().toLowerCase();
    if (!query) {
      addToast('Please enter your email or roll number', 'error');
      return;
    }

    // Check organizer records
    const org = organizers.find(
      (o) => o.email.toLowerCase() === query || o.name.toLowerCase() === query
    );
    if (org) {
      loginUser({ ...org, type: 'organizer' });
      addToast(`Welcome back, ${org.name}!`, 'success');
      onNavigate('dashboard');
      return;
    }

    // Check participant records
    const part = participants.find(
      (p) => p.email.toLowerCase() === query || (p.roll_number && p.roll_number.toLowerCase() === query)
    );
    if (part) {
      loginUser({ ...part, role: 'Student (Participant)', type: 'participant' });
      addToast(`Welcome back, ${part.name}!`, 'success');
      onNavigate('dashboard');
      return;
    }

    // Not registered notice
    setLoginNotFoundNotice({
      query: loginIdentifier.trim(),
    });
    addToast('Account not found. You have not registered yet!', 'warning');
  };

  // Register submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegAlreadyExistsNotice(null);
    setIsSubmitting(true);

    const name = regName.trim();
    const email = regEmail.trim().toLowerCase();
    const roll = regRoll.trim().toUpperCase();

    if (!name || !email) {
      addToast('Please enter your full name and email', 'error');
      setIsSubmitting(false);
      return;
    }

    if (activeRole === 'student' && !roll) {
      addToast('Please enter your roll number', 'error');
      setIsSubmitting(false);
      return;
    }

    // Check if user already exists
    const existingOrg = organizers.find((o) => o.email.toLowerCase() === email);
    const existingPart = participants.find(
      (p) => p.email.toLowerCase() === email || (roll && p.roll_number && p.roll_number.toUpperCase() === roll)
    );

    if (existingOrg || existingPart) {
      const existingUser = existingOrg || existingPart;
      setRegAlreadyExistsNotice({
        name: existingUser.name,
        email: existingUser.email,
        roll: existingUser.roll_number || '',
      });
      addToast(`Account already exists for ${existingUser.name}! Please sign in.`, 'info');
      setIsSubmitting(false);
      return;
    }

    // Insert into PostgreSQL
    try {
      if (activeRole === 'student') {
        const newPart = await db.addParticipant({
          name: name,
          email: email,
          roll_number: roll,
        });

        addToast(`🎉 Registration successful! Welcome, ${name}.`, 'success');
        refresh();
        loginUser({
          ...newPart,
          role: 'Student (Participant)',
          type: 'participant',
        });
        onNavigate('dashboard');
      } else {
        const newOrg = await db.addOrganizer({
          name: name,
          email: email,
          role: regDesignation || 'Faculty Coordinator',
        });

        addToast(`🎉 Registration successful! Welcome, ${name}.`, 'success');
        refresh();
        loginUser({
          ...newOrg,
          type: 'organizer',
        });
        onNavigate('dashboard');
      }
    } catch (err) {
      addToast(`Registration failed: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already logged in
  if (currentUser) {
    return (
      <div className="login-split-page-wrapper">
        <div className="login-card-standalone">
          <div className="login-header">
            <img src="/logo.png" alt="Campus Mela" className="login-logo-img" />
            <h2>Already Signed In</h2>
            <p className="login-subtitle">You are logged into Campus Mela</p>
          </div>

          <div className="user-profile-summary">
            <div className="summary-avatar">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="summary-details">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{currentUser.name}</h3>
              <p style={{ color: '#0d9488', fontWeight: 600, fontSize: '0.9rem' }}>{currentUser.role}</p>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{currentUser.email}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => onNavigate('dashboard')}>
              Go to Dashboard ➔
            </button>
            <button className="btn btn-secondary" onClick={logoutUser}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-split-page-wrapper">
      {/* Top Dual Color Accent Bar */}
      <div className="login-top-accent-bar">
        <div className="accent-bar-orange"></div>
        <div className="accent-bar-green"></div>
      </div>

      <div className="login-split-container">
        {/* ========================================================
            LEFT COLUMN: DARK NAVY SHOWCASE HERO (MATCHING IMAGE 2)
            ======================================================== */}
        <div className="split-left-hero">
          {/* Top Brand Logo & Title */}
          <div className="split-brand-header">
            <div className="split-logo-badge">
              <img src="/logo.png" alt="Campus Mela" className="split-logo-img" />
            </div>
            <div className="split-brand-titles">
              <span className="split-brand-name">CAMPUS MELA</span>
              <span className="split-brand-sub">COLLEGE EVENT TRACKER &amp; BUDGET MANAGEMENT</span>
            </div>
          </div>

          {/* Category Tag Pill */}
          <div className="split-tag-pill">
            <span className="tag-icon">🏛️</span>
            <span>Fest Infrastructure</span>
          </div>

          {/* Bold Display Headline */}
          <h1 className="split-hero-headline">
            Track the Fest.<br />
            Zero Budget Drift.
          </h1>

          {/* Subtitle Description */}
          <p className="split-hero-description">
            Direct student registration with real-time venue check-ins, automated capacity locking, and transparent PostgreSQL 18 financial auditing.
          </p>

          {/* 3-Column Metric Box */}
          <div className="split-metrics-card">
            <div className="metric-col">
              <span className="metric-number">1500+</span>
              <span className="metric-label">Max Capacity</span>
            </div>
            <div className="metric-col">
              <span className="metric-number">₹30 Lakh</span>
              <span className="metric-label">Fest Budget</span>
            </div>
            <div className="metric-col">
              <span className="metric-number">100%</span>
              <span className="metric-label">ACID Audit</span>
            </div>
          </div>

          {/* Quote / Testimonial Box */}
          <div className="split-quote-box">
            <p className="quote-text">
              "{testimonials[activeSlide].quote}"
            </p>
            <span className="quote-author">
              — {testimonials[activeSlide].author} • {testimonials[activeSlide].role}
            </span>
          </div>

          {/* Carousel Pagination & Arrows */}
          <div className="split-carousel-controls">
            <div className="carousel-dots">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveSlide(i)}
                  className={`dot-indicator ${activeSlide === i ? 'active' : ''}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
            <div className="carousel-arrows">
              <button
                type="button"
                className="carousel-btn prev"
                onClick={handlePrevSlide}
                aria-label="Previous quote"
              >
                ‹
              </button>
              <button
                type="button"
                className="carousel-btn next"
                onClick={handleNextSlide}
                aria-label="Next quote"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================
            RIGHT COLUMN: CLEAN LIGHT AUTH FORM (MATCHING IMAGE 2)
            ======================================================== */}
        <div className="split-right-form-panel">
          <div className="split-form-inner">
            {/* Form Headline */}
            <h2 className="auth-form-title">
              {authMode === 'login' ? 'Sign in' : 'Create account'}
            </h2>
            <p className="auth-form-subtitle">
              {authMode === 'login'
                ? 'Cooperative services at regulated base rates.'
                : 'Register for fest events, workshops, and campus access.'}
            </p>

            {/* Role Segmented Pills (Citizen | Artisan | Admin style) */}
            <div className="auth-role-segmented-bar">
              <button
                type="button"
                className={`segment-btn ${activeRole === 'student' ? 'active' : ''}`}
                onClick={() => {
                  setActiveRole('student');
                  setLoginNotFoundNotice(null);
                  setRegAlreadyExistsNotice(null);
                }}
              >
                <span className="seg-icon">👤</span>
                <span>Student</span>
              </button>
              <button
                type="button"
                className={`segment-btn ${activeRole === 'faculty' ? 'active' : ''}`}
                onClick={() => {
                  setActiveRole('faculty');
                  setLoginNotFoundNotice(null);
                  setRegAlreadyExistsNotice(null);
                }}
              >
                <span className="seg-icon">🧰</span>
                <span>Faculty</span>
              </button>
              <button
                type="button"
                className={`segment-btn ${activeRole === 'demo' ? 'active' : ''}`}
                onClick={() => {
                  setActiveRole('demo');
                  setLoginNotFoundNotice(null);
                  setRegAlreadyExistsNotice(null);
                }}
              >
                <span className="seg-icon">⚡</span>
                <span>1-Click Demo</span>
              </button>
            </div>

            {/* ===================================================
                FAST 1-CLICK DEMO SELECTION
                =================================================== */}
            {activeRole === 'demo' ? (
              <div className="demo-persona-panel slide-in">
                <p className="demo-notice">Select any verified demo persona to authenticate in 1 click:</p>
                <div className="demo-persona-list">
                  {demoAccounts.map((acc, i) => (
                    <button
                      key={i}
                      type="button"
                      className="demo-persona-item"
                      onClick={() => handleQuickLogin(acc)}
                    >
                      <span className="demo-avatar">{acc.avatar}</span>
                      <div className="demo-details">
                        <span className="demo-name">{acc.name}</span>
                        <span className="demo-role">{acc.role}</span>
                      </div>
                      <span className="demo-login-arrow">➔</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : authMode === 'login' ? (
              /* ===================================================
                 SIGN IN FORM (MATCHING IMAGE 2 INPUT WITH ICONS)
                 =================================================== */
              <form className="auth-form-body slide-in" onSubmit={handleLoginSubmit}>
                {/* Not Registered Notice */}
                {loginNotFoundNotice && (
                  <div className="auth-alert warning">
                    <div className="alert-title">⚠️ Account Not Found</div>
                    <p>No registered user found for <strong>"{loginNotFoundNotice.query}"</strong>.</p>
                    <button
                      type="button"
                      className="btn btn-primary alert-action-btn"
                      onClick={handleSwitchToRegister}
                    >
                      Register Now with this ID ➔
                    </button>
                  </div>
                )}

                {/* Identifier Input with Left Mail Icon */}
                <div className="auth-field-group">
                  <label className="auth-field-label">Phone Number or Email</label>
                  <div className="auth-input-wrapper">
                    <span className="input-leading-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      className="auth-text-input"
                      placeholder={activeRole === 'student' ? 'Phone Number, Roll No, or Email' : 'Institutional Email or Name'}
                      value={loginIdentifier}
                      onChange={(e) => {
                        setLoginIdentifier(e.target.value);
                        if (loginNotFoundNotice) setLoginNotFoundNotice(null);
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Password Input with Left Lock Icon & Right Eye Toggle */}
                <div className="auth-field-group">
                  <div className="auth-field-header-row">
                    <label className="auth-field-label">Password</label>
                    <button
                      type="button"
                      className="auth-inline-link"
                      onClick={() => addToast('Use 1-Click Demo or enter any password.', 'info')}
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="auth-input-wrapper">
                    <span className="input-leading-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      className="auth-text-input"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="input-trailing-icon-btn"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Primary Action Button (Matches Image 2 Dark Navy Pill Button) */}
                <button type="submit" className="auth-submit-navy-btn">
                  Sign In ➔
                </button>

                {/* Bottom Switch Link */}
                <div className="auth-bottom-switch">
                  <span>New here? </span>
                  <button
                    type="button"
                    className="auth-switch-link"
                    onClick={() => setAuthMode('register')}
                  >
                    Create account ➔
                  </button>
                </div>
              </form>
            ) : (
              /* ===================================================
                 REGISTER FORM (MATCHING SAME CLEAN AESTHETIC)
                 =================================================== */
              <form className="auth-form-body slide-in" onSubmit={handleRegisterSubmit}>
                {/* Already Registered Alert */}
                {regAlreadyExistsNotice && (
                  <div className="auth-alert success">
                    <div className="alert-title">✓ Account Already Exists</div>
                    <p>An existing account was found for <strong>{regAlreadyExistsNotice.name}</strong>.</p>
                    <button
                      type="button"
                      className="btn btn-primary alert-action-btn"
                      onClick={() => handleSwitchToLogin(regAlreadyExistsNotice.email || regAlreadyExistsNotice.roll)}
                    >
                      Proceed to Sign In ➔
                    </button>
                  </div>
                )}

                {/* Full Name */}
                <div className="auth-field-group">
                  <label className="auth-field-label">Full Name</label>
                  <div className="auth-input-wrapper">
                    <span className="input-leading-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      className="auth-text-input"
                      placeholder="e.g. Dipten Sharma"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="auth-field-group">
                  <label className="auth-field-label">Email Address</label>
                  <div className="auth-input-wrapper">
                    <span className="input-leading-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </span>
                    <input
                      type="email"
                      className="auth-text-input"
                      placeholder="e.g. yourname@student.edu"
                      value={regEmail}
                      onChange={(e) => {
                        setRegEmail(e.target.value);
                        if (regAlreadyExistsNotice) setRegAlreadyExistsNotice(null);
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Roll Number or Designation */}
                {activeRole === 'student' ? (
                  <div className="auth-field-group">
                    <label className="auth-field-label">Roll Number (Student ID)</label>
                    <div className="auth-input-wrapper">
                      <span className="input-leading-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                          <path d="M6 12v5c3 3 6 3 12 0v-5" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        className="auth-text-input"
                        placeholder="e.g. CS2024099"
                        value={regRoll}
                        onChange={(e) => {
                          setRegRoll(e.target.value);
                          if (regAlreadyExistsNotice) setRegAlreadyExistsNotice(null);
                        }}
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div className="auth-field-group">
                    <label className="auth-field-label">Fest Role / Designation</label>
                    <div className="auth-input-wrapper">
                      <span className="input-leading-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        className="auth-text-input"
                        placeholder="e.g. Faculty Coordinator, Event Head"
                        value={regDesignation}
                        onChange={(e) => setRegDesignation(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Password Input */}
                <div className="auth-field-group">
                  <label className="auth-field-label">Password</label>
                  <div className="auth-input-wrapper">
                    <span className="input-leading-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      className="auth-text-input"
                      placeholder="Create a password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="input-trailing-icon-btn"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button type="submit" className="auth-submit-navy-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Registering in PostgreSQL...' : 'Create Account ➔'}
                </button>

                {/* Bottom Switch Link */}
                <div className="auth-bottom-switch">
                  <span>Already have an account? </span>
                  <button
                    type="button"
                    className="auth-switch-link"
                    onClick={() => setAuthMode('login')}
                  >
                    Sign in ➔
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
