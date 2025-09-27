import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import logoImage from '../assets/Mann-mitra.png' // Assuming this path is correct

// Mock API Call function to replace useEnhancedApi's apiCall
// In a real application, you'd replace the body of this with your actual fetch logic
const mockApiCall = async (url, method, body = null) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500))

  try {
    const token = localStorage.getItem('token')
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    }

    const config = {
      method: method,
      headers: headers,
      body: body ? JSON.stringify(body) : undefined
    }

    // Replace the real fetch with mock data for simplicity if the backend is not set up
    if (url === '/api/v1/admin/overview') {
      return {
        success: true,
        data: {
          overview: {
            totalUsers: 3450,
            activeCounsellors: 42,
            todayAppointments: 12,
            crisisAlerts: 3
          }
        }
      }
    } else if (url === '/api/v1/admin/counsellors') {
      return {
        success: true,
        data: [
          { id: 101, name: 'Dr. Priya Sharma', email: 'priya@mannmitra.com', department: 'Psychology', specialization: 'Child Counseling', isActive: true },
          { id: 102, name: 'Mr. Vivek Singh', email: 'vivek@mannmitra.com', department: 'Social Work', specialization: 'Substance Abuse', isActive: false },
          { id: 103, name: 'Dr. Anita Rao', email: 'anita@mannmitra.com', department: 'Mental Health', specialization: 'Anxiety', isActive: true },
        ]
      }
    }

    // Fallback for actual fetch if mock data doesn't cover the URL
    // const response = await fetch(url, config)
    // const data = await response.json()
    
    // if (!response.ok) {
    //   throw new Error(data.message || `API call to ${url} failed with status ${response.status}`)
    // }

    // return { success: true, data: data }
    return { success: false, error: `Mock: Unknown API endpoint: ${url}` }

  } catch (error) {
    return { success: false, error: error.message || 'Network error' }
  }
}

// Helper to fetch the token from localStorage
const getToken = () => localStorage.getItem('token')

const AdminDashboardNew = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  // Removed: const { apiCall, loading, error, rateLimitError, retryCount, clearRateLimitError } = useEnhancedApi()
  
  const [activeTab, setActiveTab] = useState('overview')
  const [counsellors, setCounsellors] = useState([])
  const [dashboardData, setDashboardData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddCounsellor, setShowAddCounsellor] = useState(false)
  const [apiError, setApiError] = useState(null)

  // Fetch dashboard data and counsellors on tab change
  useEffect(() => {
    // Clear old errors when tab changes
    setApiError(null)

    if (activeTab === 'overview') {
      fetchDashboardData()
    } else if (activeTab === 'counsellors') {
      fetchCounsellors()
    } else {
      setIsLoading(false)
    }
  }, [activeTab])

  // Initial data fetch on mount
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    setApiError(null)
    
    // Replacing apiCall with mockApiCall
    try {
      const result = await mockApiCall('/api/v1/admin/overview', 'GET')
      
      if (result.success) {
        setDashboardData(result.data)
      } else {
        setApiError(result.error || 'Failed to fetch dashboard data')
      }
    } catch (err) {
      setApiError(err.message || 'Failed to fetch dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCounsellors = async () => {
    // Note: This is now called via the useEffect upon tab change, so the initial setIsLoading should happen outside or be managed to avoid double-loading.
    // We'll only set API error here, keeping isLoading to false if it was already resolved by fetchDashboardData
    setApiError(null)

    // Replacing apiCall with mockApiCall
    try {
      const result = await mockApiCall('/api/v1/admin/counsellors', 'GET')
      
      if (result.success) {
        setCounsellors(result.data)
      } else {
        setApiError(result.error || 'Failed to fetch counsellors')
      }
    } catch (err) {
      setApiError(err.message || 'Failed to fetch counsellors')
    }
  }
  
  // Removed handleRetryAfterRateLimit as rate limit handling is gone

  const tabs = [
    { id: 'overview', name: 'Dashboard Overview', icon: '📊' },
    { id: 'counsellors', name: 'Counsellor Management', icon: '👥' },
    { id: 'peer-approval', name: 'Peer Approval', icon: '✋' },
    { id: 'students', name: 'Student Analytics', icon: '🎓' },
    { id: 'crisis', name: 'Crisis Management', icon: '🚨' },
    { id: 'reports', name: 'Reports', icon: '📈' },
    { id: 'courses', name: 'Course Management', icon: '📚' }
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
              {/* Removed RateLimitStatusIndicator */}
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

      {/* Removed Rate Limit Notification */}
      {/* Rate Limit Notification UI removed */}

      {/* Error Notification */}
      {apiError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{apiError}</p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    type="button"
                    onClick={() => setApiError(null)}
                    className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100"
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
        {activeTab === 'peer-approval' && <PeerApprovalTab />}
        {activeTab === 'students' && <StudentAnalyticsTab />}
        {activeTab === 'crisis' && <CrisisManagementTab />}
        {activeTab === 'reports' && <ReportsTab />}
        {activeTab === 'courses' && <CourseManagementTab />}
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
      // Using standard fetch and getToken helper
      const token = getToken()
      const response = await fetch(`/api/v1/admin/counsellors/${counsellor.id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !counsellor.isActive })
      })

      if (!response.ok) {
        throw new Error('Failed to toggle status')
      }

      onRefresh()
    } catch (error) {
      console.error('Error toggling counsellor status:', error)
      alert(`Error: ${error.message}`) // Simple error display
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
      // Using standard fetch and getToken helper
      const token = getToken()
      const response = await fetch('/api/v1/admin/counsellors', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok && data.success) { // Check both HTTP status and API response success flag
        onSuccess()
      } else {
        setError(data.message || 'Failed to create counsellor')
      }
    } catch (error) {
      console.error('Error creating counsellor:', error)
      setError('Failed to create counsellor due to a network or server issue.')
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

// Peer Approval Tab Component (No changes needed, already uses local state)
const PeerApprovalTab = () => {
  const [pendingPeers, setPendingPeers] = useState([
    {
      id: 1,
      name: 'Rahul Sharma',
      email: 'rahul.sharma@college.edu',
      college: 'Delhi Technical University',
      year: '3rd Year',
      specialization: 'Anxiety & Stress Management',
      experience: '2 years peer counseling',
      appliedDate: '2024-01-15',
      status: 'pending'
    },
    {
      id: 2,
      name: 'Priya Patel',
      email: 'priya.patel@college.edu',
      college: 'Mumbai University',
      year: '4th Year',
      specialization: 'Depression Support',
      experience: '1.5 years peer support',
      appliedDate: '2024-01-14',
      status: 'pending'
    },
    {
      id: 3,
      name: 'Arjun Singh',
      email: 'arjun.singh@college.edu',
      college: 'Bangalore Institute of Technology',
      year: '2nd Year',
      specialization: 'General Mental Health',
      experience: '6 months volunteer work',
      appliedDate: '2024-01-13',
      status: 'pending'
    }
  ])

  const handleApproval = (id, action) => {
    setPendingPeers(peers => 
      peers.map(peer => 
        peer.id === id ? { ...peer, status: action } : peer
      )
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Peer Student Approval</h2>
          <p className="text-gray-600">Review and approve peer counselor applications</p>
        </div>
        <div className="flex space-x-2">
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
            {pendingPeers.filter(p => p.status === 'pending').length} Pending
          </span>
        </div>
      </div>

      {/* Pending Applications */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Pending Applications</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {pendingPeers.map((peer) => (
            <div key={peer.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-indigo-600">
                        {peer.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{peer.name}</h4>
                      <p className="text-sm text-gray-500">{peer.email}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">College</p>
                      <p className="text-sm text-gray-900">{peer.college}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Year</p>
                      <p className="text-sm text-gray-900">{peer.year}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Specialization</p>
                      <p className="text-sm text-gray-900">{peer.specialization}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Experience</p>
                      <p className="text-sm text-gray-900">{peer.experience}</p>
                    </div>
                  </div>
                </div>
                
                {peer.status === 'pending' && (
                  <div className="flex space-x-3 ml-4">
                    <button
                      onClick={() => handleApproval(peer.id, 'rejected')}
                      className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 text-sm font-medium"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApproval(peer.id, 'approved')}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                    >
                      Approve
                    </button>
                  </div>
                )}
                
                {peer.status === 'approved' && (
                  <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Approved
                  </span>
                )}
                
                {peer.status === 'rejected' && (
                  <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    Rejected
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Student Analytics Tab Component (No changes needed, already uses local state)
const StudentAnalyticsTab = () => {
  const [analyticsData] = useState({
    overview: {
      totalStudents: 2847,
      activeStudents: 1923,
      newRegistrations: 156,
      engagementRate: 78.5
    },
    mentalHealthLevels: [
      { level: 'Excellent', count: 852, percentage: 30, color: '#10B981' },
      { level: 'Good', count: 1138, percentage: 40, color: '#F59E0B' },
      { level: 'Fair', count: 569, percentage: 20, color: '#EF4444' },
      { level: 'Poor', count: 284, percentage: 10, color: '#DC2626' }
    ],
    courseEngagement: [
      { course: 'Stress Management', enrolled: 456, completed: 324, completion: 71 },
      { course: 'Mindfulness Basics', enrolled: 389, completed: 298, completion: 77 },
      { course: 'Anxiety Coping', enrolled: 234, completed: 167, completion: 71 },
      { course: 'Study Skills', enrolled: 345, completed: 289, completion: 84 }
    ],
    peerTalkStats: {
      totalSessions: 1247,
      activePeers: 23,
      avgSessionDuration: 45,
      satisfactionRate: 92
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Student Analytics</h2>
          <p className="text-gray-600">Comprehensive insights into student engagement and mental health</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalStudents.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Students</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.activeStudents.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <span className="text-2xl">🆕</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">New This Month</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.newRegistrations}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.engagementRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mental Health Levels Distribution */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Mental Health Levels Distribution</h3>
        <div className="space-y-4">
          {analyticsData.mentalHealthLevels.map((level, index) => (
            <div key={index} className="flex items-center">
              <div className="w-24 text-sm font-medium text-gray-700">{level.level}</div>
              <div className="flex-1 mx-4">
                <div className="bg-gray-200 rounded-full h-4">
                  <div 
                    className="h-4 rounded-full" 
                    style={{ width: `${level.percentage}%`, backgroundColor: level.color }}
                  ></div>
                </div>
              </div>
              <div className="w-20 text-sm text-gray-600 text-right">
                {level.count} ({level.percentage}%)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Course Engagement */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Course Engagement</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolled</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completion Rate</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analyticsData.courseEngagement.map((course, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.course}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.enrolled}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.completed}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{width: `${course.completion}%`}}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{course.completion}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Peer Talk Statistics */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Peer Talk Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{analyticsData.peerTalkStats.totalSessions}</p>
            <p className="text-sm text-gray-600">Total Sessions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{analyticsData.peerTalkStats.activePeers}</p>
            <p className="text-sm text-gray-600">Active Peers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{analyticsData.peerTalkStats.avgSessionDuration}m</p>
            <p className="text-sm text-gray-600">Avg Session Duration</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{analyticsData.peerTalkStats.satisfactionRate}%</p>
            <p className="text-sm text-gray-600">Satisfaction Rate</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Enhanced Crisis Management Tab Component (No changes needed, already uses local state)
const CrisisManagementTab = () => {
  const [crisisAlerts] = useState([
    {
      id: 1,
      studentId: 'ST2024001',
      studentName: 'Anonymous User #1',
      alertType: 'High PHQ-9 Score',
      severity: 'Critical',
      score: 24,
      timestamp: '2024-01-15T14:30:00Z',
      status: 'Active',
      assignedTo: 'Dr. Sarah Johnson',
      notes: 'Student scored 24/27 on PHQ-9. Immediate intervention required.'
    },
    {
      id: 2,
      studentId: 'ST2024002', 
      studentName: 'Anonymous User #2',
      alertType: 'Self-harm Keywords',
      severity: 'Critical',
      score: null,
      timestamp: '2024-01-15T13:45:00Z',
      status: 'In Progress',
      assignedTo: 'Dr. Mike Wilson',
      notes: 'Chat session contained concerning self-harm keywords.'
    },
    {
      id: 3,
      studentId: 'ST2024003',
      studentName: 'Anonymous User #3',
      alertType: 'Emotional Distress',
      severity: 'High',
      score: 18,
      timestamp: '2024-01-15T12:20:00Z',
      status: 'Resolved',
      assignedTo: 'Dr. Emily Chen',
      notes: 'Student expressed severe emotional distress during counseling session.'
    }
  ])

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-800'
      case 'High': return 'bg-orange-100 text-orange-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-red-100 text-red-800'
      case 'In Progress': return 'bg-yellow-100 text-yellow-800'
      case 'Resolved': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">🚨 Crisis Management</h2>
          <p className="text-gray-600">Monitor and manage critical mental health alerts</p>
        </div>
        <div className="flex space-x-2">
          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
            {crisisAlerts.filter(a => a.status === 'Active').length} Active Alerts
          </span>
        </div>
      </div>

      {/* Crisis Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-red-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <span className="text-2xl">🚨</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Alerts</p>
              <p className="text-2xl font-bold text-red-600">
                {crisisAlerts.filter(a => a.status === 'Active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-yellow-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">
                {crisisAlerts.filter(a => a.status === 'In Progress').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-green-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resolved Today</p>
              <p className="text-2xl font-bold text-green-600">
                {crisisAlerts.filter(a => a.status === 'Resolved').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <span className="text-2xl">📞</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-blue-600">8m</p>
            </div>
          </div>
        </div>
      </div>

      {/* Crisis Alerts Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Crisis Alerts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alert Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {crisisAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{alert.studentName}</div>
                      <div className="text-sm text-gray-500">{alert.studentId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{alert.alertType}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {alert.score ? `${alert.score}/27` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(alert.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(alert.status)}`}>
                      {alert.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{alert.assignedTo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">View</button>
                    <button className="text-green-600 hover:text-green-900">Resolve</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contacts & Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">Crisis Helpline</h4>
            <p className="text-2xl font-bold text-red-600">1-800-CRISIS</p>
            <p className="text-sm text-gray-600">24/7 Emergency Support</p>
          </div>
          <div className="p-4 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Campus Counseling</h4>
            <p className="text-2xl font-bold text-blue-600">1-800-CAMPUS</p>
            <p className="text-sm text-gray-600">Mon-Fri 8AM-8PM</p>
          </div>
          <div className="p-4 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Mental Health Services</h4>
            <p className="text-2xl font-bold text-green-600">1-800-MENTAL</p>
            <p className="text-sm text-gray-600">Professional Support</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Enhanced Reports Tab Component (No changes needed, already uses local state)
const ReportsTab = () => {
  const [selectedReportType, setSelectedReportType] = useState('mental-health')
  const [dateRange, setDateRange] = useState('last-30-days')

  const reportTypes = [
    { id: 'mental-health', name: 'Mental Health Levels Report', icon: '🧠' },
    { id: 'chatbot', name: 'Chatbot Interaction Report', icon: '🤖' },
    { id: 'peer-talk', name: 'Peer Talk Sessions Report', icon: '💬' },
    { id: 'courses', name: 'Course Completion Report', icon: '📚' },
    { id: 'crisis', name: 'Crisis Intervention Report', icon: '🚨' },
    { id: 'overall', name: 'Overall Platform Analytics', icon: '📊' }
  ]

  const sampleReports = {
    'mental-health': {
      title: 'Mental Health Levels Report',
      data: [
        { category: 'Excellent Mental Health', count: 852, percentage: 30 },
        { category: 'Good Mental Health', count: 1138, percentage: 40 },
        { category: 'Fair Mental Health', count: 569, percentage: 20 },
        { category: 'Poor Mental Health', count: 284, percentage: 10 },
      ]
    },
    'chatbot': {
      title: 'Chatbot Buddy Interaction Report',
      data: [
        { metric: 'Total Conversations', value: '15,432' },
        { metric: 'Average Session Duration', value: '12m 34s' },
        { metric: 'Most Common Topics', value: 'Stress (34%), Anxiety (28%), Study Issues (22%)' },
        { metric: 'Satisfaction Rate', value: '89%' },
        { metric: 'Crisis Escalations', value: '23' }
      ]
    },
    'peer-talk': {
      title: 'Peer Talk Sessions Report', 
      data: [
        { metric: 'Total Sessions Conducted', value: '1,247' },
        { metric: 'Active Peer Counselors', value: '23' },
        { metric: 'Average Session Duration', value: '45 minutes' },
        { metric: 'Student Satisfaction', value: '92%' },
        { metric: 'Successful Resolutions', value: '78%' }
      ]
    },
    'courses': {
      title: 'Course Completion Report',
      data: [
        { course: 'Stress Management Techniques', enrolled: 456, completed: 324, rate: 71 },
        { course: 'Mindfulness and Meditation', enrolled: 389, completed: 298, rate: 77 },
        { course: 'Anxiety Coping Strategies', enrolled: 234, completed: 167, rate: 71 },
        { course: 'Study Skills & Time Management', enrolled: 345, completed: 289, rate: 84 },
        { course: 'Building Resilience', enrolled: 278, completed: 201, rate: 72 }
      ]
    }
  }

  const generateReport = () => {
    // Simulate report generation
    alert(`Generating ${reportTypes.find(r => r.id === selectedReportType)?.name} for ${dateRange}...`)
  }

  const exportReport = (format) => {
    alert(`Exporting report as ${format.toUpperCase()}...`)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">📈 Reports & Analytics</h2>
          <p className="text-gray-600">Generate comprehensive reports on platform usage and student well-being</p>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Report Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedReportType(type.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedReportType === type.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{type.icon}</span>
                <span className="font-medium text-gray-900">{type.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Date Range & Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="last-7-days">Last 7 Days</option>
              <option value="last-30-days">Last 30 Days</option>
              <option value="last-90-days">Last 90 Days</option>
              <option value="last-year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={generateReport}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              Generate Report
            </button>
            <button
              onClick={() => exportReport('pdf')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium"
            >
              Export PDF
            </button>
            <button
              onClick={() => exportReport('csv')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-medium"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Report Preview */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {sampleReports[selectedReportType]?.title || 'Report Preview'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">Data for {dateRange}</p>
        </div>
        
        <div className="p-6">
          {selectedReportType === 'mental-health' && (
            <div className="space-y-4">
              {sampleReports['mental-health'].data.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{item.category}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-600">{item.count} students</span>
                    <span className="font-bold text-blue-600">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {selectedReportType === 'chatbot' && (
            <div className="space-y-4">
              {sampleReports['chatbot'].data.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{item.metric}</span>
                  <span className="font-bold text-green-600">{item.value}</span>
                </div>
              ))}
            </div>
          )}
          
          {selectedReportType === 'peer-talk' && (
            <div className="space-y-4">
              {sampleReports['peer-talk'].data.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{item.metric}</span>
                  <span className="font-bold text-purple-600">{item.value}</span>
                </div>
              ))}
            </div>
          )}
          
          {selectedReportType === 'courses' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolled</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sampleReports['courses'].data.map((course, index) => (
                    <tr key={index}>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{course.course}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{course.enrolled}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{course.completed}</td>
                      <td className="px-4 py-4 text-sm">
                        <span className="font-bold text-green-600">{course.rate}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Course Management Tab Component (No changes needed, already uses local state)
const CourseManagementTab = () => {
  const [showAddCourseForm, setShowAddCourseForm] = useState(false)
  const [courses, setCourses] = useState([
    {
      id: 1,
      title: 'Stress Management Techniques',
      description: 'Learn effective methods to manage and reduce stress in academic and personal life.',
      language: 'English',
      duration: '4 weeks',
      level: 'Beginner',
      enrolled: 456,
      status: 'Active'
    },
    {
      id: 2,
      title: 'मानसिक स्वास्थ्य और योग',
      description: 'योग और ध्यान के माध्यम से मानसिक स्वास्थ्य में सुधार करें।',
      language: 'Hindi',
      duration: '3 weeks',
      level: 'Intermediate',
      enrolled: 234,
      status: 'Active'
    },
    {
      id: 3,
      title: 'Mindfulness and Meditation',
      description: 'Introduction to mindfulness practices and meditation techniques.',
      language: 'English',
      duration: '2 weeks',
      level: 'Beginner',
      enrolled: 389,
      status: 'Active'
    }
  ])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">📚 Course Management</h2>
          <p className="text-gray-600">Add and manage mental health courses and resources</p>
        </div>
        <button
          onClick={() => setShowAddCourseForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
        >
          + Add New Course
        </button>
      </div>

      {/* Add Course Form Modal */}
      {showAddCourseForm && (
        <AddCourseForm 
          onClose={() => setShowAddCourseForm(false)}
          onSave={(courseData) => {
            setCourses([...courses, { ...courseData, id: courses.length + 1, enrolled: 0, status: 'Active' }])
            setShowAddCourseForm(false)
          }}
        />
      )}

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{course.title}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                course.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {course.status}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description}</p>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Language:</span>
                <span className="font-medium">{course.language}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Duration:</span>
                <span className="font-medium">{course.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Level:</span>
                <span className="font-medium">{course.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Enrolled:</span>
                <span className="font-medium text-blue-600">{course.enrolled} students</span>
              </div>
            </div>
            
            <div className="mt-6 flex space-x-3">
              <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-sm font-medium">
                Edit Course
              </button>
              <button className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 text-sm font-medium">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Add Course Form Component (No changes needed, already uses local state)
const AddCourseForm = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: 'English',
    duration: '',
    level: 'Beginner',
    category: 'Mental Health',
    tags: '',
    resources: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Add New Course</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Stress Management Techniques"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe what students will learn in this course..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language *
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({...formData, language: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="English">English</option>
                  <option value="Hindi">हिन्दी (Hindi)</option>
                  <option value="Bengali">বাংলা (Bengali)</option>
                  <option value="Tamil">தமிழ் (Tamil)</option>
                  <option value="Telugu">తెలుగు (Telugu)</option>
                  <option value="Marathi">मराठी (Marathi)</option>
                  <option value="Gujarati">ગુજરાતી (Gujarati)</option>
                  <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                  <option value="Malayalam">മലയാളം (Malayalam)</option>
                  <option value="Punjabi">ਪੰਜਾਬੀ (Punjabi)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration *
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Duration</option>
                  <option value="1 week">1 Week</option>
                  <option value="2 weeks">2 Weeks</option>
                  <option value="3 weeks">3 Weeks</option>
                  <option value="4 weeks">4 Weeks</option>
                  <option value="6 weeks">6 Weeks</option>
                  <option value="8 weeks">8 Weeks</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level *
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Mental Health">Mental Health</option>
                  <option value="Stress Management">Stress Management</option>
                  <option value="Mindfulness">Mindfulness & Meditation</option>
                  <option value="Anxiety">Anxiety Management</option>
                  <option value="Depression">Depression Support</option>
                  <option value="Study Skills">Study Skills</option>
                  <option value="Life Skills">Life Skills</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., stress, anxiety, mindfulness, wellness"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Resources
              </label>
              <textarea
                rows={3}
                value={formData.resources}
                onChange={(e) => setFormData({...formData, resources: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Links to videos, PDFs, articles, or other helpful resources..."
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Add Course
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardNew