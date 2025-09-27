import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'

const StudentDashboard = () => {
  const { user } = useAuth()
  const { callApi } = useApi()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    screeningsCompleted: 0,
    appointmentsScheduled: 0,
    forumPosts: 0,
    resourcesAccessed: 0
  })
  const [appointments, setAppointments] = useState([])
  const [latestAppointment, setLatestAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [confirmedAppointments, setConfirmedAppointments] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Check for latest appointment in localStorage
      const savedAppointment = localStorage.getItem('latestAppointment')
      if (savedAppointment) {
        const parsedAppointment = JSON.parse(savedAppointment)
        setLatestAppointment(parsedAppointment)
      }

      // Fetch appointments from API
      const appointmentsResponse = await callApi('/api/v1/appointments/me')
      if (appointmentsResponse.success) {
        const fetchedAppointments = appointmentsResponse.data || []
        setAppointments(fetchedAppointments)
        
        // Filter confirmed appointments for chat section
        const confirmed = fetchedAppointments.filter(apt => 
          apt.status === 'confirmed' && 
          (apt.mode === 'tele' || apt.mode === 'video' || apt.mode === 'chat')
        )
        setConfirmedAppointments(confirmed)
        
        // If we have API data, use the most recent appointment instead of localStorage
        if (fetchedAppointments.length > 0) {
          const mostRecent = fetchedAppointments[fetchedAppointments.length - 1]
          if (mostRecent) {
            const formattedAppointment = {
              id: mostRecent._id,
              counsellor: mostRecent.counsellorId,
              date: mostRecent.slotStart.split('T')[0],
              startTime: new Date(mostRecent.slotStart).getHours() + new Date(mostRecent.slotStart).getMinutes() / 60,
              duration: Math.round((new Date(mostRecent.slotEnd) - new Date(mostRecent.slotStart)) / (1000 * 60)),
              mode: mostRecent.mode === 'in-person' ? 'in-person' : mostRecent.mode === 'tele' ? 'video' : 'chat',
              reason: mostRecent.reason,
              urgency: mostRecent.urgency,
              location: mostRecent.location,
              status: mostRecent.status,
              createdAt: mostRecent.createdAt
            }
            setLatestAppointment(formattedAppointment)
            // Update localStorage with API data
            localStorage.setItem('latestAppointment', JSON.stringify(formattedAppointment))
          }
        }
        
        // Update stats with real data
        setStats({
          screeningsCompleted: 3, // This would come from screening API
          appointmentsScheduled: fetchedAppointments.length,
          forumPosts: 5, // This would come from forum API
          resourcesAccessed: 12 // This would come from resources API
        })
      } else {
        // Fallback to localStorage data if API fails
        const savedAppointment = localStorage.getItem('latestAppointment')
        setStats({
          screeningsCompleted: 3,
          appointmentsScheduled: savedAppointment ? 1 : 0,
          forumPosts: 5,
          resourcesAccessed: 12
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Use localStorage appointment if available
      const savedAppointment = localStorage.getItem('latestAppointment')
      setStats({
        screeningsCompleted: 3,
        appointmentsScheduled: savedAppointment ? 1 : 0,
        forumPosts: 5,
        resourcesAccessed: 12
      })
    } finally {
      setLoading(false)
    }
  }

  const clearLatestAppointment = () => {
    localStorage.removeItem('latestAppointment')
    setLatestAppointment(null)
  }

  const startChatSession = (appointment) => {
    console.log('startChatSession called with:', appointment)
    const counsellorId = appointment.counsellorId?._id || appointment.counsellorId
    console.log('Extracted counsellor ID:', counsellorId)
    
    if (!counsellorId || !appointment._id) {
      console.error('Missing required data:', { counsellorId, appointmentId: appointment._id })
      alert('Cannot start chat: Missing counsellor or appointment information')
      return
    }
    
    const chatUrl = `/chat-platform?appointment=${appointment._id}&user=${counsellorId}`
    console.log('Student starting chat with counsellor:', counsellorId)
    console.log('Navigating to:', chatUrl)
    navigate(chatUrl)
  }

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
    },
    {
      title: 'My Appointments',
      description: 'View and manage your counselling sessions',
      icon: '📅',
      link: '/appointments',
      color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.anonymousDisplayName || user?.name}! 👋
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

        {/* Latest Appointment Details */}
        {latestAppointment && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Latest Appointment</h2>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-2xl">👨‍⚕️</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{latestAppointment.counsellor?.name}</h3>
                      <p className="text-sm text-gray-600">{latestAppointment.counsellor?.specialization}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Date & Time</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(latestAppointment.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-gray-600">
                        {latestAppointment.startTime > 12 ? 
                          `${latestAppointment.startTime - 12}:00 PM` : 
                          `${latestAppointment.startTime}:00 AM`
                        }
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Duration</p>
                      <p className="text-sm font-medium text-gray-900">{latestAppointment.duration} minutes</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Session Type</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {latestAppointment.mode === 'in-person' ? 'Offline Meet' : 
                         latestAppointment.mode === 'video' ? 'Video Call' : 'Online Chat'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        latestAppointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        latestAppointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        latestAppointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {latestAppointment.status?.charAt(0).toUpperCase() + latestAppointment.status?.slice(1) || 'Pending'}
                      </span>
                    </div>
                  </div>
                  
                  {latestAppointment.reason && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Appointment Reason</p>
                      <p className="text-sm text-gray-900">{latestAppointment.reason}</p>
                    </div>
                  )}
                  
                  {latestAppointment.location && latestAppointment.mode === 'in-person' && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Location</p>
                      <p className="text-sm text-gray-900">{latestAppointment.location}</p>
                    </div>
                  )}
                </div>
                
                <div className="ml-4">
                  <div className={`w-3 h-3 rounded-full ${
                    latestAppointment.status === 'confirmed' ? 'bg-green-500' :
                    latestAppointment.status === 'pending' ? 'bg-yellow-500' :
                    latestAppointment.status === 'cancelled' ? 'bg-red-500' :
                    'bg-blue-500'
                  }`}></div>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-4 pt-4 border-t border-gray-100">
                {latestAppointment.status === 'confirmed' && 
                 (latestAppointment.mode === 'video' || latestAppointment.mode === 'chat') && (
                  <button
                    onClick={() => startChatSession({
                      _id: latestAppointment.id,
                      counsellorId: latestAppointment.counsellor
                    })}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <span>💬</span>
                    <span>Start Chat</span>
                  </button>
                )}
                <Link
                  to="/appointments"
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
                >
                  View All Appointments
                </Link>
                <Link
                  to="/booking"
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
                >
                  Book Another Session
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Active Counsellor Sessions */}
        {confirmedAppointments.length > 0 ? (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">💬 Chat with Your Counsellors</h2>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="space-y-4">
                {confirmedAppointments.map((appointment, index) => (
                  <div key={appointment._id || index} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {appointment.counsellorId?.name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {appointment.counsellorId?.name || 'Counsellor'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {appointment.mode === 'video' && '📹 Video Session'}
                          {appointment.mode === 'tele' && '💻 Online Session'}  
                          {appointment.mode === 'chat' && '💬 Chat Session'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(appointment.slotStart).toLocaleDateString()} at{' '}
                          {new Date(appointment.slotStart).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startChatSession(appointment)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <span>💬</span>
                        <span>Chat</span>
                      </button>
                      {(appointment.mode === 'video' || appointment.mode === 'tele') && (
                        <button
                          onClick={() => startChatSession(appointment)}
                          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
                        >
                          <span>📹</span>
                          <span>Video Call</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t text-center">
                <p className="text-sm text-gray-600 mb-3">
                  You can chat with your counsellors anytime during confirmed session periods
                </p>
                <Link
                  to="/appointments"
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  View All Appointments →
                </Link>
              </div>
            </div>
          </div>
        ) : appointments.length > 0 && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💬</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Connect?</h3>
                <p className="text-gray-600 mb-4">
                  Once your appointments are confirmed, you can start chatting and video calling with your counsellors directly from here.
                </p>
                <div className="flex justify-center space-x-3">
                  <Link
                    to="/appointments"
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Check Appointment Status
                  </Link>
                  <Link
                    to="/booking"
                    className="px-4 py-2 bg-white text-indigo-600 border border-indigo-600 text-sm font-medium rounded-md hover:bg-indigo-50 transition-colors"
                  >
                    Book New Session
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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
            
            {/* Dynamic Chat Session Button */}
            {confirmedAppointments.length > 0 && (
              <button
                onClick={() => {
                  console.log('Quick Action chat clicked')
                  if (confirmedAppointments.length === 1) {
                    // Direct chat if only one confirmed appointment
                    startChatSession(confirmedAppointments[0])
                  } else {
                    // Navigate to appointments to choose
                    navigate('/appointments')
                  }
                }}
                className="p-6 rounded-lg border-2 transition-colors bg-blue-50 hover:bg-blue-100 border-blue-200"
              >
                <div className="text-center">
                  <div className="text-3xl mb-3">💬</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Start Chat Session</h3>
                  <p className="text-sm text-gray-600">
                    {confirmedAppointments.length === 1 
                      ? `Chat with ${confirmedAppointments[0].counsellorId?.name || 'your counsellor'}`
                      : 'Choose a counsellor to chat with'
                    }
                  </p>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-600">Loading activities...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {latestAppointment && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600">📅</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Booked counselling session with {latestAppointment.counsellor?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(latestAppointment.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600">✓</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Completed PHQ-9 screening</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
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
                
                {!latestAppointment && appointments.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No recent activity</p>
                    <Link
                      to="/booking"
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      Book Your First Session
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard