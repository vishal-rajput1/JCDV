import { useEffect, useState } from 'react'
import Icon from '../../components/Icon'
import { apiFetch } from '../../utils/api'

const inputStyle = 'mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100'

function TeacherProfile() {
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState(null)
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)

  useEffect(() => {
    let active = true
    apiFetch('/teacher/profile')
      .then((data) => {
        if (!active) return
        setProfile(data)
        setForm({
          name: data.name || '', email: data.email || '', phone: data.phone || '',
          designation: data.designation || '', qualification: data.qualification || '',
        })
      })
      .catch((requestError) => active && setError(requestError.message))
    return () => { active = false }
  }, [])

  const updateForm = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  const saveProfile = async (event) => {
    event.preventDefault()
    setSaving(true); setError(''); setMessage('')
    try {
      const data = await apiFetch('/teacher/profile', { method: 'PUT', body: JSON.stringify(form) })
      setProfile(data.teacher)
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}')
      localStorage.setItem('user', JSON.stringify({ ...savedUser, name: data.teacher.name, email: data.teacher.email }))
      setMessage(data.message)
    } catch (requestError) { setError(requestError.message) } finally { setSaving(false) }
  }

  const changePassword = async (event) => {
    event.preventDefault()
    setError(''); setMessage('')
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New passwords do not match')
      return
    }
    setPasswordSaving(true)
    try {
      const data = await apiFetch('/teacher/profile/password', {
        method: 'PUT', body: JSON.stringify({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword }),
      })
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setMessage(data.message)
    } catch (requestError) { setError(requestError.message) } finally { setPasswordSaving(false) }
  }

  if (error && !profile) return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>
  if (!profile || !form) return <div className="grid min-h-96 place-items-center text-sm text-muted">Loading your profile…</div>

  const initials = profile.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div>
      <p className="text-sm font-semibold text-brand-600">ACCOUNT</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">My Profile</h1>
      <p className="mt-2 text-sm text-muted">Keep your contact and professional information current.</p>
      {message && <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
      {error && <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="mt-8 grid gap-6 xl:grid-cols-5">
        <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="grid h-20 w-20 place-items-center rounded-2xl bg-brand-100 text-xl font-bold text-brand-700">{initials}</div>
          <h2 className="mt-4 text-xl font-bold text-ink">{profile.name}</h2>
          <p className="mt-1 text-sm text-muted">{profile.designation || 'Teacher'}</p>
          <dl className="mt-6 space-y-4 border-t border-slate-100 pt-5 text-sm">
            <div><dt className="text-xs font-medium uppercase tracking-wide text-muted">Employee ID</dt><dd className="mt-1 font-semibold text-slate-700">{profile.employeeId || 'Not assigned'}</dd></div>
            <div><dt className="text-xs font-medium uppercase tracking-wide text-muted">Department</dt><dd className="mt-1 font-semibold text-slate-700">{profile.department || 'Not assigned'}</dd></div>
            <div><dt className="text-xs font-medium uppercase tracking-wide text-muted">Field</dt><dd className="mt-1 font-semibold text-slate-700">{profile.field || 'Not assigned'}</dd></div>
          </dl>
        </aside>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-3">
          <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-700"><Icon name="user" /></span><div><h2 className="font-bold text-ink">Personal information</h2><p className="mt-0.5 text-xs text-muted">Fields marked here are visible only to authorised portal users.</p></div></div>
          <form onSubmit={saveProfile} className="mt-6 grid gap-5 sm:grid-cols-2">
            {[['name', 'Full name', 'text'], ['email', 'Email address', 'email'], ['phone', 'Phone number', 'tel'], ['designation', 'Designation', 'text'], ['qualification', 'Qualification', 'text']].map(([name, label, type]) => <label key={name} className={name === 'qualification' ? 'sm:col-span-2' : ''}><span className="text-sm font-semibold text-slate-700">{label}</span><input required={name === 'name' || name === 'email'} name={name} type={type} value={form[name]} onChange={updateForm} className={inputStyle} /></label>)}
            <div className="flex justify-end sm:col-span-2"><button disabled={saving} className="rounded-xl bg-brand-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-60">{saving ? 'Saving…' : 'Save changes'}</button></div>
          </form>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-3"><div className="border-b border-slate-100 px-6 py-5"><h2 className="font-bold text-ink">Assigned subjects</h2><p className="mt-1 text-xs text-muted">Managed by your administrator.</p></div>{profile.assignedSubjects?.length ? <div className="divide-y divide-slate-100">{profile.assignedSubjects.map((subject) => <div key={`${subject.code}-${subject.semester}-${subject.field}`} className="px-6 py-4"><p className="text-sm font-semibold text-slate-800">{subject.name}</p><p className="mt-1 text-xs text-muted">{subject.code} · Semester {subject.semester} · {subject.field}</p></div>)}</div> : <p className="px-6 py-10 text-center text-sm text-muted">No subjects have been assigned yet.</p>}</section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2"><h2 className="font-bold text-ink">Change password</h2><p className="mt-1 text-xs text-muted">Use at least 8 characters.</p><form onSubmit={changePassword} className="mt-5 space-y-4">{[['currentPassword', 'Current password'], ['newPassword', 'New password'], ['confirmPassword', 'Confirm new password']].map(([name, label]) => <label key={name} className="block"><span className="text-sm font-semibold text-slate-700">{label}</span><input required name={name} type="password" value={passwords[name]} onChange={(event) => setPasswords({ ...passwords, [name]: event.target.value })} className={inputStyle} /></label>)}<button disabled={passwordSaving} className="w-full rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-bold text-brand-700 transition hover:bg-brand-100 disabled:opacity-60">{passwordSaving ? 'Updating…' : 'Update password'}</button></form></section>
      </div>
    </div>
  )
}

export default TeacherProfile
