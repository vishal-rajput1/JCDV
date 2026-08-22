import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../../utils/api'
import Icon from '../../components/Icon'

const freshSubject = () => ({
  name: '',
  code: '',
  semester: '',
  field: 'CSE',
})

function AcademicSetup() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  // ===============================
  // LOAD DATA
  // ===============================

  const load = async () => {
    try {
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
        'ACADEMIC SETUP ERROR:',
        err
      )

      setError(
        err.message ||
          'Unable to load academic setup'
      )
    }
  }

  useEffect(() => {
    load()
  }, [])

  // ===============================
  // STATISTICS
  // ===============================

  const statistics = useMemo(() => {
    if (!data) {
      return {
        students: 0,
        assignedStudents: 0,
        teachers: 0,
        assignedTeachers: 0,
        subjects: 0,
      }
    }

    const assignedStudents =
      data.students.filter(
        (student) => student.field
      ).length

    const assignedTeachers =
      data.teachers.filter(
        (teacher) =>
          teacher.assignedSubjects?.length > 0
      ).length

    const subjects =
      data.teachers.reduce(
        (total, teacher) =>
          total +
          (teacher.assignedSubjects?.length || 0),
        0
      )

    return {
      students: data.students.length,
      assignedStudents,
      teachers: data.teachers.length,
      assignedTeachers,
      subjects,
    }
  }, [data])

  // ===============================
  // ASSIGN STUDENT FIELD
  // ===============================

  const setField = async (
    studentId,
    field
  ) => {
    try {
      setError('')
      setMessage('')

      const result = await apiFetch(
        `/admin/students/${studentId}/field`,
        {
          method: 'PUT',
          body: JSON.stringify({
            field,
          }),
        }
      )

      setData((current) => ({
        ...current,

        students:
          current.students.map(
            (student) =>
              student._id === studentId
                ? {
                    ...student,
                    field:
                      result.student.field,
                  }
                : student
          ),
      }))

      setMessage(
        result.message ||
          'Student field updated successfully.'
      )

      setTimeout(() => {
        setMessage('')
      }, 3000)
    } catch (err) {
      setError(
        err.message ||
          'Unable to update student field'
      )
    }
  }

  // ===============================
  // OPEN SUBJECT EDITOR
  // ===============================

  const openEditor = (teacher) => {
    setEditing({
      ...teacher,

      assignedSubjects:
        teacher.assignedSubjects?.map(
          (subject) => ({
            name: subject.name || '',
            code: subject.code || '',
            semester:
              subject.semester || '',
            field:
              subject.field || 'CSE',
          })
        ) || [],
    })
  }

  // ===============================
  // UPDATE SUBJECT
  // ===============================

  const updateSubject = (
    index,
    key,
    value
  ) => {
    setEditing((current) => ({
      ...current,

      assignedSubjects:
        current.assignedSubjects.map(
          (subject, subjectIndex) =>
            subjectIndex === index
              ? {
                  ...subject,
                  [key]: value,
                }
              : subject
        ),
    }))
  }

  // ===============================
  // SAVE SUBJECTS
  // ===============================

  const saveSubjects = async (event) => {
    event.preventDefault()

    if (!editing) return

    try {
      setSaving(true)
      setError('')
      setMessage('')

      const result = await apiFetch(
        `/admin/teachers/${editing._id}/subjects`,
        {
          method: 'PUT',
          body: JSON.stringify({
            assignedSubjects:
              editing.assignedSubjects,
          }),
        }
      )

      setData((current) => ({
        ...current,

        teachers:
          current.teachers.map(
            (teacher) =>
              teacher._id === editing._id
                ? {
                    ...teacher,
                    assignedSubjects:
                      result.teacher
                        .assignedSubjects,
                  }
                : teacher
          ),
      }))

      setEditing(null)

      setMessage(
        result.message ||
          'Subject allocations saved successfully.'
      )

      setTimeout(() => {
        setMessage('')
      }, 3000)
    } catch (err) {
      setError(
        err.message ||
          'Unable to save subject allocations'
      )
    } finally {
      setSaving(false)
    }
  }

  // ===============================
  // LOADING
  // ===============================

  if (!data) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 lg:p-10">
        <div className="mx-auto max-w-7xl">

          <div className="animate-pulse space-y-6">

            <div className="h-8 w-56 rounded-lg bg-slate-200" />

            <div className="h-4 w-96 max-w-full rounded bg-slate-200" />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map(
                (item) => (
                  <div
                    key={item}
                    className="h-28 rounded-2xl bg-white"
                  />
                )
              )}
            </div>

            <div className="h-96 rounded-2xl bg-white" />

          </div>

        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-ink lg:p-10">

      <div className="mx-auto max-w-7xl">

        {/* =================================
            HEADER
        ================================= */}

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

          <div>

            <p className="text-[10px] font-bold tracking-[0.18em] text-brand-600">
              ADMINISTRATION
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Academic Setup
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Manage student field allocation and
              teacher subject assignments from one
              centralized workspace.
            </p>

          </div>

          <button
            onClick={load}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-200 hover:bg-brand-50"
          >
            <Icon name="grid" />
            Refresh
          </button>

        </div>


        {/* =================================
            MESSAGES
        ================================= */}

        {message && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-100">
              ✓
            </span>

            {message}
          </div>
        )}

        {error && (
          <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">

            <span>{error}</span>

            <button
              onClick={load}
              className="font-bold underline"
            >
              Retry
            </button>

          </div>
        )}


        {/* =================================
            STATISTICS
        ================================= */}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Students
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {statistics.students}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Registered students
                </p>
              </div>

              <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <Icon name="users" />
              </div>

            </div>
          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Field Allocation
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {statistics.assignedStudents}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Students assigned
                </p>
              </div>

              <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                ✓
              </div>

            </div>
          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Teachers
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {statistics.teachers}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Registered teachers
                </p>
              </div>

              <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <Icon name="user" />
              </div>

            </div>
          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Subjects
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {statistics.subjects}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Teacher allocations
                </p>
              </div>

              <div className="grid h-11 w-11 place-items-center rounded-xl bg-purple-50 text-purple-600">
                <Icon name="book" />
              </div>

            </div>
          </div>

        </div>


        {/* =================================
            STUDENT FIELD ALLOCATION
        ================================= */}

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-center">

            <div>

              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-700">
                  <Icon name="users" />
                </div>

                <h2 className="font-bold text-slate-900">
                  Student Field Allocation
                </h2>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Assign each student to their
                academic field.
              </p>

            </div>

            <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
              {statistics.assignedStudents} /{' '}
              {statistics.students} assigned
            </div>

          </div>


          <div className="overflow-x-auto">

            <table className="w-full min-w-[720px] text-left">

              <thead className="bg-slate-50">

                <tr className="text-[11px] uppercase tracking-wider text-slate-400">

                  <th className="px-6 py-3 font-bold">
                    Student
                  </th>

                  <th className="px-6 py-3 font-bold">
                    Roll Number
                  </th>

                  <th className="px-6 py-3 font-bold">
                    Semester
                  </th>

                  <th className="px-6 py-3 font-bold">
                    Field
                  </th>

                  <th className="px-6 py-3 text-right font-bold">
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {data.students.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-sm text-slate-400"
                    >
                      No students found.
                    </td>
                  </tr>
                ) : (
                  data.students.map(
                    (student) => (
                      <tr
                        key={student._id}
                        className="border-t border-slate-100 transition hover:bg-slate-50"
                      >

                        <td className="px-6 py-4">

                          <p className="text-sm font-semibold text-slate-800">
                            {student.name}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {student.email || 'Student'}
                          </p>

                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {student.rollNo || '—'}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {student.semester || '—'}
                        </td>

                        <td className="px-6 py-4">

                          <select
                            value={
                              student.field || ''
                            }
                            onChange={(event) =>
                              setField(
                                student._id,
                                event.target.value
                              )
                            }
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                          >

                            <option value="">
                              Choose field
                            </option>

                            {data.fields.map(
                              (field) => (
                                <option
                                  key={field}
                                  value={field}
                                >
                                  {field}
                                </option>
                              )
                            )}

                          </select>

                        </td>

                        <td className="px-6 py-4 text-right">

                          {student.field ? (
                            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                              Assigned
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                              Pending
                            </span>
                          )}

                        </td>

                      </tr>
                    )
                  )
                )}

              </tbody>

            </table>

          </div>

        </section>


        {/* =================================
            TEACHER SUBJECT ALLOCATION
        ================================= */}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

            <div>

              <div className="flex items-center gap-2">

                <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-700">
                  <Icon name="user" />
                </div>

                <h2 className="font-bold text-slate-900">
                  Teacher Subject Allocation
                </h2>

              </div>

              <p className="mt-2 text-xs text-slate-500">
                Manage subjects assigned to each
                teacher.
              </p>

            </div>

            <div className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700">
              {statistics.subjects} subjects
            </div>

          </div>


          <div className="mt-6 space-y-3">

            {data.teachers.length === 0 ? (
              <div className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-400">
                No teachers found.
              </div>
            ) : (
              data.teachers.map(
                (teacher) => (
                  <div
                    key={teacher._id}
                    className="rounded-2xl border border-slate-200 p-4 transition hover:border-brand-200 hover:shadow-sm"
                  >

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                      <div className="min-w-0">

                        <div className="flex items-center gap-3">

                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                            {teacher.name
                              ?.split(' ')
                              .map(
                                (word) =>
                                  word[0]
                              )
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">

                            <p className="font-semibold text-slate-800">
                              {teacher.name}
                            </p>

                            <p className="truncate text-xs text-slate-400">
                              {teacher.employeeId ||
                                teacher.email}
                            </p>

                          </div>

                        </div>


                        {teacher
                          .assignedSubjects
                          ?.length ? (
                          <div className="mt-4 flex flex-wrap gap-2">

                            {teacher.assignedSubjects.map(
                              (
                                subject,
                                index
                              ) => (
                                <span
                                  key={
                                    `${teacher._id}-${index}`
                                  }
                                  className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600"
                                >
                                  <span className="font-bold text-slate-800">
                                    {subject.code}
                                  </span>

                                  <span className="mx-1">
                                    ·
                                  </span>

                                  Sem{' '}
                                  {
                                    subject.semester
                                  }

                                  <span className="mx-1">
                                    ·
                                  </span>

                                  {subject.field}
                                </span>
                              )
                            )}

                          </div>
                        ) : (
                          <p className="mt-3 text-xs text-slate-400">
                            No subjects assigned yet.
                          </p>
                        )}

                      </div>


                      <div className="flex shrink-0 items-center gap-3">

                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                            teacher.assignedSubjects
                              ?.length
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {teacher
                            .assignedSubjects
                            ?.length || 0}{' '}
                          subject
                          {teacher
                            .assignedSubjects
                            ?.length === 1
                            ? ''
                            : 's'}
                        </span>

                        <button
                          onClick={() =>
                            openEditor(
                              teacher
                            )
                          }
                          className="rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-800"
                        >
                          Manage
                        </button>

                      </div>

                    </div>

                  </div>
                )
              )
            )}

          </div>

        </section>


        {/* =================================
            CONFIGURED FIELDS
        ================================= */}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div>
            <h2 className="font-bold text-slate-900">
              Available Academic Fields
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Fields currently configured in the
              academic system.
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            {data.fields.length === 0 ? (
              <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-400">
                No fields configured.
              </div>
            ) : (
              data.fields.map((field) => {

                const count =
                  data.students.filter(
                    (student) =>
                      student.field === field
                  ).length

                return (
                  <div
                    key={field}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >

                    <div className="flex items-center justify-between">

                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-white font-bold text-brand-700 shadow-sm">
                        {field
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <span className="text-xs font-semibold text-slate-400">
                        {count} students
                      </span>

                    </div>

                    <p className="mt-4 text-lg font-bold text-slate-900">
                      {field}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Academic field
                    </p>

                  </div>
                )
              })
            )}

          </div>

        </section>

      </div>


      {/* =================================
          SUBJECT EDIT MODAL
      ================================= */}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">

          <form
            onSubmit={saveSubjects}
            className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
          >

            {/* Modal Header */}

            <div className="flex items-center justify-between border-b border-slate-100 p-6">

              <div>

                <p className="text-[10px] font-bold tracking-[0.16em] text-brand-600">
                  SUBJECT MANAGEMENT
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {editing.name}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Configure subjects assigned to
                  this teacher.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setEditing(null)
                }
                className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              >
                ×
              </button>

            </div>


            {/* Modal Body */}

            <div className="flex-1 overflow-y-auto p-6">

              {editing.assignedSubjects.length ===
              0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">

                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-white text-brand-700 shadow-sm">
                    <Icon name="book" />
                  </div>

                  <p className="mt-4 text-sm font-semibold text-slate-700">
                    No subjects assigned
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Add the first subject below.
                  </p>

                </div>
              ) : (
                <div className="space-y-4">

                  {editing.assignedSubjects.map(
                    (
                      subject,
                      index
                    ) => (
                      <div
                        key={index}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >

                        <div className="mb-3 flex items-center justify-between">

                          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                            Subject {index + 1}
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              setEditing(
                                (current) => ({
                                  ...current,
                                  assignedSubjects:
                                    current.assignedSubjects.filter(
                                      (
                                        _,
                                        i
                                      ) =>
                                        i !==
                                        index
                                    ),
                                })
                              )
                            }
                            className="text-xs font-bold text-rose-500 hover:text-rose-700"
                          >
                            Remove
                          </button>

                        </div>


                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">

                          <div className="lg:col-span-2">
                            <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                              Subject Name
                            </label>

                            <input
                              required
                              value={
                                subject.name
                              }
                              onChange={(event) =>
                                updateSubject(
                                  index,
                                  'name',
                                  event.target
                                    .value
                                )
                              }
                              placeholder="e.g. Data Structures"
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                            />
                          </div>


                          <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                              Subject Code
                            </label>

                            <input
                              required
                              value={
                                subject.code
                              }
                              onChange={(event) =>
                                updateSubject(
                                  index,
                                  'code',
                                  event.target
                                    .value
                                )
                              }
                              placeholder="CSE301"
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm uppercase outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                            />
                          </div>


                          <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                              Semester
                            </label>

                            <input
                              required
                              type="number"
                              min="1"
                              value={
                                subject.semester
                              }
                              onChange={(event) =>
                                updateSubject(
                                  index,
                                  'semester',
                                  event.target
                                    .value
                                )
                              }
                              placeholder="5"
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                            />
                          </div>


                          <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                              Field
                            </label>

                            <select
                              value={
                                subject.field
                              }
                              onChange={(event) =>
                                updateSubject(
                                  index,
                                  'field',
                                  event.target
                                    .value
                                )
                              }
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                            >
                              {data.fields.map(
                                (field) => (
                                  <option
                                    key={field}
                                    value={field}
                                  >
                                    {field}
                                  </option>
                                )
                              )}

                              {data.fields
                                .length ===
                                0 && (
                                <>
                                  <option value="CSE">
                                    CSE
                                  </option>
                                  <option value="AIML">
                                    AIML
                                  </option>
                                </>
                              )}
                            </select>
                          </div>

                        </div>

                      </div>
                    )
                  )}

                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  setEditing(
                    (current) => ({
                      ...current,
                      assignedSubjects: [
                        ...current.assignedSubjects,
                        freshSubject(),
                      ],
                    })
                  )
                }
                className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-brand-300 px-4 py-3 text-sm font-bold text-brand-600 transition hover:bg-brand-50"
              >
                <span className="text-lg">
                  +
                </span>
                Add Subject
              </button>

            </div>


            {/* Modal Footer */}

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 p-5">

              <button
                type="button"
                onClick={() =>
                  setEditing(null)
                }
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
              >
                Cancel
              </button>

              <button
                disabled={saving}
                className="rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? 'Saving...'
                  : 'Save Allocations'}
              </button>

            </div>

          </form>

        </div>
      )}

    </main>
  )
}

export default AcademicSetup