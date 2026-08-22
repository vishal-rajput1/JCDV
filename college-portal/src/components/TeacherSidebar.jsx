import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import Icon from './Icon'
import { useAuthStore } from '../store/authStore'

const navigationGroups = [
  {
    label: 'Academic',
    items: [
      ['My Subjects', '/teacher/subjects', 'book'],
      ['Students', '/teacher/students', 'users'],
      ['Timetable', '/teacher/timetable', 'calendar'],
    ],
  },
  {
    label: 'Teaching',
    items: [
      ['Attendance', '/teacher/attendance', 'calendar'],
      ['Sessional Marks', '/teacher/marks', 'chart'],
      ['Assignments', '/teacher/assignments', 'book'],
    ],
  },
  {
    label: 'Communication',
    items: [
      ['Announcements', '/teacher/announcements', 'bell'],
      ['Notifications', '/teacher/notifications', 'bell'],
      ['Requests', '/teacher/requests', 'book'],
    ],
  },
  {
    label: 'Account',
    items: [
      ['My Profile', '/teacher/profile', 'user'],
      ['Settings', '/teacher/settings', 'grid'],
    ],
  },
]

function NavItem({ label, path, icon, onClick }) {
  return (
    <NavLink
      to={path}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
          isActive
            ? 'bg-white text-brand-700 shadow-sm'
            : 'text-blue-100 hover:bg-white/10 hover:text-white'
        }`
      }
    >
      <Icon name={icon} />
      <span>{label}</span>
    </NavLink>
  )
}

function TeacherSidebar() {
  const [open, setOpen] = useState(false)

  const { user, logout } = useAuthStore()

  const teacherName = user?.name || 'Teacher'
  const employeeId = user?.employeeId || 'Teacher Account'

  const initials = teacherName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const closeSidebar = () => {
    setOpen(false)
  }

  const handleLogout = () => {
    logout()
    setOpen(false)
    window.location.href = '/login'
  }

  return (
    <>
      {/* ================================
          MOBILE MENU BUTTON
      ================================= */}

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open teacher navigation"
        className="fixed left-4 top-4 z-50 grid h-11 w-11 place-items-center rounded-xl bg-brand-700 text-white shadow-lg lg:hidden"
      >
        <Icon name="menu" />
      </button>

      {/* ================================
          MOBILE OVERLAY
      ================================= */}

      {open && (
        <button
          type="button"
          onClick={closeSidebar}
          aria-label="Close teacher navigation"
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ================================
          SIDEBAR
      ================================= */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-72 flex-col
          bg-brand-700 px-5 py-7 text-white
          shadow-2xl
          transition-transform duration-300
          lg:translate-x-0 lg:shadow-none
          ${
            open
              ? 'translate-x-0'
              : '-translate-x-full'
          }
        `}
      >

        {/* ================================
            LOGO
        ================================= */}

        <div className="mb-9 flex items-center gap-3 px-2">

          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-lg font-black text-brand-700 shadow-lg">
            C
          </div>

          <div className="min-w-0">

            <p className="truncate font-bold tracking-tight">
              College Portal
            </p>

            <p className="truncate text-xs text-blue-200">
              Teacher management system
            </p>

          </div>

          {/* Mobile Close */}

          <button
            type="button"
            onClick={closeSidebar}
            aria-label="Close sidebar"
            className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-lg text-blue-100 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <Icon name="close" />
          </button>

        </div>


        {/* ================================
            PORTAL LABEL
        ================================= */}

        <p className="mb-3 px-3 text-[10px] font-bold tracking-[.16em] text-blue-300">
          TEACHER PORTAL
        </p>


        {/* ================================
            NAVIGATION
        ================================= */}

        <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">

          {/* Dashboard */}

          <NavItem
            label="Dashboard"
            path="/teacher/dashboard"
            icon="grid"
            onClick={closeSidebar}
          />


          {/* Groups */}

          {navigationGroups.map((group) => (

            <div key={group.label}>

              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-blue-300">
                {group.label}
              </p>

              <div className="space-y-1">

                {group.items.map(
                  ([label, path, icon]) => (

                    <NavItem
                      key={label}
                      label={label}
                      path={path}
                      icon={icon}
                      onClick={closeSidebar}
                    />

                  )
                )}

              </div>

            </div>

          ))}

        </nav>


        {/* ================================
            TEACHER ACCOUNT
        ================================= */}

        <div className="mt-5 rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">

          <div className="flex items-center gap-3">

            {/* Avatar */}

            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-xs font-bold text-brand-700">
              {initials}
            </div>


            {/* Details */}

            <div className="min-w-0 flex-1">

              <p className="truncate text-sm font-semibold">
                {teacherName}
              </p>

              <p className="truncate text-[11px] text-blue-200">
                {employeeId}
              </p>

            </div>

          </div>


          {/* Logout */}

          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-blue-100 transition hover:bg-white hover:text-brand-700"
          >
            <Icon name="logout" />
            Logout
          </button>

        </div>

      </aside>
    </>
  )
}

export default TeacherSidebar