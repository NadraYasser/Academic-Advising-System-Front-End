// ═══════════════════════════════════════════════════════════════
//  ASU Academic Advising — UNIFIED APP
// ═══════════════════════════════════════════════════════════════
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// ── Public Pages (ASU Website) ───────────────────────────────
import MainWebsite from './pages/public/MainWebsite';
import AcademicAdvisorLogin from './pages/public/AcademicAdvisorLogin';
import StudentGuide from './pages/public/StudentGuide';

// ── Admin Portal ─────────────────────────────────────────────
import { AppProvider as AdminProvider, useApp as useAdmin } from './contexts/AdminContext';
import { Layout as AdminLayout } from './components/AdminLayout';
import { Toast as AdminToast } from './components/AdminUI';
import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminAdvisors from './pages/admin/Advisors';
import AdminCourses from './pages/admin/Courses';
import AdminSemesters from './pages/admin/Semesters';

// ── Advisor Portal ───────────────────────────────────────────
import { AppProvider as AdvisorProvider, useApp as useAdvisor } from './contexts/AdvisorContext';
import { Header as AdvisorHeader, Sidebar as AdvisorSidebar } from './components/AdvisorLayout';
import { Toast as AdvisorToast } from './components/AdvisorUI';
import AdvisorDashboard from './pages/advisor/Dashboard';
import AdvisorMyStudents from './pages/advisor/MyStudents';
import AdvisorStudentProfile from './pages/advisor/StudentProfile';
import AdvisorAppointments from './pages/advisor/Appointments';
import AdvisorManageSlots from './pages/advisor/ManageSlots';

// ── Student Portal ───────────────────────────────────────────
import { AppProvider as StudentProvider, useApp as useStudent } from './contexts/StudentContext';
import { Header as StudentHeader, Sidebar as StudentSidebar } from './components/StudentLayout';
import { Toast as StudentToast } from './components/StudentUI';
import StudentDashboard from './pages/student/Dashboard';
import StudentMyCourses from './pages/student/MyCourses';
import StudentRegistration from './pages/student/Registration';
import StudentBookAppt from './pages/student/BookAppointment';
import StudentMyAppts from './pages/student/MyAppointments';

// ════════════════════════════════════════════════════════════
//  Shared
// ════════════════════════════════════════════════════════════
const BASE_URL = 'http://127.0.0.1:8000/api';

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#06090f', color: '#8fadc8', fontSize: 15, gap: 12 }}>
      <div style={{ width: 22, height: 22, border: '2px solid #334d6a', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      Loading…
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

async function apiLogout() {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
      });
    }
  } catch (_) { /* ignore */ }
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('user');
}

// ════════════════════════════════════════════════════════════
//  Route Guard
// ════════════════════════════════════════════════════════════
function RequireRole({ role, children }) {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  if (!token || userRole !== role) return <Navigate to="/login" replace />;
  return children;
}

// ════════════════════════════════════════════════════════════
//  ADMIN PORTAL
// ════════════════════════════════════════════════════════════
function AdminInner() {
  const [page, setPage] = useState('dashboard');
  const { boot, loading } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => { boot(); }, []);

  async function handleLogout() {
    await apiLogout();
    navigate('/login', { replace: true });
  }

  if (loading) return <Spinner />;

  const pages = {
    dashboard: <AdminDashboard onNavigate={setPage} />,
    students: <AdminStudents />,
    advisors: <AdminAdvisors />,
    courses: <AdminCourses />,
    semesters: <AdminSemesters />,
  };

  return (
    <AdminLayout page={page} setPage={setPage} onLogout={handleLogout}>
      {pages[page] ?? <AdminDashboard onNavigate={setPage} />}
      <AdminToast />
    </AdminLayout>
  );
}

function AdminPortal() {
  return (
    <RequireRole role="admin">
      <AdminProvider>
        <AdminInner />
      </AdminProvider>
    </RequireRole>
  );
}

// ════════════════════════════════════════════════════════════
//  ADVISOR PORTAL
// ════════════════════════════════════════════════════════════
function AdvisorInner() {
  const [page, setPage] = useState('dash');
  const [viewingStudent, setViewingStudent] = useState(null);
  const { boot, loading } = useAdvisor();
  const navigate = useNavigate();

  useEffect(() => { boot(); }, []);

  async function handleLogout() {
    await apiLogout();
    navigate('/login', { replace: true });
  }

  function handleSetPage(p) {
    if (p !== 'student-profile') setViewingStudent(null);
    setPage(p);
  }

  function openProfile(student) {
    console.log("Advisor: Opening profile for student ID:", student?.id, student);
    setViewingStudent(student);
    setPage('student-profile');
  }

  if (loading) return <Spinner />;

  console.log("AdvisorInner: Current Page =", page, "Viewing Student ID =", viewingStudent?.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      <AdvisorHeader onLogout={handleLogout} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <AdvisorSidebar page={page} setPage={handleSetPage} />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {(() => {
            switch (page) {
              case 'dash':
                return <AdvisorDashboard key="dash" setPage={handleSetPage} onViewStudent={openProfile} />;
              case 'students':
                return <AdvisorMyStudents key="students" setPage={handleSetPage} onViewStudent={openProfile} />;
              case 'student-profile':
                return <AdvisorStudentProfile key={`profile-${viewingStudent?.id || 'none'}`} student={viewingStudent} onBack={() => handleSetPage('students')} />;
              case 'appts':
                return <AdvisorAppointments key="appts" setPage={handleSetPage} />;
              case 'slots':
                return <AdvisorManageSlots key="slots" setPage={handleSetPage} />;
              default:
                return <AdvisorDashboard key="fallback" setPage={handleSetPage} onViewStudent={openProfile} />;
            }
          })()}
        </div>
      </div>
      <AdvisorToast />
    </div>
  );
}

function AdvisorPortal() {
  return (
    <RequireRole role="advisor">
      <AdvisorProvider>
        <AdvisorInner />
      </AdvisorProvider>
    </RequireRole>
  );
}

// ════════════════════════════════════════════════════════════
//  STUDENT PORTAL
// ════════════════════════════════════════════════════════════
function StudentInner() {
  const [page, setPage] = useState('dash');
  const { boot, loading } = useStudent();
  const navigate = useNavigate();

  useEffect(() => { boot(); }, []);

  async function handleLogout() {
    await apiLogout();
    navigate('/login', { replace: true });
  }

  if (loading) return <Spinner />;

  const pages = {
    dash: <StudentDashboard setPage={setPage} />,
    courses: <StudentMyCourses />,
    reg: <StudentRegistration setPage={setPage} />,
    book: <StudentBookAppt setPage={setPage} />,
    appts: <StudentMyAppts setPage={setPage} />,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      <StudentHeader setPage={setPage} onLogout={handleLogout} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <StudentSidebar page={page} setPage={setPage} />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {pages[page] ?? <StudentDashboard setPage={setPage} />}
        </div>
      </div>
      <StudentToast />
    </div>
  );
}

function StudentPortal() {
  return (
    <RequireRole role="student">
      <StudentProvider>
        <StudentInner />
      </StudentProvider>
    </RequireRole>
  );
}

// ════════════════════════════════════════════════════════════
//  LOGIN PAGE
// ════════════════════════════════════════════════════════════
function LoginPage() {
  const navigate = useNavigate();

  // لو مسجّل دخول بالفعل → وجّه للـ portal
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) navigate(`/${role}`, { replace: true });
  }, []);

  function onLoginSuccess(role) {
    // Normalize role to lowercase to handle API returning "Admin", "Advisor", etc.
    navigate(`/${role.toLowerCase()}`, { replace: true });
  }

  return <AcademicAdvisorLogin onLoginSuccess={onLoginSuccess} />;
}

// ════════════════════════════════════════════════════════════
//  ROOT APP
// ════════════════════════════════════════════════════════════
export default function App() {
  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --bg:#06090f;--bg2:#0b1120;--card:#0e1829;--card2:#111e30;
          --blue:#3b82f6;--blue2:#60a5fa;--teal:#2dd4bf;--amber:#f59e0b;
          --rose:#fb7185;--violet:#a78bfa;--green:#34d399;
          --white:#e8f0fe;--muted:#5b7a9d;--muted:#334d6a;
          --border:rgba(59,130,246,0.12);--border2:rgba(255,255,255,0.06);
          --serif:'Libre Baskerville',serif;--sans:'Outfit',sans-serif;--mono:'DM Mono',monospace;
        }
        html,body,#root{height:100%;font-family:var(--sans);  fontSize: '1.5rem';background:var(--bg);color:var(--white);line-height:1.5}
        *::-webkit-scrollbar{display:none!important;width:0!important}
        *{scrollbar-width:none!important}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes blink{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.6)}}
        @keyframes modalIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
        button{font-family:var(--sans)}
        button:disabled{cursor:not-allowed!important}
        table{width:100%;border-collapse:collapse;font-size:12px}
        thead{background:rgba(255,255,255,.02)}
        th{padding:8px 12px;text-align:left;font-size:13.5px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:var(--dim);border-bottom:1px solid var(--border2);white-space:nowrap}
        td{padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.03);vertical-align:middle;color:var(--white)}
        tr:last-child td{border-bottom:none}
        tr:hover td{background:rgba(255,255,255,.015)}
        select{background-color:#1e293b;color:white;border:1px solid #334155}
        select option{background-color:#1e293b;color:white}
        textarea:focus{border-color:rgba(59,130,246,.35)!important}
      `}</style>
      <Routes>
        {/* ── Public ── */}
        <Route path="/" element={<MainWebsite />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<MainWebsite />} />
        <Route path="/regulation" element={<StudentGuide />} />

        {/* ── Portals ── */}
        <Route path="/admin" element={<AdminPortal />} />
        <Route path="/advisor" element={<AdvisorPortal />} />
        <Route path="/student" element={<StudentPortal />} />

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
