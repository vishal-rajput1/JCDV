import { NavLink } from 'react-router-dom'
import Icon from './Icon'

const navigation = [
  ['Dashboard', '/teacher/dashboard', 'grid'],
  ['My Subjects', '/teacher/subjects', 'book'],
  ['Students', '/teacher/students', 'users'],
  ['Timetable', '/teacher/timetable', 'calendar'],
  ['Announcements', '/teacher/announcements', 'bell'],
  ['Attendance', '/teacher/attendance', 'calendar'],
  ['Sessional Marks', '/teacher/marks', 'chart'],
  ['My Profile', '/teacher/profile', 'user'],
]

function TeacherSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col bg-brand-700 px-5 py-7 text-white lg:flex">
      <div className="mb-12 flex items-center gap-3 px-2">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-lg font-black text-brand-700 shadow-lg">C</div>
        <div>
          <p className="font-bold tracking-tight">College Portal</p>
          <p className="text-xs text-blue-200">Teacher management system</p>
        </div>
      </div>

      <p className="mb-3 px-3 text-[10px] font-bold tracking-[.16em] text-blue-300">TEACHER PORTAL</p>
      <nav className="space-y-1">
        {navigation.map(([label, path, icon]) => (
          <NavLink
            key={label}
            to={path}
            className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
              isActive ? 'bg-white text-brand-700 shadow-sm' : 'text-blue-100 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon name={icon} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
        <p className="text-xs font-semibold">Teacher workspace</p>
        <p className="mt-1 text-xs leading-5 text-blue-200">Manage only your assigned subjects and students.</p>
      </div>
    </aside>
  )
}

export default TeacherSidebar
