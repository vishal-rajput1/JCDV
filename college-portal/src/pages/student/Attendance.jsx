import { useEffect, useState } from 'react'
import { apiFetch } from '../../utils/api'

function Attendance() {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await apiFetch('/student/attendance')

        setSubjects(data)
      } catch (error) {
        console.error('Attendance error:', error)

        setError(
          error.message || 'Failed to load attendance'
        )
      } finally {
        setLoading(false)
      }
    }

    loadAttendance()
  }, [])

  // Loading
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />

          <p className="mt-4 text-sm text-muted">
            Loading attendance...
          </p>
        </div>
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <h2 className="font-bold text-rose-800">
          Unable to load attendance
        </h2>

        <p className="mt-2 text-sm text-rose-600">
          {error}
        </p>
      </div>
    )
  }

  // Calculate totals
  const totalPresent = subjects.reduce(
    (sum, subject) => sum + subject.present,
    0
  )

  const totalClasses = subjects.reduce(
    (sum, subject) => sum + subject.total,
    0
  )

  const overall =
    totalClasses > 0
      ? Number(
          ((totalPresent / totalClasses) * 100).toFixed(1)
        )
      : 0

  return (
    <div>

      {/* Header */}
      <div className="mb-8">

        <p className="text-sm font-semibold text-brand-600">
          ATTENDANCE
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Attendance Overview
        </h1>

        <p className="mt-2 text-sm text-muted">
          Check your subject-wise attendance and overall percentage.
        </p>

      </div>


      {/* Summary */}
      <div className="mb-7 grid gap-5 md:grid-cols-3">

        {/* Overall */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <p className="text-sm text-muted">
            Overall Attendance
          </p>

          <p className="mt-2 text-3xl font-bold text-brand-700">
            {overall}%
          </p>

          <p
            className={`mt-2 text-xs font-medium ${
              overall >= 75
                ? 'text-emerald-600'
                : 'text-rose-600'
            }`}
          >
            {overall >= 75
              ? 'Good standing'
              : 'Short attendance'}
          </p>

        </div>


        {/* Classes attended */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <p className="text-sm text-muted">
            Classes Attended
          </p>

          <p className="mt-2 text-3xl font-bold">
            {totalPresent}
          </p>

          <p className="mt-2 text-xs text-muted">
            Out of {totalClasses} classes
          </p>

        </div>


        {/* Required */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <p className="text-sm text-muted">
            Required Attendance
          </p>

          <p className="mt-2 text-3xl font-bold">
            75%
          </p>

          <p className="mt-2 text-xs text-muted">
            Minimum required
          </p>

        </div>

      </div>


      {/* No data */}
      {subjects.length === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

          <p className="text-lg font-bold text-slate-700">
            No attendance records found
          </p>

          <p className="mt-2 text-sm text-muted">
            Attendance data has not been added for this student yet.
          </p>

        </section>
      ) : (

        /* Subject attendance */
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 p-6">

            <h2 className="text-lg font-bold">
              Subject-wise Attendance
            </h2>

            <p className="mt-1 text-sm text-muted">
              Current semester attendance records
            </p>

          </div>


          <div className="divide-y divide-slate-100">

            {subjects.map((subject) => {

              const percentage =
                subject.total > 0
                  ? Number(
                      (
                        (subject.present /
                          subject.total) *
                        100
                      ).toFixed(1)
                    )
                  : 0

              const status =
                percentage >= 75
                  ? 'Good'
                  : 'Short Attendance'

              return (
                <div
                  key={subject._id}
                  className="p-6"
                >

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                      <h3 className="font-semibold text-slate-800">
                        {subject.subject}
                      </h3>

                      <p className="mt-1 text-xs text-muted">
                        {subject.code}
                      </p>

                    </div>


                    <div className="flex items-center gap-4">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          percentage >= 75
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {status}
                      </span>

                      <span className="text-2xl font-bold">
                        {percentage}%
                      </span>

                    </div>

                  </div>


                  {/* Progress */}
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">

                    <div
                      className={`h-full rounded-full ${
                        subject.color || 'bg-brand-600'
                      }`}
                      style={{
                        width: `${Math.min(
                          percentage,
                          100
                        )}%`,
                      }}
                    />

                  </div>


                  {/* Counts */}
                  <div className="mt-2 flex justify-between text-xs text-muted">

                    <span>
                      Present: {subject.present}
                    </span>

                    <span>
                      Total: {subject.total}
                    </span>

                  </div>

                </div>
              )
            })}

          </div>

        </section>
      )}

    </div>
  )
}

export default Attendance