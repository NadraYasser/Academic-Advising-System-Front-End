// ─────────────────────────────────────────────────────────────
//  BookAppointment 
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { useState, useEffect } from 'react';
import { useApp } from '../../contexts/StudentContext';
import { Btn, Empty, Loader } from '../../components/StudentUI';
import { fetchAvailableDays, fetchAdvisorSlots, bookSlot } from '../../services/studentAPI';

function isPast(dateStr) {
  const today = new Date(); today.setHours(0,0,0,0);
  return new Date(dateStr+'T12:00:00') < today;
}

export default function BookAppointment({ setPage }) {
  const { student, advisor, appts, toast, refreshAppts } = useApp();

  const now = new Date();
  const [calYear,  setCalYear]  = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth()); // 0-indexed

  const [availDates,   setAvailDates]   = useState([]);
  const [datesLoading, setDatesLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState(null);
  const [dateSlots,    setDateSlots]    = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes,        setNotes]        = useState('');
  const [booking,      setBooking]      = useState(false);
  const [calMsg,       setCalMsg]       = useState('');

  // Load available days when month/year changes
  useEffect(() => {
    setDatesLoading(true);
    setSelectedDate(null);
    setSelectedSlot(null);
    setDateSlots([]);
    setCalMsg('');

    fetchAvailableDays(calMonth + 1, calYear)
      .then(data => {
        const dates = Array.isArray(data) ? data : (data?.data ?? []);
        setAvailDates(dates.map(d => (typeof d === 'string' ? d.substring(0,10) : String(d))));
      })
      .catch(() => setAvailDates([]))
      .finally(() => setDatesLoading(false));
  }, [calMonth, calYear]);

  async function handleDayClick(ds) {
    if (!availDates.includes(ds)) return;
    if (isPast(ds)) {
      setCalMsg(`⏰ ${new Date(ds+'T12:00:00').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})} — This date has passed.`);
      setSelectedDate(null);
      return;
    }
    setCalMsg('');
    setSelectedDate(ds);
    setSelectedSlot(null);
    setSlotsLoading(true);

    try {
      const data = await fetchAdvisorSlots(null, ds);
      const raw  = Array.isArray(data) ? data : (data?.data ?? []);
      setDateSlots(raw.map(s => ({
        id:        s.id ?? s.slot_id,
        date:      s.slot_date ?? ds,
        time:      s.start_time && s.end_time ? `${s.start_time} - ${s.end_time}` : (s.time ?? ''),
        max:       s.max_students ?? s.max ?? 1,
        booked:    s.booked_count ?? s.booked ?? 0,
        status:    (s.status ?? '').toLowerCase(),
        advisorId: s.advisor_id,
      })));
    } catch (e) {
      console.error('Slots error:', e);
      setDateSlots([]);
      toast('Could not load slots for this date', 'err');
    }
    setSlotsLoading(false);
  }

  async function handleBook() {
    if (!selectedSlot) return;
    const sl = dateSlots.find(s => s.id === selectedSlot);
    if (!sl) return;

    // Check for existing booking on same date
    const conflict = appts.some(a => a.status === 'booked' && a.date === sl.date);
    if (conflict) {
      toast('❌ You already have an appointment on this date', 'err');
      return;
    }

    setBooking(true);
    try {
      await bookSlot({ studentId: student?.id, advisorId: sl.advisorId, slotId: selectedSlot, notes });
      if (refreshAppts) await refreshAppts();
      toast('✅ Appointment booked successfully!', 'ok');
      setTimeout(() => setPage('appts'), 800);
    } catch (e) {
      toast(e.message || 'Booking failed', 'err');
    }
    setBooking(false);
  }

  const datesSet  = new Set(availDates);
  const daysLabel = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
  const firstDay  = new Date(calYear, calMonth, 1).getDay();
  const daysCount = new Date(calYear, calMonth + 1, 0).getDate();
  const monthName = new Date(calYear, calMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div style={{ padding: '26px 30px', animation: 'fadeIn .25s ease' }}>
      <div style={{ marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid var(--border2)' }}>
        <div style={{ fontFamily: "'Libre Baskerville',serif", fontSize: '1.4rem', color: 'var(--white)' }}>Book Advising Appointment</div>
        <div style={{ fontSize: 13, color: '#8fadc8', marginTop: 3 }}>Schedule a session with your academic advisor</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 295px', gap: 16 }}>
        <div>
          {calMsg && (
            <div style={{ background: 'rgba(251,113,133,.08)', border: '1px solid rgba(251,113,133,.2)', borderRadius: 8, padding: '9px 14px', fontSize: 13, color: 'var(--rose)', marginBottom: 14 }}>
              {calMsg}
            </div>
          )}

          {/* Calendar */}
          <div style={{ background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border2)', overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ background: 'var(--bg2)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 16, fontWeight: 600, borderBottom: '1px solid var(--border2)', color: 'var(--white)' }}>
              <span>Available Slots · {advisor?.name || 'Your Advisor'}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => { const d = new Date(calYear, calMonth-1, 1); setCalMonth(d.getMonth()); setCalYear(d.getFullYear()); }} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18, padding: '2px 6px' }}>‹</button>
                <span style={{ fontSize: 13, opacity: .7 }}>{monthName}</span>
                <button onClick={() => { const d = new Date(calYear, calMonth+1, 1); setCalMonth(d.getMonth()); setCalYear(d.getFullYear()); }} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18, padding: '2px 6px' }}>›</button>
              </div>
            </div>

            {datesLoading ? (
              <div style={{ padding: 30, textAlign: 'center' }}><Loader /></div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 1, background: 'var(--border2)' }}>
                {daysLabel.map(d => (
                  <div key={d} style={{ background: 'var(--bg2)', textAlign: 'center', padding: 7, fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' }}>{d}</div>
                ))}
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} style={{ background: 'var(--card)' }} />)}
                {Array.from({ length: daysCount }, (_, i) => i+1).map(day => {
                  const ds   = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                  const has  = datesSet.has(ds);
                  const past = isPast(ds);
                  const sel  = selectedDate === ds;

                  let dayColor = 'var(--dim)', dotColor = null, bg = 'var(--card)';
                  if (has) {
                    if (past)  { dayColor = 'var(--dim)'; dotColor = 'var(--dim)'; }
                    else       { dayColor = sel ? '#fff' : 'var(--blue2)'; dotColor = sel ? '#fff' : 'var(--blue2)'; bg = sel ? 'var(--blue)' : 'var(--card)'; }
                  }

                  return (
                    <div key={day} onClick={() => has && handleDayClick(ds)}
                      style={{ background: bg, textAlign: 'center', padding: '8px 4px', fontSize: 11, color: dayColor, cursor: has ? 'pointer' : 'default', fontWeight: (sel||has)?600:400, transition: 'all .15s', position: 'relative' }}>
                      {day}
                      {has && dotColor && <div style={{ width: 4, height: 4, borderRadius: '50%', background: dotColor, margin: '2px auto 0' }} />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Slots list */}
          {selectedDate && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 10 }}>
                Slots on {new Date(selectedDate+'T12:00:00').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}
              </div>
              {slotsLoading ? <Loader /> : dateSlots.length === 0 ? (
                <div style={{ color: 'var(--muted)', fontSize: 13, padding: 12 }}>No slots available for this date.</div>
              ) : dateSlots.map(sl => {
                const alreadyBooked = appts.some(a => a.status?.toLowerCase() === 'booked' && (a.slot?.slot_id === sl.id || a.slot_id === sl.id || a.slot?.id === sl.id || a.slotId === sl.id));
                const full  = sl.status === 'full' || sl.booked >= sl.max || alreadyBooked;
                const sel   = selectedSlot === sl.id;
                const avail = Math.max(0, sl.max - sl.booked);
                return (
                  <div key={sl.id} onClick={() => { if (!full) setSelectedSlot(sl.id); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, border: `1px solid ${sel?'var(--violet)':'var(--border2)'}`, marginBottom: 8, cursor: full ? 'not-allowed' : 'pointer', transition: 'all .15s', background: sel ? 'rgba(167,139,250,.05)' : 'var(--bg2)', opacity: full ? 0.45 : 1 }}>
                    <div style={{ width: 15, height: 15, borderRadius: '50%', border: `2px solid ${sel?'var(--violet)':'var(--dim)'}`, flexShrink: 0, background: sel ? 'var(--violet)' : 'transparent', transition: 'all .2s' }} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--white)', fontFamily: "'DM Mono',monospace" }}>{sl.time}</div>
                      <div style={{ fontSize: 10, color: 'var(--muted)' }}>{avail} spot{avail!==1?'s':''} left</div>
                    </div>
                    <div style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600 }}>
                      {alreadyBooked ? <span style={{ color:'var(--dim)' }}>Booked</span> : full ? <span style={{ color:'var(--dim)' }}>Full</span> : <span style={{ color:'var(--green)' }}>Available</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!selectedDate && !datesLoading && availDates.length === 0 && (
            <Empty icon="📅" msg="No available slots this month. Try another month." />
          )}
        </div>

        {/* Right panel */}
        <div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 9 }}>Your Advisor</div>
            <div style={{ fontSize: 12, marginBottom: 13, padding: '8px 12px', background: 'var(--bg2)', borderRadius: 8, borderLeft: '2.5px solid var(--blue2)' }}>
              <strong style={{ color: 'var(--white)', display: 'block', fontSize: 15 }}>{advisor?.name || 'N/A'}</strong>
              <span style={{ color: 'var(--muted)' }}>{advisor?.dept || advisor?.department || ''}</span>
            </div>

            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 9 }}>Selected Slot</div>
            {selectedSlot ? (() => {
              const sl = dateSlots.find(s => s.id === selectedSlot);
              return sl ? (
                <div style={{ marginBottom: 13 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--white)' }}>{advisor?.name}</div>
                  <div style={{ fontSize: 14, color: 'var(--white)', fontWeight: 500, marginTop: 6 }}>
                    📅 {new Date(sl.date+'T12:00:00').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})} &nbsp; ⏰ {sl.time}
                  </div>
                </div>
              ) : null;
            })() : (
              <div style={{ fontSize: 12, color: 'var(--muted)', padding: 12, background: 'var(--bg2)', borderRadius: 8, textAlign: 'center', marginBottom: 13 }}>
                Select a date and time slot
              </div>
            )}

            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 9, marginTop: 4 }}>Notes (Optional)</div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="What would you like to discuss?"
              style={{ width: '100%', height: 78, border: '1.5px solid var(--border2)', borderRadius: 8, padding: '8px 12px', fontSize: 14, fontFamily: "'Outfit',sans-serif", resize: 'vertical', marginBottom: 12, color: 'var(--white)', background: 'var(--bg2)', outline: 'none', boxSizing: 'border-box' }} />
            <Btn variant="primary" size="full" disabled={!selectedSlot || booking} onClick={handleBook} style={{ padding: 10, fontSize: 15, fontWeight: 600 }}>
              {booking ? '⏳ Booking…' : 'Confirm Booking'}
            </Btn>
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', background: 'var(--bg2)', borderRadius: 8, padding: '9px 12px', borderLeft: '2.5px solid var(--blue2)' }}>
            ℹ️ Bookings can be cancelled up to 24 hours before the appointment.
          </div>
        </div>
      </div>
    </div>
  );
}
