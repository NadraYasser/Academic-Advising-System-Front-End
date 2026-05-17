
import React, { useState } from 'react';
import { useApp } from '../../contexts/AdvisorContext';
import { Avatar, Empty } from '../../components/AdvisorUI';

function fmtDate(d) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function fmtBookedOn(apptId) {
  const str = String(apptId || '');
  const seed = parseInt(str.replace(/\D/g, '')) || 1;
  const offsets = [3, 6, 5, 8, 4, 2, 7, 3, 10, 5];
  const times = ['09:00', '10:30', '14:15', '11:00', '09:00', '16:45', '08:30', '13:20'];
  return `Mar ${offsets[(seed - 1) % offsets.length] || 3} · ${times[(seed - 1) % times.length] || '10:00'}`;
}

function ApptStatCard({ icon, value, label, accentColor }) {
  return (
    <div style={{ flex: 1, background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 13, padding: '22px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accentColor }} />
      <div style={{ fontSize: 28, marginBottom: 10, lineHeight: 1 }}>{icon}</div>
      <div style={{ fontFamily: "'Libre Baskerville',serif", fontSize: '2.2rem', color: 'var(--white)', lineHeight: 1, marginBottom: 5 }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

export default function Appointments({ setPage }) {
  const { appts, students, updateApptStatus, toast } = useApp();
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');

  
  const upcoming = appts.filter(a => a.status === 'booked').length;
  const attended = appts.filter(a => a.status === 'attended').length;
  const cancelled = appts.filter(a => a.status === 'cancelled' || a.status === 'noshow').length;

  // ── Actions ───────────────────────────────────────────────
  async function markAttended(id) {
    try {
      await updateApptStatus(id, 'Attended');
      toast('Marked as attended ✓', 'ok');
    } catch (err) {
      toast(err.message, 'err');
    }
  }

  // No Show → يُخزَّن كـ cancelled مباشرة
  async function markNoShow(id) {
    try {
      await updateApptStatus(id, 'Cancelled');
      toast('Marked as cancelled', 'inf');
    } catch (err) {
      toast(err.message, 'err');
    }
  }

  const filtered = appts
    .filter(a => {
      if (!filter) return true;
      if (filter === 'cancelled') return a.status === 'cancelled' || a.status === 'noshow';
      return a.status === filter;
    })
    .filter(a => {
      if (!search) return true;
      const st = students.find(s => s.id === a.sid);
      return st?.name.toLowerCase().includes(search.toLowerCase());
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div style={{ padding: '26px 30px', animation: 'fadeIn .25s ease', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>

      {/* ── 3 Stat Cards فقط ── */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
        <ApptStatCard icon="📅" value={upcoming} label="Upcoming" accentColor="linear-gradient(90deg,var(--blue),var(--blue2))" />
        <ApptStatCard icon="✅" value={attended} label="Attended" accentColor="linear-gradient(90deg,var(--green),#6ee7b7)" />
        <ApptStatCard icon="✖️" value={cancelled} label="Cancelled" accentColor="linear-gradient(90deg,var(--rose),#fda4af)" />
      </div>

      {/* ── Table Card ── */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 13, overflow: 'hidden', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ padding: '13px 18px', borderBottom: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--white)' }}>All Appointments</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--bg2)', border: '1.5px solid var(--border2)', borderRadius: 7, padding: '7px 10px' }}>
              <span style={{ fontSize: 15, color: 'var(--dim)' }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--white)', fontFamily: "'Outfit',sans-serif", fontSize: 12.5, width: 110 }} />
            </div>
            <select value={filter} onChange={e => setFilter(e.target.value)}
              style={{ background: 'var(--bg2)', border: '1.5px solid var(--border2)', borderRadius: 7, padding: '7px 10px', fontFamily: "'Outfit',sans-serif", fontSize: 13, color: 'var(--muted)', outline: 'none', cursor: 'pointer' }}>
              <option value="">All Status</option>
              <option value="booked">Booked</option>
              <option value="attended">Attended</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0
          ? <div style={{ padding: '44px 20px', textAlign: 'center', color: 'var(--muted)', flex: 1 }}>
            <div style={{ fontSize: 34, marginBottom: 10 }}>🗓</div>
            <div style={{ fontSize: 13.5, fontWeight: 500 }}>No appointments found</div>
          </div>
          : (
            <div style={{ overflowX: 'auto', overflowY: 'auto', flex: 1, scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead style={{ background: 'rgba(255,255,255,.02)' }}>
                  <tr>
                    {['STUDENT', 'RISK', 'DATE', 'TIME', 'BOOKED ON', 'STATUS', 'ACTION'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 14, fontWeight: 700, letterSpacing: .6, textTransform: 'uppercase', color: 'var(--dim)', borderBottom: '1px solid var(--border2)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => {
                    const student = a.student || {};
                    const isBooked = a.status === 'booked';
                    const isAttended = a.status === 'attended';
                    // noshow و cancelled كلاهما يظهران كـ Cancelled
                    const isCancelled = a.status === 'cancelled' || a.status === 'noshow';
                    const risk = student.riskLevel || 'low';
                    const riskLabel = { high: 'High', medium: 'Medium', low: 'Low' }[risk];
                    const riskStyle = {
                      high: { color: 'var(--rose)', bg: 'rgba(251,113,133,.12)', border: 'rgba(251,113,133,.3)' },
                      medium: { color: 'var(--amber)', bg: 'rgba(245,158,11,.1)', border: 'rgba(245,158,11,.3)' },
                      low: { color: 'var(--green)', bg: 'rgba(52,211,153,.1)', border: 'rgba(52,211,153,.3)' },
                    }[risk];

                    return (
                      <tr key={a.id}
                        style={{ borderBottom: '1px solid var(--border2)', opacity: isCancelled ? .55 : 1, transition: 'background .12s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.015)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}
                      >
                        <td style={{ padding: '13px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                            <Avatar initials={student.av || '??'} risk={risk} size={28} />
                            <span style={{ fontWeight: 600, color: 'var(--white)', fontSize: 16 }}>{student.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          <span style={{ fontSize: 14, fontWeight: 600, padding: '3px 10px', borderRadius: 6, color: riskStyle.color, background: riskStyle.bg, border: `1px solid ${riskStyle.border}` }}>{riskLabel}</span>
                        </td>
                        <td style={{ padding: '13px 16px', color: 'var(--white)', fontWeight: 500, fontSize: 14 }}>{fmtDate(a.date)}</td>
                        <td style={{ padding: '13px 16px', fontFamily: "'DM Mono',monospace", color: 'var(--white)', fontSize: 14 }}>{a.time}</td>
                        <td style={{ padding: '13px 16px', color: 'var(--muted)', fontSize: 13.5 }}>{fmtBookedOn(a.id)}</td>
                        <td style={{ padding: '13px 16px', fontSize: 14 }}>
                          {isBooked
                            ? <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue2)', background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.28)', borderRadius: 6, padding: '3px 10px' }}>Booked</span>
                            : isAttended
                              ? <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)', background: 'rgba(52,211,153,.1)', border: '1px solid rgba(52,211,153,.28)', borderRadius: 6, padding: '3px 10px' }}>Attended</span>
                              : <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--dim)', background: 'rgba(255,255,255,.04)', border: '1px solid var(--border2)', borderRadius: 6, padding: '3px 10px' }}>Cancelled</span>
                          }
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          {isBooked && (
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button onClick={() => markAttended(a.id)} style={{ padding: '5px 12px', borderRadius: 7, fontSize: 14, fontWeight: 700, background: 'linear-gradient(135deg,var(--green),#059669)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: "'Outfit',sans-serif", whiteSpace: 'nowrap' }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                ✓ Attended
                              </button>
                              <button onClick={() => markNoShow(a.id)} style={{ padding: '5px 12px', borderRadius: 7, fontSize: 14, fontWeight: 600, background: 'rgba(251,113,133,.1)', color: 'var(--rose)', border: '1px solid rgba(251,113,133,.3)', cursor: 'pointer', fontFamily: "'Outfit',sans-serif", whiteSpace: 'nowrap' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(251,113,133,.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(251,113,133,.1)'}>
                                Cancelled
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        }
      </div>
    </div>
  );
}
