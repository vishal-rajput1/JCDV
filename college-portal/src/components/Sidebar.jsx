import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import Icon from './Icon'
import { useAuthStore } from '../store/authStore'

const nav = [
  ['Dashboard', '/student/', 'grid'],
  ['Attendance', '/student/attendance', 'calendar'],
  ['Sessional Marks', '/student/sessionals', 'chart'],
  ['University Result', '/student/university-result', 'book'],
  ['Assignments', '/student/assignments', 'book'],
  ['Announcements', '/student/announcements', 'bell'],
  ['Requests', '/student/requests', 'book'],
]

function Sidebar() {
  const [open, setOpen] = useState(false)

  const navigate = useNavigate()

  const { user, logout } = useAuthStore()

  // ===============================
  // USER INITIALS
  // ===============================

  const getInitials = (name) => {
    if (!name) return 'U'

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase()
  }

  // ===============================
  // LOGOUT
  // ===============================

  const handleLogout = () => {
    setOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  // ===============================
  // NAVIGATION
  // ===============================

  const handleNavigation = () => {
    setOpen(false)
  }

  return (
    <>
      {/* ===============================
          SIDEBAR
      =============================== */}

      <aside
        className={`${
          open ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-brand-700 px-5 py-7 text-white transition-transform duration-300 lg:translate-x-0`}
      >

        {/* ===============================
            LOGO
        =============================== */}

        <div className="mb-10 flex items-center gap-3 px-2">

          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-lg font-black text-brand-700 shadow-lg">
            C
          </div>

          <div className="min-w-0">

            <p className="truncate font-bold tracking-tight">
              College Portal
            </p>

            <p className="truncate text-xs text-blue-200">
              Student management system
            </p>

          </div>

          {/* Mobile close */}

          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="ml-auto rounded-lg p-2 transition hover:bg-white/10 lg:hidden"
          >
            <Icon name="close" />
          </button>

        </div>


        {/* ===============================
            STUDENT MENU
        =============================== */}

        <div className="mb-3 flex items-center justify-between px-3">

          <p className="text-[10px] font-bold tracking-[.16em] text-blue-300">
            STUDENT MENU
          </p>

          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-semibold text-blue-200">
            PORTAL
          </span>

        </div>


        {/* ===============================
            NAVIGATION
        =============================== */}

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">

          {nav.map(([label, path, icon]) => (

            <NavLink
              key={label}
              to={path}
              end={path === '/student/'}
              onClick={handleNavigation}
              className={({ isActive }) =>
                `group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                  isActive
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`
              }
            >

              {({ isActive }) => (
                <>
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg transition ${
                      isActive
                        ? 'bg-brand-50 text-brand-700'
                        : 'bg-white/5 text-blue-200 group-hover:bg-white/10 group-hover:text-white'
                    }`}
                  >
                    <Icon name={icon} />
                  </span>

                  <span className="truncate">
                    {label}
                  </span>

                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-600" />
                  )}
                </>
              )}

            </NavLink>

          ))}

        </nav>
        {/* ===============================
            USER SECTION
        =============================== */}

        <div className="mt-4 border-t border-white/10 pt-4">

          <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">

            {/* Avatar */}

            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-xs font-bold text-brand-700">
              {getInitials(user?.name)}
            </div>


            {/* User info */}

            <div className="min-w-0 flex-1">

              <p className="truncate text-sm font-semibold">
                {user?.name || 'Student'}
              </p>

              <p className="truncate text-xs capitalize text-blue-200">
                {user?.role || 'Student'}
              </p>

            </div>


            {/* Logout */}

            <button
              type="button"
              onClick={handleLogout}
              aria-label="Logout"
              title="Logout"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-blue-200 transition hover:bg-white/10 hover:text-white"
            >
              ↪
            </button>

          </div>

        </div>

      </aside>


      {/* ===============================
          MOBILE OVERLAY
      =============================== */}

      {open && (
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-[1px] lg:hidden"
          aria-label="Close navigation"
        />
      )}


      {/* ===============================
          MOBILE MENU BUTTON
      =============================== */}

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        className="fixed left-4 top-5 z-50 grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-md transition hover:bg-slate-50 hover:text-brand-700 lg:hidden"
      >
        <Icon name="menu" />
      </button>
    </>
  )
}

export default Sidebar