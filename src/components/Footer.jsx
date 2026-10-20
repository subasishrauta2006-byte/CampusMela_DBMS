import React from 'react';
import { useApp } from '../context/AppContext';

export default function Footer({ onNavigate }) {
  const { dbStatus } = useApp();

  return (
    <footer className="campus-mela-footer">
      <div className="footer-container">
        <div className="footer-top-row">
          {/* Logo & Tagline */}
          <div className="footer-brand-col">
            <div className="footer-brand-header" onClick={() => onNavigate('dashboard')} role="button" tabIndex={0} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src="/logo.png" alt="Campus Mela Logo" className="footer-logo-img" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'contain', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>CAMPUS</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Mela</span>
                </div>
                <p className="footer-tagline" style={{ fontSize: '0.85rem', color: '#0284c7', fontWeight: 600, margin: '2px 0 0 0' }}>
                  Track the Fest, Manage the Rest
                </p>
              </div>
            </div>
            <p className="footer-description" style={{ marginTop: '12px', fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '340px', lineHeight: 1.5 }}>
              Enterprise college fest management, venue bookings, attendee registration, and financial auditing powered by PostgreSQL 18.
            </p>
          </div>

          {/* Quick Navigation Links */}
          <div className="footer-links-col">
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)', marginBottom: '12px' }}>Modules</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem' }}>
              <li><button onClick={() => onNavigate('dashboard')} className="footer-link-btn">Home & Overview</button></li>
              <li><button onClick={() => onNavigate('events')} className="footer-link-btn">Services & Booking</button></li>
              <li><button onClick={() => onNavigate('registration')} className="footer-link-btn">Student Registration</button></li>
              <li><button onClick={() => onNavigate('attendance')} className="footer-link-btn">Live Attendance</button></li>
              <li><button onClick={() => onNavigate('budget')} className="footer-link-btn">Rate Card & Expenses</button></li>
              <li><button onClick={() => onNavigate('reports')} className="footer-link-btn">Financial Views</button></li>
            </ul>
          </div>

          {/* Venues */}
          <div className="footer-links-col">
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)', marginBottom: '12px' }}>Venues</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <li>🏟️ Sankalp Ground (Cap: 1500)</li>
              <li>🏟️ Indoor Stadium (Cap: 600)</li>
              <li>🎬 Cineplix (Cap: 300)</li>
              <li>📚 Octagon Library (Cap: 250)</li>
              <li>🎭 Galaxy Auditorium (Cap: 200)</li>
            </ul>
          </div>

          {/* System & DB Status */}
          <div className="footer-links-col">
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)', marginBottom: '12px' }}>Database Engine</h4>
            <div style={{ background: 'var(--bg-card, #f8fafc)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: dbStatus?.connected ? '#10b981' : '#f59e0b' }}></span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>PostgreSQL 18</span>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.4 }}>
                DB: <code>campushub</code><br />
                Port: <code>5432</code> (ACID Safe)
              </div>
              <button 
                onClick={() => onNavigate('postgres')}
                className="btn btn-secondary btn-sm"
                style={{ marginTop: '10px', width: '100%', fontSize: '0.78rem', padding: '6px 10px' }}
              >
                Open SQL Terminal ➔
              </button>
            </div>
          </div>
        </div>

        {/* Campuses Strip */}
        <div style={{ marginTop: '28px', padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px 14px' }}>
          <strong style={{ color: 'var(--text-main)' }}>🏛️ Participating Campuses:</strong>
          <span>NIST University</span>
          <span>•</span>
          <span>IIT Bhubaneswar</span>
          <span>•</span>
          <span>NIT Rourkela</span>
          <span>•</span>
          <span>Silicon University</span>
          <span>•</span>
          <span>SOA ITER</span>
          <span>•</span>
          <span>KIIT University</span>
          <span>•</span>
          <span>Roland College</span>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-color, #e2e8f0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          <div>
            © {new Date().getFullYear()} <strong>Campus Mela</strong> • <em>Track the Fest, Manage the Rest</em>. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>DBMS Academic Project</span>
            <span>•</span>
            <span>Relational Schema v2.0</span>
            <span>•</span>
            <button onClick={() => onNavigate('login')} style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', padding: 0, fontSize: '0.82rem', fontWeight: 600 }}>Portal Login</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
