// ─────────────────────────────────────────────────────────────
//  LAYOUT — Advisor Portal
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { useApp } from '../contexts/AdvisorContext';
import { useNavigate } from "react-router-dom";

const LOGIN_URL = 'http://localhost:3000';
const BASE_URL = 'http://127.0.0.1:8000/api';

const NAV = [
  {
    section: 'MAIN', items: [
      { id: 'dash', icon: '🏠', label: 'Dashboard' },
      { id: 'students', icon: '🎓', label: 'My Students' },
      { id: 'appts', icon: '📅', label: 'Appointments' },
      // { id: 'risk',     icon: '⚠️', label: 'Risk Alerts'     },
      { id: 'slots', icon: '🗓', label: 'My Slots' },
      { id: 'student-profile', icon: '👤', label: 'Student Profile', hidden: true },
    ]
  },
];

function avBg(risk) {
  if (risk === 'high') return 'linear-gradient(135deg,#be123c,#fb7185)';
  if (risk === 'medium') return 'linear-gradient(135deg,#b45309,#f59e0b)';
  return 'linear-gradient(135deg,#1e40af,#3b82f6)';
}

export function Header({ onLogout }) {
  const { advisor, doLogout } = useApp();

  async function handleLogout() {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (e) { /* ignore */ }
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    if (onLogout) onLogout();
  }

  return (
    <header style={{
      height: 54, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 22px',
      background: 'rgba(6,9,15,.97)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      position: 'relative', zIndex: 100,
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: 'linear-gradient(135deg,var(--blue),var(--teal))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 25,
        }}>🎓</div>
        <div>
          <div style={{ fontFamily: "'Libre Baskerville',serif", fontSize: 15, fontWeight: 700, color: 'var(--white)' }}>
            Academic <span style={{ color: 'var(--blue2)' }}>Advising</span> System
          </div>
          <div style={{ fontSize: 12, color: 'var(--white)', letterSpacing: .5, marginTop: 1 }}>
            ADVISOR PORTAL · AIN SHAMS UNIVERSITY
          </div>
        </div>
      </div>

      {/* Logout */}
      <button onClick={handleLogout} style={{
        background: "linear-gradient(135deg,var(--blue),#1d65cc)", color: "#fff",
        border: "none", borderRadius: 8, padding: "9px 22px",
        fontFamily: "'Outfit',sans-serif", fontSize: 18, fontWeight: 500,
        cursor: "pointer", boxShadow: "0 4px 14px rgba(59,130,246,0.3)",
      }}>← Logout</button>
    </header>
  );
}


export function Sidebar({ page, setPage }) {
  const { advisor } = useApp();

  return (
    <aside style={{
      width: 208, flexShrink: 0,
      background: 'var(--bg2)', borderRight: '1px solid var(--border2)',
      display: 'flex', flexDirection: 'column', overflowY: 'auto',
    }}>
      {/* Advisor profile */}
      <div style={{ padding: '15px 13px 13px', borderBottom: '1px solid var(--border2)', display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'DM Mono',monospace", fontSize: 14, fontWeight: 800, color: '#fff',
          background: 'linear-gradient(135deg,var(--blue),var(--teal))',
        }}>
          {advisor?.name
            ? advisor.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
            : advisor?.av || 'AD'}
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--white)' }}>{advisor?.name || 'Advisor'}</div>
          {/* <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 1 }}>{advisor?.dept || 'Department'}</div> */}
        </div>
      </div>

      {/* Nav */}
      {NAV.map(sec => (

        <div key={sec.section} style={{ padding: '12px 0 3px' }}>
          <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--dim)', padding: '0 13px', marginBottom: 4 }}>
            {sec.section}
          </div>
          {sec.items.filter(item => !item.hidden || page === item.id)
            .map(item => {
              const active = page === item.id ||
                (item.id === 'students' && page === 'student-profile');



              return (
                <div key={item.id} onClick={() => setPage(item.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 9, padding: '8px 13px',
                  fontSize: '1.2rem', fontWeight: active ? 700 : 500,
                  color: active ? 'var(--blue2)' : 'var(--muted)',
                  cursor: 'pointer', transition: 'all .15s',
                  borderLeft: active ? '2px solid var(--blue2)' : '2px solid transparent',
                  background: active ? 'rgba(59,130,246,.07)' : 'transparent',
                  userSelect: 'none',
                }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'var(--white)'; e.currentTarget.style.background = 'rgba(255,255,255,.03)'; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.background = 'transparent'; } }}
                >
                  <span style={{ fontSize: 14, width: 17, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                  {item.label}
                </div>
              );
            })}
        </div>
      ))}
    </aside>
  );
}
