import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { io } from 'socket.io-client'
import { useApi } from '../utils/api'
import CrisisModal from '../components/CrisisModal'

const Chat = () => {
  const { t } = useTranslation()
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [severityLevel, setSeverityLevel] = useState(null)
  const [showCounsellorSuggestion, setShowCounsellorSuggestion] = useState(false)
  const { post } = useApi()
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [crisisModal, setCrisisModal] = useState({ isOpen: false, type: null })
  const messagesEndRef = useRef(null)
  const socketRef = useRef(null)
  const inputRef = useRef(null)

  // Initialize socket connection
  useEffect(() => {
    const socketURL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
    
    socketRef.current = io(socketURL, {
      transports: ['websocket'],
      autoConnect: true
    })

    const socket = socketRef.current

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Connected to chat server')
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from chat server')
      setIsConnected(false)
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setIsConnected(false)
    })

    // Message event handlers
    socket.on('message', (data) => {
      const newMessage = {
        id: Date.now() + Math.random(),
        text: data.message,
        sender: 'bot',
        timestamp: new Date(),
        suggestedActions: data.suggestedActions || []
      }
      
      setMessages(prev => [...prev, newMessage])
      setIsTyping(false)

      // Handle crisis escalation
      if (data.suggestedActions?.includes('crisis_escalation')) {
        setCrisisModal({ isOpen: true, type: 'escalation' })
      }
    })

    socket.on('typing', () => {
      setIsTyping(true)
    })

    socket.on('stop_typing', () => {
      setIsTyping(false)
    })

    socket.on('error', (error) => {
      console.error('Socket error:', error)
      const errorMessage = {
        id: Date.now(),
        text: t('chat.connectionError'),
        sender: 'system',
        timestamp: new Date(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    })

    // Cleanup on unmount
    return () => {
      socket.disconnect()
    }
  }, [t])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  // Send welcome message on mount
  useEffect(() => {
    const welcomeMessage = {
      id: 'welcome',
      text: 'Hi! I\'m Buddy, your mental health companion. I\'m here to listen and support you. You can chat with me or use voice input. How are you feeling today?',
      sender: 'bot',
      timestamp: new Date(),
      suggestedActions: ['feeling_good', 'feeling_stressed', 'feeling_anxious', 'voice_mode']
    }
    setMessages([welcomeMessage])
  }, [t])

  // Voice recognition setup
  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice recognition is not supported in your browser. Please use Chrome or Safari.')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US' // Can be changed based on user preference
    
    recognition.onstart = () => {
      setIsListening(true)
    }
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInputMessage(transcript)
      setIsListening(false)
    }
    
    recognition.onerror = () => {
      setIsListening(false)
    }
    
    recognition.onend = () => {
      setIsListening(false)
    }
    
    recognition.start()
  }

  // Severity assessment function
  const assessSeverity = (message) => {
    const severityKeywords = {
      high: ['suicide', 'kill myself', 'end it all', 'no point', 'worthless', 'hopeless'],
      medium: ['depressed', 'anxious', 'panic', 'stressed', 'overwhelmed', 'can\'t cope'],
      low: ['tired', 'worried', 'sad', 'confused', 'uncertain']
    }

    const messageText = message.toLowerCase()
    
    for (const keyword of severityKeywords.high) {
      if (messageText.includes(keyword)) {
        setSeverityLevel('high')
        setShowCounsellorSuggestion(true)
        return 'high'
      }
    }
    
    for (const keyword of severityKeywords.medium) {
      if (messageText.includes(keyword)) {
        setSeverityLevel('medium')
        return 'medium'
      }
    }
    
    for (const keyword of severityKeywords.low) {
      if (messageText.includes(keyword)) {
        setSeverityLevel('low')
        return 'low'
      }
    }
    
    return 'normal'
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isSending) return

    const userMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const messageText = inputMessage.trim()
    setInputMessage('')
    setIsSending(true)

    // Assess severity before sending
    const severity = assessSeverity(messageText)

    try {
      // Send via both API and Socket.io
      const apiPromise = post('/api/v1/chat/message', {
        message: messageText,
        severity: severity,
        timestamp: new Date().toISOString()
      })

      // Emit socket event for real-time response
      if (socketRef.current?.connected) {
        socketRef.current.emit('user_message', {
          message: messageText,
          severity: severity,
          timestamp: new Date().toISOString()
        })
      }

      // Wait for API response as backup
      const response = await apiPromise
      
      // If socket didn't respond, use API response
      if (response.data && !isTyping) {
        const botMessage = {
          id: Date.now() + 1,
          text: response.data.message,
          sender: 'bot',
          timestamp: new Date(),
          suggestedActions: response.data.suggestedActions || []
        }
        setMessages(prev => [...prev, botMessage])

        // Handle crisis escalation from API response
        if (response.data.suggestedActions?.includes('crisis_escalation')) {
          setCrisisModal({ isOpen: true, type: 'escalation' })
        }
      }

    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        id: Date.now() + 2,
        text: t('chat.sendError'),
        sender: 'system',
        timestamp: new Date(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleSuggestedAction = (action) => {
    switch (action) {
      case 'feeling_good':
        setInputMessage("I'm feeling good today!")
        setTimeout(() => sendMessage(), 100)
        break
      case 'feeling_stressed':
        setInputMessage("I'm feeling stressed and need some help.")
        setTimeout(() => sendMessage(), 100)
        break
      case 'feeling_anxious':
        setInputMessage("I'm feeling anxious and worried.")
        setTimeout(() => sendMessage(), 100)
        break
      case 'voice_mode':
        setIsVoiceMode(!isVoiceMode)
        break
      case 'breathing_exercise':
        startBreathingExercise()
        break
      case 'grounding_technique':
        startGroundingTechnique()
        break
      case 'crisis_escalation':
        setCrisisModal({ isOpen: true, type: 'immediate' })
        break
      case 'book_counsellor':
        window.location.href = '/booking'
        break
      default:
        // Send action as message
        setInputMessage(action)
        setTimeout(() => sendMessage(), 100)
    }
  }

  const startBreathingExercise = () => {
    const breathingMessage = {
      id: Date.now(),
      text: t('chat.breathingExercise.instruction'),
      sender: 'bot',
      timestamp: new Date(),
      isBreathingExercise: true
    }
    setMessages(prev => [...prev, breathingMessage])
  }

  const startGroundingTechnique = () => {
    const groundingMessage = {
      id: Date.now(),
      text: t('chat.grounding.instruction'),
      sender: 'bot',
      timestamp: new Date(),
      suggestedActions: ['grounding_5things', 'grounding_4things', 'grounding_3things']
    }
    setMessages(prev => [...prev, groundingMessage])
  }

  const handleContactCounselor = async () => {
    try {
      await post('/api/v1/crisis/contact-counselor', {
        source: 'chat',
        urgency: crisisModal.type,
        timestamp: new Date().toISOString()
      })
      
      const confirmationMessage = {
        id: Date.now(),
        text: t('chat.counselorContacted'),
        sender: 'system',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, confirmationMessage])
    } catch (error) {
      console.error('Error contacting counselor:', error)
    }
  }

  const renderMessage = (message) => {
    const isUser = message.sender === 'user'
    const isSystem = message.sender === 'system'
    const isBot = message.sender === 'bot'

    return (
      <div
        key={message.id}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`max-w-[70%] ${isUser ? 'order-2' : 'order-1'}`}>
          {/* Avatar */}
          {!isUser && (
            <div className="flex items-center mb-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                isSystem ? 'bg-yellow-100' : 'bg-blue-100'
              }`}>
                {isSystem ? (
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {isSystem ? t('chat.system') : t('chat.aiAssistant')}
              </span>
            </div>
          )}

          {/* Message Bubble */}
          <div
            className={`relative px-4 py-3 rounded-2xl ${
              isUser
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : isSystem
                ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                : message.isError
                ? 'bg-red-50 border border-red-200 text-red-800'
                : 'bg-white border border-gray-200 text-gray-900'
            } shadow-sm`}
          >
            {/* Message Content */}
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.text}
            </div>

            {/* Breathing Exercise Component */}
            {message.isBreathingExercise && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <p className="text-blue-800 font-medium">{t('chat.breathingExercise.steps')}</p>
                  <div className="mt-2 text-blue-600 text-sm">
                    {t('chat.breathingExercise.cycle')}
                  </div>
                </div>
              </div>
            )}

            {/* Suggested Actions */}
            {message.suggestedActions && message.suggestedActions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {message.suggestedActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedAction(action)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      action === 'crisis_escalation'
                        ? 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200'
                        : 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200'
                    }`}
                  >
                    {t(`chat.actions.${action}`)}
                  </button>
                ))}
              </div>
            )}

            {/* Timestamp */}
            <div className={`mt-2 text-xs ${
              isUser ? 'text-blue-100' : 'text-gray-500'
            }`}>
              {message.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-teal-50 to-blue-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-teal-600 to-blue-600 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">🤖</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Buddy - Your Mental Health Companion
              </h1>
              <div className="flex items-center text-sm text-gray-500">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  isConnected ? 'bg-green-400' : 'bg-red-400'
                }`} />
                {isConnected ? 'Online' : 'Offline'} • {severityLevel && `Severity: ${severityLevel}`}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsVoiceMode(!isVoiceMode)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                isVoiceMode
                  ? 'bg-teal-100 text-teal-700 border border-teal-200'
                  : 'bg-gray-100 text-gray-700 border border-gray-200'
              }`}
            >
              {isVoiceMode ? '🎤 Voice Mode' : '💬 Text Mode'}
            </button>
            <div className="text-sm text-gray-500">
              AI/Voice Support • Regional Languages
            </div>
          </div>
        </div>

        {/* Severity Warning */}
        {showCounsellorSuggestion && (
          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-orange-600 mr-2">⚠️</span>
                <span className="text-orange-800 font-medium">
                  I notice you might be going through a tough time. Would you like to connect with a professional counsellor?
                </span>
              </div>
              <button
                onClick={() => handleSuggestedAction('book_counsellor')}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Book Counsellor
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-4xl mx-auto">
          {messages.map(renderMessage)}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start mb-4">
              <div className="max-w-[70%]">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-500">{t('chat.aiAssistant')}</span>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={isVoiceMode ? "Click the mic button to speak..." : "Type your message here..."}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                rows="1"
                style={{ maxHeight: '120px' }}
                disabled={!isConnected || (isVoiceMode && !inputMessage)}
                aria-label="Type your message"
              />
            </div>
            
            {/* Voice Input Button */}
            {isVoiceMode && (
              <button
                onClick={startVoiceRecognition}
                disabled={isListening}
                className={`p-3 rounded-full transition-all duration-200 ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-teal-500 text-white hover:bg-teal-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
                aria-label="Voice input"
              >
                {isListening ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </button>
            )}

            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isSending || !isConnected}
              className={`p-3 rounded-full transition-all duration-200 ${
                inputMessage.trim() && !isSending && isConnected
                  ? 'bg-gradient-to-r from-teal-600 to-blue-600 text-white hover:from-teal-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              aria-label="Send message"
            >
              {isSending ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
          
          {!isConnected && (
            <div className="mt-2 text-center text-sm text-red-600">
              {t('chat.connectionLost')}
            </div>
          )}
        </div>
      </div>

      {/* Crisis Modal */}
      <CrisisModal
        isOpen={crisisModal.isOpen}
        onClose={() => setCrisisModal({ isOpen: false, type: null })}
        crisisType={crisisModal.type}
        onContactCounselor={handleContactCounselor}
      />
    </div>
  )
}

export default Chat