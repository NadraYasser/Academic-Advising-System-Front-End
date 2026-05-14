// ─────────────────────────────────────────────────────────────
//  API SERVICE — Student Portal
//  Base: http://127.0.0.1:8000/api
// ─────────────────────────────────────────────────────────────
import { HISTORY, GPA_HIST, SLOTS, APPTS } from './studentMockData';

const BASE        = 'http://127.0.0.1:8000/api';
const STUDENT_URL = `${BASE}/student`;
const AUTH_URL    = `${BASE}/auth`;

export const USE_MOCK = false; // ✅ real API

// ── Mock helper ───────────────────────────────────────────────
function mock(data, delay = 300) {
  return new Promise(resolve =>
    setTimeout(() => resolve(structuredClone(data)), delay)
  );
}

// ── Auth headers ──────────────────────────────────────────────
function authHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

// ── Request helper ────────────────────────────────────────────
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

const get  = url      => request('GET', url);
const post = (url, b) => request('POST', url, b);

// ── Auth ──────────────────────────────────────────────────────
export async function logout() {
  if (USE_MOCK) {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    return;
  }
  try {
    await post(`${AUTH_URL}/logout`);
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
  }
}

// ── Dashboard ─────────────────────────────────────────────────
export async function fetchStudentDashboard() {
  if (USE_MOCK) return mock({});
  return get(`${STUDENT_URL}/dashboard`);
}

// ── Courses ───────────────────────────────────────────────────
export async function fetchHistory(sid) {
  if (USE_MOCK) return mock(HISTORY[sid] || []);

  const data = await get(`${STUDENT_URL}/courses`);
  const arr = Array.isArray(data) ? data : (data?.data ?? []);

  return arr.map(c => ({
    code:    c.course_code ?? c.code,
    grade:   c.grade ?? '—',
    sem:     c.semester ?? c.sem ?? '',
    status:  c.status,
    attempt: c.attempt ?? 1,
    name:    c.course_name ?? c.name ?? '',
    ch:      c.credit_hours ?? c.ch ?? 3,
    planSem: c.plan_semester ?? c.planSem ?? 1,
    prereqs: c.prerequisites ?? c.prereqs ?? [],
  }));
}

// ── GPA ───────────────────────────────────────────────────────
export async function fetchGPAHistory(sid) {
  if (USE_MOCK) return mock(GPA_HIST[sid] || []);

  const data = await get(`${STUDENT_URL}/courses`);
  return data?.gpa_history ?? data?.gpaHistory ?? [];
}

// ── Registration ──────────────────────────────────────────────
export async function fetchRegistration() {
  if (USE_MOCK) {
    return mock({
      available_courses: [],
      enrolled: [],
      current_sem: null
    });
  }
  return get(`${STUDENT_URL}/registration`);
}

export async function enrollCourse(courseId) {
  if (USE_MOCK) return mock({ success: true });
  // Backend expects: { course_id: integer }
  return post(`${STUDENT_URL}/registration/enroll`, {
    course_id: courseId
  });
}

export async function unenrollCourse(enrollmentId) {
  if (USE_MOCK) return mock({ success: true });
  return post(`${STUDENT_URL}/registration/unenroll/${enrollmentId}`);
}

export async function confirmRegistration({ studentId, courseCodes }) {
  if (USE_MOCK) {
    return mock({
      success: true,
      enrolledCount: courseCodes.length
    }, 500);
  }
  // Backend just confirms whatever is currently enrolled — no body required
  return post(`${STUDENT_URL}/registration/confirm`, {});
}

// ── Booking ───────────────────────────────────────────────────
export async function fetchAvailableDays(month, year) {
  if (USE_MOCK) return mock([]);
  return get(`${STUDENT_URL}/bookings/days/${month}/${year}`);
}

export async function fetchAdvisorSlots(advisorId, date) {
  if (USE_MOCK) {
    return mock(
      SLOTS.filter(
        s => s.advisorId === advisorId && s.status !== 'cancelled'
      ),
      400
    );
  }
  const d = date || new Date().toISOString().split('T')[0];
  return get(`${STUDENT_URL}/bookings/slots/${d}`);
}

export async function bookSlot({ studentId, advisorId, slotId, notes }) {
  if (USE_MOCK) {
    const { SLOTS: S } = await import('./studentMockData');
    const slot = S.find(s => s.id === slotId);

    if (!slot || slot.booked >= slot.max) {
      throw new Error('Slot no longer available');
    }

    return mock({
      success: true,
      appointmentId: 'ap' + Date.now()
    }, 600);
  }

  return post(`${STUDENT_URL}/bookings/book`, {
    slot_id: slotId,
    notes
  });
}

// ── Appointments ──────────────────────────────────────────────
export async function fetchAppointments(sid) {
  if (USE_MOCK) {
    const { APPTS: A } = await import('./studentMockData');
    return mock(A.filter(a => a.sid === sid));
  }

  const data = await get(`${STUDENT_URL}/appointments`);
  return Array.isArray(data) ? data : (data?.data ?? []);
}

export async function cancelAppointment(apptId) {
  if (USE_MOCK) return mock({ success: true }, 300);
  return post(`${STUDENT_URL}/appointments/${apptId}/cancel`);
}

// ── Refresh Slots ─────────────────────────────────────────────
export async function refreshSlots(advisorId) {
  if (USE_MOCK) {
    const { SLOTS: S } = await import('./studentMockData');
    return mock(
      S.filter(
        s => s.advisorId === advisorId && s.status !== 'cancelled'
      ),
      400
    );
  }

  const now = new Date();
  return get(
    `${STUDENT_URL}/bookings/days/${now.getMonth() + 1}/${now.getFullYear()}`
  );
}