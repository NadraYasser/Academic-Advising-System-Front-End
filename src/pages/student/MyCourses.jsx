import React from 'react';
import { useState } from 'react';
import { useApp } from '../../contexts/StudentContext';
import { COURSES } from '../../services/studentMockData';
import { getCompletedSems, gradeClass } from '../../services/studentLogic';
import { Card, CardHead, CardBody, CardTitle, GPABar, CodeChip, AttBadge, Empty } from '../../components/StudentUI';

const PER_PAGE = 8;

// Grade groups — D and F are separate
const GRADE_GROUPS = [
  { key: 'A+/A', grades: ['A+', 'A', 'A-'], color: 'var(--green)' },
  { key: 'B+/B', grades: ['B+', 'B', 'B-'], color: 'var(--blue2)' },
  { key: 'C+/C', grades: ['C+', 'C', 'C-'], color: 'var(--amber)' },
  { key: 'D+/D', grades: ['D+', 'D'], color: '#f97316' },
  { key: 'F', grades: ['F'], color: 'var(--rose)' },
];

export default function MyCourses() {
  const { history, gpaHist } = useApp();
  const [semFilter, setSemFilter] = useState('');
  const [page, setPage] = useState(1);

  // Only completed semesters
  const completedSems = getCompletedSems(history);
  const semGroups = {};
  history.forEach(c => { if (!semGroups[c.sem]) semGroups[c.sem] = []; semGroups[c.sem].push(c); });
  const completedHist = history.filter(c => semGroups[c.sem]?.every(x => x.status !== 'enrolled'));

  const filtered = semFilter ? completedHist.filter(c => c.sem === semFilter) : completedHist;
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  function handleSemChange(val) { setSemFilter(val); setPage(1); }

  // Grade distribution — grouped
  const gradedCourses = history.filter(c => c.status !== 'enrolled' && c.grade !== '—' && c.grade !== null);
  const total = gradedCourses.length;

  const groupCounts = GRADE_GROUPS.map(grp => ({
    ...grp,
    count: gradedCourses.filter(c => grp.grades.includes(c.grade)).length,
  })).filter(grp => grp.count > 0);

  // Conic gradient
  let cum2 = 0;
  const conicParts = groupCounts.map(grp => {
    const pct = total > 0 ? (grp.count / total * 100) : 0;
    const part = `${grp.color} ${cum2}% ${cum2 + pct}%`;
    cum2 += pct;
    return part;
  });

  const subText = { fontSize: 11, color: '#8fadc8', marginTop: 3 };

  return (
    <div style={{ padding: '26px 30px', animation: 'fadeIn .25s ease' }}>
      {/* Header */}
      <div style={{ marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid var(--border2)' }}>
        <div style={{ fontFamily: "'Libre Baskerville',serif", fontSize: '1.4rem', color: 'var(--white)' }}>Academic Transcript</div>
        <div style={{ fontSize: 13, color: '#8fadc8', marginTop: 3 }}>Full course history across completed semesters</div>
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        {/* GPA Progression */}
        <Card>
          <CardHead><CardTitle>Semester GPA Progression</CardTitle></CardHead>
          <CardBody>
            {gpaHist.length === 0
              ? <Empty icon="📈" text="No GPA history yet" />
              : gpaHist.map((h, i) => {
                const semName = h.semester || h.sem || '';
                return <GPABar key={semName + '-' + i} sem={semName.split(' ').slice(0, 2).join(' ')} gpa={h.gpa} />;
              })
            }
          </CardBody>
        </Card>

        {/* Grade Distribution — grouped, no scrollbar */}
        <Card>
          <CardHead><CardTitle>Grade Distribution</CardTitle></CardHead>
          <CardBody>
            {total === 0
              ? <Empty icon="📊" text="No graded courses yet" />
              : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  {/* Donut with hole */}
                  <div style={{ position: 'relative', width: 95, height: 95, flexShrink: 0 }}>
                    <div style={{
                      width: 95, height: 95, borderRadius: '50%',
                      background: `conic-gradient(${conicParts.join(',')})`,
                    }} />
                    {/* hole */}
                    <div style={{
                      position: 'absolute', top: '50%', left: '50%',
                      transform: 'translate(-50%,-50%)',
                      width: 65, height: 65, borderRadius: '50%',
                      background: 'var(--card)',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontFamily: "'Libre Baskerville',serif", fontSize: 18, fontWeight: 700, color: 'var(--white)', lineHeight: 1 }}>{total}</span>
                      <span style={{ fontSize: 14, color: '#8fadc8', marginTop: 1 }}>courses</span>
                    </div>
                  </div>

                  {/* Legend — no scroll, all groups visible */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7, flex: 1 }}>
                    {groupCounts.map(grp => (
                      <div key={grp.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 11, height: 11, borderRadius: 3, flexShrink: 0, background: grp.color }} />
                        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, fontWeight: 700, color: 'var(--white)', width: 36 }}>{grp.key}</span>
                        <span style={{ fontSize: 14, color: '#8fadc8' }}>— {Math.round(grp.count / total * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            }
          </CardBody>
        </Card>
      </div>

      {/* Course History table */}
      <Card>
        <CardHead>
          <CardTitle>Course History</CardTitle>
          <select
            value={semFilter}
            onChange={e => handleSemChange(e.target.value)}
            style={{
              background: 'var(--bg2)', border: '1.5px solid var(--border2)', borderRadius: 7,
              padding: '7px 10px', fontFamily: "'Outfit',sans-serif", fontSize: 12.5,
              color: '(--white)', outline: 'none', cursor: 'pointer',
            }}
          >
            <option value="">All Completed Semesters</option>
            {completedSems.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </CardHead>

        {filtered.length === 0
          ? <Empty icon="📚" text="No completed courses found" />
          : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead style={{ background: 'rgba(255,255,255,.02)' }}>
                    <tr>
                      {['Code', 'Course', 'CH', 'Semester', 'Grade', 'Status', 'Attempt'].map(h => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11.5, fontWeight: 600, letterSpacing: .6, textTransform: 'uppercase', color: 'var(--dim)', borderBottom: '1px solid var(--border2)', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((c, i) => {
                      const co = COURSES.find(x => x.code === c.code);
                      const gc = gradeClass(c.grade);
                      const gradeColors = { 'gr-a': 'var(--green)', 'gr-b': 'var(--blue2)', 'gr-c': 'var(--amber)', 'gr-d': 'var(--amber)', 'gr-f': 'var(--rose)' };
                      const statusColors = { passed: 'var(--green)', failed: 'var(--rose)', enrolled: 'var(--blue2)' };
                      return (
                        <tr key={`${c.code}-${i}`}>
                          <td style={{ padding: '10px 12px' }}><CodeChip code={c.code} /></td>
                          <td style={{ padding: '10px 12px', color: 'var(--white)', fontSize: 13 }}>{c.name || co?.name || c.code}</td>
                          <td style={{ padding: '10px 12px', color: 'var(--white)' }}>{c.ch ?? co?.ch ?? 3}</td>
                          <td style={{ padding: '10px 12px', color: '#8fadc8' }}>{c.sem}</td>
                          <td style={{ padding: '10px 12px', color: gradeColors[gc] || 'var(--white)', fontWeight: 700 }}>{c.grade}</td>
                          <td style={{ padding: '10px 12px', color: statusColors[c.status] || 'var(--white)', fontSize: 11, fontWeight: 600 }}>
                            {c.status === 'passed' ? 'Passed' : c.status === 'failed' ? 'Failed' : 'Enrolled'}
                          </td>
                          <td style={{ padding: '10px 12px' }}><AttBadge n={c.attempt} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4, padding: '11px 14px', borderTop: '1px solid var(--border2)' }}>
                  <PgBtn onClick={() => setPage(p => Math.max(1, p - 1))}>‹</PgBtn>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <PgBtn key={i + 1} active={page === i + 1} onClick={() => setPage(i + 1)}>{i + 1}</PgBtn>
                  ))}
                  <PgBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))}>›</PgBtn>
                </div>
              )}
            </>
          )
        }
      </Card>
    </div>
  );
}

function PgBtn({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      minWidth: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: 6, border: `1px solid ${active ? 'var(--blue)' : 'var(--border2)'}`,
      fontSize: 12, fontWeight: 600, cursor: 'pointer', color: active ? '#fff' : '#8fadc8',
      padding: '0 6px', background: active ? 'var(--blue)' : 'transparent', transition: 'all .15s',
    }}>{children}</button>
  );
}