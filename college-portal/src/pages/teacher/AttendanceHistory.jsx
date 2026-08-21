import { useEffect, useState } from 'react'
import Icon from '../../components/Icon'
import { FIELDS } from '../../constants/academic'
import { apiFetch } from '../../utils/api'

function AttendanceHistory() {
  const [subjects, setSubjects] = useState([])
  const [records, setRecords] = useState([])
  const [filters, setFilters] = useState({ subjectId: '', semester: '', field: '', date: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [recordLoading, setRecordLoading] = useState(false)

  useEffect(() => { apiFetch('/teacher/subjects').then(setSubjects).catch(() => {}) }, [])
  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      setLoading(true); setError('')
      try {
        const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value))
        setRecords(await apiFetch(`/teacher/attendance/history${params.size ? `?${params}` : ''}`, { signal: controller.signal }))
      } catch (requestError) { if (requestError.name !== 'AbortError') setError(requestError.message) } finally { setLoading(false) }
    }
    load()
    return () => controller.abort()
  }, [filters])

  const updateFilters = (event) => setFilters({ ...filters, [event.target.name]: event.target.value })
  const openRecord = async (recordId) => {
    setRecordLoading(true); setSelectedRecord(null); setError('')
    try { setSelectedRecord(await apiFetch(`/teacher/attendance/history/${recordId}`)) } catch (requestError) { setError(requestError.message) } finally { setRecordLoading(false) }
  }

  return <div>
    <div><p className="text-sm font-semibold text-brand-600">TEACHING</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">Attendance History</h1><p className="mt-2 text-sm text-muted">Review attendance records saved for your authorised subjects.</p></div>
    {error && <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><select name="subjectId" value={filters.subjectId} onChange={updateFilters} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-500"><option value="">All my subjects</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.code} — {subject.name}</option>)}</select><select name="semester" value={filters.semester} onChange={updateFilters} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-500"><option value="">All semesters</option>{[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => <option key={semester} value={semester}>Semester {semester}</option>)}</select><select name="field" value={filters.field} onChange={updateFilters} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-500"><option value="">All fields</option>{FIELDS.map((field) => <option key={field} value={field}>{field}</option>)}</select><input name="date" type="date" value={filters.date} onChange={updateFilters} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-500" /></div>{Object.values(filters).some(Boolean) && <button onClick={() => setFilters({ subjectId: '', semester: '', field: '', date: '' })} className="mt-3 text-xs font-semibold text-brand-600">Clear filters</button>}</section>
    <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="min-w-[850px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-muted"><tr><th className="px-6 py-4">Date</th><th className="px-6 py-4">Subject</th><th className="px-6 py-4">Semester</th><th className="px-6 py-4">Field</th><th className="px-6 py-4">Present</th><th className="px-6 py-4">Absent</th><th className="px-6 py-4">Attendance</th><th className="px-6 py-4" /></tr></thead><tbody className="divide-y divide-slate-100">{loading ? <tr><td colSpan="8" className="px-6 py-14 text-center text-muted">Loading attendance history…</td></tr> : records.length ? records.map((record) => <tr key={record.id} className="transition hover:bg-slate-50"><td className="px-6 py-4 text-slate-700">{record.date}</td><td className="px-6 py-4"><p className="font-semibold text-slate-800">{record.subject}</p><p className="mt-1 text-xs text-muted">{record.code}</p></td><td className="px-6 py-4">{record.semester}</td><td className="px-6 py-4"><span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">{record.field}</span></td><td className="px-6 py-4 text-emerald-700">{record.present}</td><td className="px-6 py-4 text-rose-700">{record.absent}</td><td className="px-6 py-4 font-semibold text-slate-700">{record.attendance === null ? '—' : `${record.attendance}%`}</td><td className="px-6 py-4 text-right"><button onClick={() => openRecord(record.id)} className="text-xs font-semibold text-brand-600">View</button></td></tr>) : <tr><td colSpan="8" className="px-6 py-14 text-center"><p className="font-semibold text-slate-700">No attendance records found</p><p className="mt-1 text-xs text-muted">Records will appear here after attendance is saved.</p></td></tr>}</tbody></table></div></section>
    {(recordLoading || selectedRecord) && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-4"><section className="max-h-[85vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white shadow-2xl">{recordLoading ? <div className="grid min-h-64 place-items-center text-sm text-muted">Loading record…</div> : <><div className="flex items-start justify-between border-b border-slate-100 px-6 py-5"><div><h2 className="font-bold text-ink">{selectedRecord.subject}</h2><p className="mt-1 text-xs text-muted">{selectedRecord.date} · {selectedRecord.code} · Semester {selectedRecord.semester} · {selectedRecord.field}</p></div><button onClick={() => setSelectedRecord(null)} aria-label="Close record" className="rounded-lg p-1 text-slate-500"><Icon name="close" /></button></div><div className="divide-y divide-slate-100">{selectedRecord.entries.map((entry) => <div key={entry.id} className="flex items-center justify-between gap-4 px-6 py-4"><div><p className="text-sm font-semibold text-slate-800">{entry.name}</p><p className="mt-1 text-xs text-muted">{entry.rollNo || '—'}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${entry.present ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{entry.present ? 'Present' : 'Absent'}</span></div>)}</div></>}</section></div>}
  </div>
}

export default AttendanceHistory
