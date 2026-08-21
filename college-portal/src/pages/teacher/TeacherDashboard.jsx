import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../components/Icon'
import { apiFetch } from '../../utils/api'

const StatCard = ({ label, value, helper, icon, tone }) => (
  <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between">
      <span className={`grid h-11 w-11 place-items-center rounded-xl text-white ${tone}`}><Icon name={icon} /></span>
      <span className="text-xs font-medium text-muted">Current term</span>
    </div>
    <p className="mt-6 text-sm font-medium text-muted">{label}</p>
    <p className="mt-1 text-3xl font-bold tracking-tight text-ink">{value}</p>
    <p className="mt-2 text-xs text-muted">{helper}</p>
  </article>
)

function EmptyPanel({ title, text, icon }) {
  return (
    <div className="grid min-h-44 place-items-center px-5 text-center">
      <div>
        <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-500"><Icon name={icon} /></span>
        <p className="mt-3 text-sm font-semibold text-slate-700">{title}</p>
        <p className="mt-1 text-xs leading-5 text-muted">{text}</p>
      </div>
    </div>
  )
}

function TeacherDashboard() {
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    apiFetch('/teacher/dashboard')
      .then((data) => active && setDashboard(data))
      .catch((requestError) => active && setError(requestError.message))
    return () => { active = false }
  }, [])

  if (error) {
    return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>
  }

  if (!dashboard) {
    return <div className="grid min-h-96 place-items-center text-sm text-muted">Loading your teaching workspace…</div>
  }

  const { teacher, stats, subjects, todayClasses } = dashboard
  const actions = [
    ['Mark Attendance', '/teacher/attendance', 'calendar'],
    ['Enter Sessional Marks', '/teacher/marks', 'chart'],
    ['View Students', '/teacher/students', 'users'],
    ['My Subjects', '/teacher/subjects', 'book'],
  ]

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-600">TEACHER DASHBOARD</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">Welcome back, {teacher.name}</h1>
          <p className="mt-2 text-sm text-muted">{teacher.department || 'Department not set'} · {teacher.employeeId || 'Employee ID not set'}</p>
        </div>
        <span className="w-fit rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700">Academic workspace</span>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Assigned subjects" value={stats.subjects} helper="Subjects allocated to you" icon="book" tone="bg-brand-600" />
        <StatCard label="Total students" value={stats.students} helper="Across assigned Semester + Field groups" icon="users" tone="bg-violet-600" />
        <StatCard label="Attendance summary" value={stats.attendance === null ? '—' : `${stats.attendance}%`} helper="Based on recorded attendance" icon="chart" tone="bg-emerald-600" />
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between"><div><h2 className="text-lg font-bold text-ink">Quick actions</h2><p className="mt-1 text-sm text-muted">Jump straight into your teaching tasks.</p></div></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {actions.map(([label, path, icon]) => <button key={label} onClick={() => navigate(path)} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-200 hover:bg-brand-50"><span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-700"><Icon name={icon} /></span>{label}<Icon name="arrow" className="ml-auto h-4 w-4 text-slate-400" /></button>)}
        </div>
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-5">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-3">
          <div className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-ink">My subjects</h2><p className="mt-1 text-xs text-muted">Allocated by Semester + Field.</p></div>
          {subjects.length ? <div className="divide-y divide-slate-100">{subjects.map((subject) => <div key={subject.id} className="flex items-center justify-between gap-3 px-5 py-4"><div><p className="text-sm font-semibold text-slate-800">{subject.name}</p><p className="mt-1 text-xs text-muted">{subject.code} · Semester {subject.semester} · {subject.field}</p></div><button onClick={() => navigate('/teacher/subjects')} className="text-xs font-semibold text-brand-600">View</button></div>)}</div> : <EmptyPanel icon="book" title="No subjects assigned yet" text="Your administrator can allocate subjects to make them appear here." />}
        </section>
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
          <div className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-ink">Today’s classes</h2><p className="mt-1 text-xs text-muted">Your schedule for today.</p></div>
          {todayClasses.length ? <div /> : <EmptyPanel icon="calendar" title="No classes scheduled" text="When your timetable is available, today’s classes will appear here." />}
        </section>
      </div>
    </div>
  )
}

export default TeacherDashboard
