// ─────────────────────────────────────────────────────────────
//  SHARED UI COMPONENTS — Admin Portal
//  Matches Advisor Portal design system exactly
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { useApp } from '../contexts/AdminContext';

/* ── Toast ─────────────────────────────────────────────────── */
export function Toast() {
  return null;
  const icons   = { ok:'✅', err:'❌', inf:'ℹ️' };
  const borders = { ok:'var(--green)', err:'var(--rose)', inf:'var(--blue2)' };
  return (
    <div style={{
      position:'fixed', bottom:24, right:24, zIndex:9999,
      background:'var(--card2)', color:'var(--white)',
      padding:'11px 16px', borderRadius:10, fontSize:12, fontWeight:600,
      boxShadow:'0 4px 20px rgba(0,0,0,.4)',
      display:'flex', alignItems:'center', gap:8,
      border:'1px solid var(--border2)',
      borderLeft:`3px solid ${borders[toast.type] || borders.inf}`,
      animation:'slideIn .25s ease', maxWidth:320,
    }}>
      <span>{icons[toast.type] || '💬'}</span>
      <span>{toast.msg}</span>
    </div>
  );
}

/* ── Badge ─────────────────────────────────────────────────── */
export function Badge({ color = 'blue', children, style }) {
  const colors = {
    green:  { bg:'rgba(52,211,153,.1)',  border:'rgba(52,211,153,.2)',  text:'var(--green)'  },
    rose:   { bg:'rgba(251,113,133,.1)', border:'rgba(251,113,133,.2)', text:'var(--rose)'   },
    amber:  { bg:'rgba(245,158,11,.1)',  border:'rgba(245,158,11,.2)',  text:'var(--amber)'  },
    blue:   { bg:'rgba(59,130,246,.1)',  border:'rgba(59,130,246,.2)',  text:'var(--blue2)'  },
    violet: { bg:'rgba(167,139,250,.1)', border:'rgba(167,139,250,.2)', text:'var(--violet)' },
    muted:  { bg:'rgba(91,122,157,.1)',  border:'rgba(91,122,157,.2)',  text:'var(--muted)'  },
    teal:   { bg:'rgba(45,212,191,.1)',  border:'rgba(45,212,191,.2)',  text:'var(--teal)'   },
  };
  const c = colors[color] || colors.blue;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center',
      padding:'3px 9px', borderRadius:6,
      fontSize:10, fontWeight:700, whiteSpace:'nowrap',
      background:c.bg, color:c.text, border:`1px solid ${c.border}`,
      ...style,
    }}>
      {children}
    </span>
  );
}

export function RiskBadge({ risk }) {
  const map = {
    High:   { color:'rose',  icon:'🔴' },
    Medium: { color:'amber', icon:'🟡' },
    Low:    { color:'green', icon:'🟢' },
  };
  const r = map[risk] || map.Low;
  return <Badge color={r.color}>{r.icon} {risk}</Badge>;
}

/* ── Stat Card ─────────────────────────────────────────────── */
const CARD_THEMES = {
  blue:   'linear-gradient(90deg,var(--blue),var(--blue2))',
  green:  'linear-gradient(90deg,var(--green),#6ee7b7)',
  amber:  'linear-gradient(90deg,var(--amber),#fcd34d)',
  violet: 'linear-gradient(90deg,var(--violet),#c4b5fd)',
  rose:   'linear-gradient(90deg,var(--rose),#fda4af)',
  teal:   'linear-gradient(90deg,var(--teal),#5eead4)',
};
export function StatCard({ theme='blue', icon, value, label, sub, subColor, onClick }) {
  return (
    <div onClick={onClick} style={{
      background:'var(--card)', border:'1px solid var(--border2)',
      borderRadius:13, padding:'16px 18px', position:'relative', overflow:'hidden',
      transition:'all .2s', cursor: onClick ? 'pointer' : 'default',
    }}
    onMouseEnter={e=>{ if(onClick) e.currentTarget.style.transform='translateY(-2px)'; }}
    onMouseLeave={e=>{ e.currentTarget.style.transform=''; }}
    >
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2.5, background: CARD_THEMES[theme] || CARD_THEMES.blue }} />
      <div style={{ fontSize:20, marginBottom:8 }}>{icon}</div>
      <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:'1.8rem', color:'var(--white)', lineHeight:1, marginBottom:3 }}>{value ?? '—'}</div>
      <div style={{ fontSize:11, color:'var(--muted)', fontWeight:500 }}>{label}</div>
      {sub && <div style={{ fontSize:10, marginTop:3, color: subColor || 'var(--dim)' }}>{sub}</div>}
    </div>
  );
}

/* ── Card ──────────────────────────────────────────────────── */
export function Card({ children, style }) {
  return (
    <div style={{ background:'var(--card)', border:'1px solid var(--border2)', borderRadius:13, marginBottom:14, ...style }}>
      {children}
    </div>
  );
}
export function CardHead({ children }) {
  return (
    <div style={{ padding:'13px 16px', borderBottom:'1px solid var(--border2)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
      {children}
    </div>
  );
}
export function CardBody({ children, style }) {
  return <div style={{ padding:'15px 16px', ...style }}>{children}</div>;
}
export function CardTitle({ children }) {
  return <span style={{ fontSize:13, fontWeight:700, color:'var(--white)' }}>{children}</span>;
}

/* ── Btn ───────────────────────────────────────────────────── */
const BTN_VARIANTS = {
  primary: { background:'linear-gradient(135deg,var(--blue),#1d65cc)', color:'#fff', border:'none', boxShadow:'0 3px 12px rgba(59,130,246,.25)' },
  teal:    { background:'linear-gradient(135deg,var(--teal),#0d9488)',  color:'#fff', border:'none' },
  outline: { background:'transparent', color:'var(--blue2)', border:'1.5px solid rgba(59,130,246,.3)' },
  danger:  { background:'rgba(251,113,133,.12)', color:'var(--rose)',   border:'1px solid rgba(251,113,133,.25)' },
  ghost:   { background:'rgba(255,255,255,.04)', color:'var(--muted)',  border:'1px solid var(--border2)' },
  amber:   { background:'rgba(245,158,11,.12)',  color:'var(--amber)',  border:'1px solid rgba(245,158,11,.25)' },
  confirm: { background:'linear-gradient(135deg,var(--green),#059669)', color:'#fff', border:'none' },
};
const BTN_SIZES = {
  sm:   { padding:'5px 10px',  fontSize:11, borderRadius:6 },
  md:   { padding:'7px 14px',  fontSize:12, borderRadius:9 },
  lg:   { padding:'11px 20px', fontSize:13, borderRadius:11 },
  full: { padding:'13px',      fontSize:13, borderRadius:13, width:'100%', justifyContent:'center' },
};
export function Btn({ variant='primary', size='md', onClick, disabled, children, style }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display:'inline-flex', alignItems:'center', gap:5,
      fontFamily:"'Outfit',sans-serif", fontWeight:700, cursor: disabled ? 'not-allowed' : 'pointer',
      transition:'all .18s', ...BTN_VARIANTS[variant], ...BTN_SIZES[size],
      opacity: disabled ? .4 : 1, ...style,
    }}>
      {children}
    </button>
  );
}

/* ── Modal ─────────────────────────────────────────────────── */
export function Modal({ title, onClose, onConfirm, confirmLabel = 'Confirm', confirmVariant = 'primary', children }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.65)', backdropFilter:'blur(4px)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      onClick={onClose}>
      <div style={{ background:'var(--card2)', border:'1px solid var(--border2)', borderRadius:14, padding:'20px 24px', width:'100%', maxWidth:420, boxShadow:'0 24px 60px rgba(0,0,0,.5)', animation:'modalIn .2s ease', maxHeight:'90vh', overflowY:'auto' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ fontSize:15, fontWeight:800, color:'var(--white)', marginBottom:16 }}>{title}</div>
        {children}
        <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:18 }}>
          <Btn variant='ghost' onClick={onClose}>Cancel</Btn>
          {onConfirm && <Btn variant={confirmVariant} onClick={onConfirm}>{confirmLabel}</Btn>}
        </div>
      </div>
    </div>
  );
}

/* ── Field / Input / Select ────────────────────────────────── */
export function Field({ label, error, children, style }) {
  return (
    <div style={{ marginBottom:12, ...style }}>
      {label && <label style={{ display:'block', fontSize:15, fontWeight:600, color:'var(--muted)', letterSpacing:.6, textTransform:'uppercase', marginBottom:6 }}>{label}</label>}
      {children}
      {error && <span style={{ fontSize:11, color:'var(--rose)', marginTop:4, display:'block' }}>{error}</span>}
    </div>
  );
}
const INPUT_BASE = {
  width:'100%', padding:'9px 12px', borderRadius:9,
  border:'1px solid var(--border2)', background:'rgba(255,255,255,.04)',
  fontFamily:"'Outfit',sans-serif", fontSize:13, color:'var(--white)', outline:'none',
  transition:'border-color .18s',
};
export function Input({ error, ...props }) {
  return <input style={{ ...INPUT_BASE, ...(error ? { borderColor:'rgba(251,113,133,.45)', background:'rgba(251,113,133,.03)' } : {}) }} {...props} />;
}
export function Select({ options, ...props }) {
  return (
    <select style={{ ...INPUT_BASE, cursor:'pointer' }} {...props}>
      {options.map(o => typeof o === 'string'
        ? <option key={o} value={o}>{o}</option>
        : <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
export function ModalRow({ children }) {
  return <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>{children}</div>;
}

/* ── Search box ────────────────────────────────────────────── */
export function SearchBox({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(255,255,255,.04)', border:'1px solid var(--border2)', borderRadius:9, padding:'7px 13px', minWidth:220, transition:'border-color .18s' }}
      onFocus={e => e.currentTarget.style.borderColor='rgba(59,130,246,.35)'}
      onBlur={e  => e.currentTarget.style.borderColor='var(--border2)'}>
      <span style={{ color:'var(--dim)', fontSize:13 }}>🔍</span>
      <input value={value} onChange={onChange} placeholder={placeholder}
        style={{ border:'none', background:'transparent', outline:'none', fontFamily:"'Outfit',sans-serif", fontSize:12.5, color:'var(--white)', width:'100%' }} />
    </div>
  );
}

/* ── FilterSelect ──────────────────────────────────────────── */
export function FilterSelect({ value, onChange, children }) {
  return (
    <select value={value} onChange={onChange} style={{
      border:'1px solid var(--border2)', borderRadius:9, padding:'7px 11px',
      fontFamily:"'Outfit',sans-serif", fontSize:12.5, color:'var(--muted)',
      background:'rgba(255,255,255,.04)', outline:'none', cursor:'pointer',
    }}>
      {children}
    </select>
  );
}

/* ── Load bar ──────────────────────────────────────────────── */
export function LoadBar({ pct }) {
  const color = pct >= 90 ? 'var(--rose)' : pct >= 70 ? 'var(--amber)' : 'var(--green)';
  return (
    <div style={{ width:90, height:6, background:'rgba(255,255,255,.06)', borderRadius:99, overflow:'hidden' }}>
      <div style={{ height:'100%', borderRadius:99, background:color, width:`${pct}%` }} />
    </div>
  );
}

/* ── Empty ─────────────────────────────────────────────────── */
export function Empty({ icon='📭', text='No data yet.', sub }) {
  return (
    <div style={{ textAlign:'center', padding:'48px 20px', color:'var(--muted)' }}>
      <div style={{ fontSize:38, marginBottom:12 }}>{icon}</div>
      <div style={{ fontSize:13, fontWeight:600, color:'var(--white)', marginBottom:4 }}>{text}</div>
      {sub && <div style={{ fontSize:12, color:'var(--dim)' }}>{sub}</div>}
    </div>
  );
}

/* ── Loader ────────────────────────────────────────────────── */
export function Loader() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:160, color:'var(--muted)', fontSize:12, gap:10 }}>
      <span style={{ fontSize:20, animation:'spin 1s linear infinite', display:'inline-block' }}>⟳</span>
      Loading…
    </div>
  );
}

/* ── Table helpers ─────────────────────────────────────────── */
export function TableWrap({ children, toolbar, pagination }) {
  return (
    <div style={{ background:'var(--card)', border:'1px solid var(--border2)', borderRadius:13, overflow:'hidden' }}>
      {toolbar && <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border2)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>{toolbar}</div>}
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>{children}</table>
      </div>
      {pagination}
    </div>
  );
}
export function Th({ children, style }) {
  return <th style={{ padding:'8px 14px', textAlign:'left', fontSize:9.5, fontWeight:700, color:'var(--dim)', letterSpacing:.6, textTransform:'uppercase', borderBottom:'1px solid var(--border2)', whiteSpace:'nowrap', background:'rgba(255,255,255,.02)', ...style }}>{children}</th>;
}
export function Td({ children, style }) {
  return <td style={{ padding:'11px 14px', fontSize:12.5, color:'var(--white)', borderBottom:'1px solid rgba(255,255,255,.03)', verticalAlign:'middle', ...style }}>{children}</td>;
}
export function TR({ children, onClick }) {
  return (
    <tr style={{ cursor: onClick ? 'pointer' : 'default', transition:'background .12s' }}
      onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,.015)'}
      onMouseLeave={e => e.currentTarget.style.background='transparent'}
      onClick={onClick}>
      {children}
    </tr>
  );
}

/* ── Pagination ────────────────────────────────────────────── */
export function Pagination({ page, total, onChange }) {
  if (total <= 1) return null;
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:4, padding:'10px 14px', borderTop:'1px solid var(--border2)' }}>
      <PgBtn onClick={() => onChange(Math.max(1, page-1))}>‹</PgBtn>
      {Array.from({ length: total }, (_, i) => i + 1).map(n => (
        <PgBtn key={n} active={n === page} onClick={() => onChange(n)}>{n}</PgBtn>
      ))}
      <PgBtn onClick={() => onChange(Math.min(total, page+1))}>›</PgBtn>
    </div>
  );
}
function PgBtn({ children, onClick, active }) {
  return (
    <button onClick={onClick} style={{
      width:28, height:28, borderRadius:7, border:'1px solid var(--border2)',
      background: active ? 'var(--teal)' : 'transparent',
      color: active ? 'var(--bg)' : 'var(--muted)',
      fontFamily:"'Outfit',sans-serif", fontSize:12, fontWeight: active ? 700 : 400,
      cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      {children}
    </button>
  );
}
