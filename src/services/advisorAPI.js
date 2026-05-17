
import { HISTORY, GPA_HIST, SLOTS, APPTS, NOTES } from './advisorMockData';

const BASE = 'http://127.0.0.1:8000/api';
const ADVISOR_URL = `${BASE}/advisor`;
const AUTH_URL = `${BASE}/auth`;

export const USE_MOCK = false;

function mock(data, delay = 250) {
  return new Promise(resolve => setTimeout(() => resolve(structuredClone(data)), delay));
}
function authHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

async function request(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: authHeaders(),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    window.location.href = 'http://localhost:3000';
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

const get = url => request('GET', url);
const post = (url, b) => request('POST', url, b);
const put = (url, b) => request('PUT', url, b);
const patch = (url, b) => request('PATCH', url, b);
const del = url => request('DELETE', url);

// ── Auth ──────────────────────────────────────────────────────
// POST /api/auth/logout
export async function logout() {
  if (USE_MOCK) {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    return;
  }
  try { await post(`${AUTH_URL}/logout`); }
  finally {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
  }
}

// ── Dashboard ─────────────────────────────────────────────────
// GET /api/advisor/dashboard
export async function fetchAdvisorDashboard() {
  if (USE_MOCK) return mock({});
  return get(`${ADVISOR_URL}/dashboard`);
}

// ── My Students ───────────────────────────────────────────────
// GET /api/advisor/mystudents
export async function fetchAdvisorStudents(advisorId) {
  if (USE_MOCK) {
    const { STUDENTS } = await import('./advisorMockData');
    return mock(STUDENTS.filter(s => s.advisorId === advisorId));
  }
  const data = await get(`${ADVISOR_URL}/mystudents`);
  return Array.isArray(data) ? data : (data?.data ?? []);
}

// ── Student Profile ───────────────────────────────────────────
// GET /api/advisor/students/{studentId}
export async function fetchStudentProfile(studentId) {
  if (USE_MOCK) {
    const { STUDENTS } = await import('./advisorMockData');
    return mock(STUDENTS.find(s => s.id === studentId) ?? {});
  }
  return get(`${ADVISOR_URL}/students/${studentId}`);
}

// GET /api/advisor/students/{studentId}/availablecourses
export async function fetchStudentAvailableCourses(studentId) {
  if (USE_MOCK) return mock([]);
  return get(`${ADVISOR_URL}/students/${studentId}/availablecourses`);
}

// POST /api/advisor/students/{studentId}/addcourse
// body: { course_id }
export async function addStudentCourse(studentId, courseId) {
  if (USE_MOCK) return mock({ success: true });
  return post(`${ADVISOR_URL}/students/${studentId}/addcourse`, { courses_id: courseId });
}

// DELETE /api/advisor/students/{studentId}/removecourse/{courseId}
export async function removeStudentCourse(studentId, courseId) {
  if (USE_MOCK) return mock({ success: true });
  return del(`${ADVISOR_URL}/students/${studentId}/removecourse/${courseId}`);
}

// POST /api/advisor/students/{studentId}/confirmcourses
export async function confirmStudentCourses(studentId) {
  if (USE_MOCK) return mock({ success: true });
  return post(`${ADVISOR_URL}/students/${studentId}/confirmcourses`);
}

// ── Student History (من الـ profile response) ─────────────────
export async function fetchStudentHistory(studentId) {
  if (USE_MOCK) return mock(HISTORY[studentId] || []);
  const data = await get(`${ADVISOR_URL}/students/${studentId}`);
  return data?.history ?? data?.courses ?? [];
}

export async function fetchStudentGPAHistory(studentId) {
  if (USE_MOCK) return mock(GPA_HIST[studentId] || []);
  const data = await get(`${ADVISOR_URL}/students/${studentId}`);
  return data?.gpa_history ?? [];
}

// ── Notes (mock only — لا يوجد endpoint) ─────────────────────
export async function fetchStudentNotes(studentId) {
  return mock(NOTES[studentId] || []);
}

export async function saveNote(studentId, note) {
  return mock({ ...note, id: 'n' + Date.now() }, 200);
}

// ── Appointments ──────────────────────────────────────────────
// GET   /api/advisor/appointments
// GET   /api/advisor/appointments/stats
// PATCH /api/advisor/appointments/update_status/{id}
//       body: { status: 'attended' | 'cancelled' }
export async function fetchAdvisorAppointments(advisorId) {
  if (USE_MOCK) return mock(APPTS.filter(a => a.aid === advisorId));
  const data = await get(`${ADVISOR_URL}/appointments`);
  return Array.isArray(data) ? data : (data?.data ?? []);
}

export async function fetchAppointmentStats() {
  if (USE_MOCK) return mock({ upcoming: 0, attended: 0, cancelled: 0 });
  return get(`${ADVISOR_URL}/appointments/stats`);
}

export async function updateAppointmentStatus(apptId, status) {
  if (USE_MOCK) return mock({ success: true });
  // Backend validates: 'Attended' | 'Cancelled' (capitalized)
  const capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  return patch(`${ADVISOR_URL}/appointments/update_status/${apptId}`, { status: capitalizedStatus });
}

// Shortcuts
export const markAttended = apptId => updateAppointmentStatus(apptId, 'attended');
export const markNoShow = apptId => updateAppointmentStatus(apptId, 'cancelled');

// ── Time Slots ────────────────────────────────────────────────
// GET  /api/advisor/timeslots
// POST /api/advisor/timeslots/addslot
//      body: { date, time, max_students }
// PUT  /api/advisor/timeslots/update/{slot}
//      body: { date, time, max_students }
export async function fetchAdvisorSlots(advisorId) {
  if (USE_MOCK) return mock(SLOTS.filter(s => s.advisorId === advisorId));
  const data = await get(`${ADVISOR_URL}/timeslots`);
  return Array.isArray(data) ? data : (data?.data ?? []);
}

export async function addSlot(slotData) {
  if (USE_MOCK) return mock({ ...slotData, id: 'sl' + Date.now(), booked: 0, bookings: [], status: 'available' }, 300);
  // Parse time range "HH:MM - HH:MM" into start_time and end_time
  const [start_time, end_time] = (slotData.time ?? '').split(' - ').map(t => t.trim());
  return post(`${ADVISOR_URL}/timeslots/addslot`, {
    slot_date: slotData.date,
    start_time: start_time || slotData.start_time,
    end_time: end_time || slotData.end_time,
    max_students: slotData.max ?? slotData.max_students ?? 1,
  });
}

export async function updateSlot(slotId, slotData) {
  if (USE_MOCK) return mock({ ...slotData, id: slotId });
  // Parse time range "HH:MM - HH:MM" into start_time and end_time
  const timeStr = slotData.time ?? '';
  const [start_time, end_time] = timeStr.includes(' - ')
    ? timeStr.split(' - ').map(t => t.trim())
    : [slotData.start_time, slotData.end_time];
  const body = {};
  if (start_time) body.start_time = start_time;
  if (end_time) body.end_time = end_time;
  if (slotData.max ?? slotData.max_students) body.max_students = slotData.max ?? slotData.max_students;
  return put(`${ADVISOR_URL}/timeslots/update/${slotId}`, body);
}

// Note: Backend has no dedicated cancel endpoint for slots
// cancelSlot only updates local state in the reducer (CANCEL_SLOT action)
export const cancelSlot = slotId => Promise.resolve({ success: true, id: slotId });
