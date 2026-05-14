// ─────────────────────────────────────────────────────────────
//  Dashboard Page — Dark Theme — مطابق للـ Wireframe
//  GET /api/admin/dashboard
//  Response: { overview, risk_distribution, appointments, departments }
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { useApp } from '../../contexts/AdminContext';
import { Loader, Empty } from '../../components/AdminUI';

// ── Stat Card ────────────────────────────────────────────────
function StatCard({ icon, value, label, sub, subColor, borderColor, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: 'var(--card)',
      border: '1px solid var(--border2)',
      borderTop: `3px solid ${borderColor}`,
      borderRadius: 10,
      padding: '30px 15px',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'box-shadow .2s',
       //display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, marginBottom: 25  ,fontSize:"13",
       alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 ,fontSize:"13",
    }}
    onMouseEnter={e => onClick && (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,.3)')}
    onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      <div style={{ fontSize: 26, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 50, fontWeight: 400, color: 'var(--white)', lineHeight: 1, marginBottom: 8, gap: 8}}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div style={{ fontSize: 15, color: 'var(--muted)', fontWeight: 500  }}>{label}</div>
      {sub && <div style={{ fontSize: 13, color: subColor || 'var(--dim)' }}>{sub}</div>}
    </div>
  );
}
//<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 18  ,fontSize:""}}></div>

// ── Risk Bar ─────────────────────────────────────────────────
function RiskBar({ label, count, total }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  const colors = { 'High Risk': 'var(--rose)', 'Medium': 'var(--amber)', 'Low Risk': 'var(--green)' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
      <span style={{ fontSize: 15, color: 'var(--muted)', width: 80, textAlign: 'right', flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 12, background: 'rgba(255,255,255,.06)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 99,
          background: colors[label],
          width: `${pct}%`,
          transition: 'width .7s ease',
        }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--white)', width: 32, textAlign: 'right' }}>{count}</span>
    </div>
  );
}

// ── Donut Chart (SVG) ────────────────────────────────────────
function DonutChart({ attended, booked, cancelled, total }) {
  const r = 54, cx = 70, cy = 70, stroke = 22;
  const circumference = 2 * Math.PI * r;
  const segments = [
    { value: attended,  color: 'var(--green)' },
    { value: booked,    color: 'var(--blue2)'  },
    { value: cancelled, color: 'var(--rose)'  },
  ];
  let offset = 0;
  const arcs = segments.map(seg => {
    const pct  = total ? seg.value / total : 0;
    const dash = pct * circumference;
    const gap  = circumference - dash;
    const arc  = { ...seg, dash, gap, offset: circumference * (1 - offset) - dash };
    offset += pct;
    return arc;
  });

  return (
    <svg width={140} height={140} viewBox="0 0 140 140">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={stroke} />
      {arcs.map((arc, i) => (
        <circle key={i} cx={cx} cy={cy} r={r}
          fill="none" stroke={arc.color} strokeWidth={stroke}
          strokeDasharray={`${arc.dash} ${arc.gap}`}
          strokeDashoffset={arc.offset}
          style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
        />
      ))}
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize={18} fontWeight={800} fill="#e8f0fe">
        {total?.toLocaleString()}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize={10} fill="#8fadc8">total</text>
    </svg>
  );
}

// ── Table helpers ────────────────────────────────────────────
const Th = ({ children }) => (
  <th style={{
    padding: '10px 16px', textAlign: 'left', fontSize: 13,
    fontWeight: 600, color: 'var(--dim)', letterSpacing: .6,
    textTransform: 'uppercase', borderBottom: '1px solid var(--border2)',
    background: 'rgba(255,255,255,.02)',
  }}>
    {children}
  </th>
);

const Td = ({ children, style }) => (
  <td style={{
    padding: '12px 16px', fontSize: 13,
    color: 'var(--muted)', borderBottom: '1px solid rgba(255,255,255,.03)',
    ...style,
  }}>
    {children}
  </td>
);

// ── Section wrapper ──────────────────────────────────────────
function Section({ title, sub, children }) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border2)',
      borderRadius: 10, overflow: 'hidden', marginBottom: 18,
    }}>
      <div style={{
        padding: '14px 18px', borderBottom: '1px solid var(--border2)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--white)' }}>{title}</span>
        {sub && <span style={{ fontSize: 15, color: 'var(--dim)' }}>{sub}</span>}
      </div>
      {children}
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────
export default function Dashboard({ onNavigate }) {
  const { stats, students, advisors, courses, semesters, loading } = useApp();
  if (loading) return <Loader />;

  const overview = stats?.overview ?? {};
  const riskDist = stats?.risk_distribution ?? {};
  const appts    = stats?.appointments ?? null;
  const depts    = stats?.departments ?? [];

  const total    = overview.total_students   ?? students.length;
  const totalAdv = overview.active_advisors  ?? advisors.length;
  const totalCrs = overview.total_courses    ?? courses.length;
  const atRisk   = overview.at_risk_students ?? students.filter(s => s.risk === 'High').length;
  const high     = riskDist.high   ?? students.filter(s => s.risk === 'High').length;
  const medium   = riskDist.medium ?? students.filter(s => s.risk === 'Medium').length;
  const low      = riskDist.low    ?? students.filter(s => s.risk === 'Low').length;

  const activeSem   = semesters.find(s => s.status === 'Active');
  const activeLabel = activeSem ? `${activeSem.sem} ${activeSem.year}` : '—';

  const apptTotal     = appts?.total     ?? 0;
  const apptAttended  = appts?.attended  ?? 0;
  const apptBooked    = appts?.booked    ?? 0;
  const apptCancelled = appts?.cancelled ?? 0;

  const prereqCount = courses.filter(c => c.prereq && c.prereq !== 'None').length;

  return (
    <div style={{ padding: '24px 28px', background: 'var(--bg)', minHeight: '100%', animation: 'fadeIn .25s ease' }}>

      {/* ── Page header ── */}
      

      {/* ── Section title ── */}
      
      <div style={{ marginBottom: 22, paddingBottom: 14, borderBottom: '1px solid var(--border2)'}}>
        <div style={{ fontFamily: "'Libre Baskerville',serif", fontSize: '1.45rem', color: 'var(--white)', gap: 8 }}>
          System Overview 📊
        </div>
        <div style={{ fontSize: 15, color: 'var(--dim)', marginTop: 3 }}>
          Academic Advising System · {activeLabel}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 18}}>
        <StatCard icon='' value={total}    label='Total Students'  sub={`${depts.length || '—'} departments`}    borderColor='var(--blue)'   onClick={() => onNavigate('students')} />
        <StatCard icon='' value={totalAdv} label='Active Advisors' sub='This semester'                           borderColor='var(--violet)' onClick={() => onNavigate('advisors')} />
        <StatCard icon='' value={totalCrs} label='Total Courses'   sub={`${prereqCount} with prereqs`}            borderColor='var(--green)'  onClick={() => onNavigate('courses')} />
        <StatCard icon='' value={atRisk}   label='At-Risk Students' sub={total ? `↑ ${((atRisk/total)*100).toFixed(0)}% this semester` : '—'} subColor='var(--rose)' borderColor='var(--rose)' />
      </div>

      {/* ── Risk + Appointments ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>

        {/* Risk Distribution */}
        <Section title='Risk Level Distribution' sub={`All active students · ${total.toLocaleString()} total`}>
          <div style={{ padding: '18px 20px' }}>
            {(high + medium + low) === 0 ? (
              <Empty icon='📊' text='No student data yet.' />
            ) : (
              <>
                <RiskBar label='High Risk' count={high}   total={total} />
                <RiskBar label='Medium'    count={medium} total={total} />
                <RiskBar label='Low Risk'  count={low}    total={total} />
                <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border2)' }}>
                  {[['High Risk', high, 'var(--rose)'], ['Medium', medium, 'var(--amber)'], ['Low Risk', low, 'var(--green)']].map(([lbl, val, clr]) => (
                    <div key={lbl} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 600, color: clr }}>{total ? `${Math.round((val/total)*100)}%` : '—'}</div>
                      <div style={{ fontSize: 13, color: 'var(--dim)', marginTop: 2 }}>{lbl}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Section>

        {/* Appointment Statistics */}
        <Section title='Appointment Statistics' sub={apptTotal ? `Current semester · ${apptTotal.toLocaleString()} total` : ''}>
          <div style={{ padding: '18px 20px' }}>
            {apptTotal === 0 ? (
              <Empty icon='📅' text='No appointment data yet.' />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <DonutChart attended={apptAttended} booked={apptBooked} cancelled={apptCancelled} total={apptTotal} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    ['Attended',  apptAttended,  'var(--green)'],
                    ['Booked',    apptBooked,    'var(--blue2)'],
                    ['Cancelled', apptCancelled, 'var(--rose)'],
                  ].map(([lbl, val, clr]) => (
                    <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: clr, flexShrink: 0 }} />
                      <span style={{ fontSize: 15, color: 'var(--muted)' }}>
                        {lbl} —{' '}
                        <span style={{ fontWeight: 600, color: 'var(--white)' }}>{val?.toLocaleString()}</span>
                        {apptTotal ? <span style={{ color: 'var(--dim)' }}> ({((val/apptTotal)*100).toFixed(1)}%)</span> : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>
      </div>

      {/* ── Students per Department ── */}
      <Section title='Students per Department' sub={`${depts.length} departments`}>
        {depts.length === 0 ? (
          <div style={{ padding: 20 }}><Empty icon='🏫' text='No department data yet.' /></div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <Th>Department</Th>
                <Th>Students</Th>
                <Th>Advisors</Th>
                <Th>High Risk</Th>
                <Th>Appointments</Th>
                <Th>Avg GPA</Th>
              </tr>
            </thead>
            <tbody>
              {depts.map((d, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,.01)' }}>
                  <Td style={{ fontWeight: 600, color: 'var(--white)' }}>{d.name}</Td>
                  <Td>{d.students_count?.toLocaleString()}</Td>
                  <Td>{d.advisors_count}</Td>
                  <Td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      minWidth: 28, height: 22, borderRadius: 99, fontSize: 13, fontWeight: 600,
                      background: d.high_risk > 0 ? 'rgba(251,113,133,.15)' : 'rgba(255,255,255,.05)',
                      color: d.high_risk > 0 ? 'var(--rose)' : 'var(--dim)',
                      padding: '0 8px',
                    }}>
                      {d.high_risk ?? 0}
                    </span>
                  </Td>
                  <Td>{d.appointments_count ?? '—'}</Td>
                  <Td style={{
                    fontWeight: 700,
                    color: d.avg_gpa >= 3 ? 'var(--green)' : d.avg_gpa < 2.5 ? 'var(--rose)' : 'var(--white)',
                  }}>
                    {d.avg_gpa != null ? Number(d.avg_gpa).toFixed(2) : '—'}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

    </div>
  );
}