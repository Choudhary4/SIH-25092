import { useAuth } from '../../contexts/AuthContext'
import { Navigate } from 'react-router-dom'

const RoleGuard = ({ 
  children, 
  allowedRoles = [], 
  requireAuth = true,
  fallbackPath = '/login',
  unauthorizedPath = '/unauthorized' 
}) => {
  const { isAuthenticated, isLoading, user, hasAnyRole } = useAuth()

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={fallbackPath} replace />
  }

  // Check role-based access
  if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
    return <Navigate to={unauthorizedPath} replace />
  }

  return children
}

export default RoleGuard