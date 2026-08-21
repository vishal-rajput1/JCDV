import { useEffect, useState } from 'react'
import Icon from '../../components/Icon'
import { apiFetch } from '../../utils/api'

const typeLabels = { attendance_correction: 'Attendance correction', assignment_extension: 'Assignment extension', academic: 'Academic request' }
const statusStyles = { Pending: 'bg-amber-50 text-amber-700', Approved: 'bg-emerald-50 text-emerald-700', Rejected: 'bg-rose-50 text-rose-700' }

function TeacherRequests() {
  const [requests, setRequests] = useState([])
  const [filters, setFilters] = useState({ status: '', type: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reviewing, setReviewing] = useState(null)
  const [review, setReview] = useState({ status: 'Approved', teacherNote: '' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true); setError('')
    try { const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value)); setRequests(await apiFetch(`/teacher/requests${params.size ? `?${params}` : ''}`)) } catch (requestError) { setError(requestError.message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [filters])
  const openReview = (request) => { setReviewing(request); setReview({ status: request.status === 'Rejected' ? 'Rejected' : 'Approved', teacherNote: request.teacherNote || '' }) }
  const submitReview = async (event) => {
    event.preventDefault(); setSaving(true); setError('')
    try { await apiFetch(`/teacher/requests/${reviewing.id}`, { method: 'PUT', body: JSON.stringify(review) }); setReviewing(null); await load() } catch (requestError) { setError(requestError.message) } finally { setSaving(false) }
  }
  const pending = requests.filter((request) => request.status === 'Pending').length
  return <div>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-brand-600">COMMUNICATION</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">Requests</h1><p className="mt-2 text-sm text-muted">Review requests from students in your authorised Semester + Field groups.</p></div>{pending ? <span className="w-fit rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">{pending} pending</span> : null}</div>
    {error && <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="grid gap-3 sm:grid-cols-2"><select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-500"><option value="">All statuses</option>{['Pending', 'Approved', 'Rejected'].map((status) => <option key={status} value={status}>{status}</option>)}</select><select value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value })} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-500"><option value="">All request types</option>{Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div></section>
    <section className="mt-6 space-y-4">{loading ? <div className="grid min-h-48 place-items-center text-sm text-muted">Loading student requests…</div> : requests.length ? requests.map((request) => <article key={request.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[request.status]}`}>{request.status}</span><span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700">{typeLabels[request.type]}</span></div><h2 className="mt-3 text-lg font-bold text-ink">{request.title}</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{request.details}</p><div className="mt-4 grid gap-1 text-xs text-muted sm:grid-cols-2"><p><span className="font-semibold text-slate-700">Student:</span> {request.student?.name || 'Removed student'} {request.student?.rollNo ? `(${request.student.rollNo})` : ''}</p><p><span className="font-semibold text-slate-700">Scope:</span> Semester {request.semester} · {request.field}{request.subject ? ` · ${request.subject}` : ''}</p><p><span className="font-semibold text-slate-700">Requested:</span> {new Date(request.createdAt).toLocaleString()}</p>{request.teacherNote && <p><span className="font-semibold text-slate-700">Your note:</span> {request.teacherNote}</p>}</div></div><button onClick={() => openReview(request)} className="shrink-0 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-bold text-brand-700">{request.status === 'Pending' ? 'Review' : 'Update decision'}</button></div></article>) : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-500"><Icon name="bell" /></span><p className="mt-4 font-semibold text-slate-700">No requests found</p><p className="mt-1 text-sm text-muted">Student requests will appear here once submitted.</p></div>}</section>
    {reviewing && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-4"><section className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><h2 className="font-bold text-ink">Review request</h2><p className="mt-1 text-xs text-muted">{reviewing.student?.name || 'Student'} · {reviewing.title}</p></div><button onClick={() => setReviewing(null)} aria-label="Close review" className="rounded-lg p-1 text-slate-500"><Icon name="close" /></button></div><form onSubmit={submitReview} className="mt-6 space-y-4"><label className="block"><span className="text-sm font-semibold text-slate-700">Decision</span><select value={review.status} onChange={(event) => setReview({ ...review, status: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-500"><option value="Approved">Approve</option><option value="Rejected">Reject</option></select></label><label className="block"><span className="text-sm font-semibold text-slate-700">Note to student <span className="font-normal text-muted">(optional)</span></span><textarea rows="4" maxLength="2000" value={review.teacherNote} onChange={(event) => setReview({ ...review, teacherNote: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-500" /></label><button disabled={saving} className="w-full rounded-xl bg-brand-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{saving ? 'Saving…' : 'Save decision'}</button></form></section></div>}
  </div>
}

export default TeacherRequests
