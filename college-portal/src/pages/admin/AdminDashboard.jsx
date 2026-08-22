import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../../utils/api'
import { useAuthStore } from '../../store/authStore'
import Icon from '../../components/Icon'

function StatCard({
  label,
  value,
  description,
  icon,
  loading,
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {loading ? '—' : value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-700 group-hover:text-white">
          <Icon name={icon} />
        </div>
      </div>
    </div>
  )
}

function AdminDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const [data, setData] = useState({
    students: [],
    teachers: [],
    fields: [],
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // ===============================
  // LOAD ADMIN DATA
  // ===============================

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        setError('')

        const result = await apiFetch(
          '/admin/academic-setup'
        )

        setData({
          students: result.students || [],
          teachers: result.teachers || [],
          fields: result.fields || [],
        })
      } catch (err) {
        console.error(
          'ADMIN DASHBOARD ERROR:',
          err
        )

        setError(
          err.message ||
            'Unable to load admin dashboard'
        )
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  // ===============================
  // STATISTICS
  // ===============================

  const statistics = useMemo(() => {
    const cseStudents = data.students.filter(
      (student) =>
        String(student.field || '').toUpperCase() ===
        'CSE'
    ).length

    const aimlStudents = data.students.filter(
      (student) =>
        String(student.field || '').toUpperCase() ===
        'AIML'
    ).length

    const assignedSubjects =
      data.teachers.reduce(
        (total, teacher) =>
          total +
          (teacher.assignedSubjects?.length || 0),
        0
      )

    const teachersWithSubjects =
      data.teachers.filter(
        (teacher) =>
          teacher.assignedSubjects?.length > 0
      ).length

    return {
      students: data.students.length,
      teachers: data.teachers.length,
      cseStudents,
      aimlStudents,
      assignedSubjects,
      teachersWithSubjects,
    }
  }, [data])

  // ===============================
  // ACADEMIC STATUS
  // ===============================

  const academicStatus = useMemo(() => {
    const totalStudents = data.students.length
    const assignedStudents = data.students.filter(
      (student) => student.field
    ).length

    const totalTeachers = data.teachers.length

    const teachersAssigned =
      statistics.teachersWithSubjects

    const studentComplete =
      totalStudents === 0 ||
      assignedStudents === totalStudents

    const teacherComplete =
      totalTeachers === 0 ||
      teachersAssigned === totalTeachers

    return {
      studentComplete,
      teacherComplete,
      complete:
        studentComplete && teacherComplete,
    }
  }, [data, statistics])

  // ===============================
  // LOGOUT
  // ===============================

  const handleLogout = () => {
    logout()

    navigate('/login', {
      replace: true,
    })
  }

  // ===============================
  // INITIALS
  // ===============================

  const initials =
    user?.name
      ?.split(' ')
      .map((word) => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'AD'

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-ink">

      {/* =================================
          HEADER
      ================================= */}

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">

          <div>
            <p className="text-[10px] font-bold tracking-[0.18em] text-brand-600">
              ADMINISTRATION
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Admin Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3">

            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-900">
                {user?.name || 'Administrator'}
              </p>

              <p className="text-xs capitalize text-slate-500">
                {user?.role || 'admin'}
              </p>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
              {initials}
            </div>

            <button
              onClick={handleLogout}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
            >
              Logout
            </button>

          </div>
        </div>
      </header>


      {/* =================================
          CONTENT
      ================================= */}

      <section className="mx-auto max-w-7xl px-5 py-8 lg:px-10">

        {/* =================================
            WELCOME CARD
        ================================= */}

        <div className="relative overflow-hidden rounded-3xl bg-brand-700 p-7 text-white shadow-xl">

          <div className="relative z-10">

            <p className="text-xs font-bold tracking-[0.16em] text-blue-200">
              WELCOME BACK
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Hello,{' '}
              {user?.name?.split(' ')[0] ||
                'Administrator'}{' '}
              👋
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
              Manage your college's students,
              teachers, subjects and academic
              configuration from one central place.
            </p>

            <button
              onClick={() =>
                navigate(
                  '/admin/academic-setup'
                )
              }
              className="mt-5 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-brand-700 shadow-sm transition hover:bg-blue-50"
            >
              Manage Academic Setup →
            </button>

          </div>

          {/* Decorative shapes */}

          <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/10" />

          <div className="absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-white/5" />

        </div>


        {/* =================================
            ERROR
        ================================= */}

        {error && (
          <div className="mt-6 flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            <span>{error}</span>

            <button
              onClick={() =>
                window.location.reload()
              }
              className="font-bold underline"
            >
              Retry
            </button>
          </div>
        )}


        {/* =================================
            STATISTICS
        ================================= */}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            label="Total Students"
            value={statistics.students}
            description="Registered students"
            icon="users"
            loading={loading}
          />

          <StatCard
            label="Total Teachers"
            value={statistics.teachers}
            description="Registered teachers"
            icon="user"
            loading={loading}
          />

          <StatCard
            label="CSE Students"
            value={statistics.cseStudents}
            description="Students assigned to CSE"
            icon="book"
            loading={loading}
          />

          <StatCard
            label="AIML Students"
            value={statistics.aimlStudents}
            description="Students assigned to AIML"
            icon="chart"
            loading={loading}
          />

        </div>


        {/* =================================
            MAIN GRID
        ================================= */}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">

          {/* Academic Setup */}

          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-start justify-between">

              <div>
                <h3 className="font-bold text-slate-900">
                  Academic Setup
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Current configuration status
                </p>
              </div>

              <div
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  academicStatus.complete
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {academicStatus.complete
                  ? 'Complete'
                  : 'Needs attention'}
              </div>

            </div>


            <div className="mt-6 space-y-4">

              {/* Students */}

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">

                <div className="flex items-center gap-3">

                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-brand-700 shadow-sm">
                    <Icon name="users" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Student field allocation
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      CSE / AIML assignment
                    </p>
                  </div>

                </div>

                <div className="text-right">

                  <p className="text-sm font-bold text-slate-800">
                    {
                      data.students.filter(
                        (student) =>
                          student.field
                      ).length
                    }{' '}
                    / {statistics.students}
                  </p>

                  <p
                    className={`text-xs ${
                      academicStatus.studentComplete
                        ? 'text-emerald-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {academicStatus.studentComplete
                      ? 'All assigned'
                      : 'Pending assignment'}
                  </p>

                </div>

              </div>


              {/* Teachers */}

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">

                <div className="flex items-center gap-3">

                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-brand-700 shadow-sm">
                    <Icon name="user" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Teacher subject allocation
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Subjects assigned to teachers
                    </p>
                  </div>

                </div>

                <div className="text-right">

                  <p className="text-sm font-bold text-slate-800">
                    {
                      statistics.teachersWithSubjects
                    }{' '}
                    / {statistics.teachers}
                  </p>

                  <p
                    className={`text-xs ${
                      academicStatus.teacherComplete
                        ? 'text-emerald-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {academicStatus.teacherComplete
                      ? 'All assigned'
                      : 'Pending assignment'}
                  </p>

                </div>

              </div>

            </div>


            <button
              onClick={() =>
                navigate(
                  '/admin/academic-setup'
                )
              }
              className="mt-5 text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              Open academic setup →
            </button>

          </div>


          {/* Quick Actions */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h3 className="font-bold text-slate-900">
              Quick Actions
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Frequently used administration tools
            </p>

            <div className="mt-5 space-y-3">

              <button
                onClick={() =>
                  navigate(
                    '/admin/academic-setup'
                  )
                }
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-brand-200 hover:bg-brand-50"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Academic Setup
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Manage fields & subjects
                  </p>
                </div>

                <span className="text-brand-600">
                  →
                </span>
              </button>


              <button
                onClick={() =>
                  navigate(
                    '/admin/academic-setup'
                  )
                }
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-brand-200 hover:bg-brand-50"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Students
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Review student allocation
                  </p>
                </div>

                <span className="text-brand-600">
                  →
                </span>
              </button>


              <button
                onClick={() =>
                  navigate(
                    '/admin/academic-setup'
                  )
                }
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-brand-200 hover:bg-brand-50"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Teachers
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Manage subject assignments
                  </p>
                </div>

                <span className="text-brand-600">
                  →
                </span>
              </button>

            </div>

          </div>

        </div>


        {/* =================================
            SUBJECT ASSIGNMENT SUMMARY
        ================================= */}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

            <div>
              <h3 className="font-bold text-slate-900">
                Teacher Subject Assignments
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Overview of subjects currently assigned
              </p>
            </div>

            <div className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
              {statistics.assignedSubjects}{' '}
              Total Subjects
            </div>

          </div>


          <div className="mt-5 overflow-x-auto">

            {loading ? (
              <div className="py-10 text-center text-sm text-slate-400">
                Loading assignments...
              </div>
            ) : data.teachers.length === 0 ? (
              <div className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                No teachers found.
              </div>
            ) : (
              <table className="w-full min-w-[700px] text-left">

                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">

                    <th className="px-3 py-3 font-semibold">
                      Teacher
                    </th>

                    <th className="px-3 py-3 font-semibold">
                      Department
                    </th>

                    <th className="px-3 py-3 font-semibold">
                      Subjects
                    </th>

                    <th className="px-3 py-3 text-right font-semibold">
                      Count
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {data.teachers
                    .slice(0, 6)
                    .map((teacher) => (

                      <tr
                        key={teacher._id}
                        className="border-b border-slate-50 last:border-0"
                      >

                        <td className="px-3 py-4">

                          <p className="text-sm font-semibold text-slate-800">
                            {teacher.name}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {teacher.employeeId ||
                              teacher.email}
                          </p>

                        </td>

                        <td className="px-3 py-4 text-sm text-slate-600">
                          {teacher.department ||
                            '—'}
                        </td>

                        <td className="max-w-md px-3 py-4">

                          {teacher.assignedSubjects
                            ?.length ? (
                            <div className="flex flex-wrap gap-2">

                              {teacher.assignedSubjects
                                .slice(0, 3)
                                .map(
                                  (
                                    subject,
                                    index
                                  ) => (
                                    <span
                                      key={
                                        `${teacher._id}-${index}`
                                      }
                                      className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                                    >
                                      {subject.code ||
                                        subject.name}
                                    </span>
                                  )
                                )}

                              {teacher
                                .assignedSubjects
                                .length > 3 && (
                                <span className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
                                  +
                                  {teacher
                                    .assignedSubjects
                                    .length -
                                    3}{' '}
                                  more
                                </span>
                              )}

                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">
                              No subjects assigned
                            </span>
                          )}

                        </td>

                        <td className="px-3 py-4 text-right text-sm font-bold text-slate-700">
                          {teacher
                            .assignedSubjects
                            ?.length || 0}
                        </td>

                      </tr>

                    ))}

                </tbody>

              </table>
            )}

          </div>

        </div>


        {/* =================================
            RECENT ACADEMIC INFORMATION
        ================================= */}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">

          {/* Fields */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h3 className="font-bold text-slate-900">
              Academic Fields
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Fields currently available for students
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">

              {data.fields.length > 0 ? (
                data.fields.map((field) => {

                  const count =
                    data.students.filter(
                      (student) =>
                        student.field === field
                    ).length

                  return (
                    <div
                      key={field}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Field
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-900">
                        {field}
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        {count} student
                        {count !== 1
                          ? 's'
                          : ''}
                      </p>
                    </div>
                  )
                })
              ) : (
                <div className="col-span-2 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                  No academic fields configured.
                </div>
              )}

            </div>

          </div>


          {/* System Summary */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h3 className="font-bold text-slate-900">
              System Summary
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Current academic administration overview
            </p>

            <div className="mt-5 space-y-4">

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Students
                </span>

                <span className="text-sm font-bold text-slate-900">
                  {statistics.students}
                </span>
              </div>

              <div className="h-px bg-slate-100" />

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Teachers
                </span>

                <span className="text-sm font-bold text-slate-900">
                  {statistics.teachers}
                </span>
              </div>

              <div className="h-px bg-slate-100" />

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Assigned Subjects
                </span>

                <span className="text-sm font-bold text-slate-900">
                  {statistics.assignedSubjects}
                </span>
              </div>

              <div className="h-px bg-slate-100" />

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Academic Setup
                </span>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                    academicStatus.complete
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {academicStatus.complete
                    ? 'Ready'
                    : 'Incomplete'}
                </span>
              </div>

            </div>

          </div>

        </div>

      </section>

    </main>
  )
}

export default AdminDashboard