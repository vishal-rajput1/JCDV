import { useEffect, useState } from 'react'
import { apiFetch } from '../../utils/api'

function SessionalMarks() {
  const [marks, setMarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        const data = await apiFetch('/student/sessionals')

        setMarks(data)
      } catch (error) {
        console.error('MARKS ERROR:', error)
        setError(error.message || 'Failed to fetch marks')
      } finally {
        setLoading(false)
      }
    }

    fetchMarks()
  }, [])

  // Loading
  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-muted">
          Loading sessional marks...
        </p>
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <p className="font-semibold text-red-700">
          Unable to load marks
        </p>

        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      </div>
    )
  }

  // Calculate total score
  let obtained = 0
  let maximum = 0

  marks.forEach((item) => {
    obtained +=
      (item.sessional1 || 0) +
      (item.sessional2 || 0) +
      (item.sessional3 || 0) +
      (item.assignment || 0)

    maximum +=
      (item.sessional1Max || 20) +
      (item.sessional2Max || 20) +
      (item.sessional3Max || 20) +
      (item.assignmentMax || 10)
  })

  const overallPercentage =
    maximum > 0
      ? Math.round((obtained / maximum) * 100)
      : 0

  // Best subject
  const bestSubject = marks.length
    ? marks.reduce((best, current) => {
        const currentTotal =
          (current.sessional1 || 0) +
          (current.sessional2 || 0) +
          (current.sessional3 || 0) +
          (current.assignment || 0)

        const bestTotal =
          (best.sessional1 || 0) +
          (best.sessional2 || 0) +
          (best.sessional3 || 0) +
          (best.assignment || 0)

        return currentTotal > bestTotal
          ? current
          : best
      })
    : null

  return (
    <div>

      {/* Header */}
      <div className="mb-8">

        <p className="text-sm font-semibold text-brand-600">
          ACADEMIC PERFORMANCE
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Sessional Marks
        </h1>

        <p className="mt-2 text-sm text-muted">
          View your sessional examinations, assignments and assessment marks.
        </p>

      </div>

      {/* Student info */}
      <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-lg font-bold text-slate-900">
              {user?.name || 'Student'}
            </p>

            <p className="mt-1 text-sm text-muted">
              Roll No: {user?.rollNo || user?.studentId || '-'}
            </p>
          </div>

          <div className="text-sm text-muted sm:text-right">

            <p>
              {user?.department || 'Computer Science Engineering'}
            </p>

            <p className="mt-1">
              Semester {user?.semester || '-'}
            </p>

          </div>

        </div>

      </div>

      {/* Summary */}
      <div className="mb-7 grid gap-5 md:grid-cols-3">

        {/* Overall */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <p className="text-sm text-muted">
            Overall Score
          </p>

          <p className="mt-2 text-3xl font-bold">
            {obtained}/{maximum}
          </p>

          <p className="mt-2 text-xs text-emerald-600">
            {overallPercentage}% overall
          </p>

        </div>

        {/* Best Subject */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <p className="text-sm text-muted">
            Best Subject
          </p>

          <p className="mt-2 text-xl font-bold">

            {bestSubject
              ? bestSubject.subject
              : 'No marks available'}

          </p>

          <p className="mt-2 text-xs text-muted">
            {bestSubject
              ? 'Highest assessment score'
              : 'Marks not published yet'}
          </p>

        </div>

        {/* Semester */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <p className="text-sm text-muted">
            Semester
          </p>

          <p className="mt-2 text-3xl font-bold">
            {user?.semester || '-'}
          </p>

          <p className="mt-2 text-xs text-muted">
            {user?.department || 'B.Tech CSE'}
          </p>

        </div>

      </div>

      {/* Table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 p-6">

          <h2 className="text-lg font-bold">
            Subject-wise Marks
          </h2>

          <p className="mt-1 text-sm text-muted">
            Your latest assessment results
          </p>

        </div>

        <div className="overflow-x-auto">

          <table className="min-w-[750px] w-full text-left text-sm">

            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-muted">

              <tr>

                <th className="px-6 py-4">
                  Subject
                </th>

                <th className="px-6 py-4">
                  Sessional 1
                </th>

                <th className="px-6 py-4">
                  Sessional 2
                </th>

                <th className="px-6 py-4">
                  Sessional 3
                </th>

                <th className="px-6 py-4">
                  Assignment
                </th>

              </tr>

            </thead>

            <tbody>

              {marks.length > 0 ? (
                marks.map((item) => (

                  <tr
                    key={item._id || item.subject}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >

                    <td className="px-6 py-5 font-semibold text-slate-800">
                      {item.subject}
                    </td>

                    <td className="px-6 py-5">
                      {item.sessional1}/
                      {item.sessional1Max || 20}
                    </td>

                    <td className="px-6 py-5">
                      {item.sessional2}/
                      {item.sessional2Max || 20}
                    </td>

                    <td className="px-6 py-5">
                      {item.sessional3}/
                      {item.sessional3Max || 20}
                    </td>

                    <td className="px-6 py-5">
                      {item.assignment}/
                      {item.assignmentMax || 10}
                    </td>

                  </tr>

                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-10 text-center text-sm text-muted"
                  >
                    No sessional marks available.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </section>

      {/* Note */}
      <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">

        <p className="text-sm font-semibold text-blue-900">
          ℹ️ Sessional marks
        </p>

        <p className="mt-1 text-sm leading-6 text-blue-700">
          Marks are published by your respective subject teacher.
          If you find an incorrect mark, contact your teacher or department coordinator.
        </p>

      </div>

    </div>
  )
}

export default SessionalMarks