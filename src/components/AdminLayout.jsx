// ─────────────────────────────────────────────────────────────
//  LAYOUT — Admin Portal
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { useApp } from '../contexts/AdminContext';
import { useNavigate } from "react-router-dom";

const LOGIN_URL = 'http://localhost:3000';
const BASE_URL  = 'http://127.0.0.1:8000/api';

const NAV = [
  { section: 'OVERVIEW', items: [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard'  },
  ]},
  { section: 'MANAGEMENT', items: [
    { id: 'students',  icon: '🎓', label: 'Students',    },
    { id: 'advisors',  icon: '👨‍🏫', label: 'Advisors',  },
    { id: 'courses',   icon: '📚', label: 'Courses',     },
    { id: 'semesters', icon: '📅', label: 'Semesters'     },
  ]},
];

export function Header({ onLogout }) {
  const { admin, doLogout } = useApp();

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
    } catch (e) {
      // ignore errors on logout
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
      if (onLogout) onLogout();
    }
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
          <div style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: .5, marginTop: 1 }}>
            ADMIN PORTAL · AIN SHAMS UNIVERSITY
          </div>
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        
        <button
          onClick={handleLogout}
          style={{background:"linear-gradient(135deg,var(--blue),#1d65cc)",color:"#fff",
          border:"none",borderRadius:8,padding:"9px 22px",fontFamily:"var(--sans)",fontSize:18,
          fontWeight:500,cursor:"pointer",boxShadow:"0 4px 14px rgba(59,130,246,0.3)"}}>
          ← Logout
        </button>
      </div>
    </header>
  );
}

export function Sidebar({ page, setPage }) {
  const { admin, students, advisors, courses } = useApp();

  function getBadge(key) {
    if (key === 'students') return students?.length || 0;
    if (key === 'advisors') return advisors?.length || 0;
    if (key === 'courses')  return courses?.length  || 0;
    return 0;
  }

  return (
    <aside style={{
      width: 208, flexShrink: 0,
      background: 'var(--bg2)', borderRight: '1px solid var(--border2)',
      display: 'flex', flexDirection: 'column', overflowY: 'auto',
    }}>
      {/* Admin profile block */}
      <div style={{ padding: '15px 13px 13px', borderBottom: '1px solid var(--border2)', display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'DM Mono',monospace", fontSize: 12, fontWeight: 800, color: '#fff',
          background: 'linear-gradient(135deg,var(--blue),var(--teal))',
        }}>
          
          {admin?.name 
  ? admin.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() 
  : 'AD'}
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 550, color: 'var(--white)' }}>{admin?.name || 'Admin'}</div>
          <div style={{ fontSize: 14, color: 'var(--dim)', marginTop: 1 }}>System Administrator</div>
        </div>
      </div>

      {/* Nav sections */}
      {NAV.map(sec => (
        <div key={sec.section} style={{ padding: '12px 0 3px' }}>
          <div style={{  fontSize: 16, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--dim)', padding: '0 13px', marginBottom: 4 }}>
            {sec.section} 
          </div>
          {sec.items.map(item => {
            const active     = page === item.id;
            const badgeCount = item.badge ? getBadge(item.badge) : 0;
            return (
              <div
                key={item.id}
                onClick={() => setPage(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9, padding: '8px 13px',
                 fontWeight: active ? 700 : 500,
                  color: active ? 'var(--blue2)' : '#8fadc8',
                  cursor: 'pointer', transition: 'all .15s',
                  fontSize: '1.5rem', gap: 8,
                  borderLeft: active ? '2px solid var(--blue2)' : '2px solid transparent',
                  background: active ? 'rgba(59,130,246,.07)' : 'transparent',
                  userSelect: 'none',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.background = 'rgba(255,255,255,.03)'; }}}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'var(--dim)'; e.currentTarget.style.background = 'transparent'; }}}
              >
                <span style={{ fontSize: 15, width: 18, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                {item.label}
                {badgeCount > 0 && (
                  <span style={{
                    marginLeft: 'auto', minWidth: 19, height: 18, borderRadius: 9,
                    background: 'var(--muted)', color: '#fff',
                    fontSize: 15, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
                  }}>
                    {badgeCount}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </aside>
  );
}

export function Layout({ page, setPage, children, onLogout }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header onLogout={onLogout} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar page={page} setPage={setPage} />
        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
