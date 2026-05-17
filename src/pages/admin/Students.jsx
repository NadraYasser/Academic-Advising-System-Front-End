
import React from 'react';
import { useState } from 'react';
import { useApp } from '../../contexts/AdminContext';
import { studentsAPI } from '../../services/adminAPI';
import {
  Btn, Modal, Field, Input, Select, ModalRow,
  SearchBox, FilterSelect, RiskBadge,
  TableWrap, Th, Td, TR, Pagination, Empty,
} from '../../components/AdminUI';

const EMPTY_FORM = {
  name: '', national_id: '', email: '', password: '',
  level: '1', department_id: '', advisor_id: '',
  semester_id: '', risk_level: 'low',
  semester_gpa: '', cumulative_gpa: '',
  failed_courses: '0', allowed_maxCH: '21', passed_CH: '0',
};

function StudentModal({ initial = EMPTY_FORM, title, confirmLabel, onClose, onConfirm, departments, advisors, semesters }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initial });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    if (!initial.id && !form.password.trim()) e.password = 'Required';
    if (!form.department_id) e.department_id = 'Required';
    if (!form.advisor_id)    e.advisor_id    = 'Required';
    return e;
  };

  const handle = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const body = {
        name:           form.name,
        national_id:    form.national_id,
        email:          form.email,
        level:          String(form.level),
        department_id:  String(form.department_id),
        advisor_id:     String(form.advisor_id),
        semester_id:    String(form.semester_id || ''),
        risk_level:     form.risk_level,
        semester_gpa:   parseFloat(form.semester_gpa)    || 0,
        cumulative_gpa: parseFloat(form.cumulative_gpa)  || 0,
        failed_courses: parseInt(form.failed_courses)    || 0,
        allowed_maxCH:  parseInt(form.allowed_maxCH)     || 21,
        passed_CH:      parseInt(form.passed_CH)          || 0,
      };
      if (!initial.id) body.password = form.password;
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
      <Field label='Full Name' error={errors.name}>
        <Input value={form.name} onChange={e=>set('name',e.target.value)} placeholder='Student full name' error={errors.name}/>
      </Field>
      <ModalRow>
        <Field label='National ID'>
          <Input value={form.national_id} onChange={e=>set('national_id',e.target.value)} placeholder='National ID'/>
        </Field>
        <Field label='Level'>
          <Select options={['1','2','3','4'].map(l=>({value:l,label:`Level ${l}`}))} value={String(form.level)} onChange={e=>set('level',e.target.value)}/>
        </Field>
      </ModalRow>
      <Field label='Email' error={errors.email}>
        <Input value={form.email} onChange={e=>set('email',e.target.value)} placeholder='student@sci.asu.edu.eg' error={errors.email}/>
      </Field>
      {!initial.id && (
        <Field label='Password' error={errors.password}>
          <Input type='password' value={form.password} onChange={e=>set('password',e.target.value)} placeholder='Initial password' error={errors.password}/>
        </Field>
      )}
      <ModalRow>
        <Field label='Department' error={errors.department_id}>
          <Select
            options={[{value:'',label:'— Select —'}, ...departments.map(d=>({value:String(d.id),label:d.name}))]}
            value={String(form.department_id)} onChange={e=>set('department_id',e.target.value)} error={errors.department_id}/>
        </Field>
        <Field label='Advisor' error={errors.advisor_id}>
          <Select
            options={[{value:'',label:'— Select —'}, ...advisors.map(a=>({value:String(a.id),label:a.name}))]}
            value={String(form.advisor_id)} onChange={e=>set('advisor_id',e.target.value)} error={errors.advisor_id}/>
        </Field>
      </ModalRow>
      <ModalRow>
        <Field label='Semester'>
          <Select
            options={[{value:'',label:'— Select —'}, ...semesters.map(s=>({value:String(s.id),label:`${s.sem} ${s.year}`}))]}
            value={String(form.semester_id)} onChange={e=>set('semester_id',e.target.value)}/>
        </Field>
        <Field label='Risk Level'>
          <Select options={['low','medium','high'].map(r=>({value:r,label:r.charAt(0).toUpperCase()+r.slice(1)}))} value={form.risk_level} onChange={e=>set('risk_level',e.target.value)}/>
        </Field>
      </ModalRow>
      <ModalRow>
        <Field label='Semester GPA'><Input type='number' step='0.01' value={form.semester_gpa} onChange={e=>set('semester_gpa',e.target.value)} placeholder='0.00'/></Field>
        <Field label='Cumulative GPA'><Input type='number' step='0.01' value={form.cumulative_gpa} onChange={e=>set('cumulative_gpa',e.target.value)} placeholder='0.00'/></Field>
      </ModalRow>
      <ModalRow>
        <Field label='Failed Courses'><Input type='number' min='0' value={form.failed_courses} onChange={e=>set('failed_courses',e.target.value)}/></Field>
        <Field label='Allowed Max CH'><Input type='number' min='0' value={form.allowed_maxCH} onChange={e=>set('allowed_maxCH',e.target.value)}/></Field>
      </ModalRow>
      <Field label='Passed CH'><Input type='number' min='0' value={form.passed_CH} onChange={e=>set('passed_CH',e.target.value)}/></Field>
    </Modal>
  );
}

const PER_PAGE = 10;

function remap(raw) {
  const latestRisk = raw.risk_evaluations?.at(-1) ?? {};
  return {
    id:            raw.id,
    name:          raw.name,
    email:         raw.email,
    national_id:   raw.national_id,
    level:         raw.level,
    department_id: raw.department_id,
    advisor_id:    raw.advisor_id,
    department:    raw.department?.name ?? String(raw.department_id ?? ''),
    advisor:       raw.advisor?.name    ?? '',
    risk:          latestRisk.risk_level
                     ? latestRisk.risk_level.charAt(0).toUpperCase() + latestRisk.risk_level.slice(1)
                     : 'Low',
    gpa:           latestRisk.cumulative_gpa ?? null,
    semester_id:   latestRisk.semester_id ?? null,
    risk_evaluations: raw.risk_evaluations ?? [],
  };
}

export default function Students() {
  const { students, departments, advisors, semesters, dispatch, toast } = useApp();
  const [search, setSearch] = useState('');
  const [dept,   setDept]   = useState('All');
  const [risk,   setRisk]   = useState('All');
  const [page,   setPage]   = useState(1);
  const [modal,  setModal]  = useState(null);

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    return (
      (s.name?.toLowerCase().includes(q) || String(s.id).includes(q)) &&
      (dept === 'All' || s.department === dept) &&
      (risk === 'All' || s.risk?.toLowerCase() === risk.toLowerCase())
    );
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const rows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const deptNames = [...new Set(students.map(s => s.department).filter(Boolean))];

  const handleAdd = async (body) => {
    const res = await studentsAPI.create(body);
    const newId = (res.data ?? res).id;
    const full  = await studentsAPI.getById(newId);
    dispatch({ type: 'ADD_STUDENT', payload: remap(full) });
    toast('Student added', 'ok');
  };

  const handleEdit = async (body) => {
    const res = await studentsAPI.update(modal.id, body);
    const updated = res.data ?? res;
    dispatch({ type: 'UPDATE_STUDENT', payload: remap(updated) });
    toast('Student updated', 'ok');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    await studentsAPI.remove(id);
    dispatch({ type: 'REMOVE_STUDENT', id });
    toast('Student deleted', 'ok');
  };

  return (
    <div style={{ padding:'24px 28px', animation:'fadeIn .25s ease' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:20 }}>
        <div>
          <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize: '1.50rem', gap: 8 , color:'var(--white)', letterSpacing:'-.4px' }}>Students</div>
          <div style={{ fontSize:1, color:'var(--dim)', marginTop:3 }}>{students.length} students enrolled</div>
        </div>
        <Btn variant='teal' onClick={() => setModal('add')} style={{ fontSize: 16, padding: '10px 20px' }}>+ Add Student</Btn>
      </div>

      <TableWrap 
        toolbar={
          <>
            <SearchBox value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder='Search name…' />
            <div style={{ display:'flex', gap:8 }}>
              <FilterSelect value={dept} onChange={e => { setDept(e.target.value); setPage(1); }}>
                <option value='All'>All Departments</option>
                {deptNames.map(d => <option key={d}>{d}</option>)}
              </FilterSelect>
              <FilterSelect value={risk} onChange={e => { setRisk(e.target.value); setPage(1); }}>
                <option value='All'>All Risk Levels</option>
                {['Low','Medium','High'].map(r => <option key={r}>{r}</option>)}
              </FilterSelect>
            </div>
          </>
        }
        pagination={<Pagination page={page} total={totalPages} onChange={setPage} />}
      >
        <thead>
          <tr>
            <Th style={{ padding:'10px 12px', color:'var(--dim)' ,fontSize:14}}>Name</Th>
            <Th style={{ padding:'10px 12px', color:'var(--dim)' ,fontSize:14}}>Department</Th>
            <Th style={{ padding:'10px 12px', color:'var(--dim)' ,fontSize:14}}>Level</Th>
            <Th style={{ padding:'10px 12px', color:'var(--dim)' ,fontSize:14}}>GPA</Th>
            <Th style={{ padding:'10px 12px', color:'var(--dim)' ,fontSize:14}}>Risk</Th>
            <Th style={{ padding:'10px 12px', color:'var(--dim)' ,fontSize:14}}>Advisor</Th><Th/></tr>
        </thead>
        <tbody>
          {rows.length === 0
            ? <tr><td colSpan={8}><Empty icon='🎓' text='No students found.' /></td></tr>
            : rows.map(s => (
              <TR key={s.id}>
                
                <Td style={{ fontWeight:600 , fontSize:14}}>{s.name}</Td>
                <Td style={{ color:'var(--muted)' , fontSize:14}}>{s.department}</Td>
                <Td style={{ fontWeight:500 , fontSize:14}}>{s.level}</Td>
                <Td style={{ fontWeight:700 , fontSize:14, color: s.gpa >= 3.7 ? 'var(--green)' :  s.gpa >= 3 ? 'var(--blue)' :  s.gpa >= 2.33 ? 'var(--amber)' :s.gpa >= 2 ? '#f97316' : 'var(--rose)' }}>
                  {s.gpa != null ? Number(s.gpa).toFixed(2) : '—'}
                </Td>
                <Td style={{ fontWeight:500 , fontSize:14}}><RiskBadge risk={s.risk} /></Td>
                <Td style={{ color:'var(--muted)', fontSize:15}}>{s.advisor}</Td>
                <Td>
                  <div style={{ display:'flex', gap:6 }}>
                    <Btn variant='amber' size='sm' onClick={() => setModal(s)}>Edit</Btn>
                    <Btn variant='rose'  size='sm' onClick={() => handleDelete(s.id)}>Del</Btn>
                  </div>
                </Td>
              </TR>
            ))}
        </tbody>
      </TableWrap>

      {modal === 'add' && (
        <StudentModal title='🎓 Add Student' confirmLabel='Add Student'
          onClose={() => setModal(null)} onConfirm={handleAdd}
          departments={departments} advisors={advisors} semesters={semesters} />
      )}
      {modal && modal !== 'add' && (
        <StudentModal title='✏️ Edit Student' confirmLabel='Save Changes' initial={modal}
          onClose={() => setModal(null)} onConfirm={handleEdit}
          departments={departments} advisors={advisors} semesters={semesters} />
      )}
    </div>
  );
}
