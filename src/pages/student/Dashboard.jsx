// ─────────────────────────────────────────────────────────────
//  PAGE: Dashboard 
//  - GPA card color by risk (rose/amber/blue)
//  - Failed Courses replaces CH This Semester
//  - Current Semester Courses hidden until regConfirmed
//  - NO "Registration Open" CTA card
//  - Manage Registration re-opens if period open
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { useApp } from '../../contexts/StudentContext';
import { COURSES } from '../../services/studentMockData';
import { isRegOpen } from '../../services/studentLogic';
import {
  StatCard, Card, CardHead, CardBody, CardTitle,
  Btn, GPABar, RiskBadge, CodeChip, AttBadge, Empty,
} from '../../components/StudentUI';

function getDay(d) { return new Date(d + 'T12:00:00').getDate(); }
function getMon(d) { return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' }).toUpperCase(); }

// Sub-text style — visible but not too bright
const sub = { color: '#8fadc8', fontSize: 11, marginTop: 3 };

export default function Dashboard({ setPage }) {
  const {
    student, advisor, gpa, chPassed, failed,
    current, risk, gpaHist, appts,
    regConfirmed, dispatch, toast,
  } = useApp();

  const upcoming = (appts || []).filter(a => a.status === 'booked');
  const gpaTheme = risk === 'high' ? 'rose' : risk === 'medium' ? 'amber' : 'blue';
  const failedCount = Array.isArray(failed) ? failed.length : (failed || 0);
  const failedTheme = failedCount === 0 ? 'green' : failedCount <= 1 ? 'amber' : 'rose';

  function handleManage() {
    if (regConfirmed && isRegOpen()) {
      dispatch({ type: 'UNCONFIRM_REG' });
      toast('Registration re-opened — modify your selection', 'inf');
    } else if (!isRegOpen()) {
      toast('⏰ Registration period is closed', 'err');
    }
    setPage('reg');
  }

  return (
    <div style={{ padding: '26px 30px', animation: 'fadeIn .25s ease' }}>

      {/* Header */}
      <div style={{ marginBottom: 22, paddingBottom: 14, borderBottom: '1px solid var(--border2)' }}>
        <div style={{ fontFamily: "'Libre Baskerville',serif", fontSize: '1.43rem', color: 'var(--white)' }}>
          Welcome back, {student?.name}
        </div>
        <div style={{ fontSize: 15, color: '#8fadc8', marginTop: 3 }} >Spring 2025/2026 · {student?.dept} Department</div>
      </div>

      {/* Stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 18, fontSize: "" }}>
        <StatCard theme={gpaTheme} icon="📊" value={gpa.toFixed(2)} label="Cumulative GPA" sub={<RiskBadge risk={risk} />} />
        <StatCard theme={failedTheme} icon="⚠️" value={Array.isArray(failed) ? failed.length : failed} label="Failed Courses"
          sub={(Array.isArray(failed) ? failed.length : failed) === 0
            ? <span style={{ color: 'var(--green)' }}>✓ No failures</span>
            : Array.isArray(failed)
              ? <span style={{ color: 'var(--rose)', fontSize: 9.5 }}>{failed.slice(0, 2).join(', ')}{failed.length > 2 ? '…' : ''}</span>
              : <span style={{ color: 'var(--rose)', fontSize: 9.5 }}>Review your transcript</span>
          }
        />
        <StatCard theme="violet" icon="📅" value={upcoming.length} label="Upcoming Appts."
          sub={<span style={{ color: 'var(--blue2)' }}>Click to view</span>}
          onClick={() => setPage('appts')}
        />
      </div>

      {/* Two-col */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <Card>
          <CardHead>
            <CardTitle>GPA Progression</CardTitle>
            <Btn size="sm" variant="outline" onClick={() => setPage('courses')}>Full Transcript</Btn>
          </CardHead>
          <CardBody>
            {gpaHist.length === 0
              ? <Empty icon="📈" text="No GPA history yet" />
              : gpaHist.map((h, i) => {
                const semName = h.semester || h.sem || '';
                return <GPABar key={semName + '-' + i} sem={semName.replace(/ \d{2}\/\d{2}/, '')} gpa={h.gpa} />;
              })
            }
          </CardBody>
        </Card>

        <Card>
          <CardHead>
            <CardTitle>Upcoming Appointments</CardTitle>
            <Btn size="sm" variant="outline" onClick={() => setPage('appts')}>View All</Btn>
          </CardHead>
          <CardBody>
            {upcoming.length === 0
              ? <Empty icon="📅" text="No upcoming appointments"><Btn size="sm" onClick={() => setPage('book')} style={{ marginTop: 12 }}>Book Now</Btn></Empty>
              : <>
                {upcoming.slice(0, 2).map(a => (
                  <div key={a.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
                    borderRadius: 10, marginBottom: 8,
                    border: '1px solid rgba(59,130,246,.25)', background: 'rgba(59,130,246,.04)',
                  }}>
                    <div style={{ width: 42, flexShrink: 0, textAlign: 'center' }}>
                      <div style={{ fontSize: 17, fontWeight: 700, fontFamily: "'DM Mono',monospace", borderRadius: 7, padding: '4px 7px', background: 'rgba(59,130,246,.15)', color: 'var(--blue2)' }}>{getDay(a.date)}</div>
                      <div style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600, marginTop: 2 }}>{getMon(a.date)}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--white)' }}>{advisor?.name} — {a.type}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>⏰ {a.time}</div>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--blue2)' }}>Booked</div>
                  </div>
                ))}
                <Btn size="sm" onClick={() => setPage('book')} style={{ marginTop: 4 }}>+ Book New</Btn>
              </>
            }
          </CardBody>
        </Card>
      </div>

      {/* Current Semester Courses — only after confirmed */}
      {regConfirmed && (
        <Card style={{ animation: 'fadeIn .3s ease' }}>
          <CardHead>
            <CardTitle>Current Semester Courses</CardTitle>
            <Btn size="sm" onClick={handleManage}>⚙️ Manage Registration</Btn>
          </CardHead>
          {current.length === 0
            ? <Empty icon="📖" text="No courses enrolled this semester" />
            : <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead style={{ background: 'rgba(255,255,255,.02)' }}>
                  <tr>
                    {['Code', 'Course', 'CH', 'Status', 'Attempt'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 9.5, fontWeight: 700, letterSpacing: .6, textTransform: 'uppercase', color: 'var(--dim)', borderBottom: '1px solid var(--border2)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {current.map(c => {
                    const co = COURSES.find(x => x.code === c.code);
                    return (
                      <tr key={c.code}>
                        <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,.03)' }}><CodeChip code={c.code} /></td>
                        <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,.03)', color: 'var(--white)' }}>{co?.name || c.code}</td>
                        <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,.03)', color: 'var(--white)' }}>{co?.ch || 3}</td>
                        <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,.03)' }}><span style={{ color: 'var(--blue2)', fontSize: 11, fontWeight: 600 }}>Enrolled</span></td>
                        <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,.03)' }}><AttBadge n={c.attempt} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          }
        </Card>
      )}

    </div>
  );
}
