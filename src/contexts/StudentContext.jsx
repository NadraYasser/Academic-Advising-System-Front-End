
// AppContext — Student Portal 
// ─────────────────────────────────────────────────────────────

import React, { createContext, useContext, useReducer, useCallback } from "react";
import { COURSES, CURRENT_SEM } from "../services/studentMockData" 
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

    case "UNCONFIRM_REG":
      return { ...state, regConfirmed: false };

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
  const risk = gpa < 2.0 ? "high" : (gpa >= 2.0 && gpa < 2.76 ? "medium" : "low");

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

    }, 500);
  }, [toast]);

  // ── Refresh Appointments
  const refreshAppts = useCallback(async () => {
    try {
      const apptsRes = await apiGet("/student/appointments");
      const rawAppts = apptsRes?.data?.appointments ?? (Array.isArray(apptsRes) ? apptsRes : (apptsRes?.data ?? []));
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
    } catch (err) {
      console.warn("Failed to refresh appts:", err);
    }
  }, []);

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

      
      const dashboard = await apiGet("/student/dashboard");

      
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
            riskLevel: (dashboard.risk_level ?? 'low').toLowerCase().includes('high') ? 'high' : ((dashboard.risk_level ?? 'low').toLowerCase().includes('medium') ? 'medium' : 'low'),
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

      
      try {
        const coursesData = await apiGet("/student/courses");
    
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

        const hasConfirmed = coursesArr.some(c => {
          const s = (c.status ?? '').toLowerCase();
          return s === 'confirmed' || s === 'registered';
        });
        if (hasConfirmed) {
          dispatch({ type: "CONFIRM_REG" });
        } else {
          dispatch({ type: "UNCONFIRM_REG" });
        }
      } catch (e) {
        console.warn("Could not load courses:", e.message);
      }

      
      await refreshAppts();

     
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

  
  const refreshSlots = useCallback(async () => {
  
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
        refreshAppts,
      }}
    >
      {children}
    </AppCtx.Provider>
  );
}

export const useApp = () => useContext(AppCtx);
