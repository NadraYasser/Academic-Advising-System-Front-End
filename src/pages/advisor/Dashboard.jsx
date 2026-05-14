// ─────────────────────────────────────────────────────────────
//  PAGE: Dashboard — Advisor Portal
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { useApp } from '../../contexts/AdvisorContext';
import { CURRENT_SEM } from '../../services/advisorMockData';
import { Avatar } from '../../components/AdvisorUI';

function getDay(d) { return new Date(d + 'T12:00:00').getDate(); }
function getMon(d) { return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' }).toUpperCase(); }

function TopStatCard({ icon, value, label, sub, subColor, accentColor, onClick }) {
  return (
    <div onClick={onClick} style={{
      flex: 1, background: 'var(--card)', border: '1px solid var(--border2)',
      borderRadius: 13, padding: '18px 20px', position: 'relative', overflow: 'hidden',
      cursor: onClick ? 'pointer' : 'default', transition: 'transform .18s',
    }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accentColor }} />
      <div style={{ fontSize: 22, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontFamily: "'Libre Baskerville',serif", fontSize: '2rem', color: 'var(--white)', lineHeight: 1, marginBottom: 5 }}>{value}</div>
      <div style={{ fontSize: 15, color: 'var(--muted)', marginBottom: 4, fontWeight: 600 }}>{label}</div>
      {sub && <div style={{ fontSize: 13, fontWeight: 600, color: subColor || 'var(--muted)' }}>{sub}</div>}
    </div>
  );
}

// Shared "View All" button style used in both columns
function ViewAllBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 14px', borderRadius: 7, fontSize: 14.5, fontWeight: 600,
      background: 'transparent', color: 'var(--blue2)',
      border: '1.5px solid rgba(59,130,246,.35)', cursor: 'pointer',
      fontFamily: "'Outfit',sans-serif", transition: 'background .15s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,.1)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      View All
    </button>
  );
}

export default function Dashboard({ setPage, onViewStudent }) {
  const { advisor, students, appts } = useApp();

  const highRisk = (students || []).filter(s => s.riskLevel === 'high');
  const mediumRisk = (students || []).filter(s => s.riskLevel === 'medium');
  const upcoming = (appts || []).filter(a => a.status === 'booked');

  const atRisk = [
    ...students.filter(s => s.riskLevel === 'high'),
    ...students.filter(s => s.riskLevel === 'medium'),
    ...students.filter(s => s.riskLevel === 'low'),
  ];

  const todayAppts = [...upcoming]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 4)
    .map(a => ({ ...a, student: students.find(s => s.id === a.sid) }));

  function gpaColor(gpa) {
    if (gpa >= 3.7) return 'var(--green)';
    if (gpa >= 3) return 'var(--blue)';
    if (gpa >= 2.33) return 'var(--amber)';
    if (gpa >= 2) return '#f97316';
    return 'var(--rose)';
  }
  function riskLabel(r) {
    if (r === 'high') return { text: 'High Risk', color: 'var(--rose)' };
    if (r === 'medium') return { text: 'Medium', color: 'var(--amber)' };
    return { text: 'Low Risk', color: 'var(--green)' };
  }

  function apptStatusStyle(a) {
    const st = students.find(s => s.id === a.sid);
    if (st?.riskLevel === 'high') return { text: 'High Risk', color: 'var(--rose)' };
    return { text: 'Booked', color: 'var(--blue2)' };
  }

  return (
    <div style={{ padding: '26px 30px', animation: 'fadeIn .25s ease', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>

      {/* Welcome — no breadcrumb div with bell/advisor dashboard label */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontFamily: "'Libre Baskerville',serif", fontSize: '1.45rem', color: 'var(--white)' }}>
          Welcome, {advisor?.name}
        </div>
        <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 5 }}>
          {CURRENT_SEM.label} · {advisor?.dept} Department
        </div>
      </div>

      {/* 4 stat cards */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 22 }}>
        <TopStatCard icon="👥" value={students.length} label="Total Students"
          sub={`Max: ${advisor?.maxStudents}`} subColor="var(--muted)"
          accentColor="linear-gradient(90deg,#7c3aed,#a78bfa)" />
        <TopStatCard icon="🚨" value={highRisk.length} label="High Risk"
          sub="Needs attention" subColor="var(--rose)"
          accentColor="linear-gradient(90deg,var(--rose),#fda4af)"
          onClick={() => setPage('students')} />
        <TopStatCard icon="⚠️" value={mediumRisk.length} label="Medium Risk"
          sub="Monitor closely" subColor="var(--amber)"
          accentColor="linear-gradient(90deg,var(--amber),#fcd34d)"
          onClick={() => setPage('students')} />
        <TopStatCard icon="📅" value={upcoming.length} label="Pending Apts."
          sub="This week" subColor="var(--muted)"
          accentColor="linear-gradient(90deg,var(--teal),#5eead4)"
          onClick={() => setPage('appts')} />
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, flex: 1, minHeight: 0 }}>

        {/* Students At Risk */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 13, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--white)' }}>Students At Risk</span>
            <ViewAllBtn onClick={() => setPage('students')} />
          </div>
          <div style={{ overflowY: 'auto', flex: 1, scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {atRisk.length === 0
              ? <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>All students are on track ✅</div>
              : atRisk.map((s, i) => {
                const rl = riskLabel(s.riskLevel);
                return (
                  <div key={s.id} onClick={() => onViewStudent(s)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: i < atRisk.length - 1 ? '1px solid var(--border2)' : 'none', cursor: 'pointer', transition: 'background .12s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <Avatar initials={s.av} risk={s.riskLevel} size={36} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--white)' }}>{s.name}</div>
                      <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 2 }}>Level {s.level} </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 16, fontWeight: 700, color: gpaColor(s.cumGPA) }}>{s.cumGPA.toFixed(2)}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: rl.color, marginTop: 2 }}>{rl.text}</div>
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>

        {/* Today's Appointments — same header style as Students At Risk */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 13, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--white)' }}>Today's Appointments</span>
            {/* Same View All button style as Students At Risk */}
            <ViewAllBtn onClick={() => setPage('appts')} />
          </div>
          <div style={{ overflowY: 'auto', flex: 1, scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {todayAppts.length === 0
              ? <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>No upcoming appointments</div>
              : todayAppts.map((a, i) => {
                const ast = apptStatusStyle(a);
                return (
                  <div key={a.id}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', margin: '8px 12px', background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 10, marginBottom: 8 }}
                  >
                    <div style={{ width: 44, flexShrink: 0, textAlign: 'center', background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', borderRadius: 9, padding: '6px 4px' }}>
                      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 17, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{getDay(a.date)}</div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,.75)', textTransform: 'uppercase', fontWeight: 600, marginTop: 2 }}>{getMon(a.date)}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--white)' }}>{a.student?.name || 'Unknown'}</div>
                      <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 3 }}>⏰ {a.time}</div>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: ast.color, background: ast.color === 'var(--rose)' ? 'rgba(251,113,133,.1)' : 'rgba(59,130,246,.08)', border: `1px solid ${ast.color === 'var(--rose)' ? 'rgba(251,113,133,.3)' : 'rgba(59,130,246,.25)'}`, borderRadius: 6, padding: '3px 10px' }}>
                      {ast.text}
                    </span>
                  </div>
                );
              })
            }
          </div>
        </div>
      </div>
    </div>
  );
}
