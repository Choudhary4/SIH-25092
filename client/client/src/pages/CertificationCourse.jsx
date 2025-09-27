import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const CertificationCourse = () => {
  const navigate = useNavigate()
  const { courseId } = useParams()
  const { user } = useAuth()
  const [courseCompleted, setCourseCompleted] = useState(false)
  const [showCompletionModal, setShowCompletionModal] = useState(false)

  // Demo course data
  const course = {
    id: 8,
    title: "Peer Support Training Course",
    description: "Become a certified peer volunteer to help other students with mental health support",
    duration: "8 hours",
    modules: [
      {
        id: 1,
        title: "Introduction to Peer Support",
        duration: "1 hour",
        topics: [
          "Understanding Mental Health",
          "Role of Peer Support",
          "Ethical Considerations",
          "Boundaries and Limitations"
        ]
      },
      {
        id: 2,
        title: "Active Listening Skills",
        duration: "2 hours", 
        topics: [
          "Fundamentals of Active Listening",
          "Non-verbal Communication",
          "Empathetic Responses",
          "Practical Exercises"
        ]
      },
      {
        id: 3,
        title: "Crisis Recognition & Response",
        duration: "2 hours",
        topics: [
          "Warning Signs of Mental Health Crisis",
          "How to Respond Appropriately", 
          "When to Escalate to Professionals",
          "Emergency Procedures"
        ]
      },
      {
        id: 4,
        title: "Cultural Sensitivity",
        duration: "1.5 hours",
        topics: [
          "Understanding Cultural Differences",
          "Inclusive Support Practices",
          "Working with Diverse Communities",
          "Avoiding Bias and Assumptions"
        ]
      },
      {
        id: 5,
        title: "Self-Care for Peer Supporters",
        duration: "1.5 hours",
        topics: [
          "Preventing Burnout",
          "Managing Emotional Impact",
          "Building Support Networks",
          "Maintaining Personal Wellness"
        ]
      }
    ]
  }

  const handleCourseCompletion = () => {
    setShowCompletionModal(true)
  }

  const handleConfirmCompletion = (completed) => {
    setCourseCompleted(completed)
    setShowCompletionModal(false)
    
    if (completed) {
      // Show exam scheduling options
      setShowExamOptions(true)
    }
  }

  const [showExamOptions, setShowExamOptions] = useState(false)

  const handleExamChoice = (choice) => {
    if (choice === 'now') {
      navigate('/certification/exam')
    } else if (choice === 'slot') {
      navigate('/certification/schedule-exam')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Progress:</span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: courseCompleted ? '100%' : '0%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
              <p className="text-gray-600 mb-4">{course.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {course.duration}
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {course.modules.length} Modules
                </span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                  🏆 Certification Available
                </span>
              </div>
            </div>
            <div className="text-right">
              {!courseCompleted && (
                <button
                  onClick={handleCourseCompletion}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Mark as Complete
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Course Modules */}
        <div className="space-y-6">
          {course.modules.map((module, index) => (
            <div key={module.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Module {index + 1}: {module.title}
                  </h3>
                  <span className="text-sm text-gray-500">{module.duration}</span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {module.topics.map((topic, topicIndex) => (
                    <div key={topicIndex} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-sm font-medium">{topicIndex + 1}</span>
                      </div>
                      <span className="text-gray-700">{topic}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Certification Path */}
        <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
          <h3 className="text-xl font-semibold text-orange-900 mb-4">🏆 Certification Process</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-orange-600 font-bold">1</span>
              </div>
              <h4 className="font-medium text-orange-900">Complete Course</h4>
              <p className="text-sm text-orange-700">Finish all modules</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-orange-600 font-bold">2</span>
              </div>
              <h4 className="font-medium text-orange-900">Pass Exam</h4>
              <p className="text-sm text-orange-700">Score 80% or higher</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-orange-600 font-bold">3</span>
              </div>
              <h4 className="font-medium text-orange-900">Interview</h4>
              <p className="text-sm text-orange-700">Counselor evaluation</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-orange-600 font-bold">4</span>
              </div>
              <h4 className="font-medium text-orange-900">Get Certified</h4>
              <p className="text-sm text-orange-700">Admin approval</p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Course Completion</h3>
            <p className="text-gray-600 mb-6">
              Have you completed all the modules in this peer support training course?
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => handleConfirmCompletion(true)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Yes, Completed
              </button>
              <button
                onClick={() => handleConfirmCompletion(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Not Yet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exam Options Modal */}
      {showExamOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">🎓 Ready for Certification Exam?</h3>
            <p className="text-gray-600 mb-6">
              Great! You've completed the course. Now you can take the certification exam. When would you like to take it?
            </p>
            <div className="space-y-4">
              <button
                onClick={() => handleExamChoice('now')}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-left"
              >
                <div className="font-medium">Take Exam Now</div>
                <div className="text-sm opacity-90">15 questions, 30 minutes</div>
              </button>
              <button
                onClick={() => handleExamChoice('slot')}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-left"
              >
                <div className="font-medium">Schedule for Later</div>
                <div className="text-sm opacity-90">Choose a convenient time slot</div>
              </button>
              <button
                onClick={() => setShowExamOptions(false)}
                className="w-full px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CertificationCourse