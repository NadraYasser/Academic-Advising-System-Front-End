// ─────────────────────────────────────────────────────────────
//  Registration — UI مطابق للـ screenshot
//  API:  GET  /api/student/registration
//        POST /api/student/registration/enroll
//        POST /api/student/registration/unenroll/{id}
//        POST /api/student/registration/confirm
// ─────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { useApp } from '../../contexts/StudentContext';
import { COURSES, CURRENT_SEM, REG_PERIOD } from '../../services/studentMockData';
import { USE_MOCK } from '../../services/studentAPI';
import {
  prereqsMet, getPassedCodes, isRegOpen, regDaysLeft,
  getAvailableCourses, getCurrentCourses,
} from '../../services/studentLogic';
import { Badge, Btn, CodeChip } from '../../components/StudentUI';
import {
  fetchRegistration, enrollCourse, unenrollCourse,
  confirmRegistration as apiConfirmReg,
} from '../../services/studentAPI';

// ── Helpers ───────────────────────────────────────────────────
function calcMaxCH(gpa) { return gpa >= 2.0 ? 18 : 12; }

function SummaryCell({ val, color, label, last }) {
  return (
    <div style={{
      flex: 1, padding: '18px 16px', textAlign: 'center',
      borderRight: last ? 'none' : '1px solid var(--border2)',
    }}>
      <span style={{
        fontFamily: "'Libre Baskerville',serif", fontSize: '2rem',
        color, display: 'block', lineHeight: 1, marginBottom: 4,
      }}>{val}</span>
      <div style={{ fontSize: 11, color: '#8fadc8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: .4 }}>
        {label}
      </div>
    </div>
  );
}

function PeriodBar({ regOpen, regConfirmed, maxCH }) {
  const days = regDaysLeft();
  if (regConfirmed) return (
    <div style={{ background: 'rgba(52,211,153,.07)', border: '1px solid rgba(52,211,153,.2)', borderRadius: 8, padding: '10px 16px', fontSize: 13, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      ✅ <span>Registration confirmed for <strong>{CURRENT_SEM.label}</strong>. Your courses are now visible on the Dashboard.</span>
    </div>
  );
  if (regOpen) return (
    <div style={{ background: 'rgba(59,130,246,.05)', border: '1px solid rgba(59,130,246,.15)', borderLeft: '3px solid var(--blue2)', borderRadius: 8, padding: '10px 16px', fontSize: 13, color: 'var(--blue2)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      📋 <span>Registration open · <strong>{days} day{days !== 1 ? 's' : ''} remaining</strong> (closes {REG_PERIOD.closeLabel}) · Max <strong>{maxCH} CH</strong> allowed</span>
    </div>
  );
  return (
    <div style={{ background: 'rgba(91,122,157,.07)', border: '1px solid rgba(91,122,157,.2)', borderRadius: 8, padding: '10px 16px', fontSize: 13, color: '#8fadc8', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      ⏰ <span>Registration period closed ({REG_PERIOD.openLabel} – {REG_PERIOD.closeLabel}).</span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function Registration({ setPage }) {
  const {
    student, history, gpa, chPassed, failed,
    current, currentCH, regConfirmed, dispatch, toast,
  } = useApp();

  // ── API state ─────────────────────────────────────────────
  const [apiCourses, setApiCourses] = useState(null);
  const [enrollments, setEnrollments] = useState({});
  const [regLoading, setRegLoading] = useState(false);

  useEffect(() => {
    if (USE_MOCK) return;
    setRegLoading(true);
    fetchRegistration()
      .then(data => {
        const available = Array.isArray(data) ? data : (data?.available_courses ?? []);
        // API response uses 'current_enrollments' not 'enrolled'
        const enrolled = data?.current_enrollments ?? data?.enrolled ?? [];
        // map API → UI shape — preserve course_id for enroll calls
        setApiCourses(available.map(c => ({
          code: c.course_code ?? c.code,
          courseId: c.course_id ?? c.id,   // needed for enroll API call
          name: c.course_name ?? c.name,
          ch: c.credit_hour ?? c.credit_hours ?? c.ch ?? 3,
          planSem: c.plan_semester ?? c.planSem ?? '',
          prereqs: (c.prerequisites ?? c.prereqs ?? []).map(p => p.course_code ?? p),
          canEnroll: c.can_enroll ?? true,
          type: c.type ?? 'New',
        })));
        // enrollmentId map: code → enrollment_id
        const map = {};
        enrolled.forEach(e => { map[e.course_code ?? e.code] = e.enrollment_id ?? e.id; });
        setEnrollments(map);
      })
      .catch(() => toast('Failed to load registration data', 'err'))
      .finally(() => setRegLoading(false));
  }, []);

  const regOpen = isRegOpen();
  const canEdit = regOpen && !regConfirmed;
  const maxCH = calcMaxCH(gpa);
  const totalCH = currentCH;
  const over = totalCH > maxCH;
  const passedCodes = getPassedCodes(history);

  // قائمة المواد المتاحة
  const enrolledCodes = new Set(current.map(c => c.code));
  const availCourses = (USE_MOCK
    ? getAvailableCourses(history, COURSES)
    : (apiCourses ?? [])).filter(c => !enrolledCodes.has(c.code));

  // ── Enroll ────────────────────────────────────────────────
  async function enroll(code) {
    if (!canEdit) return;
    const course = availCourses.find(x => x.code === code);
    const adding = course?.ch || 3;

    if (!prereqsMet(code, passedCodes)) {
      const prereqList = (course?.prereqs || []).filter(p => !passedCodes.has(p)).join(', ');
      toast(`❌ Prerequisites not met: ${prereqList}`, 'err'); return;
    }
    if (totalCH + adding > maxCH) {
      toast(`❌ Cannot exceed ${maxCH} CH`, 'err'); return;
    }

    if (USE_MOCK) {
      dispatch({ type: 'ENROLL', code });
      toast(`Enrolled in ${code}`, 'ok');
    } else {
      try {
        const courseObj = availCourses.find(x => x.code === code);
        const courseId = courseObj?.courseId;
        if (!courseId) { toast('Course ID not found', 'err'); return; }
        const res = await enrollCourse(courseId);
        const eid = res?.enrollment_id ?? res?.data?.enrollment_id ?? res?.id ?? code;
        setEnrollments(prev => ({ ...prev, [code]: eid }));
        dispatch({ type: 'ENROLL', code, name: courseObj?.name, ch: courseObj?.ch });
        toast(`Enrolled in ${code}`, 'ok');
      } catch (e) { toast(e.message || 'Enroll failed', 'err'); }
    }
  }

  // ── Drop ──────────────────────────────────────────────────
  async function drop(code) {
    if (!canEdit) return;
    if (USE_MOCK) {
      dispatch({ type: 'DROP', code });
      toast(`Dropped ${code}`, 'inf');
    } else {
      try {
        const eid = enrollments[code];
        if (eid) await unenrollCourse(eid);
        setEnrollments(prev => { const n = { ...prev }; delete n[code]; return n; });
        dispatch({ type: 'DROP', code });
        toast(`Dropped ${code}`, 'inf');
      } catch (e) { toast(e.message || 'Drop failed', 'err'); }
    }
  }

  // ── Confirm ───────────────────────────────────────────────
  async function handleConfirm() {
    if (!regOpen) { toast('⏰ Registration period is closed', 'err'); return; }
    if (current.length === 0) { toast('No courses selected', 'err'); return; }
    if (over) { toast(`Cannot exceed ${maxCH} CH`, 'err'); return; }
    try {
      await apiConfirmReg({ studentId: student?.id, courseCodes: current.map(c => c.code) });
      dispatch({ type: 'CONFIRM_REG' });
      toast(`✅ Confirmed — ${current.length} courses (${totalCH} CH)`, 'ok');
    } catch (e) { toast(e.message || 'Registration failed', 'err'); }
  }

  // ── Confirm button state ──────────────────────────────────
  let confirmBg = 'linear-gradient(135deg,var(--blue),#1d65cc)';
  let confirmTxt = '✓ Confirm Registration';
  let confirmDis = false;
  if (regConfirmed) { confirmBg = 'linear-gradient(135deg,var(--green),#059669)'; confirmTxt = '✓ Registration Confirmed'; confirmDis = true; }
  else if (!regOpen) { confirmBg = 'rgba(91,122,157,.25)'; confirmTxt = '⏰ Registration Period Closed'; confirmDis = true; }
  else if (over) { confirmBg = 'rgba(251,113,133,.3)'; confirmTxt = `⚠️ Exceeds max ${maxCH} CH`; confirmDis = true; }
  else if (current.length === 0) { confirmDis = true; }

  if (regLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--muted)', fontSize: 13 }}>
      <span style={{ marginRight: 8, animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
      Loading registration…
    </div>
  );

  return (
    <div style={{ padding: '26px 30px', animation: 'fadeIn .25s ease' }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ fontFamily: "'Libre Baskerville',serif", fontSize: '1.4rem', fontWeight: 500, color: 'var(--white)' }}>
          Course Registration
        </div>
        <div style={{ fontSize: 13, color: '#8fadc8', marginTop: 4 }}>
          {CURRENT_SEM.label} · {student?.dept} · {regOpen ? `Open until ${REG_PERIOD.closeLabel}` : regConfirmed ? 'Confirmed' : 'Closed'}
        </div>
      </div>

      {/* ── Period Bar ── */}
      <div style={{ marginTop: 16 }}>
        <PeriodBar regOpen={regOpen} regConfirmed={regConfirmed} maxCH={maxCH} />
      </div>

      {/* ── Summary Row ── */}
      <div style={{ display: 'flex', background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
        <SummaryCell
          val={Array.isArray(failed) ? failed.length : (failed ?? 0)}
          color="var(--rose)"
          label="Failed Courses"
        />
        <SummaryCell val={totalCH} color="var(--amber)" label="Enrolled CH" />
        <SummaryCell val={Number(gpa || 0).toFixed(2)} color="var(--amber)" label="Cum. GPA" />
        <SummaryCell val={maxCH} color="var(--blue2)" label="Max Allowed CH" last />
      </div>

      {/* ── Academic Warning ── */}
      {gpa > 0 && gpa < 2.0 && (
        <div style={{ background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.3)', borderLeft: '3px solid var(--amber)', borderRadius: 8, padding: '10px 16px', fontSize: 13, color: 'var(--amber)', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
          ⚠️ <span><strong>Academic Warning:</strong> GPA below 2.0 — max {maxCH} CH allowed.</span>
        </div>
      )}

      {/* ── Main Grid ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 290px', gap: 16, alignItems: 'start',
        opacity: !canEdit ? 0.65 : 1, pointerEvents: !canEdit ? 'none' : 'auto', transition: 'opacity .2s',
      }}>

        {/* ── Available to Enroll ── */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--white)' }}>📚 Available to Enroll</span>
            <span style={{ fontSize: 13, color: '#8fadc8' }}>{availCourses.length} courses</span>
          </div>

          {availCourses.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#8fadc8', fontSize: 13 }}>
              No available courses for this semester
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,.02)' }}>
                    {['Code', 'Course', 'CH', 'Sem', 'Type', 'Prerequisites', 'Action'].map(h => (
                      <th key={h} style={{
                        padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700,
                        letterSpacing: .6, textTransform: 'uppercase', color: 'var(--dim)',
                        borderBottom: '1px solid var(--border2)', whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {availCourses.map(c => {
                    const everFailed = history.some(h => h.code === c.code && h.status === 'failed');
                    const prereqsOk = prereqsMet(c.code, passedCodes);
                    const prereqList = c.prereqs || [];
                    return (
                      <tr key={c.code} style={{ borderBottom: '1px solid rgba(255,255,255,.03)', opacity: prereqsOk ? 1 : 0.55 }}>
                        <td style={{ padding: '11px 14px' }}><CodeChip code={c.code} /></td>
                        <td style={{ padding: '11px 14px', color: 'var(--white)', fontSize: 13 }}>{c.name}</td>
                        <td style={{ padding: '11px 14px', color: 'var(--white)' }}>{c.ch}</td>
                        <td style={{ padding: '11px 14px', color: '#8fadc8' }}>{c.planSem}</td>
                        <td style={{ padding: '11px 14px' }}>
                          {c.type === 'Retake'
                            ? <Badge color="rose" style={{ fontSize: 10, padding: '2px 7px' }}>🔁 Retake</Badge>
                            : <Badge color="blue" style={{ fontSize: 10, padding: '2px 7px' }}>New</Badge>}
                        </td>
                        <td style={{ padding: '11px 14px' }}>
                          {prereqList.length === 0
                            ? <Badge color="muted" style={{ fontSize: 11 }}>None</Badge>
                            : prereqList.map(p => {
                              const met = passedCodes.has(p);
                              return (
                                <Badge key={p} color={met ? 'green' : 'rose'}
                                  style={{ marginRight: 4, fontSize: 10, padding: '2px 7px' }}>
                                  {met ? '✓ ' : '✗ '}{p}
                                </Badge>
                              );
                            })
                          }
                        </td>
                        <td style={{ padding: '11px 14px' }}>
                          <button
                            disabled={!prereqsOk}
                            onClick={() => prereqsOk && enroll(c.code)}
                            title={!prereqsOk ? `Complete first: ${prereqList.filter(p => !passedCodes.has(p)).join(', ')}` : ''}
                            style={{
                              padding: '5px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600,
                              border: '1px solid rgba(59,130,246,.3)', cursor: prereqsOk ? 'pointer' : 'not-allowed',
                              background: prereqsOk ? 'rgba(59,130,246,.1)' : 'rgba(255,255,255,.03)',
                              color: prereqsOk ? 'var(--blue2)' : 'var(--dim)',
                              fontFamily: "'Outfit',sans-serif", transition: 'all .15s',
                              opacity: prereqsOk ? 1 : 0.5,
                            }}>
                            + Enroll
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── My Selections ── */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 12, padding: 18, position: 'sticky', top: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--white)' }}>My Selections</span>
            <span style={{ fontSize: 12, color: '#8fadc8' }}>{current.length} courses</span>
          </div>

          {/* CH bar */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8fadc8', marginBottom: 6 }}>
              <span>Credit Hours</span>
              <span style={{ fontWeight: 700, color: over ? 'var(--rose)' : 'var(--white)' }}>{totalCH} / {maxCH} CH</span>
            </div>
            <div style={{ height: 6, background: 'var(--border2)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 4,
                background: over ? 'var(--rose)' : 'var(--blue)',
                width: `${Math.min(100, (totalCH / maxCH) * 100)}%`,
                transition: 'width .4s',
              }} />
            </div>
          </div>

          {/* Selected courses */}
          {current.length === 0 ? (
            <div style={{ color: '#8fadc8', fontSize: 12, textAlign: 'center', padding: '20px 8px' }}>
              No courses enrolled.<br />Click + Enroll to add courses.
            </div>
          ) : (
            <div style={{ marginBottom: 14 }}>
              {current.map(c => {
                const co = COURSES.find(x => x.code === c.code) || availCourses.find(x => x.code === c.code);
                return (
                  <div key={c.code} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 0', borderBottom: '1px solid var(--border2)',
                  }}>
                    <CodeChip code={c.code} />
                    <span style={{ flex: 1, color: '#8fadc8', fontSize: 12 }}>{co?.name || c.code}</span>
                    <span style={{ fontWeight: 700, color: 'var(--white)', fontFamily: "'DM Mono',monospace", fontSize: 12 }}>
                      {co?.ch || 3}CH
                    </span>
                    {canEdit && (
                      <button onClick={() => drop(c.code)} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--rose)', fontSize: 16, padding: '0 2px', lineHeight: 1,
                      }}>×</button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Confirm button */}
          <button onClick={handleConfirm} disabled={confirmDis} style={{
            width: '100%', padding: 12, background: confirmBg, color: '#fff',
            border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700,
            cursor: confirmDis ? 'not-allowed' : 'pointer',
            fontFamily: "'Outfit',sans-serif", marginTop: 4, transition: 'all .2s',
            opacity: confirmDis && !regConfirmed ? .55 : 1,
            boxShadow: confirmDis ? 'none' : '0 4px 16px rgba(59,130,246,.3)',
          }}>{confirmTxt}</button>

          {regConfirmed && (
            <button onClick={() => setPage('dash')} style={{
              width: '100%', padding: 9, marginTop: 8,
              background: 'rgba(59,130,246,.08)', color: 'var(--blue2)',
              border: '1px solid rgba(59,130,246,.2)', borderRadius: 9,
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              fontFamily: "'Outfit',sans-serif",
            }}>→ View Current Courses on Dashboard</button>
          )}
        </div>
      </div>
    </div>
  );
}
