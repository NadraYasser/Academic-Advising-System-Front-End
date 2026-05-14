// AppContextt // ─────────────────────────────────────────────────────────────
// //  AppContext — Student Portal
// //  USE_MOCK = true  → Mock Data مباشرة
// //  USE_MOCK = false → API حقيقي + token
// // ─────────────────────────────────────────────────────────────
// import React from 'react';
// import { createContext, useContext, useReducer, useCallback } from 'react';
// import { COURSES, CURRENT_SEM, USERS, HISTORY, GPA_HIST, SLOTS, APPTS, CREDENTIALS } from '../services/studentMockData';
// import { getCurrentCourses, maxCHforGPA } from '../services/studentLogic';


// // ── Toggle هنا فقط ───────────────────────────────────────────
// const USE_MOCK  = false;
// const LOGIN_URL = 'http://localhost:3000';
// const BASE_URL = "http://localhost:8000/api";


// // ── Mock Student افتراضي ─────────────────────────────────────
// // const MOCK_STUDENT = USERS.find(u => u.id === 's001');
// // const MOCK_ADVISOR = USERS.find(u => u.id === MOCK_STUDENT?.advisorId);


// // ── State ────────────────────────────────────────────────────
// const AppCtx = createContext(null);

// const init = {
//   student:      null,
//   advisor:      null,
//   history:      [],
//   gpaHist:      [],
//   slots:        [],
//   appts:        [],
//   loading:      false,
//   regConfirmed: false,
//   toast:        null,
// };

// function reducer(state, action) {
//   switch (action.type) {
//     case 'SET_STUDENT':   return { ...state, student: action.payload, regConfirmed: false };
//     case 'SET_ADVISOR':   return { ...state, advisor: action.payload };
//     case 'SET_HISTORY':   return { ...state, history: action.payload };
//     case 'SET_GPA_HIST':  return { ...state, gpaHist: action.payload };
//     case 'SET_SLOTS':     return { ...state, slots:   action.payload };
//     case 'SET_APPTS':     return { ...state, appts:   action.payload };
//     case 'SET_LOADING':   return { ...state, loading: action.payload };
//     case 'CONFIRM_REG':   return { ...state, regConfirmed: true  };
//     case 'UNCONFIRM_REG': return { ...state, regConfirmed: false };

//     case 'ENROLL': {
//       if (state.history.find(c => c.code === action.code && c.status === 'enrolled')) return state;
//       const attempts = state.history.filter(c => c.code === action.code && c.status !== 'enrolled').length;
//       return { ...state, history: [...state.history, { code: action.code, grade: '—', sem: CURRENT_SEM.short, status: 'enrolled', attempt: attempts + 1 }] };
//     }
//     case 'DROP': {
//       const idx = state.history.findIndex(c => c.code === action.code && c.status === 'enrolled');
//       if (idx < 0) return state;
//       const h = [...state.history]; h.splice(idx, 1);
//       return { ...state, history: h };
//     }
//     case 'BOOK_SLOT': {
//       const { appt, slotId } = action;
//       const newSlots = state.slots.map(s =>
//         s.id === slotId
//           ? { ...s, booked: s.booked + 1, bookings: [...(s.bookings||[]), state.student?.id], status: s.booked + 1 >= s.max ? 'full' : s.status }
//           : s
//       );
//       return { ...state, appts: [...state.appts, appt], slots: newSlots };
//     }
//     case 'CANCEL_APPT': {
//       const appt = state.appts.find(a => a.id === action.id);
//       const newSlots = state.slots.map(s => {
//         if (s.id !== appt?.slotId) return s;
//         return { ...s, booked: Math.max(0, s.booked - 1), status: 'available', bookings: (s.bookings||[]).filter(b => b !== state.student?.id) };
//       });
//       return { ...state, appts: state.appts.map(a => a.id === action.id ? { ...a, status: 'cancelled' } : a), slots: newSlots };
//     }
//     case 'SET_TOAST':   return { ...state, toast: action.payload };
//     case 'CLEAR_TOAST': return { ...state, toast: null };
//     default:            return state;
//   }
// }

// // ── API helpers ──────────────────────────────────────────────
// function authHeaders() {
//   const token = localStorage.getItem('token');
//   return { 'Content-Type': 'application/json', 'Accept': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) };
// }

// async function apiGet(path) {
//   const res = await fetch(`${BASE_URL}${path}`, { headers: authHeaders() });
//   if (res.status === 401) { localStorage.removeItem('token'); /* navigation handled by App */ throw new Error('Unauthorized'); }
//   if (!res.ok) throw new Error(`HTTP ${res.status}`);
//   return res.json();
// }

// async function apiPost(path, body) {
//   const res = await fetch(`${BASE_URL}${path}`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
//   if (res.status === 401) { localStorage.removeItem('token'); /* navigation handled by App */ throw new Error('Unauthorized'); }
//   if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.message || `HTTP ${res.status}`); }
//   return res.json();
// }

// // ── Provider ─────────────────────────────────────────────────
// export function AppProvider({ children }) {
//   const [state, dispatch] = useReducer(reducer, init);

//   const gpa       = state.student?.cumGPA      ?? 0;
//   const chPassed  = state.student?.chPassed    ?? 0;
//   const failed    = state.student?.failedCodes ?? [];
//   const risk      = state.student?.riskLevel   ?? 'low';
//   const maxCH     = maxCHforGPA(gpa);
//   const current   = getCurrentCourses(state.history);
//   const currentCH = current.reduce((s, c) => s + (COURSES.find(x => x.code === c.code)?.ch ?? 3), 0);

//   // ── Toast ────────────────────────────────────────────────
//   const toast = useCallback((msg, type = 'inf') => {
//     dispatch({ type: 'SET_TOAST', payload: { msg, type } });
//     setTimeout(() => dispatch({ type: 'CLEAR_TOAST' }), 3200);
//   }, []);

//   // ── Logout ────────────────────────────────────────────────
//   const doLogout = useCallback(async () => {
//     toast('Logging out…', 'inf');
//     if (!USE_MOCK) {
//       await apiPost('/auth/logout', {}).catch(() => {});
//     }
//     localStorage.removeItem('token');
//     localStorage.removeItem('role');
//     localStorage.removeItem('user');
//     setTimeout(() => { /* navigation handled by App */ }, 600);
//   }, [toast]);

//   // ── Boot — نفس نمط الـ admin بالضبط ─────────────────────
//   const boot = useCallback(async () => {
//     dispatch({ type: 'SET_LOADING', payload: true });

//     // ── USE_MOCK = true → تحميل Mock Data مباشرة ─────────
//     if (USE_MOCK) {
//       dispatch({ type: 'SET_STUDENT', payload: MOCK_STUDENT });
//       dispatch({ type: 'SET_ADVISOR', payload: MOCK_ADVISOR });
//       dispatch({ type: 'SET_HISTORY',  payload: HISTORY[MOCK_STUDENT.id]  || [] });
//       dispatch({ type: 'SET_GPA_HIST', payload: GPA_HIST[MOCK_STUDENT.id] || [] });
//       dispatch({ type: 'SET_APPTS',    payload: APPTS.filter(a => a.sid === MOCK_STUDENT.id) });
//       dispatch({ type: 'SET_SLOTS',    payload: SLOTS.filter(s => s.advisorId === MOCK_STUDENT.advisorId) });
//       dispatch({ type: 'SET_LOADING',  payload: false });
//       return;
//     }

//     // ── USE_MOCK = false → جلب من API الحقيقي ────────────
//     try {
//       // استخرج بيانات الـ student من localStorage (حُفظت عند login)
//       const userStr = localStorage.getItem('user');
//       const student = userStr ? JSON.parse(userStr) : null;
//       if (!student) { /* navigation handled by App */ return; }

//       dispatch({ type: 'SET_STUDENT', payload: student });

//       // جلب dashboard: GET /api/student/dashboard
//       const dashboard = await apiGet('/student/dashboard').catch(() => null);
//       if (dashboard) {
//         if (dashboard.advisor)     dispatch({ type: 'SET_ADVISOR',  payload: dashboard.advisor });
//         if (dashboard.courses)     dispatch({ type: 'SET_HISTORY',  payload: dashboard.courses });
//         if (dashboard.gpa_history) dispatch({ type: 'SET_GPA_HIST', payload: dashboard.gpa_history });
//       }

//       // جلب appointments: GET /api/student/appointments
//       const appts = await apiGet('/student/appointments').catch(() => []);
//       dispatch({ type: 'SET_APPTS', payload: Array.isArray(appts) ? appts : appts?.data ?? [] });

//       // جلب slots المتاحة للشهر الحالي
//       const now = new Date();
//       const slots = await apiGet(`/student/bookings/days/${now.getMonth()+1}/${now.getFullYear()}`).catch(() => []);
//       dispatch({ type: 'SET_SLOTS', payload: Array.isArray(slots) ? slots : [] });

//     } catch (err) {
//       console.error('Boot error:', err);
//       toast('Failed to load data — is the server running?', 'err');
//     }

//     dispatch({ type: 'SET_LOADING', payload: false });
//   }, [toast]);

//   // ── refreshSlots (للـ BookAppointment) ──────────────────
//   const refreshSlots = useCallback(async () => {
//     if (USE_MOCK) {
//       dispatch({ type: 'SET_SLOTS', payload: SLOTS.filter(s => s.advisorId === state.student?.advisorId) });
//       return;
//     }
//     const now = new Date();
//     const slots = await apiGet(`/student/bookings/days/${now.getMonth()+1}/${now.getFullYear()}`).catch(() => []);
//     dispatch({ type: 'SET_SLOTS', payload: Array.isArray(slots) ? slots : [] });
//   }, [state.student]);

//   return (
//     <AppCtx.Provider value={{
//       ...state, gpa, chPassed, failed, risk, maxCH, current, currentCH,
//       dispatch, toast, doLogout, boot, refreshSlots,
//     }}>
//       {children}
//     </AppCtx.Provider>
//   );
// }

// export const useApp = () => useContext(AppCtx);
// ─────────────────────────────────────────────────────────────
// AppContext — Student Portal (API ONLY VERSION)
// ─────────────────────────────────────────────────────────────

import React, { createContext, useContext, useReducer, useCallback } from "react";
import { COURSES, CURRENT_SEM } from "../services/studentMockData"; // اختياري فقط لو ثابت
import { getCurrentCourses, maxCHforGPA } from "../services/studentLogic";

// ── Config ───────────────────────────────────────────
const LOGIN_URL = "http://localhost:3000";
const BASE_URL = "http://127.0.0.1:8000/api";

// ── Context ───────────────────────────────────────────
const AppCtx = createContext(null);

// ── Initial State ─────────────────────────────────────
const init = {
  student: null,
  advisor: null,
  history: [],
  gpaHist: [],
  slots: [],
  appts: [],
  loading: false,
  regConfirmed: false,
  toast: null,
};

// ── Reducer ───────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case "SET_STUDENT":
      return { ...state, student: action.payload, regConfirmed: false };

    case "SET_ADVISOR":
      return { ...state, advisor: action.payload };

    case "SET_HISTORY":
      return { ...state, history: action.payload };

    case "SET_GPA_HIST":
      return { ...state, gpaHist: action.payload };

    case "SET_SLOTS":
      return { ...state, slots: action.payload };

    case "SET_APPTS":
      return { ...state, appts: action.payload };

    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_TOAST":
      return { ...state, toast: action.payload };

    case "CLEAR_TOAST":
      return { ...state, toast: null };

    case "ENROLL": {
      if (state.history.find(c => c.code === action.code && c.status === 'enrolled')) return state;
      // Note: Registration.jsx adds to history to show in "My Selections"
      return {
        ...state,
        history: [...state.history, {
          code: action.code,
          name: action.name || '',
          ch: action.ch || 3,
          status: 'enrolled',
          sem: 'Current',
          attempt: 1
        }]
      };
    }

    case "DROP":
      return {
        ...state,
        history: state.history.filter(c => !(c.code === action.code && c.status === 'enrolled'))
      };

    case "CONFIRM_REG":
      return { ...state, regConfirmed: true };

    default:
      return state;
  }
}

// ── API Helpers ───────────────────────────────────────
function authHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiGet(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: authHeaders(),
  });

  if (res.status === 401) {
    localStorage.clear();
    /* navigation handled by App */
    throw new Error("Unauthorized");
  }

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  if (res.status === 401) {
    localStorage.clear();
    /* navigation handled by App */
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  return res.json();
}

// ── Provider ─────────────────────────────────────────
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, init);

  // ── computed values
  const gpa = state.student?.cumGPA ?? 0;
  const chPassed = state.student?.chPassed ?? 0;
  const failed = state.student?.failedCodes ?? [];
  const risk = state.student?.riskLevel ?? "low";

  const maxCH = maxCHforGPA(gpa);
  const current = getCurrentCourses(state.history);

  const currentCH = current.reduce(
    (s, c) => s + (c.ch ?? 3),
    0
  );

  // ── Toast
  const toast = useCallback((msg, type = "inf") => {
    dispatch({ type: "SET_TOAST", payload: { msg, type } });

    setTimeout(() => {
      dispatch({ type: "CLEAR_TOAST" });
    }, 3000);
  }, []);

  // ── Logout
  const doLogout = useCallback(async () => {
    toast("Logging out...", "inf");

    await apiPost("/auth/logout", {}).catch(() => { });

    localStorage.clear();

    setTimeout(() => {
      /* navigation handled by App */
    }, 500);
  }, [toast]);

  // ── Boot (MAIN API LOADER)
  const boot = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const userStr = localStorage.getItem("user");
      const student = userStr ? JSON.parse(userStr) : null;

      if (!student) {
        /* navigation handled by App */
        return;
      }

      dispatch({ type: "SET_STUDENT", payload: student });

      // ── Dashboard
      const dashboard = await apiGet("/student/dashboard");

      // Enrich student with data from API response
      if (dashboard) {
        dispatch({
          type: "SET_STUDENT",
          payload: {
            ...student,
            name: dashboard.student?.name || student.name,
            level: dashboard.student?.level || student.level,
            dept: dashboard.student?.department || student.dept || student.department,
            cumGPA: dashboard.stats?.cumulative_gpa ?? 0,
            chPassed: dashboard.stats?.ch_passed ?? 0,
            failedCodes: dashboard.stats?.failed_courses ?? [],
            riskLevel: dashboard.risk_level ?? 'low',
            semester: dashboard.semester_display ?? '',
          },
        });

        dispatch({
          type: "SET_ADVISOR",
          payload: dashboard.advisor || null,
        });

        dispatch({
          type: "SET_GPA_HIST",
          payload: dashboard.gpa_progression || dashboard.gpa_history || [],
        });
      }

      // ── Courses history (separate endpoint)
      try {
        const coursesData = await apiGet("/student/courses");
        // Response shape: { student, semester_gpa, grade_distribution, course_history, semesters }
        const coursesArr = coursesData?.course_history
          ?? (Array.isArray(coursesData) ? coursesData : (coursesData?.data ?? []));
        dispatch({
          type: "SET_HISTORY",
          payload: coursesArr.map(c => ({
            code: c.course_code ?? c.code ?? '',
            grade: c.grade ? c.grade.toUpperCase() : '—',
            sem: c.semester_label ?? c.semester ?? c.sem ?? '',
            status: c.status ? c.status.toLowerCase() : 'enrolled',
            attempt: c.attempt_number ?? c.attempt ?? 1,
            name: c.course_name ?? c.name ?? '',
            ch: c.credit_hours ?? c.ch ?? 3,
            planSem: c.plan_semester ?? c.planSem ?? 1,
            prereqs: c.prerequisites ?? c.prereqs ?? [],
          })),
        });
      } catch (e) {
        console.warn("Could not load courses:", e.message);
      }

      // ── Appointments
      const apptsRes = await apiGet("/student/appointments");
      // Response: { status, data: { appointments: [], counters: {} } }
      const rawAppts = apptsRes?.data?.appointments
        ?? (Array.isArray(apptsRes) ? apptsRes : (apptsRes?.data ?? []));

      dispatch({
        type: "SET_APPTS",
        payload: rawAppts.map(a => ({
          ...a,
          id: a.appointment_id ?? a.id,
          date: a.slot?.date ?? a.date,
          time: a.slot ? `${a.slot.start_time} - ${a.slot.end_time}` : (a.time ?? ''),
          status: (a.status ?? '').toLowerCase(),
          notes: a.notes ?? '',
          type: 'Advising Session',
        })),
      });

      // ── Slots: getAvailableDays returns list of dates, then we need to fetch slots for a specific date
      // The days endpoint returns array of available dates
      // We don't load slots at boot - they load on demand in BookAppointment page
      // Just set empty array here; BookAppointment uses fetchAdvisorSlots directly
      dispatch({
        type: "SET_SLOTS",
        payload: [],
      });
    } catch (err) {
      console.error("BOOT ERROR:", err);
      toast(err.message || "Failed to load data", "err");
    }

    dispatch({ type: "SET_LOADING", payload: false });
  }, [toast]);

  // ── Refresh Slots (no-op - slots load on demand in BookAppointment page)
  const refreshSlots = useCallback(async () => {
    // Slots are fetched per-date in BookAppointment page
    // This is kept for API compatibility
  }, []);

  return (
    <AppCtx.Provider
      value={{
        ...state,
        gpa,
        chPassed,
        failed,
        risk,
        maxCH,
        current,
        currentCH,
        dispatch,
        toast,
        doLogout,
        boot,
        refreshSlots,
      }}
    >
      {children}
    </AppCtx.Provider>
  );
}

export const useApp = () => useContext(AppCtx);
