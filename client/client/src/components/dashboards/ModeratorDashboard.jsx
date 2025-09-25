import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Link } from 'react-router-dom'

const ModeratorDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    pendingReports: 0,
    resolvedReports: 0,
    forumPosts: 0,
    flaggedContent: 0
  })

  useEffect(() => {
    // Fetch moderator stats from API
    // This is a placeholder - replace with actual API calls
    setStats({
      pendingReports: 7,
      resolvedReports: 23,
      forumPosts: 156,
      flaggedContent: 3
    })
  }, [])

  const quickActions = [
    {
      title: 'Review Reports',
      description: 'Handle user reports and content violations',
      icon: '🚨',
      link: '/moderator/reports',
      color: 'bg-red-50 hover:bg-red-100 border-red-200'
    },
    {
      title: 'Moderate Forum',
      description: 'Monitor and moderate community discussions',
      icon: '👥',
      link: '/moderator/forum',
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
    {
      title: 'Content Review',
      description: 'Review flagged posts and comments',
      icon: '🔍',
      link: '/moderator/content',
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200'
    },
    {
      title: 'User Warnings',
      description: 'Issue warnings and manage user violations',
      icon: '⚠️',
      link: '/moderator/warnings',
      color: 'bg-orange-50 hover:bg-orange-100 border-orange-200'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Moderator Dashboard - {user?.name} 🛡️
          </h1>
          <p className="text-gray-600">
            Keep the community safe and supportive for everyone.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🚨</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pending Reports</p>
                <p className="text-2xl font-bold text-red-600">{stats.pendingReports}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Resolved Reports</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolvedReports}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
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
                <span className="text-2xl">🚩</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Flagged Content</p>
                <p className="text-2xl font-bold text-orange-600">{stats.flaggedContent}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Moderation Tools</h2>
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

        {/* Moderation Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Pending Reports</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-red-800">Harassment Report</span>
                    <span className="text-xs text-red-600">High Priority</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">User reported inappropriate behavior in forum</p>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-red-600 text-white text-xs rounded">Review</button>
                    <button className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded">Dismiss</button>
                  </div>
                </div>
                
                <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-orange-800">Spam Content</span>
                    <span className="text-xs text-orange-600">Medium Priority</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">Multiple spam posts detected</p>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-orange-600 text-white text-xs rounded">Review</button>
                    <button className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded">Dismiss</button>
                  </div>
                </div>
                
                <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-yellow-800">Off-topic Post</span>
                    <span className="text-xs text-yellow-600">Low Priority</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">Post doesn't match forum category</p>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-yellow-600 text-white text-xs rounded">Review</button>
                    <button className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded">Dismiss</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Recent Actions</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600">✓</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Resolved harassment report</p>
                    <p className="text-xs text-gray-500">30 minutes ago</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600">🚫</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Removed inappropriate post</p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600">⚠️</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Issued user warning</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600">👥</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Moderated forum discussion</p>
                    <p className="text-xs text-gray-500">3 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModeratorDashboard