import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const CertificationExam = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(30 * 60) // 30 minutes
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)

  // Demo exam questions
  const questions = [
    {
      id: 1,
      question: "What is the primary goal of peer support in mental health?",
      options: [
        "To provide professional therapy",
        "To offer lived experience and mutual support",
        "To diagnose mental health conditions",
        "To prescribe medication"
      ],
      correct: 1
    },
    {
      id: 2,
      question: "Which of the following is NOT an appropriate boundary for peer supporters?",
      options: [
        "Maintaining confidentiality",
        "Sharing personal contact information freely",
        "Referring to professional help when needed",
        "Avoiding dual relationships"
      ],
      correct: 1
    },
    {
      id: 3,
      question: "What should you do if someone expresses suicidal thoughts?",
      options: [
        "Try to convince them not to do it",
        "Change the subject immediately",
        "Listen without judgment and connect them to professional help",
        "Share your own similar experiences"
      ],
      correct: 2
    },
    {
      id: 4,
      question: "Active listening involves:",
      options: [
        "Giving advice immediately",
        "Focusing fully on the speaker and reflecting back what you hear",
        "Interrupting to share your thoughts",
        "Planning what to say next while they speak"
      ],
      correct: 1
    },
    {
      id: 5,
      question: "Cultural competency in peer support means:",
      options: [
        "Treating everyone exactly the same",
        "Making assumptions based on appearance",
        "Understanding and respecting diverse backgrounds and experiences",
        "Only helping people from your own culture"
      ],
      correct: 2
    },
    {
      id: 6,
      question: "Which is a warning sign of mental health crisis?",
      options: [
        "Occasional sadness",
        "Talking about wanting to die or hurt oneself",
        "Having a bad day",
        "Normal stress about exams"
      ],
      correct: 1
    },
    {
      id: 7,
      question: "Self-care for peer supporters is:",
      options: [
        "Selfish and unnecessary",
        "Only needed when feeling overwhelmed",
        "Essential for maintaining effectiveness and preventing burnout",
        "A luxury that can be ignored"
      ],
      correct: 2
    },
    {
      id: 8,
      question: "When should you refer someone to professional help?",
      options: [
        "Never, you can handle everything",
        "Only when they specifically ask",
        "When the situation is beyond your scope or involves serious risk",
        "Only if you don't like them"
      ],
      correct: 2
    },
    {
      id: 9,
      question: "Empathy in peer support means:",
      options: [
        "Feeling sorry for someone",
        "Understanding and sharing someone's feelings",
        "Agreeing with everything they say",
        "Telling them what they should feel"
      ],
      correct: 1
    },
    {
      id: 10,
      question: "Confidentiality in peer support means:",
      options: [
        "Sharing information with friends to get advice",
        "Keeping all information private unless there's immediate danger",
        "Only keeping secrets you want to keep",
        "Sharing with supervisors whenever you want"
      ],
      correct: 1
    },
    {
      id: 11,
      question: "What is trauma-informed care?",
      options: [
        "Avoiding all mention of trauma",
        "Recognizing signs of trauma and responding with sensitivity",
        "Only for professional therapists",
        "Forcing people to share traumatic experiences"
      ],
      correct: 1
    },
    {
      id: 12,
      question: "How should you handle your own emotional reactions during peer support?",
      options: [
        "Suppress them completely",
        "Share them immediately with the person you're supporting",
        "Acknowledge them privately and seek supervision if needed",
        "Let them guide your responses"
      ],
      correct: 2
    },
    {
      id: 13,
      question: "What is the difference between peer support and professional counseling?",
      options: [
        "There is no difference",
        "Peer support is based on shared experience, counseling on professional training",
        "Peer support is better than counseling",
        "Only professionals can help with mental health"
      ],
      correct: 1
    },
    {
      id: 14,
      question: "Which response shows good active listening?",
      options: [
        "\"I know exactly how you feel\"",
        "\"You should just think positive\"",
        "\"It sounds like you're feeling overwhelmed by everything\"",
        "\"At least you're not as bad as...\""
      ],
      correct: 2
    },
    {
      id: 15,
      question: "What should you do if you feel overwhelmed by someone's situation?",
      options: [
        "End the conversation immediately",
        "Take on their problems as your own",
        "Seek supervision and practice self-care",
        "Give them quick advice to solve everything"
      ],
      correct: 2
    }
  ]

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit()
    }
  }, [timeLeft, isSubmitted])

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setAnswers({
      ...answers,
      [questionIndex]: answerIndex
    })
  }

  const handleSubmit = () => {
    // Calculate score
    let correctAnswers = 0
    questions.forEach((question, index) => {
      if (answers[index] === question.correct) {
        correctAnswers++
      }
    })
    
    const finalScore = Math.round((correctAnswers / questions.length) * 100)
    setScore(finalScore)
    setIsSubmitted(true)
    setShowResult(true)
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleFinishExam = () => {
    if (score >= 80) {
      // Schedule interview with counselor
      navigate('/certification/schedule-interview', { 
        state: { 
          examScore: score,
          examCompleted: true 
        }
      })
    } else {
      // Allow retake
      navigate('/resources')
    }
  }

  if (showResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              score >= 80 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {score >= 80 ? (
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {score >= 80 ? '🎉 Congratulations!' : '📚 Keep Learning'}
            </h2>
            
            <p className="text-gray-600 mb-6">
              Your Score: <span className="text-2xl font-bold text-blue-600">{score}%</span>
            </p>
            
            {score >= 80 ? (
              <div className="text-left bg-green-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-green-900 mb-2">✅ Exam Passed!</h3>
                <p className="text-green-700 text-sm">
                  Great job! You've successfully passed the certification exam. 
                  Next step: Schedule an interview with a counselor for final evaluation.
                </p>
              </div>
            ) : (
              <div className="text-left bg-red-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-red-900 mb-2">📖 Need More Preparation</h3>
                <p className="text-red-700 text-sm">
                  You need at least 80% to pass. Please review the course materials 
                  and try again when you feel ready.
                </p>
              </div>
            )}
            
            <div className="space-y-3">
              {score >= 80 ? (
                <button
                  onClick={handleFinishExam}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Schedule Interview
                </button>
              ) : (
                <button
                  onClick={() => navigate('/certification/course/8')}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Review Course Material
                </button>
              )}
              
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

  const currentQ = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Peer Support Certification Exam</h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Time Remaining</div>
                <div className={`text-lg font-mono font-bold ${
                  timeLeft < 300 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {currentQ.question}
          </h2>
          
          <div className="space-y-4">
            {currentQ.options.map((option, index) => (
              <label
                key={index}
                className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                  answers[currentQuestion] === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion}`}
                  value={index}
                  checked={answers[currentQuestion] === index}
                  onChange={() => handleAnswerSelect(currentQuestion, index)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                  answers[currentQuestion] === index
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {answers[currentQuestion] === index && (
                    <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                  )}
                </div>
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex items-center space-x-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  index === currentQuestion
                    ? 'bg-blue-600 text-white'
                    : answers[index] !== undefined
                    ? 'bg-green-200 text-green-800'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          
          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Submit Exam
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Next
            </button>
          )}
        </div>

        {/* Answered Progress */}
        <div className="mt-4 text-center text-sm text-gray-600">
          Answered: {Object.keys(answers).length} of {questions.length} questions
        </div>
      </div>
    </div>
  )
}

export default CertificationExam