import { useAuth } from '../contexts/AuthContext'
import StudentDashboard from '../components/dashboards/StudentDashboard'
import CounsellorDashboard from '../components/dashboards/CounsellorDashboard'
import AdminDashboard from '../components/dashboards/AdminDashboard'
import ModeratorDashboard from '../components/dashboards/ModeratorDashboard'

const Dashboard = () => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Render dashboard based on user role
  switch (user?.role) {
    case 'student':
      return <StudentDashboard />
    case 'counsellor':
      return <CounsellorDashboard />
    case 'admin':
      return <AdminDashboard />
    case 'moderator':
      return <ModeratorDashboard />
    default:
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Unknown Role</h2>
            <p className="text-gray-600">Your account role is not recognized. Please contact support.</p>
          </div>
        </div>
      )
  }
}

export default Dashboard