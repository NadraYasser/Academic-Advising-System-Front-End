import { COURSES } from './studentMockData';

const GRADE_POINTS = {
  'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0,
};


export function gradePoint(grade) { return GRADE_POINTS[grade] ?? null; }

export function calcCumGPA(history, allCourses = COURSES) {
  if (!allCourses || !history) return 0;

  const graded = history.filter(
    c => c.status !== 'enrolled' && c.grade !== '—'
  );

  if (!graded.length) return 0;

  let pts = 0;
  let ch = 0;

  graded.forEach(c => {
    const course = allCourses.find(x => x.code === c.code);

    const credits = course?.ch ?? 3;
    const gp = gradePoint(c.grade);

    if (gp !== null) {
      pts += gp * credits;
      ch += credits;
    }
  });

  return ch > 0 ? pts / ch : 0;
}

export function getCHPassed(history) {
  return history
    .filter(c => c.status === 'passed')
    .reduce((sum, c) => {
      const course = COURSES.find(x => x.code === c.code);
      return sum + (course?.ch ?? 3);
    }, 0);
}

export function getFailedCodes(history) {
  const passed = new Set(history.filter(c => c.status === 'passed').map(c => c.code));
  return [...new Set(history.filter(c => c.status === 'failed').map(c => c.code))].filter(c => !passed.has(c));
}

export function getPassedCodes(history) {
  return new Set(history.filter(c => c.status === 'passed').map(c => c.code));
}

export function getCurrentCourses(history) {
  return history.filter(c => c.status === 'enrolled' || c.status === 'confirmed' || c.status === 'registered');
}

export function getRisk(gpa) {
  if (gpa < 2.0) return 'high';
  if (gpa < 2.7) return 'medium';
  return 'low';
}

export function maxCHforGPA(gpa) {
  if (gpa < 2.0) return 12;
  return 18;
}

export function prereqsMet(code, passedCodes, allCourses = COURSES) {
  if (!allCourses) return true; 

  const course = allCourses.find(c => c.code === code);
  if (!course) return true; 

  const prereqs = course.prereqs || [];

  return prereqs.every(p => passedCodes.has(p));
}

 
const REG_PERIOD = {
  open: new Date("2026-05-01"),
  close: new Date("2026-06-01"),
};
export function isRegOpen() {
  const now = new Date();
  return now >= REG_PERIOD.open && now <= REG_PERIOD.close;
}

export function regDaysLeft() {
  const ms = REG_PERIOD.close - new Date();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

/
export function getAvailableCourses(history, currentSem, allCourses) {
  if (!allCourses) return []; 
  
  const passedCodes = getPassedCodes(history);
  const enrolledCodes = new Set(
    getCurrentCourses(history).map(c => c.code)
  );

  const isSpring = currentSem?.type === 'spring';
  const targetParity = isSpring ? 0 : 1;

  return allCourses.filter(course => {

     if (passedCodes.has(course.code)) return false;

     if (enrolledCodes.has(course.code)) return false;

    const prereqs = course.prereqs || [];
    const prereqsOk = prereqs.every(p => passedCodes.has(p));
    if (!prereqsOk) return false;

    if (course.semParity !== undefined) {
      if (course.semParity !== targetParity) return false;
    }

    return true;
  });




  let maxPassedPlanSem = 0;
  allCourses.forEach(c => {
    if (passedCodes.has(c.code)) maxPassedPlanSem = Math.max(maxPassedPlanSem, c.planSem);
  });
  const studentNextPlanSem = maxPassedPlanSem + 1;

  return allCourses.filter(c => {
    if (passedCodes.has(c.code)) return false;
    if (enrolledCodes.has(c.code)) return false;


    const everFailed = history.some(h => h.code === c.code && h.status === 'failed');
    if (everFailed) return true;

    const sp = c.planSem % 2;
    const isPrevParity = sp === targetParity && c.planSem < studentNextPlanSem;
    const isCurrParity = sp === targetParity;
    const isNextSem = c.planSem === studentNextPlanSem || c.planSem === studentNextPlanSem + 1;
    return isPrevParity || isCurrParity || isNextSem;
  });
}

export function getVisiblePlanSemesters(history, allCourses = COURSES) {
  const activeSems = new Set();
  history.forEach(h => {
    const co = allCourses.find(x => x.code === h.code);
    if (co) activeSems.add(co.planSem);
  });
  const maxActive = activeSems.size > 0 ? Math.max(...activeSems) : 1;
  const maxCatalog = Math.max(...allCourses.map(c => c.planSem));
  return Math.min(maxActive + 1, maxCatalog);
}


export function hasConflict(slotId, sid, slots, appts) {
  const slot = slots.find(s => s.id === slotId);
  if (!slot) return false;
  const existing = appts.filter(a => a.sid === sid && a.status === 'booked');
  return existing.some(a => {
    const existSlot = slots.find(s => s.id === a.slotId);
    return existSlot && existSlot.date === slot.date && existSlot.time === slot.time;
  });
}


export function gradeClass(g) {
  if (!g || g === '—') return '';
  if (g.startsWith('A')) return 'gr-a';
  if (g.startsWith('B')) return 'gr-b';
  if (g.startsWith('C')) return 'gr-c';
  if (g.startsWith('D')) return 'gr-d';
  if (g === 'F') return 'gr-f';
  return '';
}

export function codeColor(code) {
  if (code.startsWith('MATH')) return '#60a5fa';
  if (code.startsWith('STAT')) return '#a78bfa';
  if (code.startsWith('PHYS')) return '#fb7185';
  if (code.startsWith('CHEM')) return '#f59e0b';
  if (code.startsWith('CS')) return '#2dd4bf';
  return '#e8f0fe';
}

export function attLabel(n) {
  return ['1st', '2nd', '3rd', '4th'][n - 1] || `${n}th`;
}

export function getCompletedSems(history) {
  const groups = {};
  history.forEach(c => { if (!groups[c.sem]) groups[c.sem] = []; groups[c.sem].push(c); });
  return Object.keys(groups)
    .filter(sem => groups[sem].every(c => c.status !== 'enrolled'))
    .sort().reverse();
}
