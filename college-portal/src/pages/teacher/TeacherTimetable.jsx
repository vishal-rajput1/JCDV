import { useEffect, useMemo, useState } from 'react'
import Icon from '../../components/Icon'
import { apiFetch } from '../../utils/api'

function ClassCard({ entry, compact = false }) {
  return <article className={`rounded-xl border border-brand-100 bg-brand-50 ${compact ? 'p-3' : 'p-4'}`}><p className="text-xs font-bold text-brand-700">{entry.startTime} – {entry.endTime}</p><p className="mt-2 text-sm font-bold text-slate-800">{entry.subject}</p><p className="mt-1 text-xs text-slate-600">{entry.code} · Semester {entry.semester} · {entry.field}</p><p className="mt-2 text-xs font-semibold text-brand-700">Room {entry.room}</p></article>
}

function TeacherTimetable() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { let active = true; apiFetch('/teacher/timetable').then((response) => active && setData(response)).catch((requestError) => active && setError(requestError.message)); return () => { active = false } }, [])
  const byDay = useMemo(() => data?.days.reduce((result, day) => ({ ...result, [day]: data.entries.filter((entry) => entry.day === day) }), {}) || {}, [data])
  if (error) return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>
  if (!data) return <div className="grid min-h-96 place-items-center text-sm text-muted">Loading your timetable…</div>
  return <div>
    <div><p className="text-sm font-semibold text-brand-600">ACADEMIC</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">Timetable</h1><p className="mt-2 text-sm text-muted">Your weekly teaching schedule from the timetable database.</p></div>
    <div className="mt-8 grid gap-5 lg:grid-cols-2"><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700"><Icon name="calendar" /></span><div><h2 className="font-bold text-ink">Today’s classes</h2><p className="mt-1 text-xs text-muted">{data.today}</p></div></div><div className="mt-5 space-y-3">{data.todaysClasses.length ? data.todaysClasses.map((entry) => <ClassCard key={entry.id} entry={entry} />) : <p className="rounded-xl bg-slate-50 p-5 text-center text-sm text-muted">No classes scheduled for today.</p>}</div></section><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><Icon name="arrow" /></span><div><h2 className="font-bold text-ink">Next class</h2><p className="mt-1 text-xs text-muted">The next class remaining today.</p></div></div><div className="mt-5">{data.nextClass ? <ClassCard entry={data.nextClass} /> : <p className="rounded-xl bg-slate-50 p-5 text-center text-sm text-muted">No upcoming classes today.</p>}</div></section></div>
    <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-6 py-5"><h2 className="font-bold text-ink">Weekly schedule</h2><p className="mt-1 text-xs text-muted">Classes are managed by the administrator.</p></div><div className="grid min-w-[1000px] grid-cols-6 divide-x divide-slate-100">{data.days.map((day) => <div key={day} className="min-h-80"><div className={`border-b border-slate-100 px-4 py-4 text-sm font-bold ${day === data.today ? 'bg-brand-50 text-brand-700' : 'bg-slate-50 text-slate-700'}`}>{day}</div><div className="space-y-3 p-3">{byDay[day].length ? byDay[day].map((entry) => <ClassCard key={entry.id} entry={entry} compact />) : <p className="pt-8 text-center text-xs text-muted">No classes</p>}</div></div>)}</div></section>
  </div>
}

export default TeacherTimetable
