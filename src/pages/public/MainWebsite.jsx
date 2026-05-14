
import React from "react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import AcademicAdvisorLogin from "./AcademicAdvisorLogin";
import StudentGuide from "./StudentGuide";



/* ── FONTS ── */
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Outfit:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap";
document.head.appendChild(fontLink);

const globalStyle = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#06090f;--card:#0e1829;--blue:#3b82f6;--blue2:#60a5fa;
    --teal:#2dd4bf;--amber:#f59e0b;--rose:#fb7185;--violet:#a78bfa;
    --white:#e8f0fe;--muted:#5b7a9d;--dim:#334d6a;
    --border:rgba(59,130,246,0.12);--border2:rgba(255,255,255,0.06);
    --serif:'Libre Baskerville',serif;--sans:'Outfit',sans-serif;--mono:'DM Mono',monospace;
  }
  html{scroll-behavior:smooth}
  body{font-family:var(--sans);background:var(--bg);color:var(--white);overflow-x:hidden;line-height:1.7}
  body::after{content:'';position:fixed;inset:0;z-index:999;pointer-events:none;
    background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E");
    opacity:0.5}
  @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes blink{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.6)}}
`;
const styleEl = document.createElement("style");
styleEl.textContent = globalStyle;
document.head.appendChild(styleEl);

/* ══ DATA ══ */
const MILESTONES = [
  {year:"1950",title:"Foundation",text:"Faculty of Science established by royal decree as part of Ibrahim Pasha University, Cairo."},
  {year:"1953",title:"First Graduates",text:"The first cohort earns Bachelor of Science degrees across seven founding departments."},
  {year:"1954",title:"Ain Shams University",text:"University renamed to Ain Shams — 'Eye of the Sun' — reflecting Egypt's ancient heritage."},
  {year:"1983",title:"Department Merger",text:"Pure and Applied Mathematics departments consolidated into a unified Mathematics department."},
  {year:"1993",title:"Expansion",text:"Geophysics and Microbiology departments established, bringing the total to ten scientific departments."},
  {year:"2016",title:"Academic Accreditation",text:"Faculty receives official accreditation from Egypt's National Authority for Quality Assurance and Accreditation of Education."},
  {year:"2017",title:"Credit-Hour System",text:"Full transition to the credit-hour system, enabling flexible, personalised degree pathways across all programmes."},
];

const DEPTS = {
  math:{
    icon:"🔢",title:"Mathematics",sub:"Department of Mathematics",
    grad:"linear-gradient(135deg,#d97706,#f59e0b)",accent:"var(--amber)",
    bg:"rgba(245,158,11,0.05)",bdr:"rgba(245,158,11,0.3)",chip:"amber",
    desc:"Students join the Mathematics department via an enrolment preference form at Level 1, Semester 1. In Semester 2 they choose one of three tracks. From Level 2, additional specialisation options become available.",
    steps:[
      {n:"1",body:"Student joins the department via an enrolment preference form — Level 1, Semester 1."},
      {n:"2",body:"At Level 1 / Semester 2, the student submits a preference form to select a track:",chips:["Mathematics","Computer Science","Mathematical Statistics"]},
      {n:"3",body:"At Level 2 / Semester 1, CS and Statistics students may choose a specialisation:",subs:[
        {label:"Mathematics students",note:"continue to graduation unchanged."},
        {label:"Computer Science students",chips:["CS (Single)","Pure Maths – CS (Joint)"]},
        {label:"Mathematical Statistics students",chips:["Statistics (Single)","Pure Maths – Statistics (Joint)","Statistics – CS (Joint)"]},
      ]},
    ],
    progs:[
      {code:"MATH",name:"Mathematics (Single)",detail:"Enrol at Level 1 · continues to graduation"},
      {code:"CS",name:"Computer Science (Single)",detail:"Chosen at Level 2, Semester 1"},
      {code:"CS+M",name:"Pure Maths – CS (Joint)",detail:"Chosen at Level 2, Semester 1"},
      {code:"STAT",name:"Mathematical Statistics (Single)",detail:"Chosen at Level 2, Semester 1"},
      {code:"ST+M",name:"Pure Maths – Statistics (Joint)",detail:"Chosen at Level 2, Semester 1"},
      {code:"ST+C",name:"Statistics – CS (Joint)",detail:"Chosen at Level 2, Semester 1"},
    ],
  },
  phys:{
    icon:"⚛️",title:"Physics",sub:"Department of Physics",
    grad:"linear-gradient(135deg,#dc2626,#ef4444)",accent:"var(--rose)",
    bg:"rgba(239,68,68,0.05)",bdr:"rgba(239,68,68,0.3)",chip:"rose",
    desc:"Students join the Physics department via an enrolment preference form at Level 1, Semester 1. In Semester 2 they choose one of three tracks and continue until graduation — no further change is available.",
    steps:[
      {n:"1",body:"Student joins the department via an enrolment preference form — Level 1, Semester 1."},
      {n:"2",body:"At Level 1 / Semester 2, the student selects one programme:",chips:["Physics (Single)","Physics – CS (Joint)","Physics – Chemistry (Joint)"]},
      {n:"✓",body:"The student continues in the chosen programme until graduation. No further track change is permitted."},
    ],
    progs:[
      {code:"PHY",name:"Physics (Single)",detail:"Chosen at Level 1, Sem 2 · continues to graduation"},
      {code:"PHY+CS",name:"Physics – Computer Science (Joint)",detail:"Chosen at Level 1, Sem 2"},
      {code:"PHY+CH",name:"Physics – Chemistry (Joint)",detail:"Chosen at Level 1, Sem 2"},
    ],
    note:"ℹ️ Programme choice is made at Level 1, Semester 2. No further specialisation change is available after this point.",
    noteRgb:"251,113,133",
  },
  bio:{
    icon:"🧬",title:"BioPhysics",sub:"Department of Biophysics",
    grad:"linear-gradient(135deg,#7c3aed,#a78bfa)",accent:"var(--violet)",
    bg:"rgba(167,139,250,0.05)",bdr:"rgba(167,139,250,0.3)",chip:"violet",
    desc:"The Biophysics department has the simplest enrolment pathway. Students join via a preference form at Level 1 and follow a single fixed track through to graduation — no mid-degree specialisation required or available.",
    steps:[
      {n:"1",body:"Student joins the Biophysics programme via an enrolment preference form — Level 1, Semester 1."},
      {n:"✅",body:"The student continues in the Biophysics programme until graduation. No further track selection is required."},
    ],
    progs:[
      {code:"BPH",name:"Biophysics — Single Track",detail:"Enrol once at Level 1 · progress to graduation unchanged"},
    ],
    note:"🔒 No mid-degree track change is available. The pathway from enrolment to graduation is fixed and continuous.",
    noteRgb:"167,139,250",
  },
  chem:{
    icon:"🧪",title:"Chemistry",sub:"Department of Chemistry",
    grad:"linear-gradient(135deg,#0d9488,#2dd4bf)",accent:"var(--teal)",
    bg:"rgba(45,212,191,0.05)",bdr:"rgba(45,212,191,0.3)",chip:"teal",
    desc:"Students join the Chemistry department at Level 1 and continue through Level 2. At Level 3, Semester 1, they may apply to specialise in Applied Chemistry. Students remain in their chosen track through to graduation.",
    steps:[
      {n:"1",body:"Student joins the programme via an enrolment preference form — Level 1, Semester 1."},
      {n:"2",body:"Student continues in the Chemistry programme until the end of Level 2."},
      {n:"3",body:"At Level 3 / Semester 1, the student submits a preference form to choose a specialisation:",chips:["Chemistry — Basic","Applied Chemistry"]},
      {n:"✓",body:"Chemistry (Basic) students continue until graduation. Applied Chemistry students continue in the Applied track until graduation."},
    ],
    progs:[
      {code:"CHM",name:"Chemistry — Basic",detail:"Core programme · continues to graduation"},
      {code:"CHM-AP",name:"Applied Chemistry",detail:"Chosen at Level 3, Sem 1 · continues to graduation"},
    ],
    note:"ℹ️ Applied Chemistry is only available from Level 3, Semester 1 — after completing Levels 1 and 2.",
    noteRgb:"45,212,191",
  },
};

/* ══ HOOKS ══ */
function useScrolled(){
  const [s,setS]=useState(false);
  useEffect(()=>{const fn=()=>setS(window.scrollY>50);window.addEventListener("scroll",fn);return()=>window.removeEventListener("scroll",fn);},[]);
  return s;
}
function useReveal(){
  const ref=useRef(null);const[v,setV]=useState(false);
  useEffect(()=>{const el=ref.current;if(!el)return;const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){setV(true);o.disconnect();}},{threshold:.08});o.observe(el);return()=>o.disconnect();},[]);
  return[ref,v];
}

/* ══ UI PRIMITIVES ══ */
function Reveal({children,delay=0,style={}}){
  const[ref,v]=useReveal();
  return<div ref={ref} style={{opacity:v?1:0,transform:v?"translateY(0)":"translateY(22px)",transition:`opacity .65s ease ${delay}s,transform .65s ease ${delay}s`,...style}}>{children}</div>;
}

const CHIP_COLORS={
  blue:{bg:"rgba(59,130,246,0.08)",bdr:"rgba(59,130,246,0.22)",c:"var(--blue2)"},
  amber:{bg:"rgba(245,158,11,0.08)",bdr:"rgba(245,158,11,0.22)",c:"var(--amber)"},
  rose:{bg:"rgba(251,113,133,0.08)",bdr:"rgba(251,113,133,0.22)",c:"var(--rose)"},
  teal:{bg:"rgba(45,212,191,0.08)",bdr:"rgba(45,212,191,0.22)",c:"var(--teal)"},
  violet:{bg:"rgba(167,139,250,0.08)",bdr:"rgba(167,139,250,0.22)",c:"var(--violet)"},
};
function Chip({children,color="blue"}){
  const t=CHIP_COLORS[color]||CHIP_COLORS.blue;
  return<span style={{padding:"5px 13px",borderRadius:8,fontSize:12,fontWeight:600,border:`1.5px solid ${t.bdr}`,background:t.bg,color:t.c,display:"inline-block"}}>{children}</span>;
}

/* ══ NAV ══ */
function Nav({page,setPage}){
  const navigate = useNavigate();
  const scrolled=useScrolled();
  return(
    <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:500,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 52px",background:scrolled?"rgba(6,9,15,0.97)":"rgba(6,9,15,0.8)",backdropFilter:"blur(20px)",borderBottom:"1px solid var(--border)",transition:"background .4s"}}>
      <div onClick={()=>setPage("home")} style={{display:"flex",alignItems:"center",gap:14,cursor:"pointer"}}>
        <div style={{width:38,height:38,borderRadius:10,background:"linear-gradient(135deg,var(--blue),var(--teal))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:25}}>🎓</div>
        <div>
          <div style={{ fontFamily: "'Libre Baskerville',serif", fontSize: 15, fontWeight: 700, color: 'var(--white)' }}>
            Academic <span style={{ color: 'var(--blue2)' }}>Advising</span> System
          </div>
          <div style={{ fontSize: 12, color: 'var(--white)', letterSpacing: .5, marginTop: 1 }}>
            FACLUTY OF SCIENCE· AIN SHAMS UNIVERSITY
          </div>
        </div>
      </div>
      
      <button onClick={()=>navigate("/login")}  style={{
            background: "linear-gradient(135deg,var(--blue),#1d65cc)", color: "#fff",
            border: "none", borderRadius: 8, padding: "9px 22px", fontFamily: "var(--sans)", fontSize: 18,
            fontWeight: 500, cursor: "pointer", boxShadow: "0 4px 14px rgba(59,130,246,0.3)"
          }}>Sign In →</button>
    </nav>
  );
}

/* ══ MOBILE NAV ══ */
function MobileNav({page,setPage}){
  return(
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:500,background:"rgba(6,9,15,0.97)",backdropFilter:"blur(20px)",borderTop:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-around",padding:"10px 0 14px"}}>
      {[["home","🏠","Home"],["history","📖","History"],["departments","🔬","Department"]].map(([id,icon,label])=>(
        <button key={id} onClick={()=>setPage(id)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4,fontFamily:"var(--sans)",fontSize:10,fontWeight:600,color:page===id?"var(--blue2)":"var(--muted)",padding:"4px 16px",transition:"color .2s"}}>
          <span style={{fontSize:20}}>{icon}</span>{label}
        </button>
      ))}
    </div>
  );
}

/* ══ HOME PAGE ══ */
function HomePage({setPage}){
  const navigate = useNavigate();
  const pills=[{icon:"🔢",label:"Mathematics",sub:"120 Credit Hours"},{icon:"⚛️",label:"Physics",sub:"128 Credit Hours"},{icon:"🧬",label:"BioPhysics",sub:"124 Credit Hours"},{icon:"🧪",label:"Chemistry",sub:"126 Credit Hours"}];
  const stats=[{n:"1950",l:"Year Founded"},{n:"75+",l:"Years of Excellence"},{n:"35+",l:"Departments"},{n:"4",l:"Academic Years"}];
  return(
    <div style={{minHeight:"calc(100vh - 72px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"60px 24px 80px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,zIndex:0,background:"radial-gradient(ellipse 700px 500px at 30% 40%,rgba(59,130,246,0.07) 0%,transparent 70%),radial-gradient(ellipse 500px 400px at 75% 60%,rgba(45,212,191,0.05) 0%,transparent 70%)"}}/>
      <div style={{position:"absolute",inset:0,zIndex:0,overflow:"hidden",opacity:.04}}>
        <svg style={{width:"100%",height:"100%"}} viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          <defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5"/></pattern></defs>
          <rect width="1440" height="900" fill="url(#grid)"/>
        </svg>
      </div>
      <div style={{position:"relative",zIndex:2,maxWidth:760}}>
          <h1 style={{fontFamily:"var(--serif)",fontSize:"clamp(2.8rem,6vw,4.8rem)",fontWeight:700,lineHeight:1.12,marginBottom:14,animation:"fadeUp .8s .08s ease both"}}>
          Where Science<br/><em style={{color:"var(--blue2)",fontStyle:"italic"}}>Meets Excellence</em>
        </h1>
        <p style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:"clamp(1rem,2vw,1.25rem)",color:"var(--teal)",marginBottom:20,animation:"fadeUp .8s .16s ease both"}}>Established 1950 · Al-Abbasiya, Cairo, Egypt</p>
        <p style={{fontSize:15,color:"var(--muted)",maxWidth:540,margin:"0 auto 44px",fontWeight:300,lineHeight:1.85,animation:"fadeUp .8s .24s ease both"}}>
          The Faculty of Science at Ain Shams University is one of Egypt's most distinguished scientific institutions — offering rigorous department as Mathematics, Physics, Biophysics, and Chemistry.
        </p>
        <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap",animation:"fadeUp .8s .32s ease both"}}>
          <button onClick={()=>navigate("/login")} style={{background:"linear-gradient(135deg,var(--blue),#1d65cc)",color:"#fff",border:"none",borderRadius:10,padding:"15px 38px",fontFamily:"var(--sans)",fontSize:15,fontWeight:700,cursor:"pointer",boxShadow:"0 6px 20px rgba(59,130,246,0.35)"}}>🔐 Student / Staff Login</button>
          <button onClick={()=>setPage("departments")} style={{background:"transparent",color:"var(--blue2)",border:"1.5px solid rgba(59,130,246,0.3)",borderRadius:10,padding:"15px 38px",fontFamily:"var(--sans)",fontSize:15,fontWeight:600,cursor:"pointer"}}>Explore Departments →</button>
        </div>
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginTop:56,animation:"fadeUp .8s .4s ease both"}}>
          {pills.map(p=>(
            <div key={p.label} style={{background:"var(--card)",border:"1px solid var(--border2)",borderRadius:12,padding:"14px 20px",display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:20}}>{p.icon}</span>
              <div><div style={{fontSize:12,fontWeight:600}}>{p.label}</div><div style={{fontSize:10,color:"var(--muted)",marginTop:1}}>{p.sub}</div></div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"center",marginTop:60,border:"1px solid var(--border2)",borderRadius:16,background:"var(--card)",overflow:"hidden",animation:"fadeUp .8s .5s ease both"}}>
          {stats.map((s,i)=>(
            <div key={s.l} style={{padding:"24px 36px",textAlign:"center",borderRight:i<stats.length-1?"1px solid var(--border2)":"none"}}>
              <span style={{fontFamily:"var(--serif)",fontSize:"2rem",color:"var(--amber)",display:"block",lineHeight:1,marginBottom:4}}>{s.n}</span>
              <span style={{fontSize:11,color:"var(--muted)",fontWeight:500,letterSpacing:.5}}>{s.l}</span>
            </div>
          ))}
        </div>
        <div style={{marginTop:48,display:"flex",flexDirection:"column",alignItems:"center",gap:16,animation:"fadeUp .8s .55s ease both"}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:"2.5px",textTransform:"uppercase",color:"var(--muted)"}}>Documents</div>
          <div style={{background:"linear-gradient(145deg,#0e2a4a,#0a1f3a,#071628)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:20,padding:"36px 28px 28px",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",width:200,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 0%,rgba(59,130,246,0.12) 0%,transparent 70%)",pointerEvents:"none"}}/>
            <div style={{marginBottom:20,position:"relative",zIndex:1}}>
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <rect x="22" y="8" width="42" height="52" rx="4" fill="#f0f0f0" stroke="#ccc" strokeWidth="1.5"/>
                <path d="M52 8 L64 20" stroke="#ccc" strokeWidth="1.5" fill="none"/>
                <path d="M52 8 L52 20 L64 20" fill="#d8d8d8"/>
                <line x1="30" y1="30" x2="56" y2="30" stroke="#aaa" strokeWidth="2" strokeLinecap="round"/>
                <line x1="30" y1="37" x2="56" y2="37" stroke="#aaa" strokeWidth="2" strokeLinecap="round"/>
                <line x1="30" y1="44" x2="46" y2="44" stroke="#aaa" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="55" cy="18" r="10" fill="#22c55e"/>
                <path d="M50 18 L53.5 21.5 L60 14" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <rect x="14" y="58" width="28" height="6" rx="3" fill="#f59e0b"/>
                <rect x="18" y="50" width="20" height="9" rx="2" fill="#f59e0b"/>
                <rect x="23" y="38" width="10" height="13" rx="3" fill="#d97706"/>
                <ellipse cx="28" cy="36" rx="7" ry="4" fill="#d97706"/>
              </svg>
            </div>
            <div style={{fontFamily:"var(--serif)",fontSize:"1.3rem",fontWeight:700,color:"var(--white)",lineHeight:1.25,marginBottom:24,position:"relative",zIndex:1}}>New<br/>Regulation 2017</div>
            <button
  onClick={() => navigate("/regulation")}
  style={{
    background: "rgba(15,15,20,0.85)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    padding: "13px 32px",
    fontSize: "14px",
    cursor: "pointer",
    width: "100%",
  }}
>
  View it →
</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══ HISTORY PAGE ══ */
function HistoryPage(){
  const hStats=[{n:"1950",l:"Founded"},{n:"75+",l:"Years Active"},{n:"35+",l:"Departments"},{n:"Cairo",l:"Al-Abbasiya"}];
  return(
    <div style={{maxWidth:1000,margin:"0 auto",padding:"56px 32px 80px"}}>
      <Reveal><div style={{fontSize:10,fontWeight:700,letterSpacing:"2.5px",textTransform:"uppercase",color:"var(--amber)",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
        <span style={{width:22,height:2,background:"var(--amber)",borderRadius:2,display:"inline-block"}}/>History &amp; Heritage
      </div></Reveal>
      <Reveal delay={.05}><h2 style={{fontFamily:"var(--serif)",fontSize:"clamp(2rem,4vw,3rem)",marginBottom:14,lineHeight:1.2}}>Faculty of Science<br/><em style={{color:"var(--amber)"}}>Since 1950</em></h2></Reveal>
      <Reveal delay={.1}><p style={{fontSize:14,color:"var(--muted)",lineHeight:1.85,maxWidth:620}}>Founded in 1950 as part of Ibrahim Pasha University, the Faculty of Science at Ain Shams University has grown into one of Egypt's most distinguished scientific institutions — offering rigorous programmes for over 75 years.</p></Reveal>
      <Reveal delay={.08} style={{marginTop:40,marginBottom:48}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
          {hStats.map(s=>(
            <div key={s.l} style={{background:"var(--card)",border:"1px solid var(--border2)",borderRadius:12,padding:20,textAlign:"center"}}>
              <div style={{fontFamily:"var(--serif)",fontSize:"1.9rem",color:"var(--amber)",lineHeight:1,marginBottom:5}}>{s.n}</div>
              <div style={{fontSize:10,color:"var(--muted)",fontWeight:600,letterSpacing:.5,textTransform:"uppercase"}}>{s.l}</div>
            </div>
          ))}
        </div>
      </Reveal>
      <Reveal delay={.14}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"var(--muted)",marginBottom:18,display:"flex",alignItems:"center",gap:8}}>
          <span style={{width:20,height:2,background:"var(--amber)",display:"inline-block",borderRadius:2}}/> Milestones
        </div>
        <div style={{position:"relative",paddingLeft:28}}>
          <div style={{position:"absolute",left:0,top:6,bottom:6,width:2,background:"linear-gradient(to bottom,var(--amber),rgba(245,158,11,0.1))"}}/>
          {MILESTONES.map((m,i)=>(
            <div key={i} style={{position:"relative",marginBottom:22,paddingLeft:18}}>
              <div style={{position:"absolute",left:-7,top:6,width:12,height:12,borderRadius:"50%",background:"var(--amber)",boxShadow:"0 0 0 3px rgba(245,158,11,0.18)"}}/>
              <div style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--amber)",fontWeight:500,marginBottom:3,letterSpacing:1}}>{m.year}</div>
              <div style={{fontSize:14,fontWeight:700,marginBottom:3}}>{m.title}</div>
              <div style={{fontSize:13,color:"rgba(232,240,254,0.6)",lineHeight:1.7}}>{m.text}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}

/* ══ DEPARTMENTS PAGE ══ */
function DeptStep({n,body,chips,subs,accent}){
  return(
    <div style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"13px 16px",marginBottom:8,fontSize:13,lineHeight:1.7,color:"rgba(232,240,254,0.72)",borderLeft:`3px solid ${accent}`}}>
      <span style={{fontWeight:800,marginRight:6,color:accent}}>{n}</span>{body}
      {chips&&<div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:10}}>{chips.map(c=><Chip key={c} color="blue">{c}</Chip>)}</div>}
      {subs&&<ul style={{listStyle:"none",marginTop:10,display:"flex",flexDirection:"column",gap:8}}>{subs.map((s,i)=>(
        <li key={i} style={{fontSize:12.5,color:"rgba(232,240,254,0.65)"}}>
          <strong style={{color:accent}}>{s.label}</strong>{s.note?` — ${s.note}`:" — choose between:"}
          {s.chips&&s.chips.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:7,marginTop:7}}>{s.chips.map(c=><Chip key={c} color="blue">{c}</Chip>)}</div>}
        </li>
      ))}</ul>}
    </div>
  );
}

function DepartmentsPage(){
  const[active,setActive]=useState("math");
  const d=DEPTS[active];
  return(
    <div>
      <div style={{padding:"60px 52px 40px",maxWidth:1200,margin:"0 auto"}}>
        <Reveal><div style={{fontSize:10,fontWeight:700,letterSpacing:"2.5px",textTransform:"uppercase",color:"var(--teal)",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
          <span style={{width:22,height:2,background:"var(--teal)",borderRadius:2,display:"inline-block"}}/>Enrolment Guide · Academic Departments
        </div></Reveal>
        <Reveal delay={.05}><h2 style={{fontFamily:"var(--serif)",fontSize:"clamp(1.8rem,3.5vw,2.8rem)",marginBottom:10,lineHeight:1.25}}>Academic Guidance</h2></Reveal>
        <Reveal delay={.1}><p style={{fontSize:14,color:"var(--muted)",maxWidth:520,lineHeight:1.8}}>A step-by-step enrolment guide for some departments at the Faculty of Science — select a department to view its pathway and available programmes.</p></Reveal>
      </div>
      <div style={{display:"flex",gap:8,padding:"0 52px",maxWidth:1200,margin:"0 auto 40px",flexWrap:"wrap"}}>
        {Object.entries(DEPTS).map(([key,dep])=>(
          <button key={key} onClick={()=>setActive(key)} style={{background:active===key?dep.grad:"none",border:active===key?"none":"1.5px solid var(--border2)",borderRadius:10,padding:"10px 22px",fontFamily:"var(--sans)",fontSize:13,fontWeight:600,color:active===key?"#fff":"var(--muted)",cursor:"pointer",transition:"all .25s",display:"flex",alignItems:"center",gap:8,boxShadow:active===key?"0 4px 16px rgba(0,0,0,0.3)":"none"}}>
            {dep.icon} {dep.title}
          </button>
        ))}
      </div>
      <div key={active} style={{maxWidth:1200,margin:"0 auto",padding:"0 52px 80px",display:"grid",gridTemplateColumns:"1.1fr 1fr",gap:44,alignItems:"start",animation:"fadeIn .3s ease"}}>
        <div>
          <div style={{width:64,height:64,borderRadius:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,marginBottom:18,border:`2px solid ${d.bdr}`,background:d.bg}}>{d.icon}</div>
          <h3 style={{fontFamily:"var(--serif)",fontSize:"2.4rem",marginBottom:5,lineHeight:1.1}}>{d.title}</h3>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:16,color:d.accent}}>{d.sub}</div>
          <p style={{fontSize:13.5,color:"rgba(232,240,254,0.62)",lineHeight:1.85,marginBottom:22}}>{d.desc}</p>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"var(--muted)",marginBottom:10}}>Enrolment Pathway</div>
          {d.steps.map((s,i)=><DeptStep key={i} n={s.n} body={s.body} chips={s.chips} subs={s.subs} accent={d.accent}/>)}
        </div>
        <div style={{background:"var(--card)",border:"1px solid var(--border2)",borderRadius:18,overflow:"hidden",position:"sticky",top:90}}>
          <div style={{height:3,background:d.grad}}/>
          <div style={{padding:"18px 22px"}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"var(--muted)",marginBottom:12}}>Available Programmes</div>
            {d.progs.map((p,i)=>(
              <div key={p.code} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 0",borderBottom:i<d.progs.length-1?"1px solid rgba(255,255,255,0.04)":"none"}}>
                <span style={{fontFamily:"var(--mono)",fontSize:10,padding:"2px 7px",borderRadius:5,background:"rgba(255,255,255,0.05)",color:"var(--muted)",flexShrink:0,marginTop:2,whiteSpace:"nowrap"}}>{p.code}</span>
                <div>
                  <div style={{fontSize:12.5,fontWeight:600,marginBottom:2}}>{p.name}</div>
                  <div style={{fontSize:11,color:"var(--muted)",lineHeight:1.5}}>{p.detail}</div>
                </div>
              </div>
            ))}
            {d.note&&<div style={{background:`rgba(${d.noteRgb},0.06)`,border:`1px solid rgba(${d.noteRgb},0.15)`,borderRadius:8,padding:12,marginTop:10,fontSize:12,color:"rgba(232,240,254,0.55)",lineHeight:1.65}}>{d.note}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══ MAIN WEBSITE ══ */
export default function MainWebsite(){
  const[page,setPage]=useState("home");
  const go=(p)=>{setPage(p);window.scrollTo(0,0);};
  return(
    <div style={{minHeight:"100vh",background:"var(--bg)",color:"var(--white)"}}>
      <Nav page={page} setPage={go}/>
      <div style={{paddingTop:72}}>
        {page==="home"&&<HomePage setPage={go}/>}
        {page==="history"&&<HistoryPage/>}
        {page==="departments"&&<DepartmentsPage/>}
      </div>
      <MobileNav page={page} setPage={go}/>
      <style>{`
        @media(max-width:900px){
          nav ul{display:none!important}
          body{padding-bottom:72px}
        }
        @media(max-width:700px){
          [data-grid-two]{grid-template-columns:1fr!important}
          [data-grid-four]{grid-template-columns:1fr 1fr!important}
        }
      `}</style>
    </div>
  );
}
