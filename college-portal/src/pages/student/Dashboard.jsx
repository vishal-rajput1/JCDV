import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../components/Icon'
import StatCard from '../../components/StatCard'
import { apiFetch } from '../../utils/api'
const subjectColors = [
  'bg-emerald-500',
  'bg-blue-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-cyan-500',
]

function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user'))

  const [subjects, setSubjects] = useState([])
  const [marks, setMarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token')

        if (!token) {
          setError('Authentication required')
          return
        }

        const [attendanceResponse, marksResponse] =
          await Promise.all([
            fetch(
              'http://localhost:5000/api/student/attendance',
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            ),

            fetch(
              'http://localhost:5000/api/student/sessionals',
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            ),
          ])

        const attendanceData =
          await attendanceResponse.json()

        const marksData =
          await marksResponse.json()

        if (!attendanceResponse.ok) {
          throw new Error(
            attendanceData.message ||
              'Unable to fetch attendance'
          )
        }

        if (!marksResponse.ok) {
          throw new Error(
            marksData.message ||
              'Unable to fetch marks'
          )
        }

        setSubjects(attendanceData.attendance || [])
        setMarks(marksData.marks || [])
      } catch (error) {
        console.error(
          'Dashboard data error:',
          error
        )

        setError(
          error.message ||
            'Unable to load dashboard data'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // -----------------------------
  // Attendance calculations
  // -----------------------------

  const overallPresent = subjects.reduce(
    (sum, subject) =>
      sum + Number(subject.present || 0),
    0
  )

  const overallTotal = subjects.reduce(
    (sum, subject) =>
      sum + Number(subject.total || 0),
    0
  )

  const overallPercentage = overallTotal
    ? Math.round(
        (overallPresent / overallTotal) * 100
      )
    : 0

  // -----------------------------
  // Marks calculations
  // -----------------------------

  const totalMarks = marks.reduce(
    (sum, item) =>
      sum +
      Number(item.sessional1 || 0) +
      Number(item.sessional2 || 0) +
      Number(item.sessional3 || 0) +
      Number(item.assignment || 0),
    0
  )
  const getOrdinal = (number) => {
  if (!number) return ''

  if (number === 1) return '1st'
  if (number === 2) return '2nd'
  if (number === 3) return '3rd'

  return `${number}th`
}

  const maximumMarks = marks.length * 70

  const marksPercentage = maximumMarks
    ? Math.round(
        (totalMarks / maximumMarks) * 100
      )
    : 0

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />

          <p className="mt-4 text-sm text-muted">
            Loading your dashboard...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <h2 className="font-bold text-rose-800">
          Unable to load dashboard
        </h2>

        <p className="mt-2 text-sm text-rose-600">
          {error}
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Heading */}
      <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-semibold text-brand-600">
            STUDENT DASHBOARD
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Good morning, {user?.name || 'Student'} 👋
          </h1>

          <p className="mt-2 text-sm text-muted">
            B.Tech{' '}
            {user?.department ||
              'Computer Science Engineering'}

            <span className="mx-1 text-slate-300">
              •
            </span>

            {user?.semester
              ? `${user.semester}th Semester`
              : 'Semester'}

            {user?.section && (
              <>
                <span className="mx-1 text-slate-300">
                  •
                </span>

                 {getOrdinal(user?.semester)} Semester

              </>
            )}
          </p>

          {user?.rollNo && (
            <p className="mt-1 text-xs text-muted">
              Roll No: {user.rollNo}
            </p>
          )}
        </div>

        <button className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm">
          ⌄ &nbsp; Semester {user?.semester || '-'}
        </button>
      </div>

      {/* Cards */}
      <div className="grid gap-5 md:grid-cols-3">
        <StatCard
          label="Overall Attendance"
          value={`${overallPercentage}%`}
          hint={
            overallPercentage >= 75
              ? 'Good standing'
              : 'Below required 75%'
          }
          icon="calendar"
          color={
            overallPercentage >= 75
              ? 'bg-emerald-500'
              : 'bg-rose-500'
          }
        />

        <StatCard
          label="Sessional Marks"
          value={`${totalMarks}/${maximumMarks}`}
          hint={`${marksPercentage}% overall score`}
          icon="chart"
          color="bg-violet-500"
        />

        <Link
          to="/student/university-result"
          className="group rounded-2xl bg-brand-700 p-6 text-left text-white shadow-lg shadow-blue-900/10 transition hover:bg-brand-600"
        >
          <div className="mb-7 flex justify-between">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/15">
              <Icon name="book" />
            </div>

            <Icon
              name="arrow"
              className="transition-transform group-hover:translate-x-1"
            />
          </div>

          <p className="text-sm font-medium text-blue-100">
            University Final Result
          </p>

          <p className="mt-1 text-xl font-bold">
            Check CDLU Result
          </p>

          <p className="mt-3 text-xs leading-5 text-blue-200">
            View your official examination result online.
          </p>
        </Link>
      </div>

      {/* Middle */}
      <div className="mt-7 grid gap-7 xl:grid-cols-[1.35fr_.9fr]">
        <AttendancePreview
          subjects={subjects}
        />

        <AttendanceAlert
          subjects={subjects}
        />
      </div>

      {/* Marks */}
      <MarksPreview marks={marks} />
    </>
  )
}

/* =====================================================
   ATTENDANCE PREVIEW
===================================================== */

function AttendancePreview({ subjects }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex justify-between">
        <div>
          <h2 className="text-lg font-bold">
            Attendance Overview
          </h2>

          <p className="mt-1 text-sm text-muted">
            Current semester subject-wise attendance
          </p>
        </div>

        <Link
          to="/student/attendance"
          className="text-sm font-semibold text-brand-600"
        >
          View details
        </Link>
      </div>

      {subjects.length === 0 ? (
        <div className="rounded-xl bg-slate-50 p-6 text-center">
          <p className="text-sm text-muted">
            No attendance records available.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {subjects.map((subject, index) => {
            const percentage = subject.total
              ? Math.round(
                  (subject.present /
                    subject.total) *
                    100
                )
              : 0

            return (
              <div
                key={subject._id || subject.code}
              >
                <div className="mb-2 flex justify-between text-sm">
                  <div>
                    <span className="font-semibold text-slate-700">
                      {subject.subject}
                    </span>

                    <span className="ml-2 text-xs text-muted">
                      {subject.code}
                    </span>
                  </div>

                  <b>{percentage}%</b>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      subjectColors[
                        index %
                          subjectColors.length
                      ]
                    }`}
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>

                <p className="mt-1.5 text-xs text-muted">
                  {subject.present} present out of{' '}
                  {subject.total} classes
                </p>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

/* =====================================================
   ATTENDANCE ALERT
===================================================== */

function AttendanceAlert({ subjects }) {
  const lowAttendance = subjects
    .map((subject) => ({
      ...subject,
      percentage: subject.total
        ? (subject.present /
            subject.total) *
          100
        : 0,
    }))
    .filter(
      (subject) => subject.percentage < 75
    )
    .sort(
      (a, b) =>
        a.percentage - b.percentage
    )[0]

  if (!lowAttendance) {
    return (
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-lg">
          ✓
        </div>

        <h2 className="mt-5 text-lg font-bold">
          Attendance looks good
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          All your subjects are currently above
          the required 75% attendance.
        </p>
      </section>
    )
  }

  const percentage =
    Number(lowAttendance.percentage.toFixed(1))

  const requiredClasses = Math.ceil(
    (75 * lowAttendance.total -
      100 * lowAttendance.present) /
      25
  )

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-100 text-lg">
        ⚠️
      </div>

      <h2 className="mt-5 text-lg font-bold">
        Attendance alert
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        Your{' '}
        <b className="text-amber-700">
          {lowAttendance.subject}
        </b>{' '}
        attendance is{' '}
        <b className="text-amber-700">
          {percentage}%
        </b>
        .

        {requiredClasses > 0 && (
          <>
            {' '}
            Attend the next{' '}
            <b className="text-amber-700">
              {requiredClasses} classes
            </b>{' '}
            to reach 75%.
          </>
        )}
      </p>

      <div className="mt-6 rounded-xl bg-white/70 p-4">
        <div className="flex justify-between text-xs font-semibold text-slate-600">
          <span>Required attendance</span>
          <span>75%</span>
        </div>

        <div className="mt-2 h-2 rounded-full bg-amber-100">
          <div
            className="h-full rounded-full bg-amber-500"
            style={{
              width: `${Math.min(
                percentage,
                100
              )}%`,
            }}
          />
        </div>
      </div>
    </section>
  )
}

/* =====================================================
   MARKS PREVIEW
===================================================== */

function MarksPreview({ marks }) {
  return (
    <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
        <div>
          <h2 className="text-lg font-bold">
            Recent Sessional Marks
          </h2>

          <p className="mt-1 text-sm text-muted">
            Latest assessment performance
          </p>
        </div>

        <Link
          to="/student/sessionals"
          className="text-sm font-semibold text-brand-600"
        >
          View all
        </Link>
      </div>

      <div className="overflow-x-auto">
        {marks.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-muted">
              No sessional marks available.
            </p>
          </div>
        ) : (
          <table className="min-w-[650px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-muted">
              <tr>
                <th className="px-5 py-3.5">
                  Subject
                </th>

                <th className="px-5 py-3.5">
                  Sessional 1
                </th>

                <th className="px-5 py-3.5">
                  Sessional 2
                </th>

                <th className="px-5 py-3.5">
                  Sessional 3
                </th>

                <th className="px-5 py-3.5">
                  Assignment
                </th>
              </tr>
            </thead>

            <tbody>
              {marks.map((row) => (
                <tr
                  key={row._id || row.subject}
                  className="border-t border-slate-100"
                >
                  <td className="px-5 py-4 font-semibold text-slate-700">
                    {row.subject}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {row.sessional1}/20
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {row.sessional2}/20
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {row.sessional3}/20
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {row.assignment}/10
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}

export default Dashboard