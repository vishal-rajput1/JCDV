import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setAuth } from '../store/authStore'

function Login() {
  const navigate = useNavigate()

  const [role, setRole] = useState('student')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const roles = [
    {
      id: 'student',
      title: 'Student',
      subtitle: 'Attendance & Marks',
      icon: '🎓',
    },
    {
      id: 'teacher',
      title: 'Teacher',
      subtitle: 'Attendance & Sessional',
      icon: '👨‍🏫',
    },
    {
      id: 'admin',
      title: 'Admin',
      subtitle: 'Manage Portal',
      icon: '⚙️',
    },
  ]

  const getIdentifierLabel = () => {
    if (role === 'student') {
      return 'Roll Number / Gmail'
    }

    if (role === 'teacher') {
      return 'Employee ID / Gmail'
    }

    return 'Admin Gmail'
  }

  const getIdentifierPlaceholder = () => {
    if (role === 'student') {
      return 'Enter roll number or Gmail'
    }

    if (role === 'teacher') {
      return 'Enter employee ID or Gmail'
    }

    return 'Enter admin Gmail'
  }

  const handleRoleChange = (newRole) => {
    setRole(newRole)
    setIdentifier('')
    setPassword('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    if (!identifier || !password) {
      alert('Please enter your login details')
      return
    }

    try {
      setLoading(true)

      const response = await fetch(
        'http://localhost:5000/api/auth/login',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            identifier,
            password,
            role,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || 'Login failed')
        return
      }
      // Save authentication information
      setAuth(data.token, data.user)
      // Redirect according to actual backend role
      if (data.user.role === 'student') {
        navigate('/student/')
      } else if (data.user.role === 'teacher') {
        navigate('/teacher/dashboard')
      } else if (data.user.role === 'admin') {
        navigate('/admin/dashboard')
      }
    } catch (error) {
      console.error(error)

      alert(
        'Unable to connect to server. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">

      <div className="grid min-h-screen lg:grid-cols-2">

        {/* Left Section */}
        <section className="hidden bg-brand-700 lg:flex lg:flex-col lg:justify-between lg:p-12">

          <div>

            <div className="flex items-center gap-3 text-white">

              <div className="grid h-12 w-12 place-items-center rounded-xl bg-white text-xl font-black text-brand-700 shadow-lg">
                C
              </div>

              <div>
                <p className="text-lg font-bold">
                  College Portal
                </p>

                <p className="text-xs text-blue-200">
                  Student Management System
                </p>
              </div>

            </div>

          </div>


          <div className="max-w-lg">

            <p className="text-sm font-bold tracking-[.2em] text-blue-200">
              COLLEGE MANAGEMENT
            </p>

            <h1 className="mt-4 text-5xl font-bold leading-tight text-white">
              Everything you need,
              <span className="text-blue-200">
                {' '}in one place.
              </span>
            </h1>

            <p className="mt-6 text-base leading-7 text-blue-100">
              Manage attendance, sessional marks and academic
              information through a single secure college portal.
            </p>

          </div>


          <p className="text-xs text-blue-200">
            © 2026 College Portal
          </p>

        </section>


        {/* Login Section */}
        <section className="flex items-center justify-center px-5 py-10">

          <div className="w-full max-w-md">

            {/* Mobile Logo */}
            <div className="mb-10 flex items-center gap-3 lg:hidden">

              <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-700 text-lg font-black text-white">
                C
              </div>

              <div>
                <p className="font-bold">
                  College Portal
                </p>

                <p className="text-xs text-muted">
                  Student Management System
                </p>
              </div>

            </div>


            {/* Heading */}
            <div className="mb-8">

              <p className="text-sm font-semibold text-brand-600">
                WELCOME BACK
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Login to your account
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted">
                Select your account type and enter your credentials.
              </p>

            </div>


            {/* Role Selection */}
            <div className="mb-7">

              <p className="mb-3 text-sm font-semibold text-slate-700">
                Login as
              </p>

              <div className="grid grid-cols-3 gap-3">

                {roles.map((item) => (

                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleRoleChange(item.id)}
                    className={`rounded-2xl border p-4 text-center transition ${
                      role === item.id
                        ? 'border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-100'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:bg-slate-50'
                    }`}
                  >

                    <div className="text-2xl">
                      {item.icon}
                    </div>

                    <p className="mt-2 text-sm font-bold">
                      {item.title}
                    </p>

                    <p className="mt-1 hidden text-[10px] leading-4 sm:block">
                      {item.subtitle}
                    </p>

                  </button>

                ))}

              </div>

            </div>


            {/* Login Form */}
            <form
              onSubmit={handleLogin}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7"
            >

              {/* Selected Role */}
              <div className="mb-6 rounded-xl bg-brand-50 px-4 py-3">

                <p className="text-xs text-brand-600">
                  You are logging in as
                </p>

                <p className="mt-1 text-sm font-bold capitalize text-brand-800">
                  {role}
                </p>

              </div>


              {/* Identifier */}
              <div>

                <label className="text-sm font-semibold text-slate-700">
                  {getIdentifierLabel()}
                </label>

                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={getIdentifierPlaceholder()}
                  autoComplete="username"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                />

              </div>


              {/* Password */}
              <div className="mt-5">

                <div className="flex justify-between">

                  <label className="text-sm font-semibold text-slate-700">
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    Forgot password?
                  </button>

                </div>

                <div className="relative">

                  <input
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-20 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-4 top-1/2 mt-1 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-brand-600"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>

                </div>

              </div>


              {/* Remember */}
              <div className="mt-5 flex items-center gap-2">

                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />

                <label
                  htmlFor="remember"
                  className="text-xs text-slate-500"
                >
                  Remember me
                </label>

              </div>


              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center rounded-xl bg-brand-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-900/10 transition hover:bg-brand-600 active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading
                  ? 'Signing in...'
                  : `Login as ${role}`}

                {!loading && (
                  <span className="ml-2">
                    →
                  </span>
                )}

              </button>

            </form>


            {/* Footer */}
            <p className="mt-6 text-center text-xs leading-5 text-muted">
              Having trouble logging in?
              <br />
              Contact your college administrator.
            </p>

          </div>

        </section>

      </div>

    </main>
  )
}

export default Login