import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

function ProtectedRoute({ children, roles }) {
  const location = useLocation()

  const {
    token,
    user,
    isAuthenticated,
  } = useAuthStore()

  // ==========================================
  // NOT AUTHENTICATED
  // ==========================================

  if (!isAuthenticated || !token || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    )
  }

  // ==========================================
  // ROLE RESTRICTION
  // ==========================================

  if (
    roles?.length &&
    !roles.includes(user.role)
  ) {
    switch (user.role) {
      case 'student':
        return (
          <Navigate
            to="/student/"
            replace
          />
        )

      case 'teacher':
        return (
          <Navigate
            to="/teacher/dashboard"
            replace
          />
        )

      case 'admin':
        return (
          <Navigate
            to="/admin/dashboard"
            replace
          />
        )

      default:
        return (
          <Navigate
            to="/login"
            replace
          />
        )
    }
  }

  // ==========================================
  // AUTHORIZED
  // ==========================================

  return children
}

export default ProtectedRoute