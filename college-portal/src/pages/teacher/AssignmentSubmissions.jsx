import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Icon from '../../components/Icon'
import { apiFetch } from '../../utils/api'

const statusStyles = { Submitted: 'bg-brand-50 text-brand-700', Pending: 'bg-slate-100 text-slate-600', Late: 'bg-amber-50 text-amber-700', Reviewed: 'bg-emerald-50 text-emerald-700' }

function AssignmentSubmissions() {
  const { assignmentId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [reviewing, setReviewing] = useState(null)
  const [review, setReview] = useState({ marks: '', feedback: '' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setError('')
    try { setData(await apiFetch(`/teacher/assignments/${assignmentId}/submissions`)) } catch (requestError) { setError(requestError.message) }
  }
  useEffect(() => { load() }, [assignmentId])
  const openReview = (submission) => { setReviewing(submission); setReview({ marks: submission.marks ?? '', feedback: submission.feedback || '' }) }
  const submitReview = async (event) => {
    event.preventDefault(); setSaving(true); setError('')
    try { await apiFetch(`/teacher/submissions/${reviewing.submissionId}`, { method: 'PUT', body: JSON.stringify(review) }); setReviewing(null); await load() } catch (requestError) { setError(requestError.message) } finally { setSaving(false) }
  }

  if (error && !data) return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>
  if (!data) return <div className="grid min-h-96 place-items-center text-sm text-muted">Loading assignment submissions…</div>
  const { assignment, submissions } = data
  const reviewed = submissions.filter((submission) => submission.status === 'Reviewed').length
  return <div>
    <button onClick={() => navigate('/teacher/assignments')} className="flex items-center gap-2 text-sm font-semibold text-brand-600"><span className="rotate-180"><Icon name="arrow" className="h-4 w-4" /></span>Back to assignments</button>
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${assignment.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{assignment.isPublished ? 'Published' : 'Draft'}</span><h1 className="mt-3 text-2xl font-bold tracking-tight text-ink">{assignment.title}</h1><p className="mt-2 text-sm text-muted">{assignment.code} · Semester {assignment.semester} · {assignment.field} · Deadline {assignment.deadline}</p></div><div className="rounded-xl bg-brand-50 px-4 py-3 text-center"><p className="text-xs text-brand-700">Reviewed</p><p className="mt-1 text-xl font-bold text-brand-700">{reviewed}/{submissions.length}</p></div></div></div>
    {error && <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
    <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="min-w-[970px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-muted"><tr><th className="px-6 py-4">Student</th><th className="px-6 py-4">Roll number</th><th className="px-6 py-4">Submitted</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Marks</th><th className="px-6 py-4" /></tr></thead><tbody className="divide-y divide-slate-100">{submissions.length ? submissions.map((submission) => <tr key={submission.studentId}><td className="px-6 py-4 font-semibold text-slate-800">{submission.name}</td><td className="px-6 py-4 text-slate-600">{submission.rollNo || '—'}</td><td className="px-6 py-4 text-slate-600">{submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : '—'}</td><td className="px-6 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[submission.status]}`}>{submission.status}</span></td><td className="px-6 py-4 text-slate-700">{submission.marks === null ? '—' : `${submission.marks}/${assignment.maximumMarks}`}</td><td className="px-6 py-4 text-right">{submission.attachmentUrl && <a href={submission.attachmentUrl} target="_blank" rel="noreferrer" className="mr-4 text-xs font-semibold text-brand-600">Open</a>}{submission.submissionId && <button onClick={() => openReview(submission)} className="text-xs font-semibold text-emerald-700">{submission.status === 'Reviewed' ? 'Edit review' : 'Review'}</button>}</td></tr>) : <tr><td colSpan="6" className="px-6 py-14 text-center text-muted">No students are enrolled in this Semester + Field.</td></tr>}</tbody></table></div></section>
    {reviewing && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-4"><section className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><h2 className="font-bold text-ink">Review submission</h2><p className="mt-1 text-xs text-muted">{reviewing.name} · maximum {assignment.maximumMarks} marks</p></div><button onClick={() => setReviewing(null)} aria-label="Close review" className="rounded-lg p-1 text-slate-500"><Icon name="close" /></button></div><form onSubmit={submitReview} className="mt-6 space-y-4"><label className="block"><span className="text-sm font-semibold text-slate-700">Marks</span><input required min="0" max={assignment.maximumMarks} step="0.01" type="number" value={review.marks} onChange={(event) => setReview({ ...review, marks: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-500" /></label><label className="block"><span className="text-sm font-semibold text-slate-700">Feedback</span><textarea rows="4" maxLength="3000" value={review.feedback} onChange={(event) => setReview({ ...review, feedback: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-500" /></label><button disabled={saving} className="w-full rounded-xl bg-brand-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{saving ? 'Saving…' : 'Save review'}</button></form></section></div>}
  </div>
}

export default AssignmentSubmissions
