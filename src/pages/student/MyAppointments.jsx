import React from 'react';
import { useState } from 'react';
import { useApp } from '../../contexts/StudentContext';
import { Card, CardHead, CardBody, CardTitle, StatCard, Btn, Empty } from '../../components/StudentUI';
import { cancelAppointment } from '../../services/studentAPI';


function getDay(d) { return new Date(d + 'T12:00:00').getDate(); }
function getMon(d) { return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' }).toUpperCase(); }

export default function MyAppointments({ setPage }) {
  const { appts, advisor, dispatch, toast, refreshAppts } = useApp();
  const [filter, setFilter] = useState('');

  const filtered = filter ? appts.filter(a => a.status === filter) : appts;
  const upcoming = appts.filter(a => a.status?.toLowerCase() === 'booked').length;
  const attended = appts.filter(a => a.status?.toLowerCase() === 'attended').length;
  const cancelled = appts.filter(a => a.status?.toLowerCase() === 'cancelled').length;

  async function handleCancel(id) {
    try {
      await cancelAppointment(id);
      if (refreshAppts) await refreshAppts();
      toast('Appointment cancelled', 'inf');
    } catch {
      toast('Failed to cancel appointment', 'err');
    }
  }

  const statusStyle = {
    booked: { color: 'var(--blue2)' },
    attended: { color: 'var(--green)' },
    cancelled: { color: 'var(--dim)' },
  };

  return (
    <div style={{ padding: '26px 30px', animation: 'fadeIn .25s ease' }}>
      <div style={{ marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid var(--border2)' }}>
        <div style={{ fontFamily: "'Libre Baskerville',serif", fontSize: '1.4rem', color: 'var(--white)' }}>My Appointments</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 18 }}>
        <StatCard theme="blue" icon="📅" value={upcoming} label="Upcoming" />
        <StatCard theme="green" icon="✅" value={attended} label="Attended" />
        <StatCard theme="rose" icon="✖️" value={cancelled} label="Cancelled" />
      </div>

      <Card>
        <CardHead>
          <CardTitle>All Appointments</CardTitle>
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{ background: 'var(--bg2)', border: '1.5px solid var(--border2)', borderRadius: 11, padding: '7px 10px', fontFamily: "'Outfit',sans-serif", fontSize: 11.5, color: 'var(--muted)', outline: 'none', cursor: 'pointer' }}
            >

              <option value="booked">Booked</option>
              <option value="attended">Attended</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Btn size="sm" onClick={() => setPage('book')}>+ Book New</Btn>
          </div>
        </CardHead>
        <CardBody>
          {filtered.length === 0
            ? <Empty icon="📅" text="No appointments found" />
            : [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date)).map(a => {
              const sLower = a.status?.toLowerCase();
              const isCancelled = sLower === 'cancelled';
              const isBooked = sLower === 'booked';
              const isAttended = sLower === 'attended';
              const rowBg = isBooked ? 'rgba(59,130,246,.04)' : isAttended ? 'rgba(52,211,153,.03)' : 'var(--bg2)';
              const rowBorder = isBooked ? 'rgba(59,130,246,.25)' : isAttended ? 'rgba(52,211,153,.2)' : 'var(--border2)';
              const numBg = isBooked ? 'rgba(59,130,246,.15)' : isAttended ? 'rgba(52,211,153,.15)' : 'var(--border2)';
              const numColor = isBooked ? 'var(--blue2)' : isAttended ? 'var(--green)' : 'var(--muted)';
              return (
                <div key={a.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
                  borderRadius: 10, marginBottom: 8, border: `1px solid ${rowBorder}`,
                  transition: 'all .15s', background: rowBg,
                  opacity: isCancelled ? .55 : 1,
                }}>
                  <div style={{ width: 42, flexShrink: 0, textAlign: 'center' }}>
                    <div style={{ fontSize: 17, fontWeight: 600, fontFamily: "'DM Mono',monospace", borderRadius: 7, padding: '4px 7px', background: numBg, color: numColor }}>
                      {getDay(a.date)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--white)', textTransform: 'uppercase', fontWeight: 600, marginTop: 2 }}>{getMon(a.date)}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--white)' }}>{advisor?.name} — {a.notes || 'Advising Session'}</div>
                    <div style={{ fontSize: 13, color: 'var(--white)', marginTop: 2 }}>⏰ {a.time}</div>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, ...statusStyle[a.status?.toLowerCase()] }}>
                    {a.status?.charAt(0).toUpperCase() + a.status?.slice(1).toLowerCase()}
                  </div>
                  {isBooked && (
                    <Btn variant="danger" size="sm" onClick={() => handleCancel(a.id)} style={{ marginLeft: 8 }}>Cancel</Btn>
                  )}
                </div>
              );
            })
          }
        </CardBody>
      </Card>
    </div>
  );
}
