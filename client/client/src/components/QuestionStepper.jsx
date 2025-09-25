import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { PHQ9_ANSWERS, AUDIO_URLS } from '../data/phq9'

const QuestionStepper = ({ 
  question, 
  questionNumber, 
  totalQuestions, 
  value, 
  onChange, 
  onNext, 
  onPrevious, 
  isFirst, 
  isLast, 
  error,
  isSubmitting,
  instructionText 
}) => {
  const { t } = useTranslation()
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)

  const progressPercentage = ((questionNumber - 1) / totalQuestions) * 100

  const handleAudioPlay = async () => {
    try {
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause()
          setIsPlaying(false)
        } else {
          await audioRef.current.play()
          setIsPlaying(true)
        }
      }
    } catch (error) {
      console.error('Audio playback error:', error)
      // Fallback: use text-to-speech if available
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(t(`screening.questions.${question.key}`))
        utterance.lang = 'en-US'
        utterance.rate = 0.8
        speechSynthesis.speak(utterance)
      }
    }
  }

  const handleAudioEnded = () => {
    setIsPlaying(false)
  }

  const handleAnswerChange = (answerValue) => {
    onChange(answerValue)
  }

  const handleNext = () => {
    if (value !== null && value !== undefined) {
      onNext()
    }
  }

  const handleKeyPress = (e) => {
    if (e.key >= '1' && e.key <= '4') {
      const answerIndex = parseInt(e.key) - 1
      if (answerIndex < PHQ9_ANSWERS.length) {
        handleAnswerChange(PHQ9_ANSWERS[answerIndex].value)
      }
    } else if (e.key === 'Enter' && value !== null && value !== undefined) {
      handleNext()
    } else if (e.key === 'ArrowLeft' && !isFirst) {
      onPrevious()
    } else if (e.key === 'ArrowRight' && value !== null && value !== undefined) {
      handleNext()
    }
  }

  return (
    <div 
      className="max-w-4xl mx-auto p-6 focus:outline-none" 
      tabIndex={0} 
      onKeyDown={handleKeyPress}
    >
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">
            {t('screening.progress')}
          </span>
          <span className="text-sm font-medium text-blue-600">
            {questionNumber} {t('common.of')} {totalQuestions}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8">
        {/* Question Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <span className="text-white font-bold text-xl">{questionNumber}</span>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-relaxed">
            {t(`screening.phq9.questions.${question.key}`)}
          </h2>
          
          <p className="text-lg text-gray-600 mb-6">
            {instructionText}
          </p>

          {/* Audio Playback Button */}
          <div className="flex justify-center mb-6">
            <button
              type="button"
              onClick={handleAudioPlay}
              className="inline-flex items-center px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={t('screening.playAudio')}
            >
              {isPlaying ? (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                  </svg>
                  {t('screening.pauseAudio')}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M8 21l4-4H8a2 2 0 01-2-2V9a2 2 0 012-2h4l4-4v18z" />
                  </svg>
                  {t('screening.playAudio')}
                </>
              )}
            </button>
          </div>

          {/* Hidden Audio Element */}
          <audio
            ref={audioRef}
            src={AUDIO_URLS[question.audioId]}
            onEnded={handleAudioEnded}
            preload="none"
          />
        </div>

        {/* Answer Options */}
        <div className="space-y-4">
          {PHQ9_ANSWERS.map((answer, index) => (
            <label
              key={answer.value}
              className={`relative flex items-center p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                value === answer.value
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name={question.id}
                value={answer.value}
                checked={value === answer.value}
                onChange={() => handleAnswerChange(answer.value)}
                className="sr-only"
              />
              
              {/* Custom Radio Button */}
              <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 mr-4 transition-colors ${
                value === answer.value
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
              }`}>
                {value === answer.value && (
                  <div className="w-full h-full rounded-full bg-white scale-50" />
                )}
              </div>

              {/* Keyboard Shortcut */}
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-4 text-sm font-medium text-gray-600">
                {index + 1}
              </div>

              {/* Answer Text */}
              <div className="flex-1">
                <span className={`text-lg font-medium ${
                  value === answer.value ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {t(`screening.phq9.answers.${answer.value}`)}
                </span>
              </div>

              {/* Selection Indicator */}
              {value === answer.value && (
                <div className="flex-shrink-0 text-blue-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </label>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isFirst}
          className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            isFirst
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('common.previous')}
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">
            {t('screening.keyboardHint')}
          </p>
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
            <span>1-4: {t('screening.selectAnswer')}</span>
            <span>•</span>
            <span>Enter: {t('common.next')}</span>
            <span>•</span>
            <span>←→: {t('common.navigate')}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleNext}
          disabled={value === null || value === undefined || (isLast && isSubmitting)}
          className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            value !== null && value !== undefined && !(isLast && isSubmitting)
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isLast && isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {t('screening.completing')}
            </>
          ) : (
            isLast ? t('common.submit') : t('common.next')
          )}
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-8 text-center">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            <strong>{t('screening.instructions.title')}:</strong> {t('screening.instructions.description')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default QuestionStepper