import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Link } from 'react-router-dom'

const StudentDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    screeningsCompleted: 0,
    appointmentsScheduled: 0,
    forumPosts: 0,
    resourcesAccessed: 0
  })

  useEffect(() => {
    // Fetch student stats from API
    // This is a placeholder - replace with actual API calls
    setStats({
      screeningsCompleted: 3,
      appointmentsScheduled: 1,
      forumPosts: 5,
      resourcesAccessed: 12
    })
  }, [])

  const quickActions = [
    {
      title: 'Take Mental Health Screening',
      description: 'Complete a quick assessment to understand your mental well-being',
      icon: '🧠',
      link: '/screening',
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
    {
      title: 'Book Counselling Session',
      description: 'Schedule a session with a professional counsellor',
      icon: '💬',
      link: '/booking',
      color: 'bg-green-50 hover:bg-green-100 border-green-200'
    },
    {
      title: 'Join Community Forum',
      description: 'Connect with peers and share experiences',
      icon: '👥',
      link: '/forum',
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200'
    },
    {
      title: 'Access Resources',
      description: 'Browse helpful articles, videos, and tools',
      icon: '📚',
      link: '/resources',
      color: 'bg-orange-50 hover:bg-orange-100 border-orange-200'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your mental health journey today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Screenings Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.screeningsCompleted}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Appointments Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">{stats.appointmentsScheduled}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Forum Posts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.forumPosts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📖</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Resources Accessed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.resourcesAccessed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className={`p-6 rounded-lg border-2 transition-colors ${action.color}`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-3">{action.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600">✓</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Completed PHQ-9 screening</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600">📅</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Scheduled counselling appointment</p>
                  <p className="text-xs text-gray-500">Yesterday</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600">💬</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Posted in "Stress Management" forum</p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard