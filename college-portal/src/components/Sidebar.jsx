import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import Icon from './Icon'

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

  return (
    <>
      <aside
        className={`${
          open ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-brand-700 px-5 py-7 text-white transition-transform duration-300 lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="mb-12 flex items-center gap-3 px-2">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-lg font-black text-brand-700 shadow-lg">
            C
          </div>

          <div>
            <p className="font-bold tracking-tight">
              College Portal
            </p>

            <p className="text-xs text-blue-200">
              Student management system
            </p>
          </div>

          <button
            className="ml-auto lg:hidden"
            onClick={() => setOpen(false)}
          >
            <Icon name="close" />
          </button>
        </div>

        {/* Menu */}
        <p className="mb-3 px-3 text-[10px] font-bold tracking-[.16em] text-blue-300">
          STUDENT MENU
        </p>

        <nav className="space-y-1">
          {nav.map(([label, path, icon]) => (
            <NavLink
              key={label}
              to={path}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                  isActive
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon name={icon} />

              {label}
            </NavLink>
          ))}
        </nav>

        {/* Help */}
        <div className="mt-auto rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
          <p className="text-xs font-semibold">
            Need help?
          </p>

          <p className="mt-1 text-xs leading-5 text-blue-200">
            Contact your department coordinator.
          </p>

          <button className="mt-3 text-xs font-bold underline underline-offset-4">
            Get support
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <button
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"
          aria-label="Close navigation"
        />
      )}

      {/* Mobile menu button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-5 z-50 rounded-lg bg-white p-2 text-slate-600 shadow lg:hidden"
      >
        <Icon name="menu" />
      </button>
    </>
  )
}

export default Sidebar
