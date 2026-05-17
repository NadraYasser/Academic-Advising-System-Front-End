
import React from 'react';
import { useState } from 'react';
import { useApp } from '../../contexts/AdminContext';
import { semestersAPI } from '../../services/adminAPI';
import {
  Btn, Modal, Field, Input, Select, ModalRow, Badge,
  TableWrap, Th, Td, TR, Empty,
} from '../../components/AdminUI';

const EMPTY = { academic_year:'', semester_name:'fall', start_date:'', end_date:'', is_active:'0' };

function SemesterModal({ initial = EMPTY, title, confirmLabel, onClose, onConfirm }) {
  const [form, setForm] = useState({
    ...EMPTY, ...initial,
    academic_year:  initial.year          ?? initial.academic_year ?? '',
    semester_name:  (initial.sem          ?? initial.semester_name ?? 'fall').toLowerCase(),
    start_date:     initial.start         ?? initial.start_date    ?? '',
    end_date:       initial.end           ?? initial.end_date      ?? '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handle = async () => {
    const e = {};
    if (!form.academic_year.trim()) e.academic_year = 'Required (e.g. 2025/2026)';
    if (!form.start_date.trim())    e.start_date    = 'Required';
    if (!form.end_date.trim())      e.end_date      = 'Required';
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const body = {
        semester_name: form.semester_name,
        academic_year: form.academic_year,
        start_date:    form.start_date,
        end_date:      form.end_date,
        is_active:     '0',
      };
      await onConfirm(body);
      onClose();
    } catch (err) {
      setErrors({ _api: err.message });
    }
    setSaving(false);
  };

  return (
    <Modal title={title} onClose={onClose} onConfirm={handle} confirmLabel={saving ? 'Saving…' : confirmLabel}>
      {errors._api && <div style={{ color:'var(--rose)', fontSize:12, marginBottom:8, padding:'6px 10px', background:'rgba(251,113,133,.08)', borderRadius:6 }}>{errors._api}</div>}
      <ModalRow>
        <Field label='Academic Year' error={errors.academic_year}>
          <Input value={form.academic_year} onChange={e=>set('academic_year',e.target.value)} placeholder='e.g. 2025/2026' error={errors.academic_year}/>
        </Field>
        <Field label='Semester'>
          <Select options={['fall','spring',"summer"].map(s=>({value:s,label:s.charAt(0).toUpperCase()+s.slice(1)}))} value={form.semester_name} onChange={e=>set('semester_name',e.target.value)}/>
        </Field>
      </ModalRow>
      <ModalRow>
        <Field label='Start Date (YYYY-MM-DD)' error={errors.start_date}>
          <Input value={form.start_date} onChange={e=>set('start_date',e.target.value)} placeholder='e.g. 2025-09-01' error={errors.start_date}/>
        </Field>
        <Field label='End Date (YYYY-MM-DD)' error={errors.end_date}>
          <Input value={form.end_date} onChange={e=>set('end_date',e.target.value)} placeholder='e.g. 2026-01-20' error={errors.end_date}/>
        </Field>
      </ModalRow>
    </Modal>
  );
}

function remapSem(s) {
  return {
    id:            s.id,
    year:          s.academic_year,
    sem:           s.semester_name
                     ? s.semester_name.charAt(0).toUpperCase() + s.semester_name.slice(1)
                     : '',
    semester_name: s.semester_name,
    academic_year: s.academic_year,
    start:         s.start_date,
    end:           s.end_date,
    duration:      typeof s.duration === 'string'
                     ? `${parseFloat(s.duration).toFixed(1)} weeks`
                     : (s.duration ? `${s.duration} weeks` : '—'),
    status:        (s.is_active == 1 || s.is_active === true) ? 'Active' : 'Inactive',
    is_active:     s.is_active,
  };
}

export default function Semesters() {
  const { semesters, dispatch, toast } = useApp();
  const [modal, setModal] = useState(null);

  const active = semesters.find(s => s.status === 'Active');

  const handleAdd = async (body) => {
    const res = await semestersAPI.create(body);
    // Response: { message, data: {...} }
    dispatch({ type: 'ADD_SEMESTER', payload: remapSem(res.data ?? res) });
    toast('Semester added', 'ok');
  };

  const handleEdit = async (body) => {
    const res = await semestersAPI.update(modal.id, body);
    dispatch({ type: 'UPDATE_SEMESTER', payload: remapSem(res.data ?? res) });
    toast('Semester updated', 'ok');
  };

  const handleActivate = async (id) => {
    //const res = await semestersAPI.activate(id);
    try {
    await semestersAPI.activate(id);  // API call
  } catch {
    // لو API فشل، حدّث الـ state محلياً على طول
  }
    dispatch({ type: 'ACTIVATE_SEMESTER', id });
    toast('Semester activated', 'ok');
  };

  return (
    <div style={{ padding:'24px 28px', animation:'fadeIn .25s ease' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:20 }}>
        <div>
          <div style={{ fontFamily:"'Libre Baskerville',serif",fontSize: '1.50rem', gap: 8 , color:'var(--white)', letterSpacing:'-.4px' }}>Semesters</div>
          <div style={{ fontSize:15, color:'var(--dim)', marginTop:3 }}>
            {semesters.length} semesters · {active ? `Active: ${active.sem} ${active.year}` : 'No active semester'}
          </div>
        </div>
        <Btn variant='teal' onClick={() => setModal('add')} style={{ fontSize: 16, padding: '10px 20px' }}>+ Add Semester</Btn>
      </div>

      {active && (
        <div style={{
          display:'flex', alignItems:'center', gap:10,
          background:'rgba(52,211,153,.07)', border:'1px solid rgba(52,211,153,.15)',
          borderLeft:'3px solid var(--green)', borderRadius:8,
          padding:'11px 15px', marginBottom:18, fontSize:15, color:'var(--muted)',
        }}>
          ✅ <span><span style={{ fontWeight:700, color:'var(--white)' }}>{active.sem} {active.year}</span> is the currently active semester · {active.start} → {active.end}</span>
        </div>
      )}

      <TableWrap>
        <thead style={{ color:'var(--muted)' ,fontSize:18}}>
          <tr>
            <Th style={{ padding:'10px 12px', color:'var(--dim)' ,fontSize:15}}>Year</Th>
            <Th style={{ padding:'10px 12px', color:'var(--dim)' ,fontSize:15}}>Semester</Th>
            <Th style={{ padding:'10px 12px', color:'var(--dim)' ,fontSize:15}}>Start</Th>
            <Th style={{ padding:'10px 12px', color:'var(--dim)' ,fontSize:15}}>End</Th>
            <Th style={{ padding:'10px 12px', color:'var(--dim)' ,fontSize:15}}>Duration</Th>
            <Th style={{ padding:'10px 12px', color:'var(--dim)' ,fontSize:15}}>Status</Th><Th/></tr>
        </thead>
        <tbody>
          {semesters.length === 0
            ? <tr><td colSpan={8}><Empty icon='📅' text='No semesters yet.' sub='Add the first semester to get started.' /></td></tr>
            : semesters.map(s => (
              <TR key={s.id}>
               
                <Td style={{ fontWeight:600,fontsize:15 }}>{s.year}</Td>
                <Td style={{ color:'var(--muted)' ,fontSize:15}}><Badge color={s.sem?.toLowerCase() === 'spring' ? 'blue' : 'amber'}>{s.sem}</Badge></Td>
                <Td style={{ color:'var(--muted)' ,fontSize:14}}>{s.start}</Td>
                <Td style={{ color:'var(--muted)',fontSize:14 }}>{s.end}</Td>
                <Td style={{ color:'var(--dim)' ,fontSize:14 }}>{s.duration}</Td>
                <Td><Badge color={s.status === 'Active' ? 'green' : 'muted'}>{s.status === 'Active' ? '✅ Active' : 'Inactive'}</Badge></Td>
                <Td>
                  <div style={{ display:'flex', gap:6 ,fontsize:14 }}>
                    <Btn variant='amber' size='sm' onClick={() => setModal(s)}>Edit</Btn>
                    {s.status === 'Inactive' && <Btn variant='confirm' size='sm' onClick={() => handleActivate(s.id)}>Activate</Btn>}
                  </div>
                </Td>
              </TR>
            ))}
        </tbody>
      </TableWrap>

      {modal === 'add' && <SemesterModal title='📅 Add Semester' confirmLabel='Add Semester' onClose={() => setModal(null)} onConfirm={handleAdd} />}
      {modal && modal !== 'add' && <SemesterModal title='✏️ Edit Semester' confirmLabel='Save Changes' initial={modal} onClose={() => setModal(null)} onConfirm={handleEdit} />}
    </div>
  );
}
