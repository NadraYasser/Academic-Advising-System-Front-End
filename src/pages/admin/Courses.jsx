// ─────────────────────────────────────────────────────────────
//  Courses Page 
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { useState } from 'react';
import { useApp } from '../../contexts/AdminContext';
import { coursesAPI } from '../../services/adminAPI';
import {
  Btn, Modal, Field, Input, Select, ModalRow, Badge,
  SearchBox, FilterSelect,
  TableWrap, Th, Td, TR, Pagination, Empty,
} from '../../components/AdminUI';
import { CODE_COLORS } from '../../services/adminConstants';

const EMPTY = { course_name:'', course_code:'', credit_hours:'3', plan_semester:'1', department_ids:'', type_course:'mandatory', prerequisite_ids:'' };

function CourseModal({ initial = EMPTY, title, confirmLabel, onClose, onConfirm, departments, courses }) {
  const [form, setForm] = useState({
    ...EMPTY, ...initial,
    credit_hours:  String(initial.credit_hours  ?? initial.credits ?? 3),
    plan_semester: String(initial.plan_semester ?? 1),
    course_name:   initial.course_name ?? initial.name ?? '',
    course_code:   initial.course_code ?? (initial.code ? `${initial.code}${initial.num}` : ''),
  
     department_input: initial.departments?.map(d => d.name).join(', ') || '',
    type_course:    initial.departments?.[0]?.type_course ?? 'mandatory',
   
prerequisite_input: initial.something?.map(x => x.name).join(', ') || '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handle = async () => {
    const e = {};
    if (!form.course_name.trim()) e.course_name = 'Required';
    if (!form.course_code.trim()) e.course_code = 'Required';
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
     
      const deptIds  = form.department_ids.split(',').map(s=>parseInt(s.trim())).filter(n=>!isNaN(n));
      const prereqIds = form.prerequisite_ids.split(',').map(s=>parseInt(s.trim())).filter(n=>!isNaN(n));

      const deptObjs = deptIds.map(id => {
        const dept = departments.find(d => d.id === id || String(d.id) === String(id));
        return { department_name: dept?.name ?? String(id), type_course: form.type_course };
      });

      const prereqObjs = prereqIds.map(id => {
        const course = courses.find(c => c.id === id || String(c.id) === String(id));
        return { course_code: course?.code ?? course?.course_code ?? String(id) };
      });

      const body = {
        course_name:      form.course_name,
        course_code:      form.course_code,
        credit_hours:     parseInt(form.credit_hours) || 3,
        plan_semester:    String(form.plan_semester),
        departments:      deptObjs,
        prerequisites:    prereqObjs,
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
      <Field label='Course Name' error={errors.course_name}>
        <Input value={form.course_name} onChange={e=>set('course_name',e.target.value)} placeholder='e.g. Operating Systems' error={errors.course_name}/>
      </Field>
      <ModalRow>
        <Field label='Course Code' error={errors.course_code}>
          <Input value={form.course_code} onChange={e=>set('course_code',e.target.value)} placeholder='e.g. CS303' error={errors.course_code}/>
        </Field>
        <Field label='Credit Hours'>
          <Input type='number' min='1' max='6' value={form.credit_hours} onChange={e=>set('credit_hours',e.target.value)}/>
        </Field>
      </ModalRow>
      <ModalRow>
        <Field label='Plan Semester'>
          <Select options={['1','2','3','4','5','6','7','8'].map(s=>({value:s,label:`Semester ${s}`}))} value={String(form.plan_semester)} onChange={e=>set('plan_semester',e.target.value)}/>
        </Field>
        <Field label='Course Type'>
          <Select options={['mandatory','elective','core'].map(t=>({value:t,label:t.charAt(0).toUpperCase()+t.slice(1)}))} value={form.type_course} onChange={e=>set('type_course',e.target.value)}/>
        </Field>
      </ModalRow>
      <Field label='Department  (comma separated)' sub='e.g. 1,2,3'>
        <Input value={form.department_input} onChange={e=>set('department_input',e.target.value)} placeholder='e.g. Applied Chemistry'/>
      </Field>
      <Field label='Prerequisite Course  (comma separated, optional)'>
        <Input value={form.prerequisite_input} onChange={e=>set('prerequisite_input',e.target.value)} placeholder='e.g. Math101 or none'/>
      </Field>
    </Modal>
  );
}

const PER_PAGE = 10;

function remapCourse(c) {
  const prereqNames = c.prerequisites?.map(p => p.course_code) ?? [];
  const match = (c.course_code ?? '').match(/^([A-Za-z]+)(\d+)$/);
  return {
    id:            c.id,
    course_name:   c.course_name,
    course_code:   c.course_code,
    code:          match ? match[1].toUpperCase() : c.course_code,
    num:           match ? match[2] : '',
    name:          c.course_name,
    credits:       c.credit_hours,
    sem:           `Sem ${c.plan_semester}`,
    plan_semester: c.plan_semester,
    prereq:        prereqNames.length ? prereqNames.join(', ') : 'None',
    prerequisite_ids: c.prerequisites?.map(p => p.id) ?? [],
    depts:         c.course_departments?.length ?? 0,
    dept_list:     c.course_departments?.map(cd => cd.department?.name ?? cd.department_id) ?? [],
    departments:   c.course_departments?.map(cd => ({ id: cd.department_id, type_course: cd.type_course })) ?? [],
  };
}

export default function Courses() {
  const { courses, departments, dispatch, toast } = useApp();
  const [search, setSearch] = useState('');
  const [sem,    setSem]    = useState('All');
  const [page,   setPage]   = useState(1);
  const [modal,  setModal]  = useState(null);

  const filtered = courses.filter(c => {
    const q = search.toLowerCase();
    return (
      (c.name?.toLowerCase().includes(q) || c.course_code?.toLowerCase().includes(q)) &&
      (sem === 'All' || c.sem === sem)
    );
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const rows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const semOptions = [...new Set(courses.map(c => c.sem).filter(Boolean))].sort();

  const handleAdd = async (body) => {
    const res = await coursesAPI.create(body);
    dispatch({ type: 'ADD_COURSE', payload: remapCourse(res) });
    toast('Course added', 'ok');
  };

  const handleEdit = async (body) => {
    const res = await coursesAPI.update(modal.id, body);
    dispatch({ type: 'UPDATE_COURSE', payload: remapCourse(res) });
    toast('Course updated', 'ok');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    await coursesAPI.remove(id);
    dispatch({ type: 'REMOVE_COURSE', id });
    toast('Course deleted', 'ok');
  };

  return (
    <div style={{ padding:'24px 28px', animation:'fadeIn .25s ease' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:20 }}>
        <div >
          <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:'1.50rem', gap: 8, color:'var(--white)', letterSpacing:'-.4px' }}>Courses</div>
          <div style={{ fontSize:15, color:'var(--dim)', marginTop:3 }}>{courses.length} courses in the system</div>
        </div>
        <Btn variant='teal' onClick={() => setModal('add')}style={{ fontSize: 16, padding: '10px 20px' }}>+ Add Course</Btn>
      </div>
      
      <TableWrap
        toolbar={
          <>
            <SearchBox value={search} onChange={e=>{ setSearch(e.target.value); setPage(1); }} placeholder='Search code or name…' />
            <FilterSelect value={sem} onChange={e=>{ setSem(e.target.value); setPage(1); }}>
              <option value='All'>All Plan Semesters</option>
              {semOptions.map(s => <option key={s}>{s}</option>)}
            </FilterSelect>
          </>
        }
        pagination={<Pagination page={page} total={totalPages} onChange={setPage} />}
      >
        <thead>
          <tr style={{ fontSize:'1.50rem', gap: 8 }}> <Th style={{ padding:'10px 12px', color:'var(--dim)' ,fontSize:13}}>Code</Th>
          <Th style={{ padding:'10px 12px', color:'var(--dim)' ,fontSize:14}}>Course Name</Th>
          <Th style={{ padding:'10px 12px', color:'var(--dim)' ,fontSize:14}}>Credits</Th>
          <Th style={{ padding:'10px 12px', color:'var(--dim)' ,fontSize:14}}>Plan Sem</Th>
          <Th style={{ padding:'10px 12px', color:'var(--dim)' ,fontSize:14}}>Prerequisites</Th>
          <Th style={{ padding:'10px 12px', color:'var(--dim)' ,fontSize:14}}>Depts</Th><Th/></tr>
        </thead>
        <tbody>
          {rows.length === 0
            ? <tr><td colSpan={7}><Empty icon='📚' text='No courses found.' /></td></tr>
            : rows.map(c => (
              <TR key={c.id}>
                <Td>
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:16, fontWeight:500, color: CODE_COLORS[c.code]  }}>{c.code}</span>
                  {' '}<span style={{ fontWeight:600, fontSize:15 }}>{c.num}</span>
                </Td>
                <Td style={{ fontWeight:600 , fontSize:14 }}>{c.name}</Td>
                <Td style={{ fontWeight:500 , fontSize:14}}>{c.credits}</Td>
                <Td style={{ fontWeight:500 , fontSize:14}}>{c.sem}</Td>
                <Td style={{ fontWeight:500 , fontSize:14}}><Badge color={c.prereq === 'None' ? 'muted' : 'amber'}>{c.prereq}</Badge></Td>
                <Td style={{ fontWeight:500 , fontSize:14}}><Badge color='teal'>{c.depts} dept{c.depts !== 1 ? 's' : ''}</Badge></Td>
                <Td>
                  <div style={{ display:'flex', gap:6 }}>
                    <Btn variant='amber' size='sm' onClick={() => setModal(c)}>Edit</Btn>
                    <Btn variant='rose'  size='sm' onClick={() => handleDelete(c.id)}>Del</Btn>
                  </div>
                </Td>
              </TR>
            ))}
        </tbody>
      </TableWrap>

      {modal === 'add' && (
        <CourseModal title='📚 Add Course' confirmLabel='Add Course'
          onClose={() => setModal(null)} onConfirm={handleAdd}
          departments={departments} courses={courses} />
      )}
      {modal && modal !== 'add' && (
        <CourseModal title='✏️ Edit Course' confirmLabel='Save Changes' initial={modal}
          onClose={() => setModal(null)} onConfirm={handleEdit}
          departments={departments} courses={courses} />
      )}
    </div>
  );
}
