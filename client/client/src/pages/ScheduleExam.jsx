import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ScheduleExam = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [isScheduled, setIsScheduled] = useState(false)

  // Generate available time slots
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute of [0, 30]) {
        if (hour === 17 && minute === 30) break
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(time)
      }
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  // Generate next 14 days (excluding weekends)
  const generateAvailableDates = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 1; i <= 20; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      // Skip weekends
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date.toISOString().split('T')[0])
      }
      
      if (dates.length >= 14) break
    }
    
    return dates
  }

  const availableDates = generateAvailableDates()

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const handleSchedule = () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select both date and time')
      return
    }

    // Create exam schedule record (in real app, this would be an API call)
    const examSchedule = {
      id: Date.now(),
      studentId: user.id,
      studentName: user.anonymousDisplayName || user.name,
      date: selectedDate,
      time: selectedTime,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    }

    // Store in localStorage (demo purpose)
    const existingSchedules = JSON.parse(localStorage.getItem('examSchedules') || '[]')
    existingSchedules.push(examSchedule)
    localStorage.setItem('examSchedules', JSON.stringify(existingSchedules))

    setIsScheduled(true)
  }

  if (isScheduled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Exam Scheduled! 📅
            </h2>
            
            <div className="text-left bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Exam Details</h3>
              <div className="space-y-1 text-sm text-blue-800">
                <p><strong>Date:</strong> {formatDate(selectedDate)}</p>
                <p><strong>Time:</strong> {selectedTime}</p>
                <p><strong>Duration:</strong> 30 minutes</p>
                <p><strong>Questions:</strong> 15 multiple choice</p>
              </div>
            </div>
            
            <div className="text-left bg-yellow-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-yellow-900 mb-2">Preparation Tips</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Review all course modules thoroughly</li>
                <li>• Practice active listening techniques</li>
                <li>• Understand crisis recognition signs</li>
                <li>• Know when to refer to professionals</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => navigate('/certification/course/8')}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Review Course Material
              </button>
              
              <button
                onClick={() => navigate('/resources')}
                className="w-full px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Back to Resources
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/certification/course/8')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Course
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Schedule Your Certification Exam</h1>
          <p className="text-gray-600 mb-8">
            Choose a convenient time to take your peer support certification exam. The exam consists of 15 multiple-choice questions and takes about 30 minutes to complete.
          </p>

          <div className="space-y-6">
            {/* Date Selection */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Select Date *
              </label>
              <select
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a date...</option>
                {availableDates.map((date) => (
                  <option key={date} value={date}>
                    {formatDate(date)}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Selection */}
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                Select Time *
              </label>
              <select
                id="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!selectedDate}
              >
                <option value="">Choose a time...</option>
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            {/* Exam Info */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📝 Exam Information</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Duration:</strong> 30 minutes maximum</li>
                <li>• <strong>Questions:</strong> 15 multiple choice questions</li>
                <li>• <strong>Passing Score:</strong> 80% (12 out of 15 questions)</li>
                <li>• <strong>Topics:</strong> Peer support principles, active listening, crisis recognition, ethics</li>
                <li>• <strong>Retakes:</strong> Unlimited attempts if you don't pass</li>
              </ul>
            </div>

            {/* Schedule Button */}
            <button
              onClick={handleSchedule}
              disabled={!selectedDate || !selectedTime}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Schedule Exam
            </button>

            {/* Alternative Option */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Ready to take the exam now?</p>
              <button
                onClick={() => navigate('/certification/exam')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Take Exam Immediately
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScheduleExam