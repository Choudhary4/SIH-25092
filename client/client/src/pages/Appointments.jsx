import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { useApi } from '../hooks/useApi'

const Appointments = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { callApi } = useApi()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // all, pending, confirmed, completed, cancelled

  useEffect(() => {
    fetchAppointments()
  }, [])

  // Debug effect to log state changes
  useEffect(() => {
    console.log('Appointments state changed:', appointments)
    console.log('Is Array:', Array.isArray(appointments))
    console.log('Length:', appointments.length)
  }, [appointments])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // First check who the current user is
      try {
        const userResponse = await callApi('/api/v1/auth/me', 'GET')
        console.log('Current logged in user:', userResponse)
      } catch (userErr) {
        console.error('Error getting current user:', userErr)
      }
      
      const response = await callApi('/api/v1/appointments/me', 'GET')
      
      console.log('Appointments API response:', response)
      console.log('Token from localStorage:', localStorage.getItem('Mann-Mitra_token'))
      console.log('Response appointments array:', response.appointments)
      
      if (response.success) {
        // The useApi hook wraps the server response in a 'data' field
        const serverResponse = response.data || response
        const appointmentsData = serverResponse.appointments || []
        console.log('Full response:', response)
        console.log('Server response:', serverResponse)
        console.log('Setting appointments data:', appointmentsData)
        console.log('Number of appointments:', appointmentsData.length)
        console.log('First appointment:', appointmentsData[0])
        setAppointments(appointmentsData)
      } else {
        console.error('API response not successful:', response)
        setError('Failed to load appointments')
      }
    } catch (err) {
      console.error('Error fetching appointments:', err)
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

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return '✅'
      case 'pending':
      case 'requested':
        return '⏳'
      case 'completed':
        return '✨'
      case 'cancelled':
        return '❌'
      default:
        return '📋'
    }
  }

  const getModeIcon = (mode) => {
    switch (mode?.toLowerCase()) {
      case 'video':
        return '📹'
      case 'chat':
      case 'tele':
        return '💬'
      case 'in-person':
        return '🏢'
      default:
        return '📱'
    }
  }

  const getModeLabel = (mode) => {
    switch (mode?.toLowerCase()) {
      case 'video':
        return 'Video Call'
      case 'chat':
      case 'tele':
        return 'Online Chat'
      case 'in-person':
        return 'In-Person Meeting'
      default:
        return 'Online Session'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const filteredAppointments = (Array.isArray(appointments) ? appointments : []).filter(appointment => {
    if (filter === 'all') return true
    const status = appointment.status?.toLowerCase()
    
    // Map "requested" to "pending" for filter matching
    if (filter === 'pending') {
      return status === 'pending' || status === 'requested'
    }
    
    return status === filter.toLowerCase()
  })

  // Debug logging for filtering
  console.log('Current filter:', filter)
  console.log('Total appointments:', appointments.length)
  console.log('Appointments data:', appointments)
  console.log('Filtered appointments:', filteredAppointments)
  console.log('Filtered count:', filteredAppointments.length)

  const joinSession = (appointment) => {
    if (appointment.mode === 'video' || appointment.mode === 'chat' || appointment.mode === 'tele') {
      // Navigate to chat platform with video/chat capabilities
      navigate(`/chat-platform?appointment=${appointment._id}&user=${appointment.counsellorId._id || appointment.counsellorId}`)
    } else {
      // In-person meeting
      alert('Please visit the counseling center at the scheduled time')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">❌</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{error}</h2>
          <p className="text-gray-600 mb-4">Please try again or contact support if the problem persists.</p>
          <div className="space-x-3">
            <button
              onClick={fetchAppointments}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
            <Link
              to="/booking"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Book New Appointment
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            My Appointments
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Manage your counseling sessions and join upcoming appointments
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 mb-6">
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
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  filter === key
                    ? 'bg-indigo-100 text-indigo-700 border-indigo-200 border'
                    : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                }`}
              >
                <span className="mr-2">{icon}</span>
                {label}
                {key !== 'all' && (
                  <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                    {appointments.filter(apt => apt.status?.toLowerCase() === key).length}
                  </span>
                )}
                {key === 'all' && (
                  <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                    {appointments.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>



        {/* Appointments Grid */}
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-400 text-3xl">📅</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all' 
                ? "You don't have any appointments yet. Book your first session to get started."
                : `No ${filter} appointments found. Try selecting a different filter.`
              }
            </p>
            <Link
              to="/booking"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Book New Appointment
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.id || appointment._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Card Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {appointment.counsellorId?.name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {appointment.counsellorId?.name || 'Counsellor'}
                        </h3>
                        <p className="text-sm text-gray-500">Mental Health Professional</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                      {getStatusIcon(appointment.status)} {appointment.status || 'Pending'}
                    </span>
                  </div>
                  
                  {/* Date & Time */}
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <span className="text-lg mr-2">📅</span>
                      <span className="font-medium">{formatDate(appointment.slotStart)}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="text-lg mr-2">⏰</span>
                      <span>{formatTime(appointment.slotStart)} - {formatTime(appointment.slotEnd)}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="text-lg mr-2">{getModeIcon(appointment.mode)}</span>
                      <span>{getModeLabel(appointment.mode)}</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  {appointment.reason && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-1">Reason:</p>
                      <p className="text-gray-700 text-sm">{appointment.reason}</p>
                    </div>
                  )}

                  {appointment.urgency && (
                    <div className="mb-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        appointment.urgency === 'high' ? 'bg-red-100 text-red-800' :
                        appointment.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {appointment.urgency === 'high' && '🔴'} 
                        {appointment.urgency === 'medium' && '🟡'} 
                        {appointment.urgency === 'low' && '🟢'} 
                        {appointment.urgency} priority
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
                      <button
                        onClick={() => joinSession(appointment)}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                          appointment.mode === 'video'
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : appointment.mode === 'chat' || appointment.mode === 'tele'
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                      >
                        {appointment.mode === 'video' && '📹 Start Video Call'}
                        {(appointment.mode === 'chat' || appointment.mode === 'tele') && '💬 Start Chat'}
                        {appointment.mode === 'in-person' && '🏢 View Details'}
                      </button>
                    )}
                    
                    <button
                      onClick={() => navigate(`/appointments/${appointment.id || appointment._id}`)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      View Details
                    </button>
                    
                    {appointment.status === 'pending' && (
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to cancel this appointment?')) {
                            // Handle cancellation
                            alert('Cancellation feature will be implemented')
                          }
                        }}
                        className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/booking"
                className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                📅 Book New Appointment
              </Link>
              <button
                onClick={() => {
                  // Find the first confirmed appointment to start chat with
                  const confirmedAppointments = appointments.filter(apt => apt.status === 'confirmed')
                  if (confirmedAppointments.length > 0) {
                    const appointment = confirmedAppointments[0]
                    const counsellorId = appointment.counsellorId?._id || appointment.counsellorId
                    navigate(`/chat-platform?appointment=${appointment._id}&user=${counsellorId}`)
                  } else {
                    alert('No confirmed appointments found. Please book an appointment first.')
                  }
                }}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                💬 Start Chat Session
              </button>
              <Link
                to="/screening"
                className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                📋 Take Mental Health Screening
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Appointments