import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import logoImage from '../assets/Mann-mitra.png'

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
    if (userData) {
      setUser(JSON.parse(userData))
    }
    
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(false) // For now, we'll just set to false
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
  const stats = [
    { label: 'Today\'s Appointments', value: 5, change: '+2 from yesterday', icon: '📅' },
    { label: 'This Week\'s Sessions', value: 18, change: '+3 from last week', icon: '💬' },
    { label: 'Pending Reports', value: 3, change: '2 overdue', icon: '📄' },
    { label: 'Average Rating', value: '4.8', change: '+0.2 this month', icon: '⭐' }
  ]

  const todaySchedule = [
    { time: '09:00 AM', student: 'Student #1234', type: 'Video Call', status: 'upcoming' },
    { time: '10:30 AM', student: 'Student #5678', type: 'Chat Session', status: 'upcoming' },
    { time: '02:00 PM', student: 'Student #9012', type: 'In-Person', status: 'completed' },
    { time: '03:30 PM', student: 'Student #3456', type: 'Video Call', status: 'upcoming' },
    { time: '05:00 PM', student: 'Student #7890', type: 'Chat Session', status: 'upcoming' }
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
          <h3 className="text-lg font-medium text-gray-900">Today's Schedule</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {todaySchedule.map((appointment, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-medium text-gray-900">{appointment.time}</div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{appointment.student}</p>
                    <p className="text-sm text-gray-500">{appointment.type}</p>
                  </div>
                </div>
                <div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    appointment.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {appointment.status === 'completed' ? 'Completed' : 'Upcoming'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Appointments Management Tab
const AppointmentsTab = () => {
  const [appointments] = useState([
    {
      id: 1,
      date: '2024-01-15',
      time: '09:00 AM',
      student: 'Student #1234',
      type: 'Video Call',
      status: 'scheduled',
      notes: 'First session - anxiety concerns'
    },
    {
      id: 2,
      date: '2024-01-15',
      time: '10:30 AM',
      student: 'Student #5678',
      type: 'Chat Session',
      status: 'completed',
      notes: 'Follow-up session'
    },
    {
      id: 3,
      date: '2024-01-16',
      time: '02:00 PM',
      student: 'Student #9012',
      type: 'In-Person',
      status: 'scheduled',
      notes: 'Academic stress counselling'
    }
  ])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Appointment Management</h2>
          <p className="text-gray-600">View and manage your upcoming and past sessions</p>
        </div>
      </div>

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
                  Notes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{appointment.date}</div>
                      <div className="text-gray-500">{appointment.time}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {appointment.student}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {appointment.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      appointment.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : appointment.status === 'scheduled'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {appointment.notes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {appointment.status === 'scheduled' && (
                      <>
                        <button className="text-green-600 hover:text-green-900">Join</button>
                        <button className="text-blue-600 hover:text-blue-900">Reschedule</button>
                      </>
                    )}
                    {appointment.status === 'completed' && (
                      <button className="text-gray-600 hover:text-gray-900">View Report</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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