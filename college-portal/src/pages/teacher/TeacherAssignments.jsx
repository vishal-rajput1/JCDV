import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FIELDS } from '../../constants/academic'
import { apiFetch } from '../../utils/api'

const emptyForm = { subjectId: '', title: '', description: '', deadline: '', attachmentUrl: '', maximumMarks: '' }

function TeacherAssignments() {
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState([])
  const [assignments, setAssignments] = useState([])
  const [filters, setFilters] = useState({ subjectId: '', semester: '', field: '' })
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => { apiFetch('/teacher/subjects').then(setSubjects).catch((requestError) => setError(requestError.message)) }, [])
  const loadAssignments = async () => {
    setLoading(true); setError('')
    try { const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value)); setAssignments(await apiFetch(`/teacher/assignments${params.size ? `?${params}` : ''}`)) } catch (requestError) { setError(requestError.message) } finally { setLoading(false) }
  }
  useEffect(() => { loadAssignments() }, [filters])
  const resetForm = () => { setForm(emptyForm); setEditingId(null); setShowForm(false) }
  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setError(''); setMessage('')
    try {
      const endpoint = editingId ? `/teacher/assignments/${editingId}` : '/teacher/assignments'
      const data = await apiFetch(endpoint, { method: editingId ? 'PUT' : 'POST', body: JSON.stringify(form) })
      setMessage(data.message); resetForm(); await loadAssignments()
    } catch (requestError) { setError(requestError.message) } finally { setSaving(false) }
  }
  const edit = (assignment) => { setEditingId(assignment.id); setForm({ subjectId: assignment.subjectId, title: assignment.title, description: assignment.description, deadline: assignment.deadline, attachmentUrl: assignment.attachmentUrl || '', maximumMarks: assignment.maximumMarks }); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const remove = async (assignmentId) => {
    if (!window.confirm('Delete this assignment? This cannot be undone.')) return
    setError(''); setMessage('')
    try { const data = await apiFetch(`/teacher/assignments/${assignmentId}`, { method: 'DELETE' }); setMessage(data.message); await loadAssignments() } catch (requestError) { setError(requestError.message) }
  }
  const publish = async (assignmentId) => {
    setError(''); setMessage('')
    try { const data = await apiFetch(`/teacher/assignments/${assignmentId}/publish`, { method: 'PATCH' }); setMessage(data.message); await loadAssignments() } catch (requestError) { setError(requestError.message) }
  }

  return <div>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-brand-600">TEACHING</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">Assignments</h1><p className="mt-2 text-sm text-muted">Create, edit, and publish assignments for your authorised student groups.</p></div><button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm) }} className="rounded-xl bg-brand-700 px-5 py-3 text-sm font-bold text-white">Create assignment</button></div>
    {message && <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}{error && <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
    {showForm && <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-start justify-between"><div><h2 className="font-bold text-ink">{editingId ? 'Edit assignment' : 'Create assignment'}</h2><p className="mt-1 text-xs text-muted">Changes to a published assignment return it to draft status.</p></div><button onClick={resetForm} className="text-sm font-semibold text-slate-500">Cancel</button></div><form onSubmit={submit} className="mt-6 grid gap-5 md:grid-cols-2"><label><span className="text-sm font-semibold text-slate-700">Subject</span><select required value={form.subjectId} onChange={(event) => setForm({ ...form, subjectId: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-500"><option value="">Choose assigned subject</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.code} — {subject.name} (Semester {subject.semester}, {subject.field})</option>)}</select></label><label><span className="text-sm font-semibold text-slate-700">Maximum marks</span><input required min="1" max="100" type="number" value={form.maximumMarks} onChange={(event) => setForm({ ...form, maximumMarks: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-500" /></label><label><span className="text-sm font-semibold text-slate-700">Title</span><input required maxLength="160" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-500" /></label><label><span className="text-sm font-semibold text-slate-700">Deadline</span><input required type="date" value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-500" /></label><label className="md:col-span-2"><span className="text-sm font-semibold text-slate-700">Description</span><textarea required maxLength="5000" rows="4" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-500" /></label><label className="md:col-span-2"><span className="text-sm font-semibold text-slate-700">Attachment URL <span className="font-normal text-muted">(optional)</span></span><input type="url" placeholder="https://…" value={form.attachmentUrl} onChange={(event) => setForm({ ...form, attachmentUrl: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-500" /></label><div className="flex justify-end md:col-span-2"><button disabled={saving} className="rounded-xl bg-brand-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{saving ? 'Saving…' : editingId ? 'Save changes' : 'Save draft'}</button></div></form></section>}
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="grid gap-3 sm:grid-cols-3"><select name="subjectId" value={filters.subjectId} onChange={(event) => setFilters({ ...filters, subjectId: event.target.value })} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-500"><option value="">All my subjects</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.code} — {subject.name}</option>)}</select><select name="semester" value={filters.semester} onChange={(event) => setFilters({ ...filters, semester: event.target.value })} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-500"><option value="">All semesters</option>{[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => <option key={semester} value={semester}>Semester {semester}</option>)}</select><select name="field" value={filters.field} onChange={(event) => setFilters({ ...filters, field: event.target.value })} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-500"><option value="">All fields</option>{FIELDS.map((field) => <option key={field} value={field}>{field}</option>)}</select></div></section>
        <section className="mt-6 grid gap-4 lg:grid-cols-2">{loading ? <div className="col-span-full grid min-h-48 place-items-center text-sm text-muted">Loading assignments…</div> : assignments.length ? assignments.map((assignment) => <article key={assignment.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-start justify-between gap-3"><div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${assignment.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{assignment.isPublished ? 'Published' : 'Draft'}</span><h2 className="mt-3 text-lg font-bold text-ink">{assignment.title}</h2><p className="mt-1 text-xs text-muted">{assignment.code} · Semester {assignment.semester} · {assignment.field}</p></div><p className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700">{assignment.maximumMarks} marks</p></div><p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{assignment.description}</p><div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 text-xs"><span className="font-semibold text-slate-700">Deadline: {assignment.deadline}</span>{assignment.attachmentUrl && <a href={assignment.attachmentUrl} target="_blank" rel="noreferrer" className="font-semibold text-brand-600">Attachment</a>}<div className="ml-auto flex gap-3"><button onClick={() => navigate(`/teacher/assignments/${assignment.id}`)} className="font-semibold text-slate-700">Submissions</button><button onClick={() => edit(assignment)} className="font-semibold text-brand-600">Edit</button>{!assignment.isPublished && <button onClick={() => publish(assignment.id)} className="font-semibold text-emerald-700">Publish</button>}<button onClick={() => remove(assignment.id)} className="font-semibold text-rose-600">Delete</button></div></div></article>) : <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><p className="font-semibold text-slate-700">No assignments found</p><p className="mt-1 text-sm text-muted">Create an assignment to save it as a draft.</p></div>}</section>
  </div>
}

export default TeacherAssignments
