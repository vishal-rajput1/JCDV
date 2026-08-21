import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../components/Icon'
import { FIELDS } from '../../constants/academic'
import { apiFetch } from '../../utils/api'

function TeacherSubjects() {
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState([])
  const [filters, setFilters] = useState({ search: '', semester: '', field: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true); setError('')
      try {
        const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value))
        const data = await apiFetch(`/teacher/subjects${params.size ? `?${params}` : ''}`, { signal: controller.signal })
        setSubjects(data)
      } catch (requestError) {
        if (requestError.name !== 'AbortError') setError(requestError.message)
      } finally { setLoading(false) }
    }, 250)
    return () => { controller.abort(); clearTimeout(timer) }
  }, [filters])

  const updateFilter = (event) => setFilters({ ...filters, [event.target.name]: event.target.value })
  const clearFilters = () => setFilters({ search: '', semester: '', field: '' })

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-semibold text-brand-600">ACADEMIC</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">My Subjects</h1><p className="mt-2 text-sm text-muted">Subjects assigned to you by the administration.</p></div>
        <span className="w-fit rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700">{subjects.length} shown</span>
      </div>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="relative md:col-span-2"><span className="sr-only">Search subjects</span><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icon name="search" className="h-4 w-4" /></span><input name="search" value={filters.search} onChange={updateFilter} placeholder="Search subject name or code" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100" /></label>
          <select name="semester" value={filters.semester} onChange={updateFilter} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-500"><option value="">All semesters</option>{[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => <option key={semester} value={semester}>Semester {semester}</option>)}</select>
          <select name="field" value={filters.field} onChange={updateFilter} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-500"><option value="">All fields</option>{FIELDS.map((field) => <option key={field} value={field}>{field}</option>)}</select>
        </div>
        {(filters.search || filters.semester || filters.field) && <button onClick={clearFilters} className="mt-3 text-xs font-semibold text-brand-600">Clear filters</button>}
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto"><table className="min-w-[740px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-muted"><tr><th className="px-6 py-4 font-semibold">Subject</th><th className="px-6 py-4 font-semibold">Code</th><th className="px-6 py-4 font-semibold">Semester</th><th className="px-6 py-4 font-semibold">Field</th><th className="px-6 py-4 font-semibold text-right">Students</th><th className="px-6 py-4" /></tr></thead><tbody className="divide-y divide-slate-100">{loading ? <tr><td colSpan="6" className="px-6 py-14 text-center text-muted">Loading assigned subjects…</td></tr> : error ? <tr><td colSpan="6" className="px-6 py-14 text-center text-rose-600">{error}</td></tr> : subjects.length ? subjects.map((subject) => <tr key={subject.id} className="transition hover:bg-slate-50"><td className="px-6 py-4 font-semibold text-slate-800">{subject.name}</td><td className="px-6 py-4 text-slate-600">{subject.code}</td><td className="px-6 py-4 text-slate-600">{subject.semester}</td><td className="px-6 py-4"><span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">{subject.field}</span></td><td className="px-6 py-4 text-right font-semibold text-slate-700">{subject.students}</td><td className="px-6 py-4 text-right"><button onClick={() => navigate(`/teacher/subjects/${subject.id}`)} className="text-xs font-semibold text-brand-600 hover:text-brand-700">View details</button></td></tr>) : <tr><td colSpan="6" className="px-6 py-14 text-center"><p className="font-semibold text-slate-700">No assigned subjects found</p><p className="mt-1 text-xs text-muted">Try changing the filters, or contact your administrator for a subject allocation.</p></td></tr>}</tbody></table></div>
      </section>
    </div>
  )
}

export default TeacherSubjects
