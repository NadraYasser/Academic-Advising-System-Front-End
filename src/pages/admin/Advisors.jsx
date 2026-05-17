// ─────────────────────────────────────────────────────────────
//  Advisors Page 
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { useState } from 'react';
import { useApp } from '../../contexts/AdminContext';
import { advisorsAPI } from '../../services/adminAPI';
import {
  Btn, Modal, Field, Input, Select, ModalRow,
  SearchBox, FilterSelect, LoadBar,
  TableWrap, Th, Td, TR, Pagination, Empty,
} from '../../components/AdminUI';

const EMPTY = { name: '', email: '', level: '1', department_id: '', max_student: '50' };

function AdvisorModal({ initial = EMPTY, title, confirmLabel, onClose, onConfirm, departments }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial, max_student: String(initial.max ?? initial.max_student ?? 50) });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handle = async () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    if (!form.department_id) e.department_id = 'Required';
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const body = {
        name: form.name,
        email: form.email,
        level: String(form.level),
        department_id: String(form.department_id),
        max_student: String(form.max_student),
  
        password: form.password || 'Advisor@123',
        password_confirmation: form.password || 'Advisor@123',
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
      {errors._api && <div style={{ color: 'var(--rose)', fontSize: 12, marginBottom: 8, padding: '6px 10px', background: 'rgba(251,113,133,.08)', borderRadius: 6 }}>{errors._api}</div>}
      <Field label='Full Name' error={errors.name}>
        <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder='Dr. Full Name' error={errors.name} />
      </Field>
      <Field label='Email' error={errors.email}>
        <Input value={form.email} onChange={e => set('email', e.target.value)} placeholder='advisor@sci.asu.edu.eg' error={errors.email} />
      </Field>
      <ModalRow>
        <Field label='Department' error={errors.department_id}>
          <Select
            options={[{ value: '', label: '— Select —' }, ...departments.map(d => ({ value: String(d.id), label: d.name }))]}
            value={String(form.department_id)} onChange={e => set('department_id', e.target.value)} error={errors.department_id} />
        </Field>
        <Field label='Level'>
          <Select options={['1', '2', '3', '4'].map(l => ({ value: l, label: `Level ${l}` }))} value={String(form.level)} onChange={e => set('level', e.target.value)} />
        </Field>
      </ModalRow>
      <Field label='Max Students'>
        <Input type='number' min='1' value={form.max_student} onChange={e => set('max_student', e.target.value)} />
      </Field>
    </Modal>
  );
}

const PER_PAGE = 10;

export default function Advisors() {
  const { advisors, departments, dispatch, toast } = useApp();
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('All');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);

  const filtered = advisors.filter(a => {
    const q = search.toLowerCase();
    return (
      (a.name?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q)) &&
      (dept === 'All' || a.department === dept)
    );
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const rows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const deptNames = [...new Set(advisors.map(a => a.department).filter(Boolean))];

  function remap(a, depts) {
    const deptMap = {};
    depts.forEach(d => { deptMap[d.id] = d.name; });
    return {
      id: a.id,
      name: a.name,
      email: a.email,
      level: a.level,
      department_id: a.department_id,
      department: deptMap[a.department_id] ?? String(a.department_id ?? ''),
      max: a.max_student,
      students: a.students_count ?? 0,
    };
  }

  const handleAdd = async (body) => {
    const res = await advisorsAPI.create(body);
    dispatch({ type: 'ADD_ADVISOR', payload: remap(res, departments) });
    toast('Advisor added', 'ok');
  };

  const handleEdit = async (body) => {
    const res = await advisorsAPI.update(modal.id, body);
    dispatch({ type: 'UPDATE_ADVISOR', payload: remap({ ...res, students_count: modal.students }, departments) });
    toast('Advisor updated', 'ok');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this advisor?')) return;
    await advisorsAPI.remove(id);
    dispatch({ type: 'REMOVE_ADVISOR', id });
    toast('Advisor deleted', 'ok');
  };

  return (
    <div style={{ padding: '24px 28px', animation: 'fadeIn .25s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: "'Libre Baskerville',serif", fontSize: '1.50rem', gap: 8, color: 'var(--white)', letterSpacing: '-.4px' }}>Advisors</div>
          <div style={{ fontSize: 15, color: 'var(--dim)', marginTop: 3 }}>{advisors.length} advisors registered</div>
        </div>
        <Btn variant='teal' onClick={() => setModal('add')} style={{ fontSize: 16, padding: '10px 20px' }}>+ Add Advisor</Btn>
      </div>

      <TableWrap
        toolbar={
          <>
            <SearchBox value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder='Search advisor…' />
            <FilterSelect value={dept} onChange={e => { setDept(e.target.value); setPage(1); }}>
              <option value='All'>All Departments</option>
              {deptNames.map(d => <option key={d}>{d}</option>)}
            </FilterSelect>
          </>
        }
        pagination={<Pagination page={page} total={totalPages} onChange={setPage} />}
      >
        <thead fontSize="13">
          <tr>
            <Th style={{ padding: '10px 12px', color: 'var(--dim)', fontSize: 14 }}>Name</Th>
            <Th style={{ padding: '10px 12px', color: 'var(--dim)', fontSize: 14 }}>Email</Th>
            <Th style={{ padding: '10px 12px', color: 'var(--dim)', fontSize: 14 }}>Department</Th>
            <Th style={{ padding: '10px 12px', color: 'var(--dim)', fontSize: 14 }}>Level</Th>
            <Th style={{ padding: '10px 12px', color: 'var(--dim)', fontSize: 14 }}>Students</Th>
            {/* <Th style={{ padding:'10px 12px', color:'var(--dim)' ,fontSize:14}}>Max</Th>
            <Th style={{ padding:'10px 12px', color:'var(--dim)' ,fontSize:14}}>Load</Th> */}
            <Th /></tr>
        </thead>
        <tbody>
          {rows.length === 0
            ? <tr><td colSpan={8}><Empty icon='👨‍🏫' text='No advisors found.' /></td></tr>
            : rows.map(a => {
              const pct = a.max ? Math.round((a.students / a.max) * 100) : 0;
              return (
                <TR key={a.id}>
                  <Td style={{ fontWeight: 500, fontSize: 15 }}>{a.name}</Td>
                  <Td style={{ color: 'var(--muted)', fontSize: 14 }}>{a.email}</Td>
                  <Td style={{ color: 'var(--muted)', fontSize: 14 }}>{a.department}</Td>
                  <Td style={{ fontWeight: 500, fontSize: 14 }}>{a.level}</Td>
                  <Td>{a.students}</Td>
                  {/* <Td style={{ color:'var(--dim)', fontSize:14 }}>{a.max}</Td>
                  <Td style={{ fontWeight:500 , fontSize:15}}><LoadBar pct={pct} /></Td> */}
                  <Td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Btn variant='amber' size='sm' onClick={() => setModal(a)}>Edit</Btn>
                      <Btn variant='rose' size='sm' onClick={() => handleDelete(a.id)}>Del</Btn>
                    </div>
                  </Td>
                </TR>
              );
            })}
        </tbody>
      </TableWrap>

      {modal === 'add' && (
        <AdvisorModal title='👨‍🏫 Add Advisor' confirmLabel='Add Advisor'
          onClose={() => setModal(null)} onConfirm={handleAdd} departments={departments} />
      )}
      {modal && modal !== 'add' && (
        <AdvisorModal title='✏️ Edit Advisor' confirmLabel='Save Changes' initial={modal}
          onClose={() => setModal(null)} onConfirm={handleEdit} departments={departments} />
      )}
    </div>
  );
}
