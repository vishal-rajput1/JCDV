import { NavLink, useNavigate } from 'react-router-dom'
import Icon from './Icon'
import { useAuthStore } from '../store/authStore'

const navigationGroups = [
  {
    label: 'Overview',
    items: [
      ['Dashboard', '/admin/dashboard', 'grid'],
    ],
  },
  {
    label: 'Academic',
    items: [
      ['Academic Setup', '/admin/academic-setup', 'book'],
      ['Students', '/admin/students', 'users'],
      ['Teachers', '/admin/teachers', 'user'],
      ['Subjects', '/admin/subjects', 'book'],
      ['Timetable', '/admin/timetable', 'calendar'],
    ],
  },
  {
    label: 'Communication',
    items: [
      ['Announcements', '/admin/announcements', 'bell'],
      ['Notifications', '/admin/notifications', 'bell'],
      ['Requests', '/admin/requests', 'book'],
    ],
  },
  {
    label: 'Account',
    items: [
      ['Settings', '/admin/settings', 'grid'],
    ],
  },
]

function NavItem({ label, path, icon }) {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
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
  )
}

function AdminSidebar() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const getInitials = (name) => {
    if (!name) return 'AD'

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase()
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col bg-brand-700 px-5 py-7 text-white lg:flex">

      {/* Logo */}

      <div className="mb-10 flex items-center gap-3 px-2">

        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-lg font-black text-brand-700 shadow-lg">
          C
        </div>

        <div className="min-w-0">
          <p className="truncate font-bold tracking-tight">
            College Portal
          </p>

          <p className="truncate text-xs text-blue-200">
            Administration system
          </p>
        </div>

      </div>


      {/* Portal label */}

      <div className="mb-3 flex items-center justify-between px-3">

        <p className="text-[10px] font-bold tracking-[.16em] text-blue-300">
          ADMIN PORTAL
        </p>

        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-semibold text-blue-200">
          ADMIN
        </span>

      </div>


      {/* Navigation */}

      <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">

        {navigationGroups.map((group) => (
          <div key={group.label}>

            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-blue-300">
              {group.label}
            </p>

            <div className="space-y-1">

              {group.items.map(([label, path, icon]) => (
                <NavItem
                  key={label}
                  label={label}
                  path={path}
                  icon={icon}
                />
              ))}

            </div>

          </div>
        ))}

      </nav>


      {/* Admin workspace */}

      <div className="mt-5 rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">

        <p className="text-xs font-semibold">
          Administration workspace
        </p>

        <p className="mt-1 text-xs leading-5 text-blue-200">
          Manage students, teachers and academic configuration.
        </p>

      </div>


      {/* User */}

      <div className="mt-4 border-t border-white/10 pt-4">

        <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">

          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-xs font-bold text-brand-700">
            {getInitials(user?.name)}
          </div>

          <div className="min-w-0 flex-1">

            <p className="truncate text-sm font-semibold">
              {user?.name || 'Administrator'}
            </p>

            <p className="truncate text-xs capitalize text-blue-200">
              {user?.role || 'Admin'}
            </p>

          </div>

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
  )
}

export default AdminSidebar