// ─────────────────────────────────────────────────────────────

import React from 'react';
import { useState } from 'react';
import { useApp } from '../../contexts/AdvisorContext';
import { CURRENT_SEM } from '../../services/advisorMockData';
import { addSlot, cancelSlot, updateSlot } from '../../services/advisorAPI';
import { Empty } from '../../components/AdvisorUI';

const TIME_OPTIONS = [
  '08:00 – 09:00','09:00 – 10:00','10:00 – 11:00','11:00 – 12:00',
  '12:00 – 13:00','13:00 – 14:00','14:00 – 15:00','15:00 – 16:00',
];

function fmtDate(d) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}


function isPastDate(dateStr) {
  const today = new Date(); today.setHours(0,0,0,0);
  return new Date(dateStr + 'T12:00:00') < today;
}

const PER_PAGE = 8;

const inputSt = {
  background: 'var(--bg2)', border: '1.5px solid var(--border2)',
  borderRadius: 8, padding: '9px 12px', color: 'var(--white)',
  fontFamily: "'Outfit',sans-serif", fontSize: 12, outline: 'none',
  width: '100%', boxSizing: 'border-box', colorScheme: 'dark',
};

export default function ManageSlots() {
  const { advisor, slots, dispatch, toast } = useApp();

  const [newDate, setNewDate]   = useState('');
  const [newTime, setNewTime]   = useState(TIME_OPTIONS[1]);
  const [newMax, setNewMax]     = useState(5);
  const [adding, setAdding]     = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editMax, setEditMax]   = useState(5);
  const [editTime, setEditTime]  = useState(TIME_OPTIONS[1]);
  const [currentPage, setCurrentPage] = useState(1);

  const mySlots = (slots || [])
    .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));

  function getSlotStatus(sl) {
    if (sl.status === 'cancelled') return 'cancelled';
    if (isPastDate(sl.date) && sl.booked < sl.max) return 'pending'; 
    if (sl.booked >= sl.max)       return 'full';
    return 'available';
  }

  const filtered = statusFilter
    ? mySlots.filter(s => getSlotStatus(s) === statusFilter)
    : mySlots;

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  async function handleAdd() {
    if (!newDate) { toast('Please select a date', 'err'); return; }
    setAdding(true);
    try {
      const result = await addSlot({ advisorId: advisor.id, date: newDate, time: newTime, max: newMax });
      dispatch({ type: 'ADD_SLOT', payload: result });
      toast('Slot added successfully ✓', 'ok');
      setNewDate(''); setShowForm(false);
    } catch { toast('Failed to add slot', 'err'); }
    setAdding(false);
  }

  async function handleCancel(slotId) {
    try {
      await cancelSlot(slotId);
      dispatch({ type: 'CANCEL_SLOT', id: slotId });
      toast('Slot cancelled', 'inf');
    } catch { toast('Failed to cancel slot', 'err'); }
  }

  async function saveEdit(slotId) {
    try {
      await updateSlot(slotId, { max: editMax, time: editTime, max_students: editMax });
      dispatch({ type: 'EDIT_SLOT', id: slotId, max: editMax, time: editTime });
      toast('Slot updated ✓', 'ok');
    } catch { toast('Failed to update slot', 'err'); }
    setEditingId(null);
  }

  return (
    <div style={{ padding: '26px 30px', animation: 'fadeIn .25s ease' }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 24, paddingBottom: 14, borderBottom: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: "'Libre Baskerville',serif", fontSize: '1.52rem', color: 'var(--white)' }}>
            My Time Slots
          </div>
          <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 3 }}>
            Manage your availability for student appointments
          </div>
        </div>
        <button
          onClick={() => setShowForm(f => !f)}
          style={{
            padding: '13px 20px', borderRadius: 9, fontSize: 15.5, fontWeight: 700,
            background: 'linear-gradient(135deg,var(--blue),#1d65cc)',
            color: '#fff', border: 'none', cursor: 'pointer',
            fontFamily: "'Outfit',sans-serif",
            boxShadow: '0 3px 14px rgba(59,130,246,.28)',
            transition: 'opacity .15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          + Add New Slot
        </button>
      </div>

      {/* ── Inline add form ── */}
      {showForm && (
        <div style={{
          background: 'var(--card)', border: '1px solid rgba(59,130,246,.35)',
          borderRadius: 12, padding: '18px 20px', marginBottom: 20,
          animation: 'fadeIn .2s ease',
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--white)', marginBottom: 14 }}>
            Add New Availability Slot
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px auto', gap: 12, alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--muted)', marginBottom: 6, letterSpacing: .5, textTransform: 'uppercase' }}>Date</label>
              <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)} style={inputSt} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--muted)', marginBottom: 6, letterSpacing: .5, textTransform: 'uppercase' }}>Time Slot</label>
              <select value={newTime} onChange={e => setNewTime(e.target.value)} style={inputSt}>
                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--muted)', marginBottom: 6, letterSpacing: .5, textTransform: 'uppercase' }}>Max</label>
              <input type="number" value={newMax} min={1} max={20}
                onChange={e => setNewMax(Math.max(1, Math.min(20, +e.target.value)))}
                style={inputSt} />
            </div>
            <div style={{ display: 'flex', gap: 7 }}>
              <button onClick={handleAdd} disabled={adding || !newDate} style={{
                padding: '9px 18px', borderRadius: 8, fontSize: 15, fontWeight: 700,
                background: 'linear-gradient(135deg,var(--blue),#1d65cc)',
                color: '#fff', border: 'none', cursor: adding || !newDate ? 'not-allowed' : 'pointer',
                fontFamily: "'Outfit',sans-serif", opacity: adding || !newDate ? .5 : 1,
              }}>
                {adding ? '⏳' : 'Add'}
              </button>
              <button onClick={() => setShowForm(false)} style={{
                padding: '9px 12px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                background: 'transparent', color: 'var(--muted)',
                border: '1px solid var(--border2)', cursor: 'pointer',
                fontFamily: "'Outfit',sans-serif",
              }}>✕</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Table card ── */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 13, overflow: 'hidden' }}>

        {/* Card header row */}
        <div style={{ padding: '13px 18px', borderBottom: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--white)' }}>
            {CURRENT_SEM.label} Slots
          </span>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            style={{
              background: 'var(--bg2)', border: '1.5px solid var(--border2)',
              borderRadius: 7, padding: '10px 12px',
              fontFamily: "'Outfit',sans-serif", fontSize: 14,
              color: 'var(--muted)', outline: 'none', cursor: 'pointer',
            }}
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="full">Full</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Table */}
        {paginated.length === 0
          ? <div style={{ padding: '44px 20px', textAlign: 'center', color: 'var(--muted)' }}>
              <div style={{ fontSize: 34, marginBottom: 10 }}>📅</div>
              <div style={{ fontSize: 12.5, fontWeight: 500 }}>No slots found</div>
            </div>
          : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead style={{ background: 'rgba(255,255,255,.02)' }}>
                  <tr>
                    {['DATE','TIME','MAX STUDENTS','BOOKED','STATUS','ACTIONS'].map(h => (
                      <th key={h} style={{
                        padding: '10px 12px', textAlign: 'left',
                        fontSize: 13.5, fontWeight: 700, letterSpacing: .6,
                        textTransform: 'uppercase', color: 'var(--dim)',
                        borderBottom: '1px solid var(--border2)', whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(sl => {
                    const st          = getSlotStatus(sl);
                    const isCancelled = st === 'cancelled';
                    const isFull      = st === 'full';
                    const isPending   = st === 'pending';
                    const isEditing   = editingId === sl.id;

                    return (
                      <tr key={sl.id}
                        style={{ borderBottom: '1px solid var(--border2)', opacity: (isCancelled || isPending) ? .6 : 1, transition: 'background .12s' }}
                        onMouseEnter={e => { if (!isCancelled) e.currentTarget.style.background = 'rgba(255,255,255,.015)'; }}
                        onMouseLeave={e => e.currentTarget.style.background = ''}
                      >
                        {/* DATE */}
                        <td style={{ padding: '13px 16px', color: isCancelled ? 'var(--dim)' : 'var(--white)', fontWeight: 600,fontSize:15 }}>
                          {fmtDate(sl.date)}
                        </td>

                        {/* TIME */}
                        <td style={{ padding: '13px 16px' ,fontSize:14}}>
                          {isEditing
                            ? <select value={editTime} onChange={e => setEditTime(e.target.value)}
                                style={{ background: 'var(--bg2)', border: '1.5px solid rgba(59,130,246,.4)', borderRadius: 6, padding: '4px 8px', color: 'var(--white)', fontFamily: "'Outfit',sans-serif", fontSize: 14, outline: 'none', cursor: 'pointer' }}>
                                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                            : <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 14, color: isCancelled ? 'var(--dim)' : 'var(--white)' }}>{sl.time}</span>
                          }
                        </td>

                        {/* MAX STUDENTS */}
                        <td style={{ padding: '13px 16px' ,fontSize:14}}>
                          {isEditing
                            ? <input type="number" value={editMax} min={sl.booked} max={20}
                                onChange={e => setEditMax(Math.max(sl.booked, Math.min(20, +e.target.value)))}
                                style={{ width: 64, background: 'var(--bg2)', border: '1.5px solid rgba(59,130,246,.4)', borderRadius: 6, padding: '4px 8px', color: 'var(--white)', fontFamily: "'Outfit',sans-serif", fontSize: 14, outline: 'none' }} />
                            : <span style={{ color: 'var(--muted)' ,fontSize:14}}>{sl.max}</span>
                          }
                        </td>

                        {/* BOOKED */}
                        <td style={{ padding: '13px 16px' }}>
                          {isCancelled
                            ? <span style={{ color: 'var(--dim)' }}>—</span>
                            : <span style={{ fontFamily: "'DM Mono',monospace",fontSize:14,fontWeight: 600, color: isFull ? 'var(--amber)' : 'var(--white)' }}>
                                {sl.booked} / {sl.max}
                              </span>
                          }
                        </td>

                        {/* STATUS */}
                        <td style={{ padding: '13px 16px' }}>
                          {isCancelled
                            ? <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--dim)', background: 'rgba(255,255,255,.04)', border: '1px solid var(--border2)', borderRadius: 6, padding: '3px 10px' }}>Cancelled</span>
                            : isFull
                              ? <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--amber)', background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.28)', borderRadius: 6, padding: '3px 10px' }}>Full</span>
                              : <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--green)', background: 'rgba(52,211,153,.1)', border: '1px solid rgba(52,211,153,.28)', borderRadius: 6, padding: '3px 10px' }}>Available</span>
                          }
                        </td>

                        {/* ACTIONS */}
                        <td style={{ padding: '13px 16px' }}>
                          {isCancelled
                            ? <span style={{ color: 'var(--dim)', fontSize: 14 }}>—</span>
                            : isEditing
                              ? (
                                <div style={{ display: 'flex', gap: 6 }}>
                                  <button onClick={() => saveEdit(sl.id)} style={{ padding: '5px 14px', borderRadius: 6, fontSize: 14, fontWeight: 600, background: 'linear-gradient(135deg,var(--green),#059669)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>Save</button>
                                  <button onClick={() => setEditingId(null)} style={{ padding: '5px 10px', borderRadius: 6, fontSize: 14, fontWeight: 600, background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border2)', cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>✕</button>
                                </div>
                              )
                              : (
                                <div style={{ display: 'flex', gap: 6 }}>
                                  <button onClick={() => { setEditingId(sl.id); setEditMax(sl.max); setEditTime(sl.time); }}
                                    style={{ padding: '5px 14px', borderRadius: 6, fontSize: 14, fontWeight: 600, background: 'transparent', color: 'var(--blue2)', border: '1.5px solid rgba(59,130,246,.35)', cursor: 'pointer', fontFamily: "'Outfit',sans-serif", transition: 'background .15s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,.1)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    Edit
                                  </button>
                                  {/* <button onClick={() => handleCancel(sl.id)}
                                    style={{ padding: '5px 12px', borderRadius: 6, fontSize: 14, fontWeight: 600, background: 'rgba(251,113,133,.1)', color: 'var(--rose)', border: '1px solid rgba(251,113,133,.3)', cursor: 'pointer', fontFamily: "'Outfit',sans-serif", transition: 'background .15s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(251,113,133,.2)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(251,113,133,.1)'}>
                                    Cancel
                                  </button> */}
                                </div>
                              )
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        }

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4, padding: '12px 16px', borderTop: '1px solid var(--border2)' }}>
            <PgBtn onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>‹</PgBtn>
            {Array.from({ length: totalPages }, (_, i) => (
              <PgBtn key={i + 1} active={currentPage === i + 1} onClick={() => setCurrentPage(i + 1)}>{i + 1}</PgBtn>
            ))}
            <PgBtn onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>›</PgBtn>
          </div>
        )}
      </div>
    </div>
  );
}

function PgBtn({ children, active, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      minWidth: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: 6, border: `1px solid ${active ? 'var(--blue)' : 'var(--border2)'}`,
      fontSize: 12, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
      color: active ? '#fff' : 'var(--muted)', padding: '0 6px',
      background: active ? 'var(--blue)' : 'transparent',
      transition: 'all .15s', opacity: disabled ? .4 : 1,
      fontFamily: "'Outfit',sans-serif",
    }}>{children}</button>
  );
}
