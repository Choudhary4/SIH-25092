import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useApi } from '../hooks/useApi'

const AppointmentDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { callApi } = useApi()
  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (id) {
      fetchAppointment()
    }
  }, [id])

  const fetchAppointment = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await callApi(`/api/v1/appointments/${id}`, 'GET')
      
      if (response.success) {
        // The useApi hook wraps the server response in a 'data' field
        const serverResponse = response.data || response
        setAppointment(serverResponse.appointment || serverResponse)
      } else {
        setError('Appointment not found')
      }
    } catch (err) {
      console.error('Error fetching appointment:', err)
      setError('Failed to load appointment details')
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  const joinSession = () => {
    if (appointment.mode === 'video') {
      alert('Video call feature will be integrated with video conferencing service')
    } else if (appointment.mode === 'chat' || appointment.mode === 'tele') {
      window.location.href = '/chat'
    } else {
      alert('Please visit the counseling center at the scheduled time')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointment details...</p>
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
          <button
            onClick={() => navigate('/appointments')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    )
  }

  if (!appointment) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/appointments')}
            className="flex items-center text-indigo-600 hover:text-indigo-700 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Appointments
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Appointment Details
          </h1>
        </div>

        {/* Appointment Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                  {appointment.counsellor?.name?.charAt(0) || 'C'}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {appointment.counsellor?.name || 'Counsellor'}
                  </h2>
                  <p className="text-gray-600">
                    {appointment.counsellor?.specialization || 'Mental Health Professional'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Experience: {appointment.counsellor?.experience || 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-2">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                  {appointment.status || 'Pending'}
                </span>
                <span className="text-sm text-gray-500">
                  {getModeIcon(appointment.mode)} {getModeLabel(appointment.mode)}
                </span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Date & Time */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <span className="mr-2">📅</span>
                  Date & Time
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium text-gray-900">{formatDate(appointment.slotStart)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-medium text-gray-900">
                        {formatTime(appointment.slotStart)} - {formatTime(appointment.slotEnd)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-medium text-gray-900">{appointment.duration || '60'} minutes</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Session Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <span className="mr-2">ℹ️</span>
                  Session Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500">Session Type</p>
                      <p className="font-medium text-gray-900">{getModeLabel(appointment.mode)}</p>
                    </div>
                    {appointment.urgency && (
                      <div>
                        <p className="text-sm text-gray-500">Urgency</p>
                        <p className="font-medium text-gray-900 capitalize">{appointment.urgency}</p>
                      </div>
                    )}
                    {appointment.location && appointment.mode === 'in-person' && (
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium text-gray-900">📍 {appointment.location}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Reason */}
            {appointment.reason && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">💭</span>
                  Reason for Consultation
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">{appointment.reason}</p>
                </div>
              </div>
            )}

            {/* Private Notes (if available and decrypted) */}
            {appointment.privateNotes && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">🔒</span>
                  Private Notes
                </h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 mb-2">
                    <strong>Note:</strong> These notes are encrypted and only visible to you and your counsellor.
                  </p>
                  <p className="text-gray-700">{appointment.privateNotes}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
              {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
                <button
                  onClick={joinSession}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center ${
                    appointment.mode === 'video'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : appointment.mode === 'chat' || appointment.mode === 'tele'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {appointment.mode === 'video' && '📹 Join Video Call'}
                  {(appointment.mode === 'chat' || appointment.mode === 'tele') && '💬 Start Chat Session'}
                  {appointment.mode === 'in-person' && '🏢 View Meeting Details'}
                </button>
              )}
              
              {appointment.status === 'pending' && (
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to cancel this appointment?')) {
                      alert('Cancellation feature will be implemented')
                    }
                  }}
                  className="px-6 py-3 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Cancel Appointment
                </button>
              )}
              
              <button
                onClick={() => navigate('/booking')}
                className="px-6 py-3 text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Book Another Session
              </button>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Important Information</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Please join your session on time to make the most of your appointment</li>
            <li>• If you need to reschedule, please do so at least 24 hours in advance</li>
            <li>• All conversations are confidential and secure</li>
            <li>• If you're in crisis, please contact emergency services immediately</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AppointmentDetails