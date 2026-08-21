import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Icon from '../../components/Icon'
import { apiFetch } from '../../utils/api'

function DetailCard({ label, value }) {
  return <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p><p className="mt-1.5 text-sm font-semibold text-slate-800">{value}</p></div>
}

function TeacherSubjectDetails() {
  const { subjectId } = useParams()
  const navigate = useNavigate()
  const [subject, setSubject] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    apiFetch(`/teacher/subjects/${subjectId}`)
      .then((data) => active && setSubject(data))
      .catch((requestError) => active && setError(requestError.message))
    return () => { active = false }
  }, [subjectId])

  if (error) return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>
  if (!subject) return <div className="grid min-h-96 place-items-center text-sm text-muted">Loading subject details…</div>

  return (
    <div>
      <button onClick={() => navigate('/teacher/subjects')} className="flex items-center gap-2 text-sm font-semibold text-brand-600"><span className="rotate-180"><Icon name="arrow" className="h-4 w-4" /></span>Back to my subjects</button>
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-brand-700 to-brand-600 px-6 py-8 text-white"><p className="text-xs font-bold tracking-[.16em] text-blue-200">SUBJECT OVERVIEW</p><h1 className="mt-2 text-3xl font-bold tracking-tight">{subject.name}</h1><p className="mt-2 text-sm text-blue-100">{subject.code} · Semester {subject.semester} · {subject.field}</p></div>
        <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4"><DetailCard label="Subject code" value={subject.code} /><DetailCard label="Semester" value={`Semester ${subject.semester}`} /><DetailCard label="Field" value={subject.field} /><DetailCard label="Total students" value={subject.students} /></div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-3"><h2 className="font-bold text-ink">Teaching assignment</h2><dl className="mt-5 grid gap-4 sm:grid-cols-2"><DetailCard label="Assigned teacher" value={subject.teacher.name} /><DetailCard label="Department" value={subject.teacher.department || 'Not assigned'} /></dl></section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2"><h2 className="font-bold text-ink">Teaching tools</h2><p className="mt-2 text-sm leading-6 text-muted">Attendance, marks, students, and assignments will use this authorised subject assignment as their shared source of access.</p><div className="mt-5 flex flex-wrap gap-2">{['Students', 'Attendance', 'Sessional Marks', 'Assignments'].map((tool) => <span key={tool} className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700">{tool}</span>)}</div></section>
      </div>
    </div>
  )
}

export default TeacherSubjectDetails
