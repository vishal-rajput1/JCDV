import { useEffect, useMemo, useState } from 'react'
import { FIELDS } from '../../constants/academic'
import { apiFetch } from '../../utils/api'

const MARK_FIELDS = [['sessional1', 'Sessional 1', 20], ['sessional2', 'Sessional 2', 20], ['sessional3', 'Sessional 3', 20], ['assignment', 'Assignment', 10]]

function TeacherSessionalMarks() {
  const [subjects, setSubjects] = useState([])
  const [selection, setSelection] = useState({ semester: '', field: '', subjectId: '' })
  const [roster, setRoster] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { apiFetch('/teacher/subjects').then(setSubjects).catch((requestError) => setError(requestError.message)) }, [])
  const filteredSubjects = useMemo(() => subjects.filter((subject) => (!selection.semester || subject.semester === Number(selection.semester)) && (!selection.field || subject.field === selection.field)), [subjects, selection.semester, selection.field])
  useEffect(() => { if (selection.subjectId && !filteredSubjects.some((subject) => subject.id === selection.subjectId)) setSelection((current) => ({ ...current, subjectId: '' })) }, [filteredSubjects, selection.subjectId])
  useEffect(() => {
    if (!selection.subjectId) { setRoster(null); return }
    let active = true
    setLoading(true); setError(''); setMessage('')
    apiFetch(`/teacher/sessionals/roster?${new URLSearchParams({ subjectId: selection.subjectId })}`)
      .then((data) => active && setRoster(data)).catch((requestError) => active && setError(requestError.message)).finally(() => active && setLoading(false))
    return () => { active = false }
  }, [selection.subjectId])

  const updateSelection = (event) => setSelection({ ...selection, [event.target.name]: event.target.value })
  const updateMark = (studentId, field, value) => setRoster((current) => current && ({ ...current, students: current.students.map((student) => student.id === studentId ? { ...student, [field]: value } : student) }))
  const complete = roster?.students.length && roster.students.every((student) => MARK_FIELDS.every(([field]) => student[field] !== null && student[field] !== ''))
  const reload = async () => {
    const data = await apiFetch(`/teacher/sessionals/roster?${new URLSearchParams({ subjectId: selection.subjectId })}`)
    setRoster(data)
  }
  const save = async () => {
    if (!complete) { setError('Enter all sessional and assignment marks before saving'); return }
    setSaving(true); setError(''); setMessage('')
    try {
      const data = await apiFetch('/teacher/sessionals', { method: 'POST', body: JSON.stringify({ subjectId: selection.subjectId, entries: roster.students.map((student) => ({ studentId: student.id, sessional1: student.sessional1, sessional2: student.sessional2, sessional3: student.sessional3, assignment: student.assignment })) }) })
      setMessage(data.message); await reload()
    } catch (requestError) { setError(requestError.message) } finally { setSaving(false) }
  }
  const publish = async () => {
    setPublishing(true); setError(''); setMessage('')
    try { const data = await apiFetch('/teacher/sessionals/publish', { method: 'PUT', body: JSON.stringify({ subjectId: selection.subjectId }) }); setMessage(data.message); await reload() } catch (requestError) { setError(requestError.message) } finally { setPublishing(false) }
  }
  const publishedCount = roster?.students.filter((student) => student.isPublished).length || 0

  return <div>
    <div><p className="text-sm font-semibold text-brand-600">TEACHING</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">Sessional Marks</h1><p className="mt-2 text-sm text-muted">Save a draft, review it, then publish marks for students to see.</p></div>
    {message && <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}{error && <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="grid gap-4 md:grid-cols-3"><label><span className="text-sm font-semibold text-slate-700">Semester</span><select name="semester" value={selection.semester} onChange={updateSelection} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-500"><option value="">Choose semester</option>{[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => <option key={semester} value={semester}>Semester {semester}</option>)}</select></label><label><span className="text-sm font-semibold text-slate-700">Field</span><select name="field" value={selection.field} onChange={updateSelection} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-500"><option value="">Choose field</option>{FIELDS.map((field) => <option key={field} value={field}>{field}</option>)}</select></label><label><span className="text-sm font-semibold text-slate-700">Subject</span><select name="subjectId" value={selection.subjectId} onChange={updateSelection} disabled={!selection.semester || !selection.field} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-500 disabled:cursor-not-allowed disabled:opacity-60"><option value="">Choose subject</option>{filteredSubjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.code} — {subject.name}</option>)}</select></label></div></section>
    {!selection.subjectId ? <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-muted">Select Semester, Field, and an assigned subject to load students.</div> : loading ? <div className="grid min-h-64 place-items-center text-sm text-muted">Loading sessional marks…</div> : roster && <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold text-ink">{roster.subject.name}</h2><p className="mt-1 text-xs text-muted">{roster.subject.code} · Semester {roster.subject.semester} · {roster.subject.field}</p></div><span className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700">{publishedCount} of {roster.students.length} published</span></div><div className="overflow-x-auto"><table className="min-w-[850px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-muted"><tr><th className="px-5 py-4">Student</th><th className="px-5 py-4">Roll number</th>{MARK_FIELDS.map(([, label, maximum]) => <th key={label} className="px-3 py-4">{label}<span className="normal-case"> / {maximum}</span></th>)}</tr></thead><tbody className="divide-y divide-slate-100">{roster.students.length ? roster.students.map((student) => <tr key={student.id}><td className="px-5 py-4 font-semibold text-slate-800">{student.name}</td><td className="px-5 py-4 text-slate-600">{student.rollNo || '—'}</td>{MARK_FIELDS.map(([field, label, maximum]) => <td key={field} className="px-3 py-3"><label className="sr-only">{label} for {student.name}</label><input type="number" min="0" max={maximum} step="0.01" value={student[field] ?? ''} onChange={(event) => updateMark(student.id, field, event.target.value)} className="w-20 rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-sm outline-none focus:border-brand-500 focus:bg-white" /></td>)}</tr>) : <tr><td colSpan="6" className="px-6 py-12 text-center text-muted">No students are enrolled in this Semester + Field.</td></tr>}</tbody></table></div><div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end"><button onClick={save} disabled={!complete || saving} className="rounded-xl border border-brand-200 bg-brand-50 px-5 py-2.5 text-sm font-bold text-brand-700 disabled:cursor-not-allowed disabled:opacity-50">{saving ? 'Saving…' : 'Save marks'}</button><button onClick={publish} disabled={!roster.students.length || publishing} className="rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{publishing ? 'Publishing…' : 'Publish marks'}</button></div></section>}
  </div>
}

export default TeacherSessionalMarks
