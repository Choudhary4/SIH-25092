import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import QuestionStepper from '../components/QuestionStepper'
import CrisisModal from '../components/CrisisModal'
import { phq9Questions, calculatePHQ9Score, interpretPHQ9Score, checkCrisisRisk } from '../data/phq9'
import { useApi } from '../utils/api'

const Screening = () => {
  const { t } = useTranslation()
  const { post, screening } = useApi()
  const [currentStep, setCurrentStep] = useState('intro') // 'intro', 'screening', 'complete'
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [crisisModal, setCrisisModal] = useState({ isOpen: false, type: null })
  const [screeningResult, setScreeningResult] = useState(null)
  const [isSubmittingScreening, setIsSubmittingScreening] = useState(false)

  const validationSchema = Yup.object().shape(
    phq9Questions.reduce((schema, _, index) => {
      schema[`q${index + 1}`] = Yup.number()
        .required('This question is required')
        .min(0, 'Please select a valid answer')
        .max(3, 'Please select a valid answer')
      return schema
    }, {})
  )

  const initialValues = phq9Questions.reduce((values, _, index) => {
    values[`q${index + 1}`] = null
    return values
  }, {})

  const handleSubmitScreening = async (values, { setSubmitting }) => {
    try {
      const answers = Object.values(values)
      const score = calculatePHQ9Score(answers)
      const interpretation = interpretPHQ9Score(score)
      const crisisRisk = checkCrisisRisk(answers)

      const screeningData = {
        type: 'PHQ-9',
        answers,
        score,
        interpretation,
        crisisRisk,
        completedAt: new Date().toISOString()
      }

      // Submit to API using the screening endpoint
      await screening.createScreening(screeningData)

      setScreeningResult({ score, interpretation, crisisRisk })

      // Handle crisis situations
      if (crisisRisk.level === 'immediate') {
        setCrisisModal({ isOpen: true, type: 'immediate' })
      } else if (crisisRisk.level === 'elevated') {
        setCrisisModal({ isOpen: true, type: 'escalation' })
      } else {
        setCurrentStep('complete')
      }
    } catch (error) {
      console.error('Error submitting screening:', error)
      // Handle error appropriately
    } finally {
      setSubmitting(false)
    }
  }

  const handleContactCounselor = async () => {
    try {
      // Implement counselor contact logic
      await post('/crisis/contact-counselor', {
        urgency: crisisModal.type,
        timestamp: new Date().toISOString()
      })
      // Could redirect to chat or booking system
    } catch (error) {
      console.error('Error contacting counselor:', error)
    }
  }

  const handleCrisisModalClose = () => {
    setCrisisModal({ isOpen: false, type: null })
    setCurrentStep('complete')
  }

  if (currentStep === 'screening') {
    const currentQuestion = phq9Questions[currentQuestionIndex]
    const fieldName = `q${currentQuestionIndex + 1}`
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmitScreening}
        >
          {({ values, setFieldValue, isSubmitting, errors, touched }) => {
            const handleNext = async () => {
              if (currentQuestionIndex < phq9Questions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1)
              } else {
                // Last question, submit the form
                setIsSubmittingScreening(true)
                try {
                  await handleSubmitScreening(values, { setSubmitting: setIsSubmittingScreening })
                } finally {
                  setIsSubmittingScreening(false)
                }
              }
            }

            const handlePrevious = () => {
              if (currentQuestionIndex > 0) {
                setCurrentQuestionIndex(currentQuestionIndex - 1)
              }
            }

            const handleAnswerChange = (value) => {
              setFieldValue(fieldName, value)
            }

            return (
              <Form>
                <QuestionStepper
                  question={currentQuestion}
                  questionNumber={currentQuestionIndex + 1}
                  totalQuestions={phq9Questions.length}
                  value={values[fieldName]}
                  onChange={handleAnswerChange}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  isFirst={currentQuestionIndex === 0}
                  isLast={currentQuestionIndex === phq9Questions.length - 1}
                  error={touched[fieldName] && errors[fieldName]}
                  isSubmitting={isSubmittingScreening}
                  instructionText={t('screening.phq9.instruction')}
                />
              </Form>
            )
          }}
        </Formik>

        <CrisisModal
          isOpen={crisisModal.isOpen}
          onClose={handleCrisisModalClose}
          crisisType={crisisModal.type}
          onContactCounselor={handleContactCounselor}
        />
      </div>
    )
  }

  if (currentStep === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Screening Complete
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Thank you for completing the mental health screening. Your results have been saved.
            </p>
            
            {screeningResult && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Your Result: {screeningResult.interpretation.severity}
                </h3>
                <p className="text-blue-800">
                  {screeningResult.interpretation.description}
                </p>
                <p className="text-sm text-blue-700 mt-2">
                  Score: {screeningResult.score}/27
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setCurrentStep('intro')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Take Another Screening
              </button>
              <button
                onClick={() => window.location.href = '/resources'}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Resources
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default intro screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('screening.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('screening.subtitle')}
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('screening.phq9.title')}
            </h2>
            <p className="text-gray-600 mb-8">
              {t('screening.instructions')}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900">Confidential</h3>
                <p className="text-sm text-gray-600">Your responses are secure and private</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900">Quick</h3>
                <p className="text-sm text-gray-600">Takes only 5-10 minutes to complete</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900">Insightful</h3>
                <p className="text-sm text-gray-600">Get personalized recommendations</p>
              </div>
            </div>
            
            <button
              onClick={() => setCurrentStep('screening')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold py-4 px-8 rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {t('screening.startScreening')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Screening