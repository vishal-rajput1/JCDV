import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'

import Sidebar from './components/Sidebar'
import Header from './components/Header'

import Login from './pages/Login'

import Dashboard from './pages/student/Dashboard'
import Attendance from './pages/student/Attendance'
import SessionalMarks from './pages/student/SessionalMarks'
import UniversityResult from './pages/student/UniversityResult'
import TeacherSidebar from './components/TeacherSidebar'
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import TeacherProfile from './pages/teacher/TeacherProfile'
import TeacherSubjects from './pages/teacher/TeacherSubjects'
import TeacherSubjectDetails from './pages/teacher/TeacherSubjectDetails'
import TeacherStudents from './pages/teacher/TeacherStudents'
import TeacherStudentDetails from './pages/teacher/TeacherStudentDetails'
import TeacherAttendance from './pages/teacher/TeacherAttendance'
import AttendanceHistory from './pages/teacher/AttendanceHistory'
import TeacherSessionalMarks from './pages/teacher/TeacherSessionalMarks'
import TeacherAssignments from './pages/teacher/TeacherAssignments'
import AssignmentSubmissions from './pages/teacher/AssignmentSubmissions'


function StudentLayout() {
  return (
    <main className="min-h-screen bg-slate-50 font-sans text-ink">

      <Sidebar />

      <section className="lg:pl-72">

        <Header />

        <div className="mx-auto max-w-7xl px-5 py-8 lg:px-10">

          <Routes>

            <Route
              path="/"
              element={<Dashboard />}
            />

            <Route
              path="/attendance"
              element={<Attendance />}
            />

            <Route
              path="/sessionals"
              element={<SessionalMarks />}
            />

            <Route
              path="/university-result"
              element={<UniversityResult />}
            />

          </Routes>

        </div>

      </section>

    </main>
  )
}


function TeacherLayout() {
  return (
    <main className="min-h-screen bg-slate-50 font-sans text-ink">
      <TeacherSidebar />
      <section className="lg:pl-72">
        <header className="flex h-20 items-center justify-end border-b border-slate-200 bg-white px-5 lg:px-10">
          <span className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700">Teacher Portal</span>
        </header>
        <div className="mx-auto max-w-7xl px-5 py-8 lg:px-10">
          <Routes>
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="profile" element={<TeacherProfile />} />
            <Route path="subjects" element={<TeacherSubjects />} />
            <Route path="subjects/:subjectId" element={<TeacherSubjectDetails />} />
            <Route path="students" element={<TeacherStudents />} />
            <Route path="students/:studentId" element={<TeacherStudentDetails />} />
            <Route path="attendance" element={<TeacherAttendance />} />
            <Route path="attendance/history" element={<AttendanceHistory />} />
            <Route path="marks" element={<TeacherSessionalMarks />} />
            <Route path="assignments" element={<TeacherAssignments />} />
            <Route path="assignments/:assignmentId" element={<AssignmentSubmissions />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </div>
      </section>
    </main>
  )
}

function TeacherRoute({ children }) {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    return user?.role === 'teacher' ? children : <Navigate to="/login" replace />
  } catch {
    return <Navigate to="/login" replace />
  }
}


function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 p-10">
      <h1 className="text-3xl font-bold">
        Admin Dashboard ⚙️
      </h1>

      <p className="mt-2 text-muted">
        Admin portal coming next.
      </p>
    </div>
  )
}


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Login */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Student */}
        <Route
          path="/student/*"
          element={<StudentLayout />}
        />

        {/* Teacher */}
        <Route
          path="/teacher/*"
          element={<TeacherRoute><TeacherLayout /></TeacherRoute>}
        />

        {/* Admin */}
        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />

      </Routes>

    </BrowserRouter>
  )
}

export default App
