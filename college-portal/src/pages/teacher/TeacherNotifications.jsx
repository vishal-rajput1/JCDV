import { useEffect, useState } from 'react'
import Icon from '../../components/Icon'
import { apiFetch } from '../../utils/api'

const typeLabels = { assignment_submission: 'Assignment submission', student_request: 'Student request', admin_announcement: 'Admin announcement', attendance: 'Attendance', schedule_change: 'Schedule change', system: 'System' }

function TeacherNotifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)
  const load = async () => {
    setLoading(true); setError('')
    try { setNotifications(await apiFetch('/teacher/notifications')) } catch (requestError) { setError(requestError.message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  const markRead = async (notificationId) => {
    setUpdating(true); setError('')
    try { await apiFetch(`/teacher/notifications/${notificationId}/read`, { method: 'PUT' }); setNotifications((items) => items.map((item) => item.id === notificationId ? { ...item, isRead: true } : item)) } catch (requestError) { setError(requestError.message) } finally { setUpdating(false) }
  }
  const markAllRead = async () => {
    setUpdating(true); setError('')
    try { await apiFetch('/teacher/notifications/read-all', { method: 'PUT' }); setNotifications((items) => items.map((item) => ({ ...item, isRead: true }))) } catch (requestError) { setError(requestError.message) } finally { setUpdating(false) }
  }
  const unread = notifications.filter((notification) => !notification.isRead).length
  return <div>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-brand-600">COMMUNICATION</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">Notifications</h1><p className="mt-2 text-sm text-muted">Updates and alerts delivered to your teacher account.</p></div><button disabled={!unread || updating} onClick={markAllRead} className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-bold text-brand-700 disabled:cursor-not-allowed disabled:opacity-50">Mark all as read</button></div>
    {error && <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
    <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-6 py-5"><h2 className="font-bold text-ink">Inbox {unread ? <span className="ml-2 rounded-full bg-rose-50 px-2 py-0.5 text-xs text-rose-700">{unread} unread</span> : ''}</h2></div>{loading ? <div className="grid min-h-64 place-items-center text-sm text-muted">Loading notifications…</div> : notifications.length ? <div className="divide-y divide-slate-100">{notifications.map((notification) => <article key={notification.id} className={`flex gap-4 px-6 py-5 ${notification.isRead ? 'bg-white' : 'bg-brand-50/40'}`}><span className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl ${notification.isRead ? 'bg-slate-100 text-slate-500' : 'bg-brand-100 text-brand-700'}`}><Icon name="bell" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-bold text-slate-800">{notification.title}</h3><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">{typeLabels[notification.type]}</span></div><p className="mt-1 text-sm leading-6 text-slate-600">{notification.message}</p><p className="mt-2 text-xs text-muted">{new Date(notification.createdAt).toLocaleString()}</p></div>{!notification.isRead && <button disabled={updating} onClick={() => markRead(notification.id)} className="self-start whitespace-nowrap text-xs font-semibold text-brand-600 disabled:opacity-50">Mark as read</button>}</article>)}</div> : <div className="grid min-h-64 place-items-center px-6 text-center"><div><span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-500"><Icon name="bell" /></span><p className="mt-4 font-semibold text-slate-700">You’re all caught up</p><p className="mt-1 text-sm text-muted">New assignment submissions, requests, schedule updates, and system notices will appear here.</p></div></div>}</section>
  </div>
}

export default TeacherNotifications
