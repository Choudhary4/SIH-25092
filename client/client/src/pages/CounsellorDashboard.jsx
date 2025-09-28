import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import logoImage from '../assets/Mann-mitra.png'
import { useApi } from '../hooks/useApi'

const CounsellorDashboard = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [appointments, setAppointments] = useState([])
  const [availability, setAvailability] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Get user info from localStorage
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('Mann-Mitra_token')
    
    console.log('Counsellor Dashboard - Token:', token)
    console.log('Counsellor Dashboard - User data:', userData)
    
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      console.log('Counsellor Dashboard - Parsed user:', parsedUser)
      
      // Check if user is actually a counsellor
      if (parsedUser.role !== 'counsellor') {
        console.warn('User is not a counsellor:', parsedUser.role)
      }
    } else {
      console.warn('No user data found in localStorage')
    }
    
    if (!token) {
      console.error('No authentication token found!')
    }
    
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Check if user is logged in and is a counsellor
      const token = localStorage.getItem('Mann-Mitra_token')
      const userData = localStorage.getItem('user')
      
      if (!token) {
        console.error('No token found, redirecting to login')
        navigate('/counsellor/login')
        return
      }
      
      if (!userData) {
        console.error('No user data found, redirecting to login')
        navigate('/counsellor/login')
        return
      }
      
      const user = JSON.parse(userData)
      if (user.role !== 'counsellor') {
        console.error('User is not a counsellor, redirecting')
        navigate('/counsellor/login')
        return
      }
      
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'appointments', name: 'Appointments', icon: '📅' },
    { id: 'certification', name: 'Certification Interviews', icon: '🏆' },
    { id: 'availability', name: 'Availability', icon: '⏰' },
    { id: 'reports', name: 'Session Reports', icon: '📄' },
    { id: 'profile', name: 'Profile', icon: '👤' }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
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
                  className="h-18 w-auto"
                />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Counsellor Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.name || 'Counsellor'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {user?.specialization && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {user.specialization}
                  </span>
                )}
              </div>
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
                    ? 'border-green-500 text-green-600'
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
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'appointments' && <AppointmentsTab />}
        {activeTab === 'certification' && <CertificationTab />}
        {activeTab === 'availability' && <AvailabilityTab />}
        {activeTab === 'reports' && <ReportsTab />}
        {activeTab === 'profile' && <ProfileTab user={user} />}
      </div>
    </div>
  )
}

// Dashboard Overview Tab
const DashboardTab = () => {
  const { callApi } = useApi()
  const [dashboardData, setDashboardData] = useState({
    appointments: [],
    stats: {
      today: 0,
      thisWeek: 0,
      pending: 0,
      completed: 0
    },
    loading: true
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await callApi('/api/v1/appointments/me', 'GET')
      
      if (response.success) {
        const serverResponse = response.data || response
        const appointments = serverResponse.appointments || []
        
        const today = new Date()
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
        
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay())
        
        const todayAppointments = appointments.filter(apt => {
          const appointmentDate = new Date(apt.slotStart)
          return appointmentDate >= startOfDay && appointmentDate < endOfDay
        })
        
        const weeklyAppointments = appointments.filter(apt => {
          const appointmentDate = new Date(apt.slotStart)
          return appointmentDate >= startOfWeek
        })
        
        const pendingAppointments = appointments.filter(apt => 
          apt.status === 'requested' || apt.status === 'pending'
        )
        
        const completedAppointments = appointments.filter(apt => 
          apt.status === 'completed'
        )

        setDashboardData({
          appointments: todayAppointments,
          stats: {
            today: todayAppointments.length,
            thisWeek: weeklyAppointments.length,
            pending: pendingAppointments.length,
            completed: completedAppointments.length
          },
          loading: false
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setDashboardData(prev => ({ ...prev, loading: false }))
    }
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const getModeLabel = (mode) => {
    switch (mode?.toLowerCase()) {
      case 'video': return 'Video Call'
      case 'tele': return 'Online Session'
      case 'in-person': return 'In-Person'
      default: return 'Session'
    }
  }

  const stats = [
    { 
      label: 'Today\'s Appointments', 
      value: dashboardData.stats.today, 
      change: dashboardData.stats.today > 0 ? 'Schedule active' : 'No appointments today', 
      icon: '📅' 
    },
    { 
      label: 'This Week\'s Sessions', 
      value: dashboardData.stats.thisWeek, 
      change: `${dashboardData.stats.completed} completed`, 
      icon: '💬' 
    },
    { 
      label: 'Pending Requests', 
      value: dashboardData.stats.pending, 
      change: 'Need your response', 
      icon: '⏳' 
    },
    { 
      label: 'Completed Sessions', 
      value: dashboardData.stats.completed, 
      change: 'This month', 
      icon: '✨' 
    }
  ]

  if (dashboardData.loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    )
  }

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
                <p className="text-sm text-green-600">{stat.change}</p>
              </div>
              <div className="text-4xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Today's Schedule ({dashboardData.appointments.length} appointments)</h3>
          <button
            onClick={fetchDashboardData}
            className="text-sm text-green-600 hover:text-green-700 mt-1"
          >
            🔄 Refresh
          </button>
        </div>
        <div className="p-6">
          {dashboardData.appointments.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">📅</span>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No appointments today</h4>
              <p className="text-gray-500">You have a free day! Check back tomorrow for new appointments.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData.appointments
                .sort((a, b) => new Date(a.slotStart) - new Date(b.slotStart))
                .map((appointment) => (
                <div key={appointment._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm font-medium text-gray-900">
                      {formatTime(appointment.slotStart)} - {formatTime(appointment.slotEnd)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {appointment.studentId?.name || 'Anonymous Student'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {getModeLabel(appointment.mode)}
                        {appointment.urgency && (
                          <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                            appointment.urgency === 'high' ? 'bg-red-100 text-red-700' :
                            appointment.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {appointment.urgency}
                          </span>
                        )}
                      </p>
                      {appointment.reason && (
                        <p className="text-xs text-gray-400 mt-1 truncate max-w-xs">
                          Reason: {appointment.reason}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      appointment.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : appointment.status === 'confirmed'
                        ? 'bg-blue-100 text-blue-800'
                        : appointment.status === 'requested'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {appointment.status === 'completed' && '✨ Completed'}
                      {appointment.status === 'confirmed' && '✅ Confirmed'}
                      {appointment.status === 'requested' && '⏳ Pending'}
                      {!['completed', 'confirmed', 'requested'].includes(appointment.status) && appointment.status}
                    </span>
                    {appointment.status === 'confirmed' && (
                      <div className="text-xs text-green-600 font-medium">
                        Ready to join
                      </div>
                    )}
                    {appointment.status === 'requested' && (
                      <div className="text-xs text-yellow-600 font-medium">
                        Awaiting response
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Appointments Management Tab
const AppointmentsTab = () => {
  const { callApi } = useApi()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  
  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await callApi('/api/v1/appointments/me', 'GET')
      
      console.log('Counsellor appointments response:', response)
      
      if (response.success) {
        const serverResponse = response.data || response
        const appointmentsData = serverResponse.appointments || []
        console.log('Setting counsellor appointments:', appointmentsData)
        setAppointments(appointmentsData)
      } else {
        setError('Failed to load appointments')
      }
    } catch (err) {
      console.error('Error fetching counsellor appointments:', err)
      setError('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
      case 'requested':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getModeLabel = (mode) => {
    switch (mode?.toLowerCase()) {
      case 'video':
        return 'Video Call'
      case 'tele':
      case 'chat':
        return 'Online Session'
      case 'in-person':
        return 'In-Person'
      default:
        return 'Session'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const handleConfirmAppointment = async (appointmentId) => {
    try {
      const response = await callApi(`/api/v1/appointments/${appointmentId}/status`, 'PATCH', {
        status: 'confirmed'
      })
      
      if (response.success) {
        fetchAppointments() // Refresh the list
        alert('Appointment confirmed successfully!')
      }
    } catch (error) {
      console.error('Error confirming appointment:', error)
      alert('Failed to confirm appointment')
    }
  }

  const handleCancelAppointment = async (appointmentId) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      try {
        const response = await callApi(`/api/v1/appointments/${appointmentId}/status`, 'PATCH', {
          status: 'cancelled',
          cancellationReason: 'Cancelled by counsellor'
        })
        
        if (response.success) {
          fetchAppointments() // Refresh the list
          alert('Appointment cancelled successfully!')
        }
      } catch (error) {
        console.error('Error cancelling appointment:', error)
        alert('Failed to cancel appointment')
      }
    }
  }

  const handleJoinSession = (appointment) => {
    console.log('joinSession called with appointment:', appointment)
    console.log('Appointment mode:', appointment.mode)
    console.log('Appointment _id:', appointment._id)
    console.log('Student ID:', appointment.studentId)
    
    try {
      if (appointment.mode === 'video' || appointment.mode === 'tele' || appointment.mode === 'chat') {
        const studentId = appointment.studentId?._id || appointment.studentId
        const chatUrl = `/chat-platform?appointment=${appointment._id}&user=${studentId}`
        console.log('Navigating to:', chatUrl)
        
        // Use window.location as fallback if navigate doesn't work
        if (typeof navigate === 'function') {
          navigate(chatUrl)
        } else {
          console.error('Navigate function not available, using window.location')
          window.location.href = chatUrl
        }
      } else {
        alert('Please prepare for the in-person session at the scheduled time')
      }
    } catch (error) {
      console.error('Error in joinSession:', error)
      alert('Unable to join session. Please try refreshing the page.')
    }
  }

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true
    const status = appointment.status?.toLowerCase()
    
    if (filter === 'pending') {
      return status === 'pending' || status === 'requested'
    }
    
    return status === filter.toLowerCase()
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">Loading appointments...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">❌ {error}</div>
        <button
          onClick={fetchAppointments}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Appointment Management</h2>
          <p className="text-gray-600">View and manage your student appointments ({appointments.length} total)</p>
        </div>
        <button
          onClick={fetchAppointments}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border p-2">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All', icon: '📋' },
            { key: 'pending', label: 'Pending', icon: '⏳' },
            { key: 'confirmed', label: 'Confirmed', icon: '✅' },
            { key: 'completed', label: 'Completed', icon: '✨' },
            { key: 'cancelled', label: 'Cancelled', icon: '❌' }
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-2 rounded-md font-medium transition-all text-sm ${
                filter === key
                  ? 'bg-green-100 text-green-700 border-green-200 border'
                  : 'text-gray-600 hover:bg-gray-50 border border-transparent'
              }`}
            >
              <span className="mr-1">{icon}</span>
              {label}
              <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                {key === 'all' ? appointments.length : appointments.filter(apt => {
                  const status = apt.status?.toLowerCase()
                  if (key === 'pending') return status === 'pending' || status === 'requested'
                  return status === key
                }).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 text-2xl">📅</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? "No student appointments scheduled yet."
              : `No ${filter} appointments found.`
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment._id || appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{formatDate(appointment.slotStart)}</div>
                        <div className="text-gray-500">
                          {formatTime(appointment.slotStart)} - {formatTime(appointment.slotEnd)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{appointment.studentId?.name || 'Anonymous Student'}</div>
                        <div className="text-gray-500 text-xs">{appointment.studentId?.email}</div>
                        <div className="text-gray-500 text-xs">ID: {appointment.studentId?.collegeId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className="mr-2">
                          {appointment.mode === 'video' && '📹'}
                          {appointment.mode === 'tele' && '💬'}
                          {appointment.mode === 'in-person' && '🏢'}
                        </span>
                        {getModeLabel(appointment.mode)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                        {appointment.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <div className="truncate" title={appointment.reason}>
                        {appointment.reason || 'No reason provided'}
                      </div>
                      {appointment.privateNotes && (
                        <div className="text-xs text-blue-600 mt-1">🔒 Private notes available</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {appointment.urgency && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          appointment.urgency === 'high' ? 'bg-red-100 text-red-800' :
                          appointment.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {appointment.urgency === 'high' && '🔴'} 
                          {appointment.urgency === 'medium' && '🟡'} 
                          {appointment.urgency === 'low' && '🟢'} 
                          {appointment.urgency}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col space-y-1">
                        {appointment.status === 'requested' && (
                          <div className="flex space-x-1">
                            <button 
                              onClick={() => handleConfirmAppointment(appointment._id || appointment.id)}
                              className="text-green-600 hover:text-green-900 text-xs px-2 py-1 border border-green-200 rounded hover:bg-green-50"
                            >
                              ✅ Confirm
                            </button>
                            <button 
                              onClick={() => handleCancelAppointment(appointment._id || appointment.id)}
                              className="text-red-600 hover:text-red-900 text-xs px-2 py-1 border border-red-200 rounded hover:bg-red-50"
                            >
                              ❌ Decline
                            </button>
                          </div>
                        )}
                        {appointment.status === 'confirmed' && (
                          <div className="flex space-x-1">
                            <button 
                              onClick={() => handleJoinSession(appointment)}
                              className="text-blue-600 hover:text-blue-900 text-xs px-2 py-1 border border-blue-200 rounded hover:bg-blue-50"
                            >
                              {appointment.mode === 'video' && '📹 Join'}
                              {appointment.mode === 'tele' && '💬 Chat'}
                              {appointment.mode === 'in-person' && '🏢 Prepare'}
                            </button>
                            <button 
                              onClick={() => handleCancelAppointment(appointment._id || appointment.id)}
                              className="text-red-600 hover:text-red-900 text-xs px-2 py-1 border border-red-200 rounded hover:bg-red-50"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                        {appointment.status === 'completed' && (
                          <button className="text-gray-600 hover:text-gray-900 text-xs px-2 py-1 border border-gray-200 rounded hover:bg-gray-50">
                            📄 View Report
                          </button>
                        )}
                        {(appointment.status === 'cancelled' || appointment.status === 'pending') && (
                          <span className="text-gray-400 text-xs">No actions</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// Availability Management Tab
const AvailabilityTab = () => {
  const [weeklySchedule, setWeeklySchedule] = useState({
    monday: [{ start: '09:00', end: '17:00', isActive: true }],
    tuesday: [{ start: '09:00', end: '17:00', isActive: true }],
    wednesday: [{ start: '09:00', end: '17:00', isActive: true }],
    thursday: [{ start: '09:00', end: '17:00', isActive: true }],
    friday: [{ start: '09:00', end: '17:00', isActive: true }],
    saturday: [],
    sunday: []
  })

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Availability Schedule</h2>
        <p className="text-gray-600">Set your weekly availability for student appointments</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Schedule</h3>
        
        <div className="space-y-4">
          {days.map((day) => (
            <div key={day} className="flex items-center space-x-4 p-4 border rounded-lg">
              <div className="w-24">
                <label className="block text-sm font-medium text-gray-700 capitalize">
                  {day}
                </label>
              </div>
              
              <div className="flex-1">
                {weeklySchedule[day].length === 0 ? (
                  <span className="text-gray-500 italic">Not available</span>
                ) : (
                  <div className="flex items-center space-x-2">
                    {weeklySchedule[day].map((slot, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="time"
                          value={slot.start}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <span>to</span>
                        <input
                          type="time"
                          value={slot.end}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-900 text-sm">
                  Add Slot
                </button>
                {weeklySchedule[day].length > 0 && (
                  <button className="text-red-600 hover:text-red-900 text-sm">
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            Save Schedule
          </button>
        </div>
      </div>
    </div>
  )
}

// Session Reports Tab
const ReportsTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Session Reports</h2>
        <p className="text-gray-600">Submit and manage session reports for completed appointments</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Reports</h3>
        <p className="text-gray-600">You have 3 session reports that need to be completed.</p>
        
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map((report) => (
            <div key={report} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Session #{report}</p>
                <p className="text-sm text-gray-500">Student #123{report} - {new Date().toLocaleDateString()}</p>
              </div>
              <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                Submit Report
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Profile Tab
const ProfileTab = ({ user }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
        <p className="text-gray-600">Manage your counsellor profile information</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={user?.name || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              readOnly
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              readOnly
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
            <input
              type="text"
              value={user?.specialization || 'General Counselling'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              readOnly
            />
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            To update your profile information, please contact your administrator.
          </p>
        </div>
      </div>
    </div>
  )
}

// Certification Interviews Tab
const CertificationTab = () => {
  const [interviews, setInterviews] = useState([])
  const [selectedInterview, setSelectedInterview] = useState(null)
  const [showEvaluationModal, setShowEvaluationModal] = useState(false)
  const [evaluationData, setEvaluationData] = useState({
    approved: null,
    notes: '',
    recommendations: ''
  })

  useEffect(() => {
    // Load interviews from localStorage (demo data)
    const storedInterviews = JSON.parse(localStorage.getItem('certificationInterviews') || '[]')
    
    // Add some demo interviews if none exist
    if (storedInterviews.length === 0) {
      const demoInterviews = [
        {
          id: 1,
          studentId: 'user123',
          studentName: 'Anonymous Student #1234',
          counsellorId: '1',
          counsellorName: 'Dr. Sarah Johnson',
          date: '2025-09-30',
          time: '10:00',
          examScore: 87,
          status: 'scheduled',
          notes: 'Interested in peer support for anxiety and depression topics',
          createdAt: '2025-09-27T10:00:00.000Z'
        },
        {
          id: 2,
          studentId: 'user456',
          studentName: 'Anonymous Student #5678',
          counsellorId: '1',
          counsellorName: 'Dr. Sarah Johnson',
          date: '2025-09-28',
          time: '14:30',
          examScore: 92,
          status: 'completed',
          evaluation: {
            approved: true,
            notes: 'Excellent understanding of peer support principles and strong communication skills.',
            recommendations: 'Recommended for certification approval.',
            evaluatedAt: '2025-09-27T14:30:00.000Z'
          },
          createdAt: '2025-09-25T10:00:00.000Z'
        }
      ]
      localStorage.setItem('certificationInterviews', JSON.stringify(demoInterviews))
      setInterviews(demoInterviews)
    } else {
      setInterviews(storedInterviews)
    }
  }, [])

  const handleCompleteInterview = (interview) => {
    setSelectedInterview(interview)
    setShowEvaluationModal(true)
  }

  const handleSubmitEvaluation = () => {
    const updatedInterviews = interviews.map(interview => {
      if (interview.id === selectedInterview.id) {
        return {
          ...interview,
          status: 'completed',
          evaluation: {
            ...evaluationData,
            evaluatedAt: new Date().toISOString()
          }
        }
      }
      return interview
    })

    setInterviews(updatedInterviews)
    localStorage.setItem('certificationInterviews', JSON.stringify(updatedInterviews))
    
    // If approved, add to admin certification queue
    if (evaluationData.approved) {
      const certificationQueue = JSON.parse(localStorage.getItem('certificationQueue') || '[]')
      certificationQueue.push({
        id: Date.now(),
        studentId: selectedInterview.studentId,
        studentName: selectedInterview.studentName,
        examScore: selectedInterview.examScore,
        interviewDate: selectedInterview.date,
        counsellorName: selectedInterview.counsellorName,
        counsellorNotes: evaluationData.notes,
        status: 'pending_admin_approval',
        submittedAt: new Date().toISOString()
      })
      localStorage.setItem('certificationQueue', JSON.stringify(certificationQueue))
    }

    setShowEvaluationModal(false)
    setSelectedInterview(null)
    setEvaluationData({ approved: null, notes: '', recommendations: '' })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const scheduledInterviews = interviews.filter(i => i.status === 'scheduled')
  const completedInterviews = interviews.filter(i => i.status === 'completed')

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">🏆 Certification Interview Management</h2>
        <p className="text-gray-600 mb-6">
          Review and evaluate students who have completed the peer support training course and passed their certification exam.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{scheduledInterviews.length}</div>
            <div className="text-sm text-blue-800">Scheduled Interviews</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{completedInterviews.filter(i => i.evaluation?.approved).length}</div>
            <div className="text-sm text-green-800">Approved Students</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{completedInterviews.filter(i => i.evaluation?.approved === false).length}</div>
            <div className="text-sm text-red-800">Need More Training</div>
          </div>
        </div>

        {/* Scheduled Interviews */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Scheduled Interviews</h3>
          {scheduledInterviews.length > 0 ? (
            <div className="space-y-4">
              {scheduledInterviews.map((interview) => (
                <div key={interview.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-medium text-gray-900">{interview.studentName}</h4>
                          <p className="text-sm text-gray-600">
                            {formatDate(interview.date)} at {interview.time}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Exam Score: {interview.examScore}%
                          </span>
                        </div>
                      </div>
                      {interview.notes && (
                        <p className="text-sm text-gray-600 mt-2">
                          <strong>Student Notes:</strong> {interview.notes}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleCompleteInterview(interview)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Complete Interview
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No scheduled interviews</p>
          )}
        </div>

        {/* Completed Interviews */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">✅ Completed Interviews</h3>
          {completedInterviews.length > 0 ? (
            <div className="space-y-4">
              {completedInterviews.map((interview) => (
                <div key={interview.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{interview.studentName}</h4>
                      <p className="text-sm text-gray-600">
                        Interviewed on {formatDate(interview.date)} • Exam Score: {interview.examScore}%
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {interview.evaluation?.approved ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                          ✅ Approved for Certification
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                          ❌ Needs More Training
                        </span>
                      )}
                    </div>
                  </div>
                  {interview.evaluation?.notes && (
                    <div className="bg-gray-50 rounded-lg p-3 mt-3">
                      <p className="text-sm text-gray-700">
                        <strong>Evaluation Notes:</strong> {interview.evaluation.notes}
                      </p>
                      {interview.evaluation.recommendations && (
                        <p className="text-sm text-gray-700 mt-2">
                          <strong>Recommendations:</strong> {interview.evaluation.recommendations}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No completed interviews</p>
          )}
        </div>
      </div>

      {/* Evaluation Modal */}
      {showEvaluationModal && selectedInterview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Interview Evaluation - {selectedInterview.studentName}
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Student Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Exam Score:</span>
                    <span className="text-blue-900 ml-2">{selectedInterview.examScore}%</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Interview Date:</span>
                    <span className="text-blue-900 ml-2">{formatDate(selectedInterview.date)}</span>
                  </div>
                </div>
                {selectedInterview.notes && (
                  <div className="mt-2">
                    <span className="text-blue-700 font-medium text-sm">Student Notes:</span>
                    <p className="text-blue-900 text-sm mt-1">{selectedInterview.notes}</p>
                  </div>
                )}
              </div>

              {/* Approval Decision */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certification Recommendation *
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="approved"
                      checked={evaluationData.approved === true}
                      onChange={() => setEvaluationData({...evaluationData, approved: true})}
                      className="mr-2"
                    />
                    <span className="text-green-700">✅ Approve for Certification</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="approved"
                      checked={evaluationData.approved === false}
                      onChange={() => setEvaluationData({...evaluationData, approved: false})}
                      className="mr-2"
                    />
                    <span className="text-red-700">❌ Needs Additional Training</span>
                  </label>
                </div>
              </div>

              {/* Evaluation Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Evaluation Notes *
                </label>
                <textarea
                  rows={4}
                  value={evaluationData.notes}
                  onChange={(e) => setEvaluationData({...evaluationData, notes: e.target.value})}
                  placeholder="Provide detailed feedback on the student's readiness for peer support role..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Recommendations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recommendations (Optional)
                </label>
                <textarea
                  rows={3}
                  value={evaluationData.recommendations}
                  onChange={(e) => setEvaluationData({...evaluationData, recommendations: e.target.value})}
                  placeholder="Any specific recommendations or areas for improvement..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleSubmitEvaluation}
                disabled={evaluationData.approved === null || !evaluationData.notes}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Evaluation
              </button>
              <button
                onClick={() => {
                  setShowEvaluationModal(false)
                  setSelectedInterview(null)
                  setEvaluationData({ approved: null, notes: '', recommendations: '' })
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CounsellorDashboard