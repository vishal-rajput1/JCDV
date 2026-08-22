import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from './Icon'
import { useAuthStore } from '../store/authStore'

function Header() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  // ===============================
  // CURRENT DATE
  // ===============================

  const today = new Date()

  const formattedDate = today.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

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
  // CLOSE PROFILE MENU
  // ===============================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setShowMenu(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      )
    }
  }, [])

  // ===============================
  // LOGOUT
  // ===============================

  const handleLogout = () => {
    setShowMenu(false)
    logout()
    navigate('/login', { replace: true })
  }

  // ===============================
  // PROFILE
  // ===============================

  const handleProfile = () => {
    setShowMenu(false)

    if (user?.role === 'student') {
      navigate('/student/')
    }

    if (user?.role === 'teacher') {
      navigate('/teacher/profile')
    }

    if (user?.role === 'admin') {
      navigate('/admin/dashboard')
    }
  }

  // ===============================
  // NOTIFICATIONS
  // ===============================

  const handleNotifications = () => {
    if (user?.role === 'student') {
      navigate('/student/announcements')
    }

    if (user?.role === 'teacher') {
      navigate('/teacher/notifications')
    }

    if (user?.role === 'admin') {
      navigate('/admin/dashboard')
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur lg:px-10">

      {/* ===============================
          DATE
      =============================== */}

      <div className="hidden lg:block">

        <p className="text-sm font-medium text-slate-600">
          {formattedDate}
        </p>

        <p className="mt-0.5 text-xs text-slate-400">
          College Management Portal
        </p>

      </div>


      {/* ===============================
          RIGHT SIDE
      =============================== */}

      <div className="ml-auto flex items-center gap-3">

        {/* Notification */}

        <button
          type="button"
          onClick={handleNotifications}
          aria-label="Notifications"
          className="relative grid h-10 w-10 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-brand-700"
        >

          <Icon name="bell" />

          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />

        </button>


        {/* Divider */}

        <div className="hidden h-8 w-px bg-slate-200 sm:block" />


        {/* ===============================
            PROFILE
        =============================== */}

        <div
          ref={menuRef}
          className="relative"
        >

          <button
            type="button"
            onClick={() => setShowMenu((value) => !value)}
            className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-slate-50"
          >

            {/* Avatar */}

            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 ring-2 ring-white">
              {getInitials(user?.name)}
            </div>


            {/* User Info */}

            <div className="hidden text-left sm:block">

              <p className="max-w-[150px] truncate text-sm font-semibold text-slate-800">
                {user?.name || 'User'}
              </p>

              <p className="text-xs capitalize text-slate-500">
                {user?.role || 'Account'}
              </p>

            </div>


            {/* Arrow */}

            <svg
              className={`hidden h-4 w-4 text-slate-400 transition sm:block ${
                showMenu ? 'rotate-180' : ''
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>

          </button>


          {/* ===============================
              PROFILE DROPDOWN
          =============================== */}

          {showMenu && (

            <div className="absolute right-0 top-14 z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">

              {/* User */}

              <div className="border-b border-slate-100 px-4 py-4">

                <div className="flex items-center gap-3">

                  <div className="grid h-11 w-11 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                    {getInitials(user?.name)}
                  </div>

                  <div className="min-w-0">

                    <p className="truncate text-sm font-bold text-slate-900">
                      {user?.name || 'User'}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {user?.email || ''}
                    </p>

                  </div>

                </div>

              </div>


              {/* Menu */}

              <div className="p-2">

                <button
                  type="button"
                  onClick={handleProfile}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-brand-700"
                >

                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100">
                    <Icon name="user" />
                  </span>

                  My Profile

                </button>


                <button
                  type="button"
                  onClick={handleNotifications}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-brand-700"
                >

                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100">
                    <Icon name="bell" />
                  </span>

                  Notifications

                </button>

              </div>


              {/* Logout */}

              <div className="border-t border-slate-100 p-2">

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                >

                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-rose-50">
                    ↪
                  </span>

                  Logout

                </button>

              </div>

            </div>

          )}

        </div>

      </div>

    </header>
  )
}

export default Header