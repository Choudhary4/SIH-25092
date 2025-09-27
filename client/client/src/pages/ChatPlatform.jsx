import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import { useApi } from '../hooks/useApi'

const ChatPlatform = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { callApi } = useApi()

  console.log('ChatPlatform component loaded')
  console.log('Search params:', Object.fromEntries(searchParams))

  // Core state
  const [user, setUser] = useState(null)
  const [currentChat, setCurrentChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [otherUserTyping, setOtherUserTyping] = useState(false)

  // Chat management
  const [activeChats, setActiveChats] = useState([])
  const [onlineUsers, setOnlineUsers] = useState(new Set())

  // Video calling state
  const [inVideoCall, setInVideoCall] = useState(false)
  const [incomingCall, setIncomingCall] = useState(null)
  const [callControls, setCallControls] = useState({
    video: true,
    audio: true,
    screenShare: false
  })

  // Media refs
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const localStreamRef = useRef(null)
  const peerConnectionRef = useRef(null)
  const socketRef = useRef(null)

  // UI refs
  const messagesContainerRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)

  // ICE servers configuration for WebRTC
  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ]
  }

  // Initialize socket connection and user data
  useEffect(() => {
    initializeUser()
    initializeSocket()
    
    return () => {
      cleanup()
    }
  }, [])

  // Handle URL parameters for appointment chat
  useEffect(() => {
    try {
      const appointmentId = searchParams.get('appointment')
      const userId = searchParams.get('user')
      
      console.log('URL params - appointmentId:', appointmentId, 'userId:', userId)
      console.log('User loaded:', !!user)
      
      if (appointmentId && userId && user) {
        console.log('User is loaded, initiating appointment chat...')
        initiateAppointmentChat(appointmentId, userId)
      } else if (appointmentId && userId && !user) {
        console.log('Waiting for user data to load...')
      } else {
        console.log('Missing URL parameters for appointment chat')
      }
    } catch (error) {
      console.error('Error processing URL parameters:', error)
    }
  }, [searchParams, user])

  const initializeUser = () => {
    console.log('Initializing user...')
    const userData = localStorage.getItem('Mann-Mitra_user') // Fixed: use correct key
    const token = localStorage.getItem('Mann-Mitra_token')
    
    console.log('User data in localStorage:', userData)
    console.log('Token in localStorage:', !!token)
    
    // Check for test mode parameters
    const urlParams = new URLSearchParams(window.location.search)
    const isTestMode = urlParams.get('test') === 'true'
    
    if (isTestMode) {
      console.log('🧪 Test mode enabled - bypassing authentication')
      const testUser = {
        _id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'student'
      }
      setUser(testUser)
      return
    }
    
    if (!userData || !token) {
      console.log('Missing user data or token, redirecting to login')
      alert('❌ Authentication required!\n\nPlease log in first to access the chat platform.\n\n💡 Tip: You can test the chat platform by adding "?test=true" to the URL')
      navigate('/login')
      return
    }
    
    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      console.log('Chat user initialized successfully:', parsedUser)
    } catch (error) {
      console.error('Error parsing user data:', error)
      navigate('/login')
    }
  }

  const initializeSocket = () => {
    const token = localStorage.getItem('Mann-Mitra_token')
    
    // Check for test mode
    const urlParams = new URLSearchParams(window.location.search)
    const isTestMode = urlParams.get('test') === 'true'
    
    if (isTestMode) {
      console.log('🧪 Test mode - skipping socket connection')
      setIsConnected(true) // Fake connection for UI
      return
    }
    
    if (!token) {
      console.error('No authentication token found')
      setIsConnected(false)
      return
    }
    
    const socketURL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
    console.log('Connecting to socket server:', socketURL)
    
    socketRef.current = io(socketURL, {
      auth: { token },
      transports: ['websocket', 'polling']
    })

    const socket = socketRef.current

    // Connection events
    socket.on('connect', () => {
      console.log('Connected to chat server')
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from chat server')
      setIsConnected(false)
    })

    // Chat events
    socket.on('private_message', handleIncomingMessage)
    socket.on('user_typing', handleUserTyping)
    socket.on('message_sent', handleMessageSent)

    // Video call events
    socket.on('incoming_call', handleIncomingCall)
    socket.on('call_accepted', handleCallAccepted)
    socket.on('call_rejected', handleCallRejected)
    socket.on('call_ended', handleCallEnded)
    socket.on('webrtc_offer', handleWebRTCOffer)
    socket.on('webrtc_answer', handleWebRTCAnswer)
    socket.on('webrtc_ice_candidate', handleICECandidate)

    // Presence events
    socket.on('user_online', (userId) => {
      setOnlineUsers(prev => new Set([...prev, userId]))
    })

    socket.on('user_offline', (userId) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    })
  }

  const cleanup = () => {
    if (socketRef.current) {
      socketRef.current.disconnect()
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
    }
  }

  const initiateAppointmentChat = async (appointmentId, otherUserId) => {
    try {
      console.log('Initiating chat for appointment:', appointmentId, 'with user:', otherUserId)
      console.log('Current user:', user)
      
      // Check if user is loaded
      if (!user) {
        console.error('User not loaded yet, waiting...')
        return
      }
      
      // Handle test case
      if (appointmentId === 'test' || otherUserId === 'test') {
        console.log('Test mode - setting up demo chat')
        setCurrentChat({
          type: 'test',
          appointmentId: 'test',
          partnerId: 'test-user',
          partnerName: 'Test Partner',
          partnerRole: user.role === 'student' ? 'counsellor' : 'student'
        })
        
        // Don't try to fetch real data or connect to socket for test
        return
      }
      
      // Validate MongoDB ObjectId format
      const objectIdRegex = /^[0-9a-fA-F]{24}$/
      if (!objectIdRegex.test(appointmentId)) {
        console.error('Invalid appointment ID format:', appointmentId)
        alert('Invalid appointment ID. Please use a valid appointment link.')
        return
      }
      
      // Fetch appointment details
      const response = await callApi(`/api/v1/appointments/${appointmentId}`, 'GET')
      
      if (response.success) {
        const serverResponse = response.data || response
        const appointment = serverResponse.appointment || serverResponse
        
        console.log('Appointment data received:', appointment)
        
        // Set up chat with the other participant
        let chatPartner = null
        let partnerRole = ''
        
        if (user.role === 'student') {
          chatPartner = appointment.counsellorId
          partnerRole = 'counsellor'
        } else if (user.role === 'counsellor') {
          chatPartner = appointment.studentId
          partnerRole = 'student'
        } else {
          console.error('Invalid user role:', user.role)
          alert('Invalid user role. Please login again.')
          return
        }
          
        if (!chatPartner) {
          console.error('Chat partner not found in appointment data')
          console.error('Appointment data:', appointment)
          alert('Unable to find chat partner information. Please check if this appointment is properly configured.')
          return
        }
          
        setCurrentChat({
          type: 'appointment',
          appointmentId,
          partnerId: chatPartner._id || chatPartner,
          partnerName: chatPartner.name || 'Chat Partner',
          partnerRole: partnerRole
        })

        // Join appointment room
        if (socketRef.current) {
          socketRef.current.emit('join_room', {
            roomId: `appointment_${appointmentId}`,
            roomType: 'appointment'
          })
        }

        // Load message history
        await loadMessageHistory(appointmentId)
      } else {
        console.error('Failed to fetch appointment:', response.message)
        alert('Unable to load appointment details. Please check if you have access to this appointment.')
      }
    } catch (error) {
      console.error('Error initiating appointment chat:', error)
      alert('Failed to initialize chat. Please try again or contact support.')
    }
  }

  const loadMessageHistory = async (appointmentId) => {
    try {
      // Skip loading for test appointments
      if (appointmentId === 'test') {
        console.log('Test mode - using demo messages')
        setMessages([
          {
            id: 'demo1',
            senderId: 'test-user',
            senderName: 'Test Partner',
            senderRole: user.role === 'student' ? 'counsellor' : 'student',
            message: 'Hello! This is a demo chat message.',
            timestamp: new Date()
          }
        ])
        return
      }
      
      const response = await callApi(`/api/v1/chat/messages/${appointmentId}`, 'GET')
      
      if (response.success) {
        const serverResponse = response.data || response
        setMessages(serverResponse.messages || [])
        console.log('Loaded message history:', serverResponse.messages?.length || 0, 'messages')
      } else {
        console.error('Failed to load message history:', response.message)
        setMessages([])
      }
    } catch (error) {
      console.error('Error loading message history:', error)
      setMessages([])
    }
  }

  const handleIncomingMessage = (messageData) => {
    setMessages(prev => [...prev, {
      ...messageData,
      timestamp: new Date(messageData.timestamp)
    }])
    scrollToBottom()
  }

  const handleUserTyping = ({ userId, isTyping }) => {
    if (currentChat && userId === currentChat.partnerId) {
      setOtherUserTyping(isTyping)
    }
  }

  const handleMessageSent = ({ messageId, timestamp }) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, sent: true, timestamp: new Date(timestamp) } : msg
    ))
  }

  const sendMessage = async () => {
    console.log('📤 sendMessage called:', { 
      inputMessage: inputMessage?.trim(), 
      hasCurrentChat: !!currentChat, 
      currentChatType: currentChat?.type,
      user: user 
    })
    
    if (!inputMessage.trim() || !currentChat) {
      console.warn('❌ sendMessage blocked:', { 
        noInputMessage: !inputMessage.trim(), 
        noCurrentChat: !currentChat 
      })
      return
    }

    const tempMessage = {
      id: `temp_${Date.now()}`,
      senderId: user._id || user.id,
      senderName: user.name,
      senderRole: user.role,
      message: inputMessage.trim(),
      messageType: 'text',
      timestamp: new Date(),
      sent: false,
      temp: true
    }

    setMessages(prev => [...prev, tempMessage])
    
    // Handle test mode
    if (currentChat.type === 'test') {
      console.log('Test mode - simulating message sent')
      // Simulate message delivery
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id ? { ...msg, sent: true, temp: false } : msg
        ))
        
        // Add an auto-reply for demo
        setTimeout(() => {
          const autoReply = {
            id: `auto_${Date.now()}`,
            senderId: 'test-user',
            senderName: 'Test Partner',
            senderRole: user.role === 'student' ? 'counsellor' : 'student',
            message: 'Thanks for your message! This is an automated test response.',
            messageType: 'text',
            timestamp: new Date(),
            sent: true
          }
          setMessages(prev => [...prev, autoReply])
          scrollToBottom()
        }, 1000)
      }, 500)
    } else {
      // Real message sending
      if (socketRef.current) {
        socketRef.current.emit('private_message', {
          recipientId: currentChat.partnerId,
          message: inputMessage.trim(),
          messageType: 'text',
          appointmentId: currentChat.appointmentId
        })
      } else {
        console.error('Socket not connected - message not sent')
        // Remove the temp message if socket not connected
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
        alert('Not connected to chat server. Please refresh and try again.')
        return
      }
    }

    setInputMessage('')
    inputRef.current?.focus()
    scrollToBottom()
  }

  const handleTyping = () => {
    if (!currentChat) return
    
    setIsTyping(true)
    socketRef.current.emit('typing', {
      roomId: `appointment_${currentChat.appointmentId}`,
      isTyping: true
    })

    // Clear typing indicator after 3 seconds
    clearTimeout(window.typingTimeout)
    window.typingTimeout = setTimeout(() => {
      setIsTyping(false)
      socketRef.current.emit('typing', {
        roomId: `appointment_${currentChat.appointmentId}`,
        isTyping: false
      })
    }, 3000)
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesContainerRef.current?.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }, 100)
  }

  // Local video test function
  const startLocalVideoTest = async () => {
    try {
      console.log('🎥 Starting local video test...')
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
      
      localStreamRef.current = stream
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
      
      // For testing, mirror the local video to remote video too
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream
      }
      
      setIsVideoCallActive(true)
      console.log('✅ Local video test started successfully')
    } catch (error) {
      console.error('❌ Local video test failed:', error)
      alert('Camera/microphone access denied or not available. Please check permissions.')
    }
  }

  // Video calling functions
  const startVideoCall = async () => {
    try {
      if (!currentChat) return

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
      
      localStreamRef.current = stream
      
      // Safely set video source if element exists
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      } else {
        console.warn('Local video element not found')
      }

      // Create peer connection
      peerConnectionRef.current = new RTCPeerConnection(iceServers)
      
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnectionRef.current.addTrack(track, stream)
      })

      // Handle remote stream
      peerConnectionRef.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0]
        } else {
          console.warn('Remote video element not found in startVideoCall')
        }
      }

      // Handle ICE candidates
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit('webrtc_ice_candidate', {
            candidate: event.candidate,
            recipientId: currentChat.partnerId
          })
        }
      }

      // Create and send offer
      const offer = await peerConnectionRef.current.createOffer()
      await peerConnectionRef.current.setLocalDescription(offer)
      
      socketRef.current.emit('initiate_call', {
        recipientId: currentChat.partnerId,
        offer,
        callType: 'video'
      })

      setInVideoCall(true)
    } catch (error) {
      console.error('Error starting video call:', error)
      alert('Failed to start video call. Please check your camera and microphone permissions.')
    }
  }

  const handleIncomingCall = ({ senderId, senderName, offer, callType }) => {
    setIncomingCall({
      senderId,
      senderName,
      offer,
      callType
    })
  }

  const acceptCall = async () => {
    try {
      const { senderId, offer } = incomingCall
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
      
      localStreamRef.current = stream
      
      // Safely set video source if element exists
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      } else {
        console.warn('Local video element not found in acceptCall')
      }

      // Create peer connection
      peerConnectionRef.current = new RTCPeerConnection(iceServers)
      
      // Add local stream
      stream.getTracks().forEach(track => {
        peerConnectionRef.current.addTrack(track, stream)
      })

      // Handle remote stream
      peerConnectionRef.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0]
        } else {
          console.warn('Remote video element not found in acceptCall')
        }
      }

      // Handle ICE candidates
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit('webrtc_ice_candidate', {
            candidate: event.candidate,
            recipientId: senderId
          })
        }
      }

      // Set remote description and create answer
      await peerConnectionRef.current.setRemoteDescription(offer)
      const answer = await peerConnectionRef.current.createAnswer()
      await peerConnectionRef.current.setLocalDescription(answer)
      
      socketRef.current.emit('call_accepted', {
        senderId,
        answer
      })

      setInVideoCall(true)
      setIncomingCall(null)
    } catch (error) {
      console.error('Error accepting call:', error)
    }
  }

  const rejectCall = () => {
    socketRef.current.emit('call_rejected', {
      senderId: incomingCall.senderId
    })
    setIncomingCall(null)
  }

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
    }

    socketRef.current.emit('call_ended', {
      recipientId: currentChat?.partnerId
    })

    setInVideoCall(false)
    localVideoRef.current.srcObject = null
    remoteVideoRef.current.srcObject = null
  }

  const handleCallAccepted = async ({ answer }) => {
    await peerConnectionRef.current.setRemoteDescription(answer)
  }

  const handleCallRejected = () => {
    alert('Call was rejected')
    endCall()
  }

  const handleCallEnded = () => {
    endCall()
  }

  const handleWebRTCOffer = async ({ offer, senderId }) => {
    // Handle when receiving an offer (for incoming calls)
    setIncomingCall(prev => ({ ...prev, offer }))
  }

  const handleWebRTCAnswer = async ({ answer }) => {
    if (peerConnectionRef.current) {
      await peerConnectionRef.current.setRemoteDescription(answer)
    }
  }

  const handleICECandidate = async ({ candidate }) => {
    if (peerConnectionRef.current) {
      await peerConnectionRef.current.addIceCandidate(candidate)
    }
  }

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      videoTrack.enabled = !videoTrack.enabled
      setCallControls(prev => ({ ...prev, video: videoTrack.enabled }))
    }
  }

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      audioTrack.enabled = !audioTrack.enabled
      setCallControls(prev => ({ ...prev, audio: audioTrack.enabled }))
    }
  }

  const shareScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
      const videoTrack = stream.getVideoTracks()[0]
      
      // Replace video track in peer connection
      const sender = peerConnectionRef.current.getSenders().find(s => 
        s.track && s.track.kind === 'video'
      )
      
      if (sender) {
        await sender.replaceTrack(videoTrack)
      }

      setCallControls(prev => ({ ...prev, screenShare: true }))
      
      // Handle screen share end
      videoTrack.onended = () => {
        setCallControls(prev => ({ ...prev, screenShare: false }))
        // Switch back to camera
        const cameraTrack = localStreamRef.current.getVideoTracks()[0]
        if (sender && cameraTrack) {
          sender.replaceTrack(cameraTrack)
        }
      }
    } catch (error) {
      console.error('Error sharing screen:', error)
    }
  }

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp)
    const today = new Date()
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    }
    
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file || !currentChat) return

    // Here you would typically upload the file to your server
    // and then send a message with the file URL
    console.log('File upload not implemented yet:', file)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we set up your chat session</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              {currentChat ? `Chat with ${currentChat.partnerName}` : 'Chat Platform'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Connection status */}
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
              isConnected 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>

            {/* Video call buttons */}
            {currentChat && !inVideoCall && (
              <>
                <button
                  onClick={startVideoCall}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <span>📹</span>
                  <span>Video Call</span>
                </button>
                
                {/* Local video test button */}
                <button
                  onClick={startLocalVideoTest}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1 text-sm"
                  title="Test your camera and microphone locally"
                >
                  <span>🧪</span>
                  <span>Test Video</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {!currentChat ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Chat</h3>
                <p className="text-gray-600">
                  Start a conversation by clicking on an appointment or contact.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {currentChat.partnerName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{currentChat.partnerName}</h3>
                      <p className="text-sm text-gray-500 capitalize">{currentChat.partnerRole}</p>
                    </div>
                    {onlineUsers.has(currentChat.partnerId) && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs">Online</span>
                      </div>
                    )}
                  </div>
                  
                  {otherUserTyping && (
                    <div className="text-sm text-gray-500 italic">
                      {currentChat.partnerName} is typing...
                    </div>
                  )}
                </div>
              </div>

              {/* Messages Area */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-6 space-y-4"
              >
                {messages.map((message, index) => {
                  const isOwn = message.senderId === user.id
                  const showDate = index === 0 || 
                    formatMessageDate(message.timestamp) !== formatMessageDate(messages[index - 1]?.timestamp)
                  
                  return (
                    <div key={message.id}>
                      {showDate && (
                        <div className="flex justify-center mb-4">
                          <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                            {formatMessageDate(message.timestamp)}
                          </span>
                        </div>
                      )}
                      
                      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isOwn 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white text-gray-900 border border-gray-200'
                        }`}>
                          <p className="text-sm">{message.message}</p>
                          <div className={`flex items-center justify-end mt-1 text-xs ${
                            isOwn ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            <span>{formatMessageTime(message.timestamp)}</span>
                            {isOwn && message.sent && (
                              <span className="ml-1">✓</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Input Area */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex items-end space-x-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,application/pdf,.doc,.docx"
                  />
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    📎
                  </button>
                  
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => {
                        setInputMessage(e.target.value)
                        handleTyping()
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          sendMessage()
                        }
                      }}
                      placeholder="Type your message..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Video Call Modal */}
      {inVideoCall && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 h-[80vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Video Call with {currentChat?.partnerName}</h3>
              <button
                onClick={endCall}
                className="text-red-600 hover:text-red-700"
              >
                End Call
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 h-[60vh]">
              {/* Remote Video */}
              <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                  {currentChat?.partnerName}
                </div>
              </div>
              
              {/* Local Video */}
              <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                  You
                </div>
              </div>
            </div>
            
            {/* Call Controls */}
            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={toggleAudio}
                className={`p-3 rounded-full transition-colors ${
                  callControls.audio 
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {callControls.audio ? '🎤' : '🚫'}
              </button>
              
              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full transition-colors ${
                  callControls.video 
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {callControls.video ? '📹' : '🚫'}
              </button>
              
              <button
                onClick={shareScreen}
                className={`p-3 rounded-full transition-colors ${
                  callControls.screenShare 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📺
              </button>
              
              <button
                onClick={endCall}
                className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
              >
                📞
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                {incomingCall.senderName.charAt(0)}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Incoming {incomingCall.callType} call
              </h3>
              <p className="text-gray-600 mb-6">{incomingCall.senderName} is calling you</p>
              
              <div className="flex space-x-4">
                <button
                  onClick={rejectCall}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Decline
                </button>
                <button
                  onClick={acceptCall}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatPlatform