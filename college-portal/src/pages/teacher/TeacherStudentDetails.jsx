import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Icon from '../../components/Icon'
import { apiFetch } from '../../utils/api'

function TeacherStudentDetails() {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    apiFetch(`/teacher/students/${studentId}`).then((response) => active && setData(response)).catch((requestError) => active && setError(requestError.message))
    return () => { active = false }
  }, [studentId])

  if (error) return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>
  if (!data) return <div className="grid min-h-96 place-items-center text-sm text-muted">Loading student details…</div>

  const { student, summary, attendance, marks } = data
  const initials = student.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()
  return <div>
    <button onClick={() => navigate('/teacher/students')} className="flex items-center gap-2 text-sm font-semibold text-brand-600"><span className="rotate-180"><Icon name="arrow" className="h-4 w-4" /></span>Back to students</button>
    <div className="mt-6 flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center"><div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-100 text-lg font-bold text-brand-700">{initials}</div><div><p className="text-sm font-semibold text-brand-600">STUDENT PROFILE</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">{student.name}</h1><p className="mt-1 text-sm text-muted">{student.rollNo || 'Roll number not assigned'} · Semester {student.semester} · {student.field}</p></div></div>
    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-muted">Attendance</p><p className="mt-2 text-3xl font-bold text-ink">{summary.attendance === null ? '—' : `${summary.attendance}%`}</p><p className="mt-1 text-xs text-muted">Across your assigned subjects</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-muted">Performance</p><p className="mt-2 text-3xl font-bold text-ink">{summary.performance === null ? '—' : `${summary.performance}%`}</p><p className="mt-1 text-xs text-muted">From sessional marks recorded</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-muted">Email</p><p className="mt-2 break-all text-sm font-semibold text-slate-700">{student.email}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-muted">Phone</p><p className="mt-2 text-sm font-semibold text-slate-700">{student.phone || 'Not provided'}</p></div></div>
    <div className="mt-6 grid gap-6 xl:grid-cols-2"><section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-6 py-5"><h2 className="font-bold text-ink">Attendance by subject</h2></div>{attendance.length ? <div className="divide-y divide-slate-100">{attendance.map((record) => <div key={record._id} className="flex items-center justify-between px-6 py-4"><div><p className="text-sm font-semibold text-slate-800">{record.subject}</p><p className="mt-1 text-xs text-muted">{record.present} present of {record.total} classes</p></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">{record.percentage === null ? '—' : `${record.percentage}%`}</span></div>)}</div> : <p className="px-6 py-10 text-center text-sm text-muted">No attendance records for your assigned subjects.</p>}</section><section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-6 py-5"><h2 className="font-bold text-ink">Sessional marks</h2></div>{marks.length ? <div className="overflow-x-auto"><table className="min-w-[590px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-muted"><tr><th className="px-5 py-3">Subject</th><th className="px-3 py-3">S1</th><th className="px-3 py-3">S2</th><th className="px-3 py-3">S3</th><th className="px-3 py-3">Assignment</th></tr></thead><tbody className="divide-y divide-slate-100">{marks.map((record) => <tr key={record._id}><td className="px-5 py-4 font-semibold text-slate-800">{record.subject}</td><td className="px-3 py-4">{record.sessional1}/{record.sessional1Max}</td><td className="px-3 py-4">{record.sessional2}/{record.sessional2Max}</td><td className="px-3 py-4">{record.sessional3}/{record.sessional3Max}</td><td className="px-3 py-4">{record.assignment}/{record.assignmentMax}</td></tr>)}</tbody></table></div> : <p className="px-6 py-10 text-center text-sm text-muted">No sessional marks for your assigned subjects.</p>}</section></div>
  </div>
}

export default TeacherStudentDetails
