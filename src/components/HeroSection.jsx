import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function HeroSection({ onNavigate, onSearch }) {
  const { db } = useApp();
  const venues = db.getVenues();
  const [selectedVenue, setSelectedVenue] = useState('All Venues');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChip, setActiveChip] = useState('all');

  const chips = [
    { id: 'all', label: 'All Services (7)', page: 'dashboard' },
    { id: 'events', label: '🔥 Popular Events', page: 'events' },
    { id: 'registration', label: '👥 Student Registration', page: 'registration' },
    { id: 'attendance', label: '🕒 Attendance & Check-in', page: 'attendance' },
    { id: 'budget', label: '💰 Rate Card & Finance', page: 'budget' },
    { id: 'reports', label: '📊 Analytics & Views', page: 'reports' },
    { id: 'postgres', label: '🐘 PostgreSQL Terminal', page: 'postgres' },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery, selectedVenue);
    }
  };

  return (
    <section className="prithvi-hero-section">
      {/* Top Pill Tag */}
      <div className="hero-top-badge">
        <img src="/logo.png" alt="Campus Mela" className="hero-mini-badge-logo" />
        <span>Campus Mela • Track the Fest, Manage the Rest</span>
      </div>

      {/* Main Display Headline */}
      <h1 className="hero-headline">
        Track the Fest.<br />
        <span className="headline-gradient">Manage the Rest.</span>
      </h1>

      {/* Hero Subtitle */}
      <p className="hero-subtitle">
        Campus Mela — Comprehensive college event tracker & budget management powered by PostgreSQL 18. Real-time attendance, venue capacities, and transparent ACID balance.
      </p>

      {/* Floating Search / Booking Pill Bar */}
      <form className="hero-search-bar" onSubmit={handleSearchSubmit}>
        {/* Venue Dropdown */}
        <div className="search-venue-select">
          <span className="search-icon">📍</span>
          <select
            value={selectedVenue}
            onChange={(e) => setSelectedVenue(e.target.value)}
          >
            <option value="All Venues">All Campuses & Venues</option>
            <optgroup label="Institutions & Universities">
              <option value="NIST University">NIST University</option>
              <option value="IIT Bhubaneswar">IIT Bhubaneswar</option>
              <option value="NIT Rourkela">NIT Rourkela</option>
              <option value="Silicon University">Silicon University</option>
              <option value="SOA ITER">SOA ITER</option>
              <option value="KIIT University">KIIT University</option>
              <option value="Roland College">Roland College</option>
            </optgroup>
            <optgroup label="Event Venues">
              {venues.map(v => (
                <option key={v.id} value={v.name}>{v.name} ({v.capacity} seats)</option>
              ))}
            </optgroup>
          </select>
        </div>

        <div className="search-divider"></div>

        {/* Query Input */}
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="What event or student roll number? (e.g. Sankalp 2026, CS2024016)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="mic-icon" title="Voice Search Available">🎙️</span>
        </div>

        {/* Action Button */}
        <button type="submit" className="search-submit-btn">
          <span>Find Service</span>
          <span className="arrow">➔</span>
        </button>
      </form>

      {/* Trust & Guarantee Badges Row */}
      <div className="hero-trust-row">
        <div className="trust-item">
          <span className="trust-icon">🛡️</span>
          <span className="trust-text">100% Schema Verified</span>
        </div>
        <div className="trust-item">
          <span className="trust-icon">⚡</span>
          <span className="trust-text">Zero Surge Pricing</span>
        </div>
        <div className="trust-item">
          <span className="trust-icon">⏱️</span>
          <span className="trust-text">30-Day Free Audit</span>
        </div>
        <div className="trust-item">
          <span className="trust-icon">📞</span>
          <span className="trust-text">Toll-Free: 1800-345-CAMPUS</span>
        </div>
      </div>

      {/* Standardized Services Header & Category Filter Chips */}
      <div className="services-section-header">
        <div className="section-pill-tag">REGULATED TARIFFS</div>
        <h2 className="section-title">Standardized Event Services</h2>
        <p className="section-subtitle">
          Official base tariffs for all campus halls. Transparent expenditure rates, zero hidden fees.
        </p>

        {/* Chips */}
        <div className="category-chips-row">
          {chips.map(chip => (
            <button
              key={chip.id}
              className={`category-chip ${activeChip === chip.id ? 'active' : ''}`}
              onClick={() => {
                setActiveChip(chip.id);
                onNavigate(chip.page);
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
