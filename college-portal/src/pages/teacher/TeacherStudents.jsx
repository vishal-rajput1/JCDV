import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../components/Icon'
import { FIELDS } from '../../constants/academic'
import { apiFetch } from '../../utils/api'

function Percentage({ value, tone = 'brand' }) {
  if (value === null) return <span className="text-xs text-muted">No records</span>
  const colors = tone === 'emerald' ? 'bg-emerald-50 text-emerald-700' : 'bg-brand-50 text-brand-700'
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${colors}`}>{value}%</span>
}

function TeacherStudents() {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [subjects, setSubjects] = useState([])
  const [filters, setFilters] = useState({ search: '', semester: '', field: '', subjectId: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    apiFetch('/teacher/subjects').then((data) => active && setSubjects(data)).catch(() => {})
    return () => { active = false }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true); setError('')
      try {
        const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value))
        const data = await apiFetch(`/teacher/students${params.size ? `?${params}` : ''}`, { signal: controller.signal })
        setStudents(data)
      } catch (requestError) {
        if (requestError.name !== 'AbortError') setError(requestError.message)
      } finally { setLoading(false) }
    }, 250)
    return () => { controller.abort(); clearTimeout(timer) }
  }, [filters])

  const updateFilter = (event) => setFilters({ ...filters, [event.target.name]: event.target.value })
  const clearFilters = () => setFilters({ search: '', semester: '', field: '', subjectId: '' })

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-brand-600">ACADEMIC</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">Students</h1><p className="mt-2 text-sm text-muted">Students enrolled in your authorised Semester + Field groups.</p></div><span className="w-fit rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700">{students.length} shown</span></div>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"><label className="relative xl:col-span-1"><span className="sr-only">Search student</span><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icon name="search" className="h-4 w-4" /></span><input name="search" value={filters.search} onChange={updateFilter} placeholder="Name or roll number" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100" /></label><select name="semester" value={filters.semester} onChange={updateFilter} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-500"><option value="">All semesters</option>{[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => <option key={semester} value={semester}>Semester {semester}</option>)}</select><select name="field" value={filters.field} onChange={updateFilter} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-500"><option value="">All fields</option>{FIELDS.map((field) => <option key={field} value={field}>{field}</option>)}</select><select name="subjectId" value={filters.subjectId} onChange={updateFilter} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-500"><option value="">All my subjects</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.code} — {subject.name}</option>)}</select></div>{Object.values(filters).some(Boolean) && <button onClick={clearFilters} className="mt-3 text-xs font-semibold text-brand-600">Clear filters</button>}</section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="min-w-[1040px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-muted"><tr><th className="px-6 py-4 font-semibold">Student</th><th className="px-6 py-4 font-semibold">Roll number</th><th className="px-6 py-4 font-semibold">Semester</th><th className="px-6 py-4 font-semibold">Field</th><th className="px-6 py-4 font-semibold">Email</th><th className="px-6 py-4 font-semibold">Attendance</th><th className="px-6 py-4 font-semibold">Performance</th><th className="px-6 py-4" /></tr></thead><tbody className="divide-y divide-slate-100">{loading ? <tr><td colSpan="8" className="px-6 py-14 text-center text-muted">Loading authorised students…</td></tr> : error ? <tr><td colSpan="8" className="px-6 py-14 text-center text-rose-600">{error}</td></tr> : students.length ? students.map((student) => <tr key={student.id} className="transition hover:bg-slate-50"><td className="px-6 py-4 font-semibold text-slate-800">{student.name}</td><td className="px-6 py-4 text-slate-600">{student.rollNo || '—'}</td><td className="px-6 py-4 text-slate-600">{student.semester}</td><td className="px-6 py-4"><span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">{student.field}</span></td><td className="px-6 py-4 text-slate-600">{student.email}</td><td className="px-6 py-4"><Percentage value={student.attendance} tone="emerald" /></td><td className="px-6 py-4"><Percentage value={student.performance} /></td><td className="px-6 py-4 text-right"><button onClick={() => navigate(`/teacher/students/${student.id}`)} className="text-xs font-semibold text-brand-600 hover:text-brand-700">View</button></td></tr>) : <tr><td colSpan="8" className="px-6 py-14 text-center"><p className="font-semibold text-slate-700">No authorised students found</p><p className="mt-1 text-xs text-muted">Students appear when their Semester + Field matches one of your subject assignments.</p></td></tr>}</tbody></table></div></section>
    </div>
  )
}

export default TeacherStudents
