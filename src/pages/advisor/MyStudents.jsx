// ─────────────────────────────────────────────────────────────
//  PAGE: My Students 
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { useState } from 'react';
import { useApp } from '../../contexts/AdvisorContext';
import { COURSES, HISTORY } from '../../services/advisorMockData';
import { Avatar } from '../../components/AdvisorUI';

export default function MyStudents({ setPage, onViewStudent }) {
  const { students } = useApp();
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  const filtered = students.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    const matchRisk = !riskFilter || s.riskLevel === riskFilter;
    const matchLevel = !levelFilter || String(s.level) === levelFilter;
    return matchSearch && matchRisk && matchLevel;
  });

  const needAttention = students.filter(s => s.riskLevel !== 'low').length;
  const levels = [...new Set(students.map(s => s.level))].sort();

  function riskBadge(r) {
    const map = {
      high: { text: 'High Risk', color: 'var(--rose)', bg: 'rgba(251,113,133,.12)', border: 'rgba(251,113,133,.3)' },
      medium: { text: 'Medium', color: 'var(--amber)', bg: 'rgba(245,158,11,.1)', border: 'rgba(245,158,11,.3)' },
      low: { text: 'Low Risk', color: 'var(--green)', bg: 'rgba(52,211,153,.1)', border: 'rgba(52,211,153,.3)' },
    };
    const r2 = map[r] || map.low;
    return (
      <span style={{ fontSize: 14, fontWeight: 600, padding: '3px 10px', borderRadius: 6, color: r2.color, background: r2.bg, border: `1px solid ${r2.border}` }}>
        {r2.text}
      </span>
    );
  }

  function failedBadge(codes) {
    if (codes.length === 0) return <span style={{ fontSize: 15, color: 'var(--green)' }}>0</span>;
    return (
      <span style={{ fontSize: 14, fontWeight: 600, padding: '3px 10px', borderRadius: 6, color: 'var(--rose)', background: 'rgba(251,113,133,.1)', border: '1px solid rgba(251,113,133,.25)' }}>
        {codes.length} course{codes.length > 1 ? 's' : ''}
      </span>
    );
  }

  function getCurrentCH(s) {
    return s.currentCH ?? 0;
  }

  return (
    <div style={{ padding: '26px 30px', animation: 'fadeIn .25s ease', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>

      {/* Header — title 2 sizes bigger than before (was 1.4rem, now 1.7rem) */}
      <div style={{ marginBottom: 22, paddingBottom: 14, borderBottom: '1px solid var(--border2)' }}>
        <div style={{ fontFamily: "'Libre Baskerville',serif", fontSize: '1.7rem', color: 'var(--white)' }}>
          My Students
        </div>
        <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>
          {students.length} students · {needAttention} need attention
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--card)', border: '1.5px solid var(--border2)', borderRadius: 8, padding: '8px 12px', flex: 1, maxWidth: 280 }}>
          <span style={{ fontSize: 15, color: 'var(--dim)' }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search student..."
            style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--white)', fontFamily: "'Outfit',sans-serif", fontSize: 14, flex: 1 }}
          />
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)}
            style={{ background: 'var(--card)', border: '1.5px solid var(--border2)', borderRadius: 8, padding: '8px 12px', color: 'var(--muted)', fontFamily: "'Outfit',sans-serif", fontSize: 14, outline: 'none', cursor: 'pointer' }}>
            <option value="">All Risk Levels</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>
          <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)}
            style={{ background: 'var(--card)', border: '1.5px solid var(--border2)', borderRadius: 8, padding: '8px 12px', color: 'var(--muted)', fontFamily: "'Outfit',sans-serif", fontSize: 14, outline: 'none', cursor: 'pointer' }}>
            <option value="">All Levels</option>
            {levels.map(l => <option key={l} value={l}>Level {l}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 13, overflow: 'hidden', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {filtered.length === 0
          ? (
            <div style={{ padding: '44px 20px', textAlign: 'center', color: 'var(--muted)', flex: 1 }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>👥</div>
              <div style={{ fontSize: 12.5, fontWeight: 500 }}>No students found</div>
            </div>
          )
          : (
            <div style={{ overflowX: 'auto', overflowY: 'auto', flex: 1, scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead style={{ background: 'rgba(255,255,255,.02)' }}>
                  <tr>
                    {['STUDENT', 'LEVEL', 'CUM. GPA', 'CH THIS SEM', 'FAILED', 'RISK', 'ACTION'].map(h => (
                      <th key={h} style={{
                        textAlign: 'left',
                        fontWeight: 700, letterSpacing: .6, textTransform: 'uppercase',
                        borderBottom: '1px solid var(--border2)', whiteSpace: 'nowrap',
                        padding: '10px 12px', color: 'var(--dim)', fontSize: 14
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => (
                    <tr key={s.id}
                      style={{ borderBottom: '1px solid var(--border2)', transition: 'background .12s', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.015)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                      onClick={() => onViewStudent(s)}
                    >
                      {/* STUDENT */}
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar initials={s.av} risk={s.riskLevel} size={32} />
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--white)', fontSize: 16 }}>{s.name}</div>

                          </div>
                        </div>
                      </td>

                      {/* LEVEL */}
                      <td style={{ padding: '13px 16px', color: 'var(--muted)', fontSize: 15 }}>{s.level}</td>

                      {/* CUM. GPA */}
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{
                          fontFamily: "'DM Mono',monospace", fontWeight: 700, fontSize: 15,
                          //color: s.cumGPA < 2 ? 'var(--rose)' : s.cumGPA < 3 ? 'var(--amber)' : 'var(--green)',
                          color: s.cumGPA >= 3.7 ? 'var(--green)' : s.cumGPA >= 3 ? 'var(--blue)' : s.cumGPA >= 2.33 ? 'var(--amber)' : s.cumGPA >= 2 ? '#f97316' : 'var(--rose)'
                        }}>
                          {s.cumGPA.toFixed(2)}
                        </span>
                      </td>

                      {/* CH THIS SEM */}
                      <td style={{ fontSize: 15, padding: '13px 16px', color: 'var(--white)', fontFamily: "'DM Mono',monospace" }}>
                        {s.allowedMaxCH} CH
                      </td>

                      {/* FAILED */}
                      <td style={{ fontSize: 15, padding: '13px 16px' }}>{failedBadge(s.failedCodes)}</td>

                      {/* RISK */}
                      <td style={{ fontSize: 15, padding: '13px 16px' }}>{riskBadge(s.riskLevel)}</td>

                      {/* ACTION — View opens Student Profile page */}
                      <td style={{ padding: '13px 16px' }} onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => onViewStudent(s)}
                          style={{
                            padding: '6px 16px', borderRadius: 7, fontSize: 15, fontWeight: 700,
                            background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                            color: '#fff', border: 'none', cursor: 'pointer',
                            fontFamily: "'Outfit',sans-serif", transition: 'opacity .15s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </div>
    </div>
  );
}
