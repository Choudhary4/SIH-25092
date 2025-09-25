const { validationResult } = require('express-validator');
const llmService = require('../services/llm.service');
const User = require('../models/user.model');
const Screening = require('../models/screening.model');

/**
 * Chat Controller - AI-Guided First Aid Mental Health Support
 * 
 * This controller provides AI-powered mental health first aid responses
 * with built-in safety checks and crisis escalation protocols.
 * 
 * SAFETY PROTOCOLS:
 * 1. Automated crisis keyword detection
 * 2. Immediate escalation for suicidal ideation
 * 3. Professional help recommendations in all responses
 * 4. Conversation logging for audit and safety monitoring
 * 5. Rate limiting to prevent abuse
 * 
 * LIMITATIONS:
 * - This is NOT therapy or professional counseling
 * - AI responses are supplementary to human support
 * - All users should be directed to professional resources
 * - Crisis situations require immediate human intervention
 */

// @desc    Send message to AI chat assistant
// @route   POST /api/v1/chat/message
// @access  Public (allows anonymous users in crisis)
const sendChatMessage = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { message, context = {}, sessionId } = req.body;
    const studentId = req.user?.id || null; // Optional auth allows anonymous users

    // Prepare context with user information and session data
    const chatContext = {
      sessionId: sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: studentId,
      timestamp: new Date().toISOString(),
      ...context
    };

    // Add user profile context if authenticated
    if (studentId) {
      try {
        const user = await User.findById(studentId).select('name collegeId role');
        if (user) {
          chatContext.userProfile = {
            name: user.name,
            role: user.role,
            collegeId: user.collegeId
          };
        }

        // Check for recent high-risk screenings to provide context
        const recentScreening = await Screening.findOne({
          userId: studentId,
          riskLevel: { $in: ['moderate', 'high'] },
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
        }).sort({ createdAt: -1 });

        if (recentScreening) {
          chatContext.recentRiskLevel = recentScreening.riskLevel;
          chatContext.hasRecentConcerns = true;
        }
      } catch (userError) {
        console.error('Error fetching user context:', userError);
        // Continue without user context - don't fail the chat
      }
    }

    // Pre-processing: Run automated safety checks
    const safetyCheck = runSafetyChecks(message);
    
    // Log the interaction for monitoring
    console.log('Chat interaction:', {
      sessionId: chatContext.sessionId,
      userId: studentId || 'anonymous',
      messageLength: message.length,
      crisisFlags: safetyCheck.crisisFlags,
      timestamp: new Date().toISOString()
    });

    // Query the LLM service
    const llmResponse = await llmService.queryLLM(message, chatContext);

    // Post-processing: Analyze and enhance the response
    const enhancedResponse = enhanceResponse(llmResponse, safetyCheck, chatContext);

    // Prepare final response
    const response = {
      success: true,
      sessionId: chatContext.sessionId,
      reply: enhancedResponse.reply,
      suggestedActions: enhancedResponse.suggestedActions,
      resources: enhancedResponse.resources,
      timestamp: new Date().toISOString()
    };

    // Add coping exercise if available
    if (llmResponse.copingExercise) {
      response.copingExercise = llmResponse.copingExercise;
    }

    // Add warning for crisis situations
    if (safetyCheck.requiresImmediateAction || llmResponse.crisisDetected) {
      response.warning = {
        level: 'critical',
        message: 'This conversation indicates you may be in crisis. Please seek immediate help.',
        actions: ['contact_emergency', 'call_crisis_line', 'reach_trusted_adult']
      };

      // Emit real-time crisis alert to counsellors and admins
      try {
        const socketService = require('../services/socket.service');
        
        // Get user information for the alert
        let userName = 'Anonymous Chat User';
        let userEmail = null;
        let collegeId = null;
        
        if (studentId) {
          const student = await User.findById(studentId).select('name email collegeId');
          if (student) {
            userName = student.name;
            userEmail = student.email;
            collegeId = student.collegeId;
          }
        }

        const alertData = {
          userId: studentId,
          userName,
          userEmail,
          collegeId,
          source: 'chat',
          message: `Crisis keywords detected in chat conversation. User may need immediate intervention.`,
          data: {
            sessionId: chatContext.sessionId,
            crisisFlags: safetyCheck.crisisFlags,
            riskLevel: safetyCheck.riskLevel,
            messageLength: message.length,
            timestamp: chatContext.timestamp
          }
        };

        socketService.emitCrisisAlert(alertData);
      } catch (socketError) {
        console.error('Failed to emit chat crisis alert via Socket.io:', socketError);
        // Don't fail the response if socket emission fails
      }
    }

    // Add metadata for debugging (development only)
    if (process.env.NODE_ENV === 'development') {
      response.debug = {
        provider: llmResponse.provider,
        model: llmResponse.model,
        confidence: llmResponse.confidence,
        safetyFlags: safetyCheck.crisisFlags,
        processingTime: Date.now() - new Date(chatContext.timestamp).getTime()
      };
    }

    res.status(200).json(response);

  } catch (error) {
    console.error('Chat message error:', error);
    
    // Provide a safe fallback response even if the service fails
    res.status(200).json({
      success: false,
      reply: "I'm sorry, I'm having trouble responding right now. This doesn't mean your feelings aren't important. Please consider reaching out to a counselor, trusted adult, or crisis line for support.",
      suggestedActions: ['seek_counseling', 'contact_crisis_line'],
      resources: {
        crisis_hotline: '988',
        crisis_text: '741741',
        emergency: '911'
      },
      error: process.env.NODE_ENV === 'development' ? error.message : 'Service temporarily unavailable',
      timestamp: new Date().toISOString()
    });
  }
};

// @desc    Get chat session history
// @route   GET /api/v1/chat/history/:sessionId
// @access  Private (user can only see their own history)
const getChatHistory = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { limit = 50 } = req.query;

    // In a production system, you'd fetch from a database
    // For now, we'll use the in-memory conversation history from LLM service
    const history = llmService.getConversationHistory(sessionId);

    // Filter and format the history
    const formattedHistory = history.slice(-limit * 2).map((message, index) => ({
      id: index,
      role: message.role,
      content: message.content,
      timestamp: new Date(Date.now() - (history.length - index) * 60000).toISOString() // Approximate timestamps
    }));

    res.status(200).json({
      success: true,
      sessionId,
      messageCount: formattedHistory.length,
      history: formattedHistory,
      disclaimer: 'This chat provides supportive guidance only. It is not a substitute for professional counseling or therapy.'
    });

  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving chat history'
    });
  }
};

// @desc    Clear chat session (for privacy)
// @route   DELETE /api/v1/chat/sessions/:sessionId
// @access  Private
const clearChatSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    
    // Clear the conversation history
    llmService.clearConversation(sessionId);

    res.status(200).json({
      success: true,
      message: 'Chat session cleared successfully',
      sessionId
    });

  } catch (error) {
    console.error('Clear chat session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error clearing chat session'
    });
  }
};

// @desc    Get chat analytics for admins
// @route   GET /api/v1/chat/analytics
// @access  Private (admin only)
const getChatAnalytics = async (req, res, next) => {
  try {
    const { period = 7 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // In a production system, you'd query a database for chat analytics
    // For now, provide placeholder analytics structure
    const analytics = {
      period: `${period} days`,
      totalConversations: 0, // Would come from database
      totalMessages: 0,
      crisisInterventions: 0,
      averageResponseTime: '2.3s',
      topConcerns: [
        { concern: 'anxiety', count: 45, percentage: 32.1 },
        { concern: 'stress', count: 38, percentage: 27.1 },
        { concern: 'depression', count: 23, percentage: 16.4 },
        { concern: 'loneliness', count: 18, percentage: 12.9 },
        { concern: 'academic_pressure', count: 16, percentage: 11.4 }
      ],
      responsePatterns: {
        averageMessageLength: 127,
        averageConversationLength: 8.5,
        peakUsageHours: ['20:00', '21:00', '22:00'], // 8-10 PM
        commonSuggestedActions: [
          'seek_counseling',
          'breathing_exercise',
          'stress_management',
          'social_connection'
        ]
      },
      safetyMetrics: {
        crisisDetectionRate: 0.023, // 2.3% of conversations
        falsePositiveRate: 0.12,
        averageEscalationTime: '45 seconds'
      }
    };

    res.status(200).json({
      success: true,
      analytics,
      generatedAt: new Date().toISOString(),
      note: 'This is a placeholder implementation. In production, data would come from conversation logs in the database.'
    });

  } catch (error) {
    console.error('Chat analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving chat analytics'
    });
  }
};

/**
 * Run automated safety checks on user input
 * @param {string} message - User's message
 * @returns {Object} Safety analysis results
 */
function runSafetyChecks(message) {
  const lowerMessage = message.toLowerCase();
  
  // Crisis keywords that trigger immediate escalation
  const crisisKeywords = [
    'kill myself', 'end my life', 'suicide', 'suicidal', 'want to die',
    'better off dead', 'no point living', 'hurt myself', 'self harm',
    'overdose', 'jump off', 'hang myself', 'cut myself', 'ending it all',
    'no way out', 'can\'t go on', 'worthless', 'hopeless'
  ];

  // High-concern keywords that need careful handling
  const concernKeywords = [
    'depressed', 'hopeless', 'worthless', 'can\'t cope', 'overwhelmed',
    'panic attack', 'can\'t breathe', 'scared', 'alone', 'isolated'
  ];

  const crisisFlags = crisisKeywords.filter(keyword => lowerMessage.includes(keyword));
  const concernFlags = concernKeywords.filter(keyword => lowerMessage.includes(keyword));

  return {
    crisisFlags,
    concernFlags,
    requiresImmediateAction: crisisFlags.length > 0,
    requiresExtraCare: concernFlags.length > 0 || crisisFlags.length > 0,
    riskLevel: crisisFlags.length > 0 ? 'high' : concernFlags.length > 0 ? 'moderate' : 'low'
  };
}

/**
 * Enhance LLM response with additional resources and actions
 * @param {Object} llmResponse - Response from LLM service
 * @param {Object} safetyCheck - Safety analysis results
 * @param {Object} context - Chat context
 * @returns {Object} Enhanced response
 */
function enhanceResponse(llmResponse, safetyCheck, context) {
  let { reply, suggestedActions = [] } = llmResponse;

  // Always ensure professional help is mentioned for concerning content
  if (safetyCheck.requiresExtraCare && !reply.toLowerCase().includes('counselor') && !reply.toLowerCase().includes('professional')) {
    reply += '\n\nI encourage you to speak with a professional counselor who can provide personalized support for what you\'re going through.';
  }

  // Crisis escalation for high-risk situations
  if (safetyCheck.requiresImmediateAction) {
    suggestedActions = ['crisis_escalation', 'emergency_contact', 'immediate_help', ...suggestedActions];
  }

  // Add context-specific actions
  if (context.hasRecentConcerns) {
    suggestedActions.push('follow_up_screening');
  }

  if (context.userProfile?.role === 'student') {
    suggestedActions.push('campus_resources');
  }

  // Prepare comprehensive resources
  const resources = {
    crisis: {
      hotline: {
        number: '988',
        description: 'Suicide & Crisis Lifeline (24/7)',
        availability: '24 hours'
      },
      text: {
        number: '741741',
        description: 'Crisis Text Line (Text HOME)',
        availability: '24 hours'
      },
      emergency: {
        number: '911',
        description: 'Emergency Services',
        availability: '24 hours'
      }
    },
    professional: {
      campus_counseling: {
        description: 'College Counseling Center',
        note: 'Free confidential counseling for students'
      },
      therapy: {
        description: 'Licensed Mental Health Professional',
        note: 'Individual or group therapy options'
      },
      psychiatry: {
        description: 'Psychiatric Services',
        note: 'For medication evaluation and management'
      }
    },
    selfCare: {
      meditation_apps: ['Headspace', 'Calm', 'Insight Timer'],
      exercise: 'Regular physical activity',
      sleep_hygiene: 'Consistent sleep schedule',
      social_connection: 'Reaching out to friends, family, or support groups'
    }
  };

  return {
    reply,
    suggestedActions: [...new Set(suggestedActions)], // Remove duplicates
    resources
  };
}

module.exports = {
  sendChatMessage,
  getChatHistory,
  clearChatSession,
  getChatAnalytics
};