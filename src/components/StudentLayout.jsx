import React from 'react';
import { useApp } from '../contexts/StudentContext';
import { useNavigate } from "react-router-dom";

const LOGIN_URL = 'http://localhost:3000';
const BASE_URL  = 'http://127.0.0.1:8000/api';


// export function Header({ setPage, onLogout }) {
//   const { student} = useApp();
//     async function doLogout() {
//   await authAPI.logout();
      
//       window.location.href = 'http://localhost:3000/';
    
//   }
  
  export function Header({ setPage, onLogout }) {
  const { student } = useApp();

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
            STUDENT PORTAL · AIN SHAMS UNIVERSITY
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={handleLogout} style={{
          background: "linear-gradient(135deg,var(--blue),#1d65cc)", color: "#fff",
          border: "none", borderRadius: 8, padding: "9px 22px",
          fontFamily: "'Outfit',sans-serif", fontSize: 18, fontWeight: 500,
          cursor: "pointer", boxShadow: "0 4px 14px rgba(59,130,246,0.3)",
        }}>← Logout</button>
      </div>
    </header>
  );
}

const NAV = [
  { section: 'MAIN', items: [
    { id: 'dash',    icon: '🏠', label: 'Dashboard'       },
    { id: 'courses', icon: '📚', label: 'My Courses'      },
    { id: 'reg',     icon: '📝', label: 'Registration'    },
  ]},
  { section: 'ADVISING', items: [
    { id: 'book',  icon: '📅', label: 'Book Appointment'  },
    { id: 'appts', icon: '🗓', label: 'My Appointments', badge: true },
  ]},
];

function avBg(risk) {
  if (risk === 'high')   return 'linear-gradient(135deg,#be123c,#fb7185)';
  if (risk === 'medium') return 'linear-gradient(135deg,#b45309,#f59e0b)';
  return 'linear-gradient(135deg,#1e40af,#3b82f6)';
}

export function Sidebar({ page, setPage }) {
  const { student, risk, appts } = useApp();
  const upcomingCount = (appts || []).filter(a => a.status === 'booked').length;

  return (
    <aside style={{
      width: 208, flexShrink: 0,
      background: 'var(--bg2)', borderRight: '1px solid var(--border2)',
      display: 'flex', flexDirection: 'column', overflowY: 'auto',
    }}>
      <div style={{ padding: '15px 13px 13px', borderBottom: '1px solid var(--border2)', display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'DM Mono',monospace", fontSize: 14, fontWeight: 800, color: '#fff',
          background: avBg(risk),
        }}>
          {student?.av || (student?.name ? student.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() : '??')}
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--white)' }}>{student?.name}</div>
          <div style={{ fontSize: 14, color: 'var(--white)', marginTop: 1 }}>Level {student?.level} · {student?.dept}</div>
        </div>
      </div>
      {NAV.map(sec => (
        <div key={sec.section} style={{ padding: '12px 0 3px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--dim)', padding: '0 13px', marginBottom: 4 }}>
            {sec.section}
          </div>
          {sec.items.map(item => {
            const active = page === item.id;
            return (
              <div key={item.id} onClick={() => setPage(item.id)} style={{
                display: 'flex', alignItems: 'center', gap: 9, padding: '8px 13px',
                fontSize: 1.2 rem, fontWeight: active ? 700 : 500,
                cursor: 'pointer', transition: 'all .15s',
                borderLeft: active ? '2px solid var(--blue2)' : '2px solid transparent',
                background: active ? 'rgba(59,130,246,.07)' : 'transparent',
                userSelect: 'none',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.color='var(--white)'; e.currentTarget.style.background='rgba(255,255,255,.03)'; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.color='var(--muted)'; e.currentTarget.style.background='transparent'; }}}
              >
                <span style={{ fontSize: 14, width: 16, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                {item.label}
                {item.badge && upcomingCount > 0 && (
                  <span style={{ marginLeft: 'auto', minWidth: 18, height: 18, borderRadius: 9, background: 'var(--rose)', color: '#fff', fontSize: 9.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                    {upcomingCount}
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
