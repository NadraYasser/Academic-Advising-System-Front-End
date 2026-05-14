// ─────────────────────────────────────────────────────────────
//  PAGE: Student Profile — standalone page
//  Opened via Student Profile nav item after selecting a student
//  from My Students (View button → App sets viewingStudent + page)
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AdvisorContext';
import { GPABar, CodeChip } from '../../components/AdvisorUI';
import {
  fetchStudentProfile,
  fetchStudentAvailableCourses,
  addStudentCourse,
  removeStudentCourse,
  confirmStudentCourses,
} from '../../services/advisorAPI';

const GRADE_COLORS = {
  'A': 'var(--green)', 'A-': 'var(--green)',
  'B+': 'var(--blue2)', 'B': 'var(--blue2)', 'B-': 'var(--blue2)',
  'C+': 'var(--amber)', 'C': 'var(--amber)', 'C-': 'var(--amber)',
  'D+': '#f97316', 'D': '#f97316', 'F': 'var(--rose)',
};

function PrereqChips({ prereqs }) {
  if (!prereqs || prereqs.length === 0)
    return <span style={{ fontSize: 13, color: 'var(--dim)' }}>—</span>;
  return (
    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      {prereqs.map(p => (
        <span key={p} style={{
          fontFamily: "'DM Mono',monospace", fontSize: 9.5, fontWeight: 500,
          padding: '2px 6px', borderRadius: 5,
          background: 'rgba(167,139,250,.1)', border: '1px solid rgba(167,139,250,.25)',
          color: 'var(--violet)', whiteSpace: 'nowrap',
        }}>{p}</span>
      ))}
    </div>
  );
}

export default function StudentProfile({ student, onBack }) {
  const { toast } = useApp();

  const [profileData, setProfileData] = useState(null);
  const [availCourses, setAvailCourses] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmPending, setConfirmPending] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [addSearch, setAddSearch] = useState('');

  useEffect(() => {
    console.log("StudentProfile: Component Mounted/Updated with student:", student);
    if (!student?.id) {
      console.warn("StudentProfile: No student ID provided!");
      return;
    }
    setLoadingProfile(true);
    setProfileData(null);
    setAvailCourses([]);
    setConfirmed(false);

    console.log("StudentProfile: Fetching data for student ID:", student.id);
    Promise.all([
      fetchStudentProfile(student.id),
      fetchStudentAvailableCourses(student.id)
    ]).then(([profile, avail]) => {
      console.log("StudentProfile: Data fetched successfully:", { profile, avail });
      setProfileData(profile);
      setAvailCourses(avail);
    }).catch(e => {
      console.error("StudentProfile: Fetch error:", e);
      toast('Failed to load student data', 'err');
    }).finally(() => {
      console.log("StudentProfile: Loading finished.");
      setLoadingProfile(false);
    });
  }, [student?.id]);

  // No student selected → empty page
  if (!student) return <div style={{ padding: '26px 30px' }} />;

  if (loadingProfile) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--muted)', fontSize: 14 }}>
        <span style={{ marginRight: 8, fontSize: 20 }}>⟳</span> Loading profile…
      </div>
    );
  }

  // ── Handlers ────────────────────────────────────────────────
  async function handleAddCourse(course) {
    const cid = course.id || course.course_id;
    console.log("StudentProfile: Adding course:", { studentId: student.id, courseId: cid });
    if (!cid) {
      toast('Invalid course ID', 'err');
      return;
    }
    try {
      await addStudentCourse(student.id, cid);
      toast(`Added ${course.course_code || course.code}`, 'success');
      // Re-fetch everything
      const [profile, avail] = await Promise.all([
        fetchStudentProfile(student.id),
        fetchStudentAvailableCourses(student.id)
      ]);
      setProfileData(profile);
      setAvailCourses(avail);
    } catch (e) {
      console.error("StudentProfile: Add course error:", e);
      toast(e.message || 'Failed to add course', 'err');
    }
  }

  async function handleRemoveCourse(courseId) {
    console.log("StudentProfile: Removing course:", { studentId: student.id, courseId });
    if (!courseId) {
      toast('Invalid course ID', 'err');
      return;
    }
    try {
      await removeStudentCourse(student.id, courseId);
      toast('Course removed', 'success');
      // Re-fetch everything
      const [profile, avail] = await Promise.all([
        fetchStudentProfile(student.id),
        fetchStudentAvailableCourses(student.id)
      ]);
      setProfileData(profile);
      setAvailCourses(avail);
    } catch (e) {
      console.error("StudentProfile: Remove course error:", e);
      toast(e.message || 'Failed to remove course', 'err');
    }
  }

  async function handleConfirm() {
    setConfirmPending(true);
    try {
      await confirmStudentCourses(student.id);
      setConfirmed(true);
      toast('Courses confirmed successfully!', 'success');
    } catch (e) {
      toast(e.message, 'err');
    } finally {
      setConfirmPending(false);
    }
  }

  // ── Data Extraction ─────────────────────────────────────────
  const header = profileData?.header ?? student;
  const summary = profileData?.summary_cards ?? {};
  const currentCoursesData = profileData?.current_courses ?? {};
  const gpaHistory = profileData?.gpa_history ?? [];
  const academicHistory = profileData?.academic_history ?? [];

  const studentName = header?.name ?? student.name;
  const studentLevel = header?.level ?? student.level;
  const studentDept = header?.department ?? student.dept ?? student.department;
  const riskLevel = (header?.risk_level ?? student.riskLevel ?? 'low').toLowerCase().replace(' level', '');
  const cumGPA = header?.cumulative_gpa ?? student.gpa ?? 0;

  // Stats from summary_cards
  const failedCount = summary.failed_courses ?? 0;
  const currentCH = summary.current_hours ?? currentCoursesData.total_enrolled_ch ?? 0;
  const chPassed = summary.total_ch_passed ?? 0;

  const completed = academicHistory.filter(c => (c.status ?? '').toLowerCase() !== 'enrolled');
  const enrolled = currentCoursesData.courses ?? [];

  const passedCodes = new Set(completed.filter(c => (c.status ?? '').toLowerCase() === 'passed').map(c => c.course_code ?? c.code));

  const availableToAdd = (availCourses.courses ?? []).filter(c => {
    const code = c.course_code ?? c.code ?? '';
    const name = c.course_name ?? c.name ?? '';
    const isEnrolled = enrolled.some(e => (e.course_code ?? e.code) === code);
    const matchesSearch = !addSearch ||
      code.toLowerCase().includes(addSearch.toLowerCase()) ||
      name.toLowerCase().includes(addSearch.toLowerCase());
    return !isEnrolled && matchesSearch;
  });

  const studentApptNotes = profileData?.student_notes ?? [];

  const filteredHistory = historySearch
    ? completed.filter(c =>
      (c.course_code ?? c.code ?? '').toLowerCase().includes(historySearch.toLowerCase()) ||
      (c.course_name ?? c.name ?? '').toLowerCase().includes(historySearch.toLowerCase())
    )
    : completed;

  const riskBannerBg = {
    high: 'linear-gradient(135deg,#6d28d9,#7c3aed,#8b5cf6)',
    medium: 'linear-gradient(135deg,#b45309,#d97706,#f59e0b)',
    low: 'linear-gradient(135deg,#1e40af,#2563eb,#3b82f6)',
  }[riskLevel] || 'linear-gradient(135deg,#1e40af,#3b82f6)';

  const studentAv = header?.initials ?? (studentName ? studentName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '??');

  return (
    <div style={{ padding: '26px 30px', animation: 'fadeIn .25s ease' }}>

      {/* ── Top Navigation ── */}
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onBack} style={{
          background: 'rgba(255,255,255,.05)', border: '1px solid var(--border2)', borderRadius: 8,
          padding: '6px 12px', color: 'var(--white)', cursor: 'pointer', fontFamily: "'Outfit',sans-serif",
          fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5
        }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.05)'}>
          ← Back to List
        </button>
        <div style={{ fontSize: 14, color: 'var(--muted)' }}>
          Student Profile / <span style={{ color: 'var(--white)' }}>{studentName}</span>
        </div>
      </div>

      {/* ── Banner ── */}
      <div style={{ background: riskBannerBg, borderRadius: 14, padding: '22px 28px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 14, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'DM Mono',monospace", fontSize: 25, fontWeight: 600, color: '#fff',
          background: 'rgba(255,255,255,.2)', border: '2px solid rgba(255,255,255,.3)',
        }}>
          {studentAv}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Libre Baskerville',serif", fontSize: '1.43rem', color: '#fff', marginBottom: 8 }}>
            {student.name}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[`Level ${student.level}`, student.dept].map(tag => (
              <span key={tag} style={{
                fontSize: 13, fontWeight: 600, padding: '3px 10px', borderRadius: 6,
                background: 'rgba(255,255,255,.15)', color: '#fff', border: '1px solid rgba(255,255,255,.25)',
              }}>{tag}</span>
            ))}
            <span style={{
              fontSize: 13, fontWeight: 700, padding: '3px 10px', borderRadius: 6,
              background: student.riskLevel === 'high' ? 'rgba(239,68,68,.3)' : student.riskLevel === 'medium' ? 'rgba(245,158,11,.3)' : 'rgba(34,197,94,.3)',
              color: '#fff', border: '1px solid rgba(255,255,255,.3)',
            }}>
              {student.riskLevel === 'high' ? '⚠️ High Risk' : student.riskLevel === 'medium' ? '🟡 Medium Risk' : '🟢 Low Risk'}
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: "'Libre Baskerville',serif", fontSize: '2.6rem', color: '#fff', lineHeight: 1, fontWeight: 700 }}>
            {student.cumGPA.toFixed(2)}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', marginTop: 4 }}>Cumulative GPA</div>
        </div>
      </div>

      {/* 3 mini stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 18 }}>
        {[
          { icon: '✖️', value: failedCount, label: 'Failed Courses', accent: 'var(--rose)', bg: 'rgba(251,113,133,.06)', border: 'rgba(251,113,133,.2)' },
          { icon: '📖', value: `${currentCH} CH`, label: 'Credit Hours / Semester', accent: 'var(--amber)', bg: 'rgba(245,158,11,.06)', border: 'rgba(245,158,11,.2)' },
          { icon: '✅', value: chPassed, label: 'Total CH Passed', accent: 'var(--green)', bg: 'rgba(52,211,153,.06)', border: 'rgba(52,211,153,.2)' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 15, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.accent }} />
            <div style={{ fontSize: 20, marginBottom: 10 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Libre Baskerville',serif", fontSize: '1.8rem', color: 'var(--white)', lineHeight: 1, marginBottom: 5 }}>{s.value}</div>
            <div style={{ fontSize: 13.5, color: 'var(--muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Two-column */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Current Courses */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 13, overflow: 'hidden' }}>
            <div style={{ padding: '13px 16px', borderBottom: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: 15.5, fontWeight: 600, color: 'var(--white)' }}>Current Courses</span>
                <span style={{ fontSize: 14, color: 'var(--muted)', marginLeft: 8 }}>{currentCH} CH enrolled</span>
              </div>
              {confirmed
                ? (
                  <span style={{ fontSize: 13.5, fontWeight: 700, padding: '8px 14px', borderRadius: 7, background: 'rgba(52,211,153,.15)', color: 'var(--green)', border: '1px solid rgba(52,211,153,.35)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    ✓ Confirmed
                  </span>
                )
                : (
                  <div style={{ display: 'flex', gap: 7 }}>
                    <button onClick={() => setShowAddCourse(v => !v)} style={{
                      padding: '7px 11px', borderRadius: 7, fontSize: 14.5, fontWeight: 700,
                      background: 'rgba(59,130,246,.1)', color: 'var(--blue2)',
                      border: '1px solid rgba(59,130,246,.3)', cursor: 'pointer', fontFamily: "'Outfit',sans-serif",
                    }}>
                      {showAddCourse ? '✕ Close' : '+ Add Course'}
                    </button>
                    <button onClick={handleConfirm} disabled={confirmPending || enrolled.length === 0} style={{
                      padding: '5px 11px', borderRadius: 7, fontSize: 13.5, fontWeight: 700,
                      background: 'linear-gradient(135deg,var(--green),#059669)',
                      color: '#fff', border: 'none', cursor: enrolled.length === 0 ? 'not-allowed' : 'pointer',
                      fontFamily: "'Outfit',sans-serif", opacity: confirmPending || enrolled.length === 0 ? .55 : 1,
                    }}>
                      {confirmPending ? '⏳' : '✓ Confirm'}
                    </button>
                  </div>
                )
              }
            </div>

            {/* Add course picker */}
            {!confirmed && showAddCourse && (
              <div style={{ borderBottom: '1px solid var(--border2)', background: 'var(--bg2)' }}>
                <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 7, padding: '6px 10px' }}>
                    <span style={{ fontSize: 15, color: 'var(--dim)' }}>🔍</span>
                    <input value={addSearch} onChange={e => setAddSearch(e.target.value)} placeholder="Search course..."
                      style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--white)', fontFamily: "'Outfit',sans-serif", fontSize: 14, flex: 1 }} />
                  </div>
                </div>
                <div style={{ maxHeight: 200, overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: 'var(--border2) transparent' }}>
                  {availableToAdd.length === 0
                    ? <div style={{ padding: '14px 16px', fontSize: 14, color: 'var(--muted)', textAlign: 'center' }}>{addSearch ? 'No matching courses' : 'No available courses'}</div>
                    : availableToAdd.map(c => {
                      const prereqs = c.prerequisites || [];
                      const prereqsMet = prereqs.every(p => passedCodes.has(p));
                      const cid = c.id || c.course_id;
                      return (
                        <div key={cid} onClick={() => handleAddCourse(c)}
                          style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 14px', cursor: 'pointer', transition: 'background .12s', borderBottom: '1px solid rgba(255,255,255,.04)', fontSize: 14 }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,.07)'}
                          onMouseLeave={e => e.currentTarget.style.background = ''}>
                          <CodeChip code={c.code || c.course_code} />
                          <div style={{ flex: 1, minWidth: 0, fontSize: 14 }}>
                            <div style={{ fontSize: 13, color: 'var(--white)', marginBottom: 3 }}>{c.course_name || c.name}</div>
                            {prereqs.length > 0 && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <span style={{ fontSize: 14, color: 'var(--dim)' }}>Prereq:</span>
                                <PrereqChips prereqs={prereqs} />
                                {!prereqsMet && <span style={{ fontSize: 13.5, color: 'var(--amber)', fontWeight: 600 }}>⚠ not met</span>}
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
                            <span style={{ fontSize: 13, color: 'var(--muted)' }}>{c.credit_hours || c.ch || 3} CH</span>
                            <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>+ Add</span>
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
              </div>
            )}

            {/* Enrolled table */}
            <div style={{ maxHeight: 240, overflowY: 'auto', overflowX: 'auto', scrollbarWidth: 'thin', scrollbarColor: 'var(--border2) transparent' }}>
              {enrolled.length === 0
                ? <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>No courses enrolled this semester</div>
                : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                    <thead style={{ background: 'var(--card)', position: 'sticky', top: 0, zIndex: 1 }}>
                      <tr>
                        {(confirmed
                          ? ['CODE', 'COURSE', 'CH', 'PREREQUISITES', 'ATT']
                          : ['CODE', 'COURSE', 'CH', 'PREREQUISITES', 'ATT', '']
                        ).map(h => (
                          <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 13, fontWeight: 700, letterSpacing: .6, textTransform: 'uppercase', color: 'var(--dim)', borderBottom: '1px solid var(--border2)', whiteSpace: 'nowrap', background: 'var(--card)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {enrolled.map(c => {
                        const code = c.course_code || c.code;
                        const name = c.course_name || c.name || code;
                        const ch = c.credit_hours || c.ch || 3;
                        const attempt = c.attempt_number || c.attempt || 1;
                        return (
                          <tr key={code} style={{ borderBottom: '1px solid var(--border2)' }}>
                            <td style={{ padding: '9px 10px', fontSize: 13 }}><CodeChip code={code} /></td>
                            <td style={{ padding: '9px 10px', color: 'var(--white)', maxWidth: 110 }}>
                              <span style={{ fontSize: 13 }}>{name}</span>
                            </td>
                            <td style={{ padding: '9px 10px', color: 'var(--muted)' }}>{ch}</td>
                            <td style={{ padding: '9px 10px' }}><PrereqChips prereqs={c.prerequisites || []} /></td>
                            <td style={{ padding: '9px 10px' }}>
                              <span style={{ fontSize: 13.5, fontWeight: 700, padding: '2px 5px', borderRadius: 4, border: `1.5px solid ${attempt > 1 ? 'var(--rose)' : 'var(--dim)'}`, color: attempt > 1 ? 'var(--rose)' : 'var(--muted)' }}>
                                {['1st', '2nd', '3rd'][attempt - 1] || `${attempt}th`}
                              </span>
                            </td>
                            {!confirmed && (
                              <td style={{ padding: '9px 8px' }}>
                                <button onClick={() => handleRemoveCourse(c.course_id || c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rose)', fontSize: 16, lineHeight: 1 }} title="Remove">×</button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )
              }
            </div>
          </div>

          {/* GPA History */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 13, overflow: 'hidden' }}>
            <div style={{ padding: '13px 16px', borderBottom: '1px solid var(--border2)' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--white)' }}>GPA History per Semester</span>
            </div>
            <div style={{ padding: '16px' }}>
              {gpaHistory.length === 0
                ? <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '16px 0', fontSize: 14 }}>No GPA history yet</div>
                : gpaHistory.map((h, i) => <GPABar key={i} sem={h.semester_name || `Sem ${i + 1}`} gpa={h.semester_gpa || 0} />)
              }
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Academic History — scrollable + search */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 13, overflow: 'hidden' }}>
            <div style={{ padding: '13px 16px', borderBottom: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--white)' }}>Academic History</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 7, padding: '5px 9px' }}>
                <span style={{ fontSize: 15, color: 'var(--dim)' }}>🔍</span>
                <input value={historySearch} onChange={e => setHistorySearch(e.target.value)} placeholder="Search..."
                  style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--white)', fontFamily: "'Outfit',sans-serif", fontSize: 13.5, width: 90 }} />
                {historySearch && (
                  <button onClick={() => setHistorySearch('')} style={{ background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer', fontSize: 13, lineHeight: 1, padding: 0 }}>×</button>
                )}
              </div>
            </div>
            {filteredHistory.length === 0
              ? <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>{historySearch ? 'No matching courses' : 'No completed courses yet'}</div>
              : (
                <div style={{ maxHeight: 300, overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: 'var(--border2) transparent' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                      <tr>
                        {['CODE', 'COURSE', 'GRADE', 'SEM', 'STATUS'].map(h => (
                          <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 13, fontWeight: 700, letterSpacing: .6, textTransform: 'uppercase', color: 'var(--dim)', borderBottom: '1px solid var(--border2)', background: 'var(--card)', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...filteredHistory].reverse().map((c, i) => {
                        const code = c.course_code || c.code;
                        const name = c.course_name || c.name || code;
                        const status = (c.status || '').toLowerCase();
                        return (
                          <tr key={`${code}-${i}`} style={{ borderBottom: '1px solid var(--border2)' }}>
                            <td style={{ padding: '9px 12px' }}><CodeChip code={code} /></td>
                            <td style={{ padding: '9px 12px', color: 'var(--white)', fontSize: 13 }}>{name}</td>
                            <td style={{ padding: '9px 12px', color: GRADE_COLORS[c.grade] || 'var(--muted)', fontWeight: 700, fontFamily: "'DM Mono',monospace" }}>{c.grade}</td>
                            <td style={{ padding: '9px 12px', color: 'var(--muted)', fontSize: 13, whiteSpace: 'nowrap' }}>{c.sem || c.semester}</td>
                            <td style={{ padding: '9px 12px' }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: status === 'passed' ? 'var(--green)' : 'var(--rose)' }}>
                                {status === 'passed' ? 'Passed' : status === 'failed' ? 'Failed' : status}
                              </span>
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

          {/* Student Notes */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 13, overflow: 'hidden' }}>
            <div style={{ padding: '13px 16px', borderBottom: '1px solid var(--border2)' }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--white)' }}>Student Notes</span>
              <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 3 }}>Notes submitted when booking appointments</div>
            </div>
            <div style={{ maxHeight: 200, overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: 'var(--border2) transparent', padding: '12px 14px' }}>
              {studentApptNotes.length === 0
                ? <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 12, padding: '16px 0' }}>No notes from student yet</div>
                : studentApptNotes.map((n, idx) => (
                  <div key={idx} style={{ padding: '10px 14px', background: 'var(--bg2)', borderRadius: 9, marginBottom: 10, borderLeft: '3px solid var(--violet)' }}>
                    <div style={{ fontSize: 14, color: 'var(--white)', lineHeight: 1.6 }}>{n.note}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>📅 {n.booking_date || n.slot_date} · {n.start_time} - {n.end_time}</div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
