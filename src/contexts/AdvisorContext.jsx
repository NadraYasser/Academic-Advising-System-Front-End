// // ─────────────────────────────────────────────────────────────
// //  AppContext — Advisor Portal
// //  USE_MOCK = true  → Mock Data
// //  USE_MOCK = false → API حقيقي
// // ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────
// Advisor Context — API ONLY VERSION
// ─────────────────────────────────────────────

import React, { createContext, useContext, useReducer, useCallback } from "react";

const LOGIN_URL = "http://localhost:3000";
const BASE_URL = "http://127.0.0.1:8000/api";

// ── Context ─────────────────────────────
const AppCtx = createContext(null);

// ── State ───────────────────────────────
const init = {
  advisor: null,
  students: [],
  slots: [],
  appts: [],
  selectedStudent: null,
  studentHistory: [],
  studentGPAHist: [],
  studentNotes: [],
  loading: false,
  studentLoading: false,
  toast: null,
};

// ── Reducer ─────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case "SET_ADVISOR":
      return { ...state, advisor: action.payload };

    case "SET_STUDENTS":
      return { ...state, students: action.payload };

    case "SET_SLOTS":
      return { ...state, slots: action.payload };

    case "ADD_SLOT":
      return {
        ...state,
        slots: [...state.slots, {
          ...action.payload,
          id: action.payload.id,
          date: action.payload.slot_date ?? action.payload.date,
          time: action.payload.time_range ?? action.payload.time ?? '',
          max: action.payload.max_students ?? action.payload.max ?? 1,
          booked: 0,
          status: 'available',
        }],
      };

    case "CANCEL_SLOT":
      return {
        ...state,
        slots: state.slots.map(s =>
          s.id === action.id ? { ...s, status: 'cancelled' } : s
        ),
      };

    case "EDIT_SLOT":
      return {
        ...state,
        slots: state.slots.map(s =>
          s.id === action.id
            ? { ...s, max: action.max ?? s.max, time: action.time ?? s.time }
            : s
        ),
      };

    case "SET_APPTS":
      return { ...state, appts: action.payload };

    case "MARK_ATTENDED":
      return {
        ...state,
        appts: state.appts.map(a => a.id === action.id ? { ...a, status: 'attended' } : a)
      };

    case "MARK_CANCELLED":
      return {
        ...state,
        appts: state.appts.map(a => a.id === action.id ? { ...a, status: 'cancelled' } : a)
      };

    case "SET_SELECTED_STUDENT":
      return { ...state, selectedStudent: action.payload };

    case "SET_STUDENT_HISTORY":
      return { ...state, studentHistory: action.payload };

    case "SET_STUDENT_GPA":
      return { ...state, studentGPAHist: action.payload };

    case "SET_STUDENT_NOTES":
      return { ...state, studentNotes: action.payload };

    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_STUDENT_LOADING":
      return { ...state, studentLoading: action.payload };

    case "SET_TOAST":
      return { ...state, toast: action.payload };

    case "CLEAR_TOAST":
      return { ...state, toast: null };

    default:
      return state;
  }
}

// ── API ────────────────────────────────
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
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    localStorage.clear();
    /* navigation handled by App */
    throw new Error("Unauthorized");
  }

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  return res.json();
}

async function apiPatch(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    localStorage.clear();
    /* navigation handled by App */
    throw new Error("Unauthorized");
  }

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  return res.json();
}

// ── Provider ───────────────────────────
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, init);

  // ── Toast ───────────────────────────
  const toast = useCallback((msg, type = "inf") => {
    dispatch({ type: "SET_TOAST", payload: { msg, type } });

    setTimeout(() => {
      dispatch({ type: "CLEAR_TOAST" });
    }, 3000);
  }, []);

  // ── Logout ──────────────────────────
  const doLogout = useCallback(async () => {
    await apiPost("/auth/logout").catch(() => { });

    localStorage.clear();

    /* navigation handled by App */
  }, []);

  // ── Boot ────────────────────────────
  const boot = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const userStr = localStorage.getItem("user");
      const advisor = userStr ? JSON.parse(userStr) : null;

      if (!advisor) {
        /* navigation handled by App */
        return;
      }

      dispatch({ type: "SET_ADVISOR", payload: advisor });

      const studentsRes = await apiGet("/advisor/mystudents");
      // Response shape: { total, need_attention, students: [...] }
      const rawStudents = studentsRes?.students ?? studentsRes?.data ?? (Array.isArray(studentsRes) ? studentsRes : []);

      // Map snake_case API fields to camelCase expected by components
      const mappedStudents = rawStudents.map(s => {
        const rawRisk = (s.risk_level ?? s.riskLevel ?? 'low').toLowerCase();
        // Normalize "High level" or "High" -> "high"
        const risk = rawRisk.includes('high') ? 'high' : rawRisk.includes('medium') ? 'medium' : 'low';
        const gpa = s.cumulative_gpa ?? s.gpa ?? 0;

        return {
          ...s,
          id: s.id ?? s.student_id,
          riskLevel: risk,
          failedCodes: s.failed_courses
            ? (Array.isArray(s.failed_courses) ? s.failed_courses : [s.failed_courses])
            : (s.failedCodes ?? []),
          gpa: gpa,
          cumGPA: gpa, // Dashboard expects cumGPA
          currentCH: s.current_hours ?? s.currentCH ?? 0,
          av: s.av ?? s.initials ?? (s.name ? s.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '??'),
        };
      });

      dispatch({
        type: "SET_STUDENTS",
        payload: mappedStudents,
      });

      const apptsRes = await apiGet("/advisor/appointments");
      const rawAppts = Array.isArray(apptsRes) ? apptsRes : (apptsRes?.data ?? []);

      // Map API response to expected frontend shape
      const mappedAppts = rawAppts.map(a => {
        const student = a.student || {};
        const stObj = mappedStudents.find(s => s.id === (student.id ?? a.student_id));
        return {
          ...a,
          id: a.id ?? a.appointment_id,
          sid: student.id ?? a.student_id,
          date: a.date,
          time: a.time,
          notes: a.notes ?? '',
          // Normalize status to lowercase
          status: (a.status ?? '').toLowerCase(),
          // Ensure student info is available for avatars etc
          student: stObj || {
            name: student.name || 'Unknown',
            av: student.initials || '??',
            riskLevel: (student.risk_level || 'low').toLowerCase().includes('high') ? 'high' : 'low'
          }
        };
      });

      dispatch({
        type: "SET_APPTS",
        payload: mappedAppts,
      });

      // Load timeslots
      const slotsRes = await apiGet("/advisor/timeslots").catch(() => []);
      const rawSlots = Array.isArray(slotsRes) ? slotsRes : (slotsRes?.data ?? []);
      const mappedSlots = rawSlots.map(s => ({
        ...s,
        id: s.id,
        date: s.slot_date ?? s.date,
        time: s.time_range ?? s.time ?? `${s.start_time ?? ''} - ${s.end_time ?? ''}`,
        max: s.max_students ?? s.max ?? 1,
        booked: s.booked ?? 0,
        status: (s.status ?? 'available').toLowerCase(),
      }));

      dispatch({ type: "SET_SLOTS", payload: mappedSlots });

    } catch (err) {
      console.error(err);
      toast("Failed to load advisor data", "err");
    }

    dispatch({ type: "SET_LOADING", payload: false });
  }, [toast]);

  // ── Student details ────────────────
  const loadStudentDetail = useCallback(async (student) => {
    dispatch({ type: "SET_SELECTED_STUDENT", payload: student });
    dispatch({ type: "SET_STUDENT_LOADING", payload: true });

    try {
      // The student profile endpoint returns full data including history
      const profileData = await apiGet(`/advisor/students/${student.id}`);

      // Map academic_history to the expected format
      const history = (profileData?.academic_history ?? []).map(c => ({
        code: c.course_code ?? c.code,
        name: c.course_name ?? c.name ?? '',
        grade: c.grade ?? '—',
        status: c.status,
        sem: c.semester_name ?? c.sem ?? '',
        ch: c.credit_hours ?? c.ch ?? 3,
        attempt: c.attempt ?? 1,
      }));

      dispatch({
        type: "SET_STUDENT_HISTORY",
        payload: history,
      });

      // student_notes come from profile endpoint
      dispatch({
        type: "SET_STUDENT_NOTES",
        payload: profileData?.student_notes ?? [],
      });

      // Also update the selected student with full profile data
      if (profileData?.header) {
        const h = profileData.header;
        dispatch({
          type: "SET_SELECTED_STUDENT",
          payload: {
            ...student,
            id: h.student_id ?? student.id,
            name: h.name ?? student.name,
            email: h.email ?? student.email,
            level: h.level ?? student.level,
            department: h.department ?? student.department,
            riskLevel: h.risk_level ?? student.riskLevel,
            gpa: h.cumulative_gpa ?? student.gpa,
            av: h.initials ?? student.av,
            summaryCards: profileData.summary_cards ?? [],
            currentCourses: profileData.current_courses ?? [],
            gpaHistory: profileData.gpa_history ?? [],
          },
        });
      }
    } catch (err) {
      console.error(err);
      toast("Failed to load student details", "err");
    }

    dispatch({ type: "SET_STUDENT_LOADING", payload: false });
  }, [toast]);

  // ── Appointment actions ───────────
  const updateApptStatus = useCallback(async (id, status) => {
    // status should be 'Attended' or 'Cancelled' (matching backend validation)
    await apiPatch(`/advisor/appointments/update_status/${id}`, { status });
    if (status === 'Attended') dispatch({ type: 'MARK_ATTENDED', id });
    else dispatch({ type: 'MARK_CANCELLED', id });
  }, []);

  return (
    <AppCtx.Provider
      value={{
        ...state,
        dispatch,
        toast,
        doLogout,
        boot,
        loadStudentDetail,
        updateApptStatus,
      }}
    >
      {children}
    </AppCtx.Provider>
  );
}

export const useApp = () => useContext(AppCtx);
