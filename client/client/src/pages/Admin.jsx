import { useTranslation } from 'react-i18next'

const Admin = () => {
  const { t } = useTranslation()

  const dashboardStats = [
    { label: 'Total Users', value: '1,247', change: '+12%', icon: '👥' },
    { label: 'Active Sessions', value: '89', change: '+5%', icon: '💬' },
    { label: 'Appointments Today', value: '23', change: '+8%', icon: '📅' },
    { label: 'Crisis Alerts', value: '3', change: '-2%', icon: '🚨' }
  ]

  const recentActivity = [
    { type: 'user', message: 'New user registration: john.doe@email.com', time: '5 min ago' },
    { type: 'crisis', message: 'Crisis alert triggered for User #1234', time: '12 min ago' },
    { type: 'appointment', message: 'Appointment booked with Dr. Sarah Johnson', time: '18 min ago' },
    { type: 'system', message: 'System backup completed successfully', time: '25 min ago' }
  ]

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user': return '👤'
      case 'crisis': return '🚨'
      case 'appointment': return '📅'
      case 'system': return '⚙️'
      default: return '📝'
    }
  }

  const getActivityColor = (type) => {
    switch (type) {
      case 'user': return 'text-blue-600'
      case 'crisis': return 'text-red-600'
      case 'appointment': return 'text-green-600'
      case 'system': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor and manage the MindCare platform</p>
        </div>
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
            Generate Report
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            Settings
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change} from last week
                </p>
              </div>
              <div className="text-3xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                <div className="text-lg">{getActivityIcon(activity.type)}</div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className={`text-xs ${getActivityColor(activity.type)}`}>{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All Activity
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full px-4 py-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <div className="flex items-center space-x-3">
                <span>👥</span>
                <span className="text-sm font-medium">Manage Users</span>
              </div>
            </button>
            <button className="w-full px-4 py-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <div className="flex items-center space-x-3">
                <span>👨‍⚕️</span>
                <span className="text-sm font-medium">Manage Therapists</span>
              </div>
            </button>
            <button className="w-full px-4 py-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <div className="flex items-center space-x-3">
                <span>📊</span>
                <span className="text-sm font-medium">View Analytics</span>
              </div>
            </button>
            <button className="w-full px-4 py-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <div className="flex items-center space-x-3">
                <span>🚨</span>
                <span className="text-sm font-medium">Crisis Management</span>
              </div>
            </button>
            <button className="w-full px-4 py-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <div className="flex items-center space-x-3">
                <span>⚙️</span>
                <span className="text-sm font-medium">System Settings</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Development Notice */}
      <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-red-500">🔒</div>
          <div>
            <h3 className="text-red-800 font-medium">Admin Access Notice</h3>
            <p className="text-red-700 text-sm mt-1">
              This admin dashboard is currently in development. All data shown is for demonstration purposes only. 
              In production, this area would require proper authentication and authorization.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admin