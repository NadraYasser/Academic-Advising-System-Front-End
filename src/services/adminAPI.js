
const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/admin';

// ── Request helper ───────────────────────────────────────────
async function request(method, path, body) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

const get   = p      => request('GET',    p);
const post  = (p, b) => request('POST',   p, b);
const put   = (p, b) => request('PUT',    p, b);
const patch = (p, b) => request('PATCH',  p, b);
const del   = p      => request('DELETE', p);

// ── Auth ─────────────────────────────────────────────────────
// POST /api/auth/login   body: { email, password }
// POST /api/auth/logout
export const authAPI = {
  login:  data => fetch('http://127.0.0.1:8000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => r.json()),
  logout: () => {
    const token = localStorage.getItem('token');
    return fetch('http://127.0.0.1:8000/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    }).then(r => r.json()).catch(() => ({}));
  },
};

// ── Admin Me ─────────────────────────────────────────────────
 //GET /api/admin/me  (if exists) — يجلب بيانات الـ admin المسجّل
//  export const adminAPI = {
//    getMe: () => get('/me'),
//  };

// ── Dashboard ────────────────────────────────────────────────
// GET /api/admin/dashboard
export const dashboardAPI = {
  getStats: () => get('/dashboard'),
};

// ── Departments ──────────────────────────────────────────────
// GET    /api/admin/departments
// POST   /api/admin/departments
// DELETE /api/admin/departments/{id}
export const departmentsAPI = {
  getAll:  ()   => get('/departments'),
  create:  data => post('/departments', data),
  remove:  id   => del(`/departments/${id}`),
};

// ── Students ─────────────────────────────────────────────────
// GET    /api/admin/students
// GET    /api/admin/students/{id}
// POST   /api/admin/students
// PUT    /api/admin/students/{id}
// DELETE /api/admin/students/{id}
export const studentsAPI = {
  getAll: (params = {}) => {
    const q = new URLSearchParams();
    if (params.search)        q.set('search',        params.search);
    if (params.department_id) q.set('department_id', params.department_id);
    if (params.risk_level)    q.set('risk_level',    params.risk_level);
    const qs = q.toString();
    return get(`/students${qs ? `?${qs}` : ''}`);
  },
  getById: id         => get(`/students/${id}`),
  create:  data       => post('/students', data),
  update:  (id, data) => put(`/students/${id}`, data),
  remove:  id         => del(`/students/${id}`),
};

// ── Advisors ─────────────────────────────────────────────────
// GET    /api/admin/advisors
// GET    /api/admin/advisors/{id}
// POST   /api/admin/advisors
// PUT    /api/admin/advisors/{id}
// DELETE /api/admin/advisors/{id}
export const advisorsAPI = {
  getAll: (params = {}) => {
    const q = new URLSearchParams();
    if (params.search)        q.set('search',        params.search);
    if (params.department_id) q.set('department_id', params.department_id);
    const qs = q.toString();
    return get(`/advisors${qs ? `?${qs}` : ''}`);
  },
  getById: id         => get(`/advisors/${id}`),
  create:  data       => post('/advisors', data),
  update:  (id, data) => put(`/advisors/${id}`, data),
  remove:  id         => del(`/advisors/${id}`),
};

// ── Courses ──────────────────────────────────────────────────
// GET    /api/admin/courses
// GET    /api/admin/courses/{id}
// POST   /api/admin/courses
// PUT    /api/admin/courses/{id}
// DELETE /api/admin/courses/{id}
export const coursesAPI = {
  getAll: (params = {}) => {
    const q = new URLSearchParams();
    if (params.search) q.set('search', params.search);
    const qs = q.toString();
    return get(`/courses${qs ? `?${qs}` : ''}`);
  },
  getById: id         => get(`/courses/${id}`),
  create:  data       => post('/courses', data),
  update:  (id, data) => put(`/courses/${id}`, data),
  remove:  id         => del(`/courses/${id}`),
};

// ── Semesters ────────────────────────────────────────────────
// GET   /api/admin/semesters
// POST  /api/admin/semesters
// PUT   /api/admin/semesters/{id}
// PATCH /api/admin/semesters/{id}/activate
export const semestersAPI = {
  getAll:   ()         => get('/semesters'),
  create:   data       => post('/semesters', data),
  update:   (id, data) => put(`/semesters/${id}`, data),
  activate: id         => patch(`/semesters/${id}/activate`),
};
