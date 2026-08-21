import { useEffect, useMemo, useState } from 'react'
import Icon from '../../components/Icon'
import { FIELDS } from '../../constants/academic'
import { apiFetch } from '../../utils/api'

const today = new Date().toISOString().slice(0, 10)

function TeacherAttendance() {
  const [subjects, setSubjects] = useState([])
  const [selection, setSelection] = useState({ semester: '', field: '', subjectId: '', date: today })
  const [roster, setRoster] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    apiFetch('/teacher/subjects').then(setSubjects).catch((requestError) => setError(requestError.message))
  }, [])

  const filteredSubjects = useMemo(() => subjects.filter((subject) =>
    (!selection.semester || subject.semester === Number(selection.semester)) && (!selection.field || subject.field === selection.field)
  ), [subjects, selection.semester, selection.field])

  useEffect(() => {
    if (selection.subjectId && !filteredSubjects.some((subject) => subject.id === selection.subjectId)) {
      setSelection((current) => ({ ...current, subjectId: '' }))
    }
  }, [filteredSubjects, selection.subjectId])

  const loadRoster = async () => {
    if (!selection.subjectId || !selection.date) return
    setLoading(true); setError(''); setMessage('')
    try {
      const data = await apiFetch(`/teacher/attendance/roster?${new URLSearchParams({ subjectId: selection.subjectId, date: selection.date })}`)
      setRoster(data)
    } catch (requestError) { setError(requestError.message); setRoster(null) } finally { setLoading(false) }
  }

  useEffect(() => { loadRoster() }, [selection.subjectId, selection.date])

  const updateSelection = (event) => setSelection({ ...selection, [event.target.name]: event.target.value })
  const setAll = (present) => setRoster((current) => current && ({ ...current, students: current.students.map((student) => ({ ...student, present })) }))
  const toggleStudent = (studentId) => setRoster((current) => current && ({ ...current, students: current.students.map((student) => student.id === studentId ? { ...student, present: student.present !== true } : student) }))
  const reset = () => loadRoster()

  const summary = roster?.students.reduce((total, student) => ({ total: total.total + 1, present: total.present + (student.present === true ? 1 : 0), absent: total.absent + (student.present === false ? 1 : 0), pending: total.pending + (student.present === null ? 1 : 0) }), { total: 0, present: 0, absent: 0, pending: 0 })
  const readyToSave = roster && roster.students.length > 0 && summary.pending === 0

  const save = async () => {
    if (!readyToSave) return
    setSaving(true); setError(''); setMessage('')
    try {
      const data = await apiFetch('/teacher/attendance', { method: 'POST', body: JSON.stringify({ subjectId: selection.subjectId, date: selection.date, entries: roster.students.map((student) => ({ studentId: student.id, present: student.present })) }) })
      setMessage(data.message)
      await loadRoster()
    } catch (requestError) { setError(requestError.message) } finally { setSaving(false) }
  }

  return <div>
    <div><p className="text-sm font-semibold text-brand-600">TEACHING</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">Mark Attendance</h1><p className="mt-2 text-sm text-muted">Attendance is saved against one authorised subject, Semester + Field, and date.</p></div>
    {message && <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}{error && <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><label><span className="text-sm font-semibold text-slate-700">Semester</span><select name="semester" value={selection.semester} onChange={updateSelection} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-500"><option value="">Choose semester</option>{[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => <option key={semester} value={semester}>Semester {semester}</option>)}</select></label><label><span className="text-sm font-semibold text-slate-700">Field</span><select name="field" value={selection.field} onChange={updateSelection} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-500"><option value="">Choose field</option>{FIELDS.map((field) => <option key={field} value={field}>{field}</option>)}</select></label><label><span className="text-sm font-semibold text-slate-700">Subject</span><select name="subjectId" value={selection.subjectId} onChange={updateSelection} disabled={!selection.semester || !selection.field} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-500 disabled:cursor-not-allowed disabled:opacity-60"><option value="">Choose subject</option>{filteredSubjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.code} — {subject.name}</option>)}</select></label><label><span className="text-sm font-semibold text-slate-700">Date</span><input name="date" type="date" value={selection.date} onChange={updateSelection} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-500" /></label></div></section>
    {!selection.subjectId ? <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-muted">Select Semester, Field, subject, and date to load the authorised student roster.</div> : loading ? <div className="grid min-h-64 place-items-center text-sm text-muted">Loading student roster…</div> : roster && <><div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs text-muted">Total students</p><p className="mt-1 text-2xl font-bold text-ink">{summary.total}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs text-muted">Present</p><p className="mt-1 text-2xl font-bold text-emerald-600">{summary.present}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs text-muted">Absent</p><p className="mt-1 text-2xl font-bold text-rose-600">{summary.absent}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs text-muted">Attendance</p><p className="mt-1 text-2xl font-bold text-ink">{summary.total ? `${Math.round((summary.present / summary.total) * 100)}%` : '—'}</p></div></div><section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold text-ink">{roster.subject.name}</h2><p className="mt-1 text-xs text-muted">{roster.subject.code} · Semester {roster.subject.semester} · {roster.subject.field}{roster.saved ? ' · Existing record' : ''}</p></div><div className="flex gap-2"><button onClick={() => setAll(true)} disabled={!roster.students.length} className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 disabled:opacity-50">Mark all present</button><button onClick={() => setAll(false)} disabled={!roster.students.length} className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 disabled:opacity-50">Mark all absent</button></div></div><div className="overflow-x-auto"><table className="min-w-[600px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-muted"><tr><th className="px-6 py-4">Student</th><th className="px-6 py-4">Roll number</th><th className="px-6 py-4 text-right">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{roster.students.length ? roster.students.map((student) => <tr key={student.id}><td className="px-6 py-4 font-semibold text-slate-800">{student.name}</td><td className="px-6 py-4 text-slate-600">{student.rollNo || '—'}</td><td className="px-6 py-4 text-right"><button onClick={() => toggleStudent(student.id)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${student.present === true ? 'bg-emerald-50 text-emerald-700' : student.present === false ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-500'}`}>{student.present === true ? 'Present' : student.present === false ? 'Absent' : 'Mark status'}</button></td></tr>) : <tr><td colSpan="3" className="px-6 py-12 text-center text-muted">No students are currently enrolled in this Semester + Field.</td></tr>}</tbody></table></div><div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end"><button onClick={reset} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600">Reset</button><button onClick={save} disabled={!readyToSave || saving} className="rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{saving ? 'Saving…' : roster.saved ? 'Update attendance' : 'Save attendance'}</button></div></section></>}</div>
}

export default TeacherAttendance
