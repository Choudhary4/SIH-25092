import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ScheduleInterview = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { examScore = 85 } = location.state || {}
  
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedCounsellor, setSelectedCounsellor] = useState('')
  const [notes, setNotes] = useState('')
  const [isScheduled, setIsScheduled] = useState(false)

  // Demo available counsellors
  const counsellors = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      specialization: "Peer Support Supervision",
      experience: "8 years",
      rating: 4.9,
      image: "👩‍⚕️"
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialization: "Mental Health Training",
      experience: "12 years", 
      rating: 4.8,
      image: "👨‍⚕️"
    },
    {
      id: 3,
      name: "Dr. Priya Patel",
      specialization: "Crisis Intervention",
      experience: "6 years",
      rating: 4.9,
      image: "👩‍⚕️"
    }
  ]

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
    if (!selectedDate || !selectedTime || !selectedCounsellor) {
      alert('Please fill in all required fields')
      return
    }

    // Create interview record (in real app, this would be an API call)
    const interview = {
      id: Date.now(),
      studentId: user.id,
      studentName: user.anonymousDisplayName || user.name,
      counsellorId: selectedCounsellor,
      counsellorName: counsellors.find(c => c.id.toString() === selectedCounsellor)?.name,
      date: selectedDate,
      time: selectedTime,
      examScore: examScore,
      status: 'scheduled',
      notes: notes,
      createdAt: new Date().toISOString()
    }

    // Store in localStorage (demo purpose)
    const existingInterviews = JSON.parse(localStorage.getItem('certificationInterviews') || '[]')
    existingInterviews.push(interview)
    localStorage.setItem('certificationInterviews', JSON.stringify(existingInterviews))

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
              Interview Scheduled! 📅
            </h2>
            
            <div className="text-left bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Interview Details</h3>
              <div className="space-y-1 text-sm text-blue-800">
                <p><strong>Date:</strong> {formatDate(selectedDate)}</p>
                <p><strong>Time:</strong> {selectedTime}</p>
                <p><strong>Counsellor:</strong> {counsellors.find(c => c.id.toString() === selectedCounsellor)?.name}</p>
                <p><strong>Your Exam Score:</strong> {examScore}%</p>
              </div>
            </div>
            
            <div className="text-left bg-yellow-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-yellow-900 mb-2">What's Next?</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Check your email for confirmation details</li>
                <li>• Prepare to discuss your motivation for peer support</li>
                <li>• Review the course materials once more</li>
                <li>• The counsellor will evaluate your readiness</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Go to Dashboard
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
              onClick={() => navigate('/resources')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Resources
            </button>
            <div className="text-right">
              <div className="text-sm text-gray-600">Exam Score</div>
              <div className="text-lg font-bold text-green-600">{examScore}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="ml-2 text-sm text-green-600 font-medium">Course Complete</span>
              </div>
              <div className="w-8 h-1 bg-green-500"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="ml-2 text-sm text-green-600 font-medium">Exam Passed</span>
              </div>
              <div className="w-8 h-1 bg-blue-500"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                <span className="ml-2 text-sm text-blue-600 font-medium">Schedule Interview</span>
              </div>
              <div className="w-8 h-1 bg-gray-300"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-500 font-bold text-sm">4</span>
                </div>
                <span className="ml-2 text-sm text-gray-500 font-medium">Get Certified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Schedule Your Certification Interview</h1>
          <p className="text-gray-600 mb-8">
            Congratulations on passing your exam with {examScore}%! Now schedule a final interview with one of our qualified counsellors to complete your certification process.
          </p>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Counsellor Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Counsellor *
                </label>
                <div className="space-y-3">
                  {counsellors.map((counsellor) => (
                    <label
                      key={counsellor.id}
                      className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedCounsellor === counsellor.id.toString()
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="counsellor"
                        value={counsellor.id}
                        checked={selectedCounsellor === counsellor.id.toString()}
                        onChange={(e) => setSelectedCounsellor(e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex items-center flex-1">
                        <div className="text-3xl mr-4">{counsellor.image}</div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{counsellor.name}</div>
                          <div className="text-sm text-gray-600">{counsellor.specialization}</div>
                          <div className="flex items-center mt-1 space-x-2">
                            <span className="text-xs text-gray-500">{counsellor.experience}</span>
                            <span className="text-xs text-gray-300">•</span>
                            <div className="flex items-center">
                              <span className="text-xs text-yellow-500">⭐</span>
                              <span className="text-xs text-gray-600 ml-1">{counsellor.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedCounsellor === counsellor.id.toString()
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedCounsellor === counsellor.id.toString() && (
                          <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific topics you'd like to discuss or questions you have..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Right Column */}
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

              {/* Interview Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Interview Information</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Duration: 30-45 minutes</li>
                  <li>• Format: Video call or in-person</li>
                  <li>• Topics: Motivation, ethics, scenarios</li>
                  <li>• Result: Immediate feedback</li>
                </ul>
              </div>

              {/* Schedule Button */}
              <button
                onClick={handleSchedule}
                disabled={!selectedDate || !selectedTime || !selectedCounsellor}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Schedule Interview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScheduleInterview