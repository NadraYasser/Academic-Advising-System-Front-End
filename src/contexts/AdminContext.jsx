// // ─────────────────────────────────────────────────────────────
//  AppContext — Admin Portal
// ─────────────────────────────────────────────────────────────
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import {
  dashboardAPI,
  studentsAPI,
  advisorsAPI,
  coursesAPI,
  semestersAPI,
  departmentsAPI
} from '../services/adminAPI';

// ── CONFIG ───────────────────────────────────────────────
const USE_MOCK = false;
const LOGIN_URL = 'http://localhost:3000';
const BASE_URL = 'http://127.0.0.1:8000/api'; // Laravel

// ── CONTEXT ──────────────────────────────────────────────
const AppCtx = createContext(null);

// ── STATE ────────────────────────────────────────────────
const init = {
  admin: null,
  students: [],
  advisors: [],
  courses: [],
  semesters: [],
  departments: [],
  stats: null,
  loading: false,
  toast: null,
};

// ── REDUCER ──────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'SET_ADMIN': return { ...state, admin: action.payload };
    case 'SET_STUDENTS': return { ...state, students: action.payload };
    case 'SET_ADVISORS': return { ...state, advisors: action.payload };
    case 'SET_COURSES': return { ...state, courses: action.payload };
    case 'SET_SEMESTERS': return { ...state, semesters: action.payload };
    case 'SET_DEPARTMENTS': return { ...state, departments: action.payload };
    case 'SET_STATS': return { ...state, stats: action.payload };
    case 'SET_LOADING': return { ...state, loading: action.payload };
    case 'SET_TOAST': return { ...state, toast: action.payload };
    case 'CLEAR_TOAST': return { ...state, toast: null };

    // ── Students CRUD ──
    case 'ADD_STUDENT': return { ...state, students: [...state.students, action.payload] };
    case 'UPDATE_STUDENT': return { ...state, students: state.students.map(s => s.id === action.payload.id ? action.payload : s) };
    case 'REMOVE_STUDENT': return { ...state, students: state.students.filter(s => s.id !== action.id) };

    // ── Advisors CRUD ──
    case 'ADD_ADVISOR': return { ...state, advisors: [...state.advisors, action.payload] };
    case 'UPDATE_ADVISOR': return { ...state, advisors: state.advisors.map(a => a.id === action.payload.id ? action.payload : a) };
    case 'REMOVE_ADVISOR': return { ...state, advisors: state.advisors.filter(a => a.id !== action.id) };

    // ── Courses CRUD ──
    case 'ADD_COURSE': return { ...state, courses: [...state.courses, action.payload] };
    case 'UPDATE_COURSE': return { ...state, courses: state.courses.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'REMOVE_COURSE': return { ...state, courses: state.courses.filter(c => c.id !== action.id) };

    // ── Semesters CRUD ──
    case 'ADD_SEMESTER': return { ...state, semesters: [...state.semesters, action.payload] };
    case 'UPDATE_SEMESTER': return { ...state, semesters: state.semesters.map(s => s.id === action.payload.id ? action.payload : s) };
    case 'ACTIVATE_SEMESTER': return { ...state, semesters: state.semesters.map(s => ({ ...s, status: s.id === action.id ? 'Active' : 'Inactive' })) };

    default: return state;
  }
}

// ── MAPPERS ──────────────────────────────────────────────
function mapStudent(s) {
  const latestRisk = s.risk_evaluations?.[s.risk_evaluations.length - 1] ?? {};
  const gpa = latestRisk.cumulative_gpa ?? null;
  const riskVal = gpa === null ? 'Low' : (gpa < 2.0 ? 'High' : (gpa < 2.76 ? 'Medium' : 'Low'));
  return {
    id: s.id,
    name: s.name,
    email: s.email,
    national_id: s.national_id,
    level: s.level,
    department_id: s.department_id,
    advisor_id: s.advisor_id,
    department: s.department?.name ?? '',
    advisor: s.advisor?.name ?? '',
    risk: riskVal,
    gpa: gpa,
  };
}

function mapAdvisor(a, deptMap = {}) {
  return {
    id: a.id,
    name: a.name,
    email: a.email,
    level: a.level,
    department_id: a.department_id,
    department: deptMap[a.department_id] ?? '',
    max: a.max_student,
    students: a.students_count ?? 0,
  };
}

function mapCourse(c) {
  const prereqNames = c.prerequisites?.map(p => p.course_code) ?? [];
  const match = (c.course_code ?? '').match(/^([A-Za-z]+)(\d+)$/);
  return {
    id: c.id,
    course_name: c.course_name,
    course_code: c.course_code,
    code: match ? match[1].toUpperCase() : (c.course_code || ''),
    num: match ? match[2] : '',
    name: c.course_name,
    credits: c.credit_hours,
    sem: `Sem ${c.plan_semester}`,
    plan_semester: c.plan_semester,
    prereq: prereqNames.length ? prereqNames.join(', ') : 'None',
    prerequisite_ids: c.prerequisites?.map(p => p.id) ?? [],
    depts: c.course_departments?.length ?? 0,
    dept_list: c.course_departments?.map(cd => cd.department?.name ?? cd.department_id) ?? [],
    departments: c.course_departments?.map(cd => ({ id: cd.department_id, type_course: cd.type_course })) ?? [],
  };
}

function mapSemester(s) {
  return {
    id: s.id,
    year: s.academic_year,
    sem: s.semester_name ? s.semester_name.charAt(0).toUpperCase() + s.semester_name.slice(1) : '',
    semester_name: s.semester_name,
    academic_year: s.academic_year,
    start: s.start_date,
    end: s.end_date,
    duration: typeof s.duration === 'string'
      ? `${parseFloat(s.duration).toFixed(1)} weeks`
      : (s.duration ? `${s.duration} weeks` : '—'),
    status: (s.is_active == 1 || s.is_active === true) ? 'Active' : 'Inactive',
    is_active: s.is_active,
  };
}

// ── PROVIDER ─────────────────────────────────────────────
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, init);

  const toast = useCallback((msg, type = 'inf') => {
    dispatch({ type: 'SET_TOAST', payload: { msg, type } });
    setTimeout(() => dispatch({ type: 'CLEAR_TOAST' }), 3000);
  }, []);

  const boot = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      
      const userStr = localStorage.getItem('user');
      const adminUser = userStr ? JSON.parse(userStr) : null;

      if (!adminUser) {
        /* navigation handled by App */
        return;
      }

      dispatch({
        type: 'SET_ADMIN',
        payload: {
          name: adminUser.name,
          email: adminUser.email,
        }
      });


      const [
        statsRaw,
        studentsRaw,
        advisorsRaw,
        coursesRaw,
        semestersRaw,
        deptsRaw
      ] = await Promise.all([
        dashboardAPI.getStats(),
        studentsAPI.getAll(),
        advisorsAPI.getAll(),
        coursesAPI.getAll(),
        semestersAPI.getAll(),
        departmentsAPI.getAll(),
      ]);

      const studentsArr = Array.isArray(studentsRaw)
        ? studentsRaw
        : (studentsRaw?.data ?? []);

      const advisorsArr = Array.isArray(advisorsRaw)
        ? advisorsRaw
        : (advisorsRaw?.data ?? []);

      const coursesArr = Array.isArray(coursesRaw)
        ? coursesRaw
        : (coursesRaw?.data ?? []);

      const semestersArr = Array.isArray(semestersRaw)
        ? semestersRaw
        : (semestersRaw?.data ?? []);

      const deptsArr = Array.isArray(deptsRaw)
        ? deptsRaw
        : (deptsRaw?.data ?? []);

      const deptMap = {};
      deptsArr.forEach(d => {
        deptMap[d.id] = d.name;
      });

      // ✅ 3. Dispatch
      dispatch({ type: 'SET_STATS', payload: statsRaw });
      dispatch({ type: 'SET_STUDENTS', payload: studentsArr.map(mapStudent) });
      dispatch({ type: 'SET_ADVISORS', payload: advisorsArr.map(a => mapAdvisor(a, deptMap)) });
      dispatch({ type: 'SET_COURSES', payload: coursesArr.map(mapCourse) });
      dispatch({ type: 'SET_SEMESTERS', payload: semestersArr.map(mapSemester) });
      dispatch({ type: 'SET_DEPARTMENTS', payload: deptsArr });

    } catch (err) {
      console.error(err);
      toast('Server error — تأكد إن Laravel شغال', 'err');
    }

    dispatch({ type: 'SET_LOADING', payload: false });
  }, [toast]);

  const doLogout = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (e) { /* ignore */ }
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    /* navigation handled by App */
  }, []);

  return (
    <AppCtx.Provider value={{ ...state, dispatch, toast, boot, doLogout }}>
      {children}
    </AppCtx.Provider>
  );
}

export const useApp = () => useContext(AppCtx);
