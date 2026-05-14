// ─────────────────────────────────────────────────────────────
//  SHARED UI COMPONENTS — Advisor Portal
//  Same design system as Student Portal
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { useApp } from '../contexts/AdvisorContext';

/* ── Toast ─────────────────────────────────────────────────── */
export function Toast() {
  const { toast } = useApp();
  return null;
  const icons = { ok: '✅', err: '❌', inf: 'ℹ️' };
  const borders = { ok: 'var(--green)', err: 'var(--rose)', inf: 'var(--blue2)' };
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: 'var(--card2)', color: 'var(--white)',
      padding: '11px 16px', borderRadius: 10, fontSize: 12, fontWeight: 600,
      boxShadow: '0 4px 20px rgba(0,0,0,.4)',
      display: 'flex', alignItems: 'center', gap: 8,
      border: '1px solid var(--border2)',
      borderLeft: `3px solid ${borders[toast.type] || borders.inf}`,
      animation: 'slideIn .25s ease',
      maxWidth: 320,
    }}>
      <span>{icons[toast.type] || '💬'}</span>
      <span>{toast.msg}</span>
    </div>
  );
}

/* ── Badge ─────────────────────────────────────────────────── */
export function Badge({ color = 'blue', children, style }) {
  const colors = {
    green: { bg: 'rgba(52,211,153,.1)', border: 'rgba(52,211,153,.2)', text: 'var(--green)' },
    rose: { bg: 'rgba(251,113,133,.1)', border: 'rgba(251,113,133,.2)', text: 'var(--rose)' },
    amber: { bg: 'rgba(245,158,11,.1)', border: 'rgba(245,158,11,.2)', text: 'var(--amber)' },
    blue: { bg: 'rgba(59,130,246,.1)', border: 'rgba(59,130,246,.2)', text: 'var(--blue2)' },
    violet: { bg: 'rgba(167,139,250,.1)', border: 'rgba(167,139,250,.2)', text: 'var(--violet)' },
    muted: { bg: 'rgba(91,122,157,.1)', border: 'rgba(91,122,157,.2)', text: 'var(--muted)' },
    teal: { bg: 'rgba(45,212,191,.1)', border: 'rgba(45,212,191,.2)', text: 'var(--teal)' },
  };
  const c = colors[color] || colors.blue;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 9px', borderRadius: 6,
      fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap',
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      ...style,
    }}>
      {children}
    </span>
  );
}

/* ── Risk Badge ────────────────────────────────────────────── */
export function RiskBadge({ risk }) {
  const map = {
    high: { color: 'rose', icon: '🔴', label: 'High Risk' },
    medium: { color: 'amber', icon: '🟡', label: 'Medium Risk' },
    low: { color: 'green', icon: '🟢', label: 'Low Risk' },
  };
  const r = map[risk] || map.low;
  return <Badge color={r.color}>{r.icon} {r.label}</Badge>;
}

/* ── Stat Card ─────────────────────────────────────────────── */
const CARD_THEMES = {
  blue: { top: 'linear-gradient(90deg,var(--blue),var(--blue2))' },
  green: { top: 'linear-gradient(90deg,var(--green),#6ee7b7)' },
  amber: { top: 'linear-gradient(90deg,var(--amber),#fcd34d)' },
  violet: { top: 'linear-gradient(90deg,var(--violet),#c4b5fd)' },
  rose: { top: 'linear-gradient(90deg,var(--rose),#fda4af)' },
  teal: { top: 'linear-gradient(90deg,var(--teal),#5eead4)' },
};
export function StatCard({ theme = 'blue', icon, value, label, sub, onClick, style }) {
  const t = CARD_THEMES[theme] || CARD_THEMES.blue;
  return (
    <div onClick={onClick} style={{
      background: 'var(--card)', border: '1px solid var(--border2)',
      borderRadius: 13, padding: '16px 18px', position: 'relative', overflow: 'hidden',
      transition: 'all .2s', cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2.5, background: t.top }} />
      <div style={{ fontSize: 20, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontFamily: "'Libre Baskerville',serif", fontSize: '1.9rem', color: 'var(--white)', lineHeight: 1, marginBottom: 3 }}>{value}</div>
      <div style={{ fontSize: 15, color: 'var(--muted)', fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 14, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

/* ── Card ──────────────────────────────────────────────────── */
export function Card({ children, style }) {
  return (
    <div style={{ fontSize: 15, fontWeight: 700, background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 13, marginBottom: 14, ...style }}>
      {children}
    </div>
  );
}
export function CardHead({ children }) {
  return (
    <div style={{ fontSize: 15, fontWeight: 700, padding: '13px 16px', borderBottom: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
      {children}
    </div>
  );
}
export function CardBody({ children, style }) {
  return <div style={{ fontSize: 15, fontWeight: 700, padding: '15px 16px', ...style }}>{children}</div>;
}
export function CardTitle({ children }) {
  return <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--white)' }}>{children}</span>;
}

/* ── Button ────────────────────────────────────────────────── */
export function Btn({ variant = 'primary', size = '', onClick, disabled, children, style }) {
  const variants = {
    primary: { background: 'linear-gradient(135deg,var(--blue),#1d65cc)', color: '#fff', border: 'none', boxShadow: '0 3px 12px rgba(59,130,246,.25)' },
    outline: { background: 'transparent', color: 'var(--blue2)', border: '1.5px solid rgba(59,130,246,.3)' },
    danger: { background: 'rgba(251,113,133,.12)', color: 'var(--rose)', border: '1px solid rgba(251,113,133,.25)' },
    ghost: { background: 'rgba(255,255,255,.04)', color: 'var(--muted)', border: '1px solid var(--border2)' },
    confirm: { background: 'linear-gradient(135deg,var(--green),#059669)', color: '#fff', border: 'none' },
    amber: { background: 'rgba(245,158,11,.12)', color: 'var(--amber)', border: '1px solid rgba(245,158,11,.25)' },
  };
  const sizes = {
    '': { padding: '7px 14px', fontSize: 12, borderRadius: 8 },
    sm: { padding: '5px 10px', fontSize: 11, borderRadius: 6 },
    lg: { padding: '11px 20px', fontSize: 13, borderRadius: 9 },
    full: { padding: '11px', fontSize: 13, borderRadius: 9, width: '100%', justifyContent: 'center' },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontFamily: "'Outfit',sans-serif", fontWeight: 700, cursor: 'pointer',
        transition: 'all .18s', ...variants[variant], ...sizes[size || ''],
        opacity: disabled ? .4 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/* ── Empty State ───────────────────────────────────────────── */
export function Empty({ icon = '📭', text = 'No data found', children }) {
  return (
    <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--muted)' }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 18.5, fontWeight: 500 }}>{text}</div>
      {children}
    </div>
  );
}

/* ── Loading Spinner ───────────────────────────────────────── */
export function Loader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, color: 'var(--muted)', fontSize: 12 }}>
      <span style={{ marginRight: 8, fontSize: 18, animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
      Loading…
    </div>
  );
}

/* ── Code Chip ─────────────────────────────────────────────── */
export function CodeChip({ code }) {
  const colors = {
    MATH: '#60a5fa', STAT: '#a78bfa', PHYS: '#fb7185', CHEM: '#f59e0b', CS: '#2dd4bf',
  };
  const prefix = Object.keys(colors).find(p => code.startsWith(p));
  return (
    <span style={{
      fontFamily: "'DM Mono',monospace", fontSize: 11, fontWeight: 500,
      color: colors[prefix] || 'var(--white)',
    }}>
      {code}
    </span>
  );
}

/* ── GPA Bar ───────────────────────────────────────────────── */
export function GPABar({ sem, gpa }) {
  const w = Math.round((gpa / 4) * 100);
  const color = gpa >= 3.7 ? 'var(--green)' : gpa >= 3 ? 'var(--blue)' : gpa >= 2.33 ? 'var(--amber)' : gpa >= 2 ? '#f97316' : 'var(--rose)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
      <span style={{ fontSize: 11, color: 'var(--muted)', width: 56, flexShrink: 0 }}>{sem}</span>
      <div style={{ flex: 1, height: 7, background: 'var(--border2)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 4, background: color, width: `${w}%`, transition: 'width .6s ease' }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--white)', width: 32, textAlign: 'right' }}>{gpa.toFixed(2)}</span>
    </div>
  );
}

/* ── Avatar ────────────────────────────────────────────────── */
export function Avatar({ initials, risk, size = 34 }) {
  const bg = {
    high: 'linear-gradient(135deg,#be123c,#fb7185)',
    medium: 'linear-gradient(135deg,#b45309,#f59e0b)',
    low: 'linear-gradient(135deg,#1e40af,#3b82f6)',
  }[risk] || 'linear-gradient(135deg,#1e40af,#3b82f6)';
  return (
    <div style={{
      width: size, height: size, borderRadius: size / 4, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Mono',monospace", fontSize: size * 0.35, fontWeight: 800, color: '#fff',
      background: bg,
    }}>
      {initials}
    </div>
  );
}

/* ── Divider ───────────────────────────────────────────────── */
export function Divider() {
  return <div style={{ height: 1, background: 'var(--border2)', margin: '12px 0' }} />;
}
