import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../components/Icon'
import { apiFetch } from '../../utils/api'

const inputStyle = 'mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100'

function TeacherSettings() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState(null)
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  useEffect(() => { let active = true; apiFetch('/teacher/settings').then((data) => active && setSettings(data)).catch((requestError) => active && setError(requestError.message)); return () => { active = false } }, [])
  const save = async (event) => {
    event.preventDefault(); setSaving(true); setError(''); setMessage('')
    try { const data = await apiFetch('/teacher/settings', { method: 'PUT', body: JSON.stringify(settings) }); setSettings(data.settings); const user = JSON.parse(localStorage.getItem('user') || '{}'); localStorage.setItem('user', JSON.stringify({ ...user, name: data.settings.name, email: data.settings.email })); setMessage(data.message) } catch (requestError) { setError(requestError.message) } finally { setSaving(false) }
  }
  const changePassword = async (event) => {
    event.preventDefault(); setError(''); setMessage(''); if (passwords.newPassword !== passwords.confirmPassword) { setError('New passwords do not match'); return }
    setPasswordSaving(true)
    try { const data = await apiFetch('/teacher/profile/password', { method: 'PUT', body: JSON.stringify({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword }) }); setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' }); setMessage(data.message) } catch (requestError) { setError(requestError.message) } finally { setPasswordSaving(false) }
  }
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login', { replace: true }) }
  if (error && !settings) return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>
  if (!settings) return <div className="grid min-h-96 place-items-center text-sm text-muted">Loading settings…</div>
  return <div>
    <div><p className="text-sm font-semibold text-brand-600">ACCOUNT</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">Settings</h1><p className="mt-2 text-sm text-muted">Manage your account, security, notification preference, and session.</p></div>
    {message && <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}{error && <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
    <div className="mt-8 grid gap-6 xl:grid-cols-5"><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-3"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700"><Icon name="user" /></span><div><h2 className="font-bold text-ink">Account</h2><p className="mt-1 text-xs text-muted">Your primary account details.</p></div></div><form onSubmit={save} className="mt-6 grid gap-5 sm:grid-cols-2"><label><span className="text-sm font-semibold text-slate-700">Name</span><input required value={settings.name} onChange={(event) => setSettings({ ...settings, name: event.target.value })} className={inputStyle} /></label><label><span className="text-sm font-semibold text-slate-700">Email</span><input required type="email" value={settings.email} onChange={(event) => setSettings({ ...settings, email: event.target.value })} className={inputStyle} /></label><label><span className="text-sm font-semibold text-slate-700">Phone</span><input type="tel" value={settings.phone} onChange={(event) => setSettings({ ...settings, phone: event.target.value })} className={inputStyle} /></label><label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:mt-6"><span><span className="block text-sm font-semibold text-slate-700">Notifications</span><span className="mt-1 block text-xs text-muted">Receive teacher account notifications.</span></span><input checked={settings.notificationsEnabled} onChange={(event) => setSettings({ ...settings, notificationsEnabled: event.target.checked })} type="checkbox" className="h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500" /></label><div className="flex justify-end sm:col-span-2"><button disabled={saving} className="rounded-xl bg-brand-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{saving ? 'Saving…' : 'Save settings'}</button></div></form></section><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2"><h2 className="font-bold text-ink">Change password</h2><p className="mt-1 text-xs text-muted">Use at least 8 characters.</p><form onSubmit={changePassword} className="mt-5 space-y-4">{[['currentPassword', 'Current password'], ['newPassword', 'New password'], ['confirmPassword', 'Confirm new password']].map(([name, label]) => <label key={name} className="block"><span className="text-sm font-semibold text-slate-700">{label}</span><input required type="password" value={passwords[name]} onChange={(event) => setPasswords({ ...passwords, [name]: event.target.value })} className={inputStyle} /></label>)}<button disabled={passwordSaving} className="w-full rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-bold text-brand-700 disabled:opacity-60">{passwordSaving ? 'Updating…' : 'Update password'}</button></form></section></div>
    <section className="mt-6 rounded-2xl border border-rose-200 bg-white p-6 shadow-sm"><h2 className="font-bold text-ink">Session</h2><p className="mt-1 text-sm text-muted">Sign out securely from this browser.</p><button onClick={logout} className="mt-5 rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-700">Log out</button></section>
  </div>
}

export default TeacherSettings
