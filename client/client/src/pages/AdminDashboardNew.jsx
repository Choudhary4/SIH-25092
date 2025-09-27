import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import logoImage from '../assets/Mann-mitra.png'

const AdminDashboardNew = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [counsellors, setCounsellors] = useState([])
  const [dashboardData, setDashboardData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddCounsellor, setShowAddCounsellor] = useState(false)

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData()
    if (activeTab === 'counsellors') {
      fetchCounsellors()
    }
  }, [activeTab])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/v1/admin/overview', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setDashboardData(data.data)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCounsellors = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/v1/admin/counsellors', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setCounsellors(data.data)
      }
    } catch (error) {
      console.error('Error fetching counsellors:', error)
    }
  }

  const tabs = [
    { id: 'overview', name: 'Dashboard Overview', icon: '📊' },
    { id: 'counsellors', name: 'Counsellor Management', icon: '👥' },
    { id: 'students', name: 'Student Analytics', icon: '🎓' },
    { id: 'crisis', name: 'Crisis Management', icon: '🚨' },
    { id: 'reports', name: 'Reports', icon: '📈' }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                <img 
                  src={logoImage} 
                  alt="Mann-Mitra Logo" 
                  className="h-32 w-auto"
                />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Manage your Mann-Mitra platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <OverviewTab data={dashboardData} />}
        {activeTab === 'counsellors' && (
          <CounsellorManagementTab 
            counsellors={counsellors} 
            onRefresh={fetchCounsellors}
            showAddForm={showAddCounsellor}
            setShowAddForm={setShowAddCounsellor}
          />
        )}
        {activeTab === 'students' && <StudentAnalyticsTab />}
        {activeTab === 'crisis' && <CrisisManagementTab />}
        {activeTab === 'reports' && <ReportsTab />}
      </div>
    </div>
  )
}

// Overview Tab Component
const OverviewTab = ({ data }) => {
  if (!data) return <div>Loading...</div>

  const stats = [
    { label: 'Total Users', value: data.overview?.totalUsers || 0, change: '+12%', icon: '👥' },
    { label: 'Active Counsellors', value: data.overview?.activeCounsellors || 0, change: '+5%', icon: '🧑‍⚕️' },
    { label: 'Appointments Today', value: data.overview?.todayAppointments || 0, change: '+8%', icon: '📅' },
    { label: 'Crisis Alerts', value: data.overview?.crisisAlerts || 0, change: '-2%', icon: '🚨' }
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change} from last month
                </p>
              </div>
              <div className="text-4xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm text-gray-600">Sample activity item {item}</p>
                <p className="text-xs text-gray-400 ml-auto">{item} min ago</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Counsellor Management Tab Component
const CounsellorManagementTab = ({ counsellors, onRefresh, showAddForm, setShowAddForm }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Counsellor Management</h2>
          <p className="text-gray-600">Add, edit, and manage counsellor accounts</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          + Add Counsellor
        </button>
      </div>

      {/* Add Counsellor Form */}
      {showAddForm && (
        <AddCounsellorForm
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false)
            onRefresh()
          }}
        />
      )}

      {/* Counsellors List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Current Counsellors</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Counsellor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specialization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {counsellors.map((counsellor) => (
                <CounsellorRow
                  key={counsellor.id}
                  counsellor={counsellor}
                  onRefresh={onRefresh}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Individual Counsellor Row Component
const CounsellorRow = ({ counsellor, onRefresh }) => {
  const [isEditing, setIsEditing] = useState(false)

  const toggleStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/v1/admin/counsellors/${counsellor.id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !counsellor.isActive })
      })
      onRefresh()
    } catch (error) {
      console.error('Error toggling counsellor status:', error)
    }
  }

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {counsellor.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{counsellor.name}</div>
            <div className="text-sm text-gray-500">{counsellor.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {counsellor.department || 'Not specified'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {counsellor.specialization || 'General Counselling'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          counsellor.isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {counsellor.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
        <button
          onClick={() => setIsEditing(true)}
          className="text-red-600 hover:text-red-900"
        >
          Edit
        </button>
        <button
          onClick={toggleStatus}
          className={`${
            counsellor.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
          }`}
        >
          {counsellor.isActive ? 'Deactivate' : 'Activate'}
        </button>
      </td>
    </tr>
  )
}

// Add Counsellor Form Component
const AddCounsellorForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    specialization: '',
    experience: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/v1/admin/counsellors', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        onSuccess()
      } else {
        setError(data.message || 'Failed to create counsellor')
      }
    } catch (error) {
      console.error('Error creating counsellor:', error)
      setError('Failed to create counsellor')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Add New Counsellor</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialization
              </label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience (Years)
              </label>
              <input
                type="number"
                min="0"
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Counsellor'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Placeholder components for other tabs
const StudentAnalyticsTab = () => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <h3 className="text-lg font-medium text-gray-900 mb-4">Student Analytics</h3>
    <p className="text-gray-600">Student analytics dashboard will be implemented here.</p>
  </div>
)

const CrisisManagementTab = () => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <h3 className="text-lg font-medium text-gray-900 mb-4">Crisis Management</h3>
    <p className="text-gray-600">Crisis management tools will be implemented here.</p>
  </div>
)

const ReportsTab = () => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <h3 className="text-lg font-medium text-gray-900 mb-4">Reports</h3>
    <p className="text-gray-600">Report generation and export functionality will be implemented here.</p>
  </div>
)

export default AdminDashboardNew