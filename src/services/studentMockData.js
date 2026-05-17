
//  MOCK DATA — mirrors server API response shapes



export const CREDENTIALS = {
  'omar.samir@sci.asu.edu.eg':    { pw: 'student123', id: 's001' },
  'ahmed.hassan@sci.asu.edu.eg':  { pw: 'student123', id: 's002' },
  'mona.fathy@sci.asu.edu.eg':    { pw: 'student123', id: 's003' },
  'sara.nour@sci.asu.edu.eg':     { pw: 'student123', id: 's004' },
  'khaled.atef@sci.asu.edu.eg':   { pw: 'student123', id: 's005' },
};

export const USERS = [
  {
    id:'s001', name:'Omar Samir', email:'omar.samir@sci.asu.edu.eg',
    role:'student', dept:'Mathematics', level:3, advisorId:'a001', av:'OS',
  
    cumGPA: 3.50, chPassed: 28, failedCodes: [], riskLevel: 'low',
  },
  {
    id:'s002', name:'Ahmed Hassan', email:'ahmed.hassan@sci.asu.edu.eg',
    role:'student', dept:'Mathematics', level:2, advisorId:'a001', av:'AH',
    cumGPA: 1.45, chPassed: 9, failedCodes: ['MATH 102', 'PHYS 103'], riskLevel: 'high',
  },
  {
    id:'s003', name:'Mona Fathy', email:'mona.fathy@sci.asu.edu.eg',
    role:'student', dept:'Mathematics', level:1, advisorId:'a001', av:'MF',
    cumGPA: 1.72, chPassed: 3, failedCodes: ['STAT 101'], riskLevel: 'high',
  },
  {
    id:'s004', name:'Sara Nour', email:'sara.nour@sci.asu.edu.eg',
    role:'student', dept:'Computer Sciences', level:4, advisorId:'a002', av:'SN',
    cumGPA: 3.85, chPassed: 15, failedCodes: [], riskLevel: 'low',
  },
  {
    id:'s005', name:'Khaled Atef', email:'khaled.atef@sci.asu.edu.eg',
    role:'student', dept:'Mathematics', level:3, advisorId:'a001', av:'KA',
    cumGPA: 2.10, chPassed: 12, failedCodes: [], riskLevel: 'medium',
  },
  { id:'a001', name:'Dr. Hana Samir', dept:'Mathematics',       av:'HS', maxStudents:6  },
  { id:'a002', name:'Dr. Ahmed Zaki', dept:'Computer Sciences', av:'AZ', maxStudents:50 },
];

export const COURSES = [
  { code:'MATH 101', name:'Calculus (1)',         ch:3, planSem:1, dept:'Mathematics',       prereqs:[] },
  { code:'MATH 102', name:'Calculus (2)',         ch:3, planSem:2, dept:'Mathematics',       prereqs:['MATH 101'] },
  { code:'MATH 201', name:'Advanced Calculus',    ch:3, planSem:3, dept:'Mathematics',       prereqs:['MATH 102'] },
  { code:'MATH 211', name:'Linear Algebra',       ch:3, planSem:2, dept:'Mathematics',       prereqs:[] },
  { code:'MATH 301', name:'Real Analysis (1)',    ch:3, planSem:5, dept:'Mathematics',       prereqs:['MATH 201'] },
  { code:'MATH 305', name:'Complex Analysis',     ch:3, planSem:5, dept:'Mathematics',       prereqs:['MATH 201'] },
  { code:'MATH 311', name:'Numerical Methods',    ch:3, planSem:5, dept:'Mathematics',       prereqs:['MATH 211'] },
  { code:'MATH 401', name:'Real Analysis (2)',    ch:3, planSem:6, dept:'Mathematics',       prereqs:['MATH 301'] },
  { code:'STAT 101', name:'Intro to Statistics',  ch:3, planSem:1, dept:'Mathematics',       prereqs:[] },
  { code:'STAT 201', name:'Probability Theory',   ch:3, planSem:3, dept:'Mathematics',       prereqs:['STAT 101'] },
  { code:'STAT 305', name:'Applied Statistics',   ch:3, planSem:5, dept:'Mathematics',       prereqs:['STAT 201'] },
  { code:'PHYS 103', name:'General Physics (1)',  ch:3, planSem:1, dept:'Physics',           prereqs:[] },
  { code:'PHYS 104', name:'General Physics (2)',  ch:3, planSem:2, dept:'Physics',           prereqs:['PHYS 103'] },
  { code:'CHEM 101', name:'General Chemistry',    ch:3, planSem:1, dept:'Mathematics',       prereqs:[] },
  { code:'CHEM 103', name:'Applied Chemistry',    ch:1, planSem:3, dept:'Mathematics',       prereqs:['CHEM 101'] },
  { code:'CS 101',   name:'Intro to Programming', ch:3, planSem:1, dept:'Computer Sciences', prereqs:[] },
  { code:'CS 201',   name:'Data Structures',      ch:3, planSem:3, dept:'Computer Sciences', prereqs:['CS 101'] },
  { code:'CS 301',   name:'Algorithms',           ch:3, planSem:5, dept:'Computer Sciences', prereqs:['CS 201'] },
];

export const HISTORY = {
  s001:[
    { code:'MATH 101', grade:'B+', sem:'Fall 21/22', status:'passed',  attempt:1 },
    { code:'STAT 101', grade:'D',  sem:'Fall 21/22', status:'passed',  attempt:1 },
    { code:'PHYS 103', grade:'F',  sem:'Spr 21/22',  status:'failed',  attempt:1 },
    { code:'CHEM 101', grade:'C+', sem:'Spr 21/22',  status:'passed',  attempt:1 },
    { code:'MATH 102', grade:'B',  sem:'Spr 22/23',  status:'passed',  attempt:1 },
    { code:'MATH 211', grade:'A-', sem:'Fall 22/23', status:'passed',  attempt:1 },
    { code:'PHYS 103', grade:'C',  sem:'Fall 22/23', status:'passed',  attempt:2 },
    { code:'STAT 201', grade:'B+', sem:'Spr 23/24',  status:'passed',  attempt:1 },
    { code:'MATH 201', grade:'A',  sem:'Fall 23/24', status:'passed',  attempt:1 },
    { code:'CHEM 103', grade:'B',  sem:'Spr 24/25',  status:'passed',  attempt:1 },
    { code:'MATH 301', grade:'—',  sem:'Spr 25/26',  status:'enrolled',attempt:1 },
    { code:'MATH 305', grade:'—',  sem:'Spr 25/26',  status:'enrolled',attempt:1 },
    { code:'STAT 305', grade:'—',  sem:'Spr 25/26',  status:'enrolled',attempt:1 },
    { code:'MATH 311', grade:'—',  sem:'Spr 25/26',  status:'enrolled',attempt:1 },
  ],
  s002:[
    { code:'MATH 101', grade:'D',  sem:'Fall 22/23', status:'passed',  attempt:1 },
    { code:'STAT 101', grade:'F',  sem:'Fall 22/23', status:'failed',  attempt:1 },
    { code:'PHYS 103', grade:'F',  sem:'Spr 22/23',  status:'failed',  attempt:1 },
    { code:'CHEM 101', grade:'D',  sem:'Spr 22/23',  status:'passed',  attempt:1 },
    { code:'STAT 101', grade:'D',  sem:'Fall 23/24', status:'passed',  attempt:2 },
    { code:'MATH 102', grade:'F',  sem:'Spr 23/24',  status:'failed',  attempt:1 },
    { code:'MATH 201', grade:'—',  sem:'Spr 25/26',  status:'enrolled',attempt:1 },
    { code:'PHYS 103', grade:'—',  sem:'Spr 25/26',  status:'enrolled',attempt:2 },
    { code:'CHEM 103', grade:'—',  sem:'Spr 25/26',  status:'enrolled',attempt:3 },
    { code:'MATH 102', grade:'—',  sem:'Spr 25/26',  status:'enrolled',attempt:2 },
  ],
  s003:[
    { code:'MATH 101', grade:'C',  sem:'Fall 24/25', status:'passed',  attempt:1 },
    { code:'STAT 101', grade:'F',  sem:'Fall 24/25', status:'failed',  attempt:1 },
    { code:'PHYS 103', grade:'C+', sem:'Spr 25/26',  status:'enrolled',attempt:1 },
    { code:'CHEM 101', grade:'—',  sem:'Spr 25/26',  status:'enrolled',attempt:1 },
    { code:'STAT 101', grade:'—',  sem:'Spr 25/26',  status:'enrolled',attempt:2 },
  ],
  s004:[
    { code:'CS 101',   grade:'A',  sem:'Fall 21/22', status:'passed',  attempt:1 },
    { code:'MATH 101', grade:'A-', sem:'Fall 21/22', status:'passed',  attempt:1 },
    { code:'CS 201',   grade:'A',  sem:'Fall 22/23', status:'passed',  attempt:1 },
    { code:'MATH 102', grade:'B+', sem:'Spr 22/23',  status:'passed',  attempt:1 },
    { code:'CS 301',   grade:'—',  sem:'Spr 25/26',  status:'enrolled',attempt:1 },
  ],
  s005:[
    { code:'MATH 101', grade:'C+', sem:'Fall 21/22', status:'passed',  attempt:1 },
    { code:'STAT 101', grade:'B',  sem:'Fall 21/22', status:'passed',  attempt:1 },
    { code:'MATH 102', grade:'C',  sem:'Spr 22/23',  status:'passed',  attempt:1 },
    { code:'MATH 211', grade:'F',  sem:'Fall 22/23', status:'failed',  attempt:1 },
    { code:'MATH 211', grade:'C+', sem:'Spr 23/24',  status:'passed',  attempt:2 },
    { code:'MATH 201', grade:'—',  sem:'Spr 25/26',  status:'enrolled',attempt:1 },
    { code:'STAT 201', grade:'—',  sem:'Spr 25/26',  status:'enrolled',attempt:1 },
  ],
};

export const GPA_HIST = {
  s001:[{sem:'Fall 21/22',gpa:2.20},{sem:'Spr 22/23',gpa:2.48},{sem:'Fall 22/23',gpa:2.88},{sem:'Spr 23/24',gpa:3.12},{sem:'Fall 23/24',gpa:3.32},{sem:'Spr 24/25',gpa:3.50}],
  s002:[{sem:'Fall 22/23',gpa:2.08},{sem:'Spr 22/23',gpa:1.60},{sem:'Fall 23/24',gpa:1.40}],
  s003:[{sem:'Fall 24/25',gpa:1.72}],
  s004:[{sem:'Fall 21/22',gpa:3.80},{sem:'Spr 22/23',gpa:3.75},{sem:'Fall 22/23',gpa:3.90},{sem:'Spr 23/24',gpa:3.85}],
  s005:[{sem:'Fall 21/22',gpa:2.40},{sem:'Spr 22/23',gpa:2.20},{sem:'Fall 22/23',gpa:1.90},{sem:'Spr 23/24',gpa:2.10}],
};

export const SLOTS = [
  { id:'sl001', advisorId:'a001', date:'2026-03-11', time:'09:00 – 10:00', max:5, booked:3, status:'available', bookings:['s002','s003','s005'] },
  { id:'sl002', advisorId:'a001', date:'2026-03-11', time:'11:00 – 12:00', max:5, booked:5, status:'full',      bookings:['s001','s002','s003','s004','s005'] },
  { id:'sl003', advisorId:'a001', date:'2026-03-13', time:'14:00 – 15:00', max:4, booked:2, status:'available', bookings:['s003','s005'] },
  { id:'sl004', advisorId:'a001', date:'2026-03-18', time:'10:00 – 11:00', max:6, booked:0, status:'available', bookings:[] },
  { id:'sl005', advisorId:'a001', date:'2026-03-26', time:'09:00 – 10:00', max:5, booked:1, status:'available', bookings:['s001'] },
  { id:'sl007', advisorId:'a001', date:'2026-04-08', time:'10:00 – 11:00', max:5, booked:0, status:'available', bookings:[] },
  { id:'sl008', advisorId:'a001', date:'2026-04-15', time:'14:00 – 15:00', max:4, booked:1, status:'available', bookings:['s002'] },
  { id:'sl009', advisorId:'a001', date:'2026-05-06', time:'09:00 – 10:00', max:5, booked:0, status:'available', bookings:[] },
  { id:'sl010', advisorId:'a002', date:'2026-03-10', time:'10:00 – 11:00', max:8, booked:2, status:'available', bookings:['s004'] },
  { id:'sl011', advisorId:'a002', date:'2026-03-17', time:'11:00 – 12:00', max:8, booked:0, status:'available', bookings:[] },
  { id:'sl012', advisorId:'a002', date:'2026-03-24', time:'14:00 – 15:00', max:8, booked:3, status:'available', bookings:[] },
  { id:'sl013', advisorId:'a002', date:'2026-04-07', time:'10:00 – 11:00', max:8, booked:0, status:'available', bookings:[] },
  { id:'sl014', advisorId:'a002', date:'2026-04-21', time:'09:00 – 10:00', max:8, booked:1, status:'available', bookings:['s004'] },
  { id:'sl015', advisorId:'a002', date:'2026-05-12', time:'13:00 – 14:00', max:8, booked:0, status:'available', bookings:[] },
];

export const APPTS = [
  { id:'ap001', sid:'s001', aid:'a001', slotId:'sl002', date:'2026-03-11', time:'11:00–12:00', type:'Advising Session',  status:'booked',   notes:'Want to discuss semester plan' },
  { id:'ap002', sid:'s001', aid:'a001', slotId:null,    date:'2026-02-18', time:'09:00–10:00', type:'Registration Help', status:'attended', notes:'' },
  { id:'ap003', sid:'s001', aid:'a001', slotId:null,    date:'2026-01-05', time:'14:00–15:00', type:'Academic Planning', status:'cancelled',notes:'' },
  { id:'ap004', sid:'s002', aid:'a001', slotId:'sl001', date:'2026-03-11', time:'09:00–10:00', type:'Risk Review',       status:'booked',   notes:'Discuss failed courses' },
  { id:'ap005', sid:'s003', aid:'a001', slotId:'sl003', date:'2026-03-13', time:'14:00–15:00', type:'Registration Help', status:'booked',   notes:'' },
  { id:'ap006', sid:'s005', aid:'a001', slotId:'sl001', date:'2026-03-11', time:'09:00–10:00', type:'GPA Review',        status:'booked',   notes:'' },
];

export const CURRENT_SEM = {
  label: 'Spring 2025/2026',
  short: 'Spr 25/26',
  type:  'spring',
  start: '2026-02-01',
  end:   '2026-06-30',
};

export const REG_PERIOD = {
  open:       new Date('2026-02-01'),
  close:      new Date('2026-04-30T23:59:59'), // extended for demo
  openLabel:  'Feb 1, 2026',
  closeLabel: 'May 21, 2026',
};
