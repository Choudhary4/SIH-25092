const express = require('express');
const { body, query, param } = require('express-validator');
const {
  sendChatMessage,
  getChatHistory,
  clearChatSession,
  getChatAnalytics
} = require('../controllers/chat.controller');
const { protect, optionalAuth, authorize } = require('../middlewares/auth.middleware');
const { createCustomRateLimit } = require('../middlewares/rateLimit');

const router = express.Router();

// Specialized rate limiting for chat operations
const chatRateLimit = createCustomRateLimit(30, 10 * 60 * 1000); // 30 messages per 10 minutes (prevents spam/abuse)
const historyRateLimit = createCustomRateLimit(20, 5 * 60 * 1000); // 20 history requests per 5 minutes
const analyticsRateLimit = createCustomRateLimit(10, 15 * 60 * 1000); // 10 analytics requests per 15 minutes

// @route   POST /api/v1/chat/message
// @desc    Send message to AI mental health support assistant
// @access  Public (allows anonymous users in crisis, optional auth for personalization)
router.post(
  '/message',
  chatRateLimit,
  optionalAuth, // Allows both authenticated and anonymous users
  [
    body('message')
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Message must be between 1 and 2000 characters')
      .matches(/^[\s\S]*$/) // Allow all characters including newlines, emojis, etc.
      .withMessage('Message contains invalid characters'),
    body('context')
      .optional()
      .isObject()
      .withMessage('Context must be an object'),
    body('context.sessionId')
      .optional()
      .isLength({ min: 10, max: 100 })
      .withMessage('Session ID must be between 10 and 100 characters')
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Session ID can only contain letters, numbers, hyphens, and underscores'),
    body('context.previousConcerns')
      .optional()
      .isArray({ max: 5 })
      .withMessage('Previous concerns must be an array with maximum 5 items'),
    body('context.urgency')
      .optional()
      .isIn(['low', 'moderate', 'high', 'crisis'])
      .withMessage('Urgency must be low, moderate, high, or crisis'),
    body('sessionId')
      .optional()
      .isLength({ min: 10, max: 100 })
      .withMessage('Session ID must be between 10 and 100 characters')
  ],
  sendChatMessage
);

// @route   GET /api/v1/chat/history/:sessionId
// @desc    Get chat conversation history for a session
// @access  Private (users can only access their own sessions)
router.get(
  '/history/:sessionId',
  historyRateLimit,
  protect, // Require authentication for history access
  [
    param('sessionId')
      .isLength({ min: 10, max: 100 })
      .withMessage('Session ID must be between 10 and 100 characters')
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Session ID can only contain letters, numbers, hyphens, and underscores'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],
  getChatHistory
);

// @route   DELETE /api/v1/chat/sessions/:sessionId
// @desc    Clear/delete a chat session for privacy
// @access  Private (users can only clear their own sessions)
router.delete(
  '/sessions/:sessionId',
  historyRateLimit,
  protect,
  [
    param('sessionId')
      .isLength({ min: 10, max: 100 })
      .withMessage('Session ID must be between 10 and 100 characters')
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Session ID can only contain letters, numbers, hyphens, and underscores')
  ],
  clearChatSession
);

// @route   GET /api/v1/chat/analytics
// @desc    Get chat system analytics and metrics (admin only)
// @access  Private (admin only)
router.get(
  '/analytics',
  analyticsRateLimit,
  protect,
  authorize('admin'),
  [
    query('period')
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage('Period must be between 1 and 365 days'),
    query('includeDetails')
      .optional()
      .isBoolean()
      .withMessage('Include details must be a boolean')
  ],
  getChatAnalytics
);

// @route   GET /api/v1/chat/resources
// @desc    Get mental health resources and crisis contacts
// @access  Public
router.get(
  '/resources',
  historyRateLimit,
  async (req, res) => {
    try {
      const resources = {
        crisis: {
          immediate: [
            {
              name: 'National Suicide Prevention Lifeline',
              number: '988',
              description: '24/7 crisis support for people in suicidal crisis or emotional distress',
              availability: '24 hours',
              languages: ['English', 'Spanish'],
              type: 'phone'
            },
            {
              name: 'Crisis Text Line',
              number: '741741',
              description: 'Text HOME for 24/7 crisis support via text message',
              availability: '24 hours',
              instruction: 'Text HOME to 741741',
              type: 'text'
            },
            {
              name: 'Emergency Services',
              number: '911',
              description: 'For immediate life-threatening emergencies',
              availability: '24 hours',
              type: 'emergency'
            }
          ]
        },
        professional: {
          counseling: [
            {
              name: 'Campus Counseling Center',
              description: 'Free, confidential counseling services for students',
              note: 'Usually available at most colleges and universities',
              cost: 'Free for students'
            },
            {
              name: 'Psychology Today Therapist Finder',
              url: 'https://www.psychologytoday.com/us/therapists',
              description: 'Find licensed mental health professionals in your area',
              filters: ['Insurance', 'Specialty', 'Location', 'Cost']
            },
            {
              name: 'Community Mental Health Centers',
              description: 'Sliding-scale fee mental health services',
              note: 'Available in most communities, income-based pricing'
            }
          ]
        },
        selfCare: {
          apps: [
            {
              name: 'Headspace',
              description: 'Meditation and mindfulness app',
              type: 'meditation',
              cost: 'Freemium'
            },
            {
              name: 'Calm',
              description: 'Sleep stories, meditation, and relaxation',
              type: 'relaxation',
              cost: 'Freemium'
            },
            {
              name: 'Sanvello',
              description: 'Anxiety and depression tracking and coping',
              type: 'mental_health',
              cost: 'Freemium'
            }
          ],
          techniques: [
            {
              name: 'Deep Breathing',
              description: '4-7-8 breathing technique for anxiety relief',
              duration: '2-5 minutes'
            },
            {
              name: 'Grounding (5-4-3-2-1)',
              description: 'Use your senses to ground yourself in the present',
              duration: '3-5 minutes'
            },
            {
              name: 'Progressive Muscle Relaxation',
              description: 'Tense and relax muscle groups to reduce physical tension',
              duration: '10-20 minutes'
            }
          ]
        },
        educational: {
          websites: [
            {
              name: 'National Institute of Mental Health (NIMH)',
              url: 'https://www.nimh.nih.gov',
              description: 'Authoritative information about mental health conditions'
            },
            {
              name: 'Mental Health America',
              url: 'https://www.mhanational.org',
              description: 'Resources, screening tools, and advocacy information'
            },
            {
              name: 'NAMI (National Alliance on Mental Illness)',
              url: 'https://www.nami.org',
              description: 'Support groups, education, and advocacy'
            }
          ]
        },
        student_specific: {
          academic: [
            {
              name: 'Academic Accommodations Office',
              description: 'Support for students with mental health conditions affecting academics',
              note: 'Available at most colleges under different names (Disability Services, Student Success, etc.)'
            },
            {
              name: 'Student Health Services',
              description: 'On-campus medical and mental health services',
              note: 'Often includes counseling, psychiatry, and crisis intervention'
            }
          ],
          financial: [
            {
              name: 'Financial Aid Office',
              description: 'Help with financial stress affecting mental health',
              note: 'May offer emergency funds or payment plan options'
            },
            {
              name: 'Food Pantries',
              description: 'On-campus food assistance programs',
              note: 'Basic needs support can improve mental health'
            }
          ]
        }
      };

      res.status(200).json({
        success: true,
        resources,
        disclaimer: 'This information is for educational purposes only and does not replace professional medical advice. In a crisis, please contact emergency services or a crisis hotline immediately.',
        lastUpdated: new Date().toISOString()
      });

    } catch (error) {
      console.error('Get resources error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error retrieving resources'
      });
    }
  }
);

// @route   GET /api/v1/chat/coping-exercises
// @desc    Get structured coping exercises and techniques
// @access  Public
router.get(
  '/coping-exercises',
  historyRateLimit,
  [
    query('type')
      .optional()
      .isIn(['breathing', 'grounding', 'mindfulness', 'relaxation', 'cognitive'])
      .withMessage('Type must be breathing, grounding, mindfulness, relaxation, or cognitive'),
    query('duration')
      .optional()
      .isIn(['short', 'medium', 'long']) // short: <5min, medium: 5-15min, long: >15min
      .withMessage('Duration must be short, medium, or long')
  ],
  async (req, res) => {
    try {
      const { type, duration } = req.query;

      const exercises = {
        breathing: [
          {
            name: '4-7-8 Breathing',
            duration: 'short',
            description: 'Inhale for 4, hold for 7, exhale for 8',
            steps: [
              'Sit comfortably with your back straight',
              'Place your tongue against the ridge behind your upper teeth',
              'Exhale completely through your mouth',
              'Close your mouth and inhale through your nose for 4 counts',
              'Hold your breath for 7 counts',
              'Exhale through your mouth for 8 counts',
              'Repeat 3-4 cycles'
            ],
            benefits: ['Reduces anxiety', 'Promotes relaxation', 'Helps with sleep']
          },
          {
            name: 'Box Breathing',
            duration: 'short',
            description: 'Equal counts for inhale, hold, exhale, hold',
            steps: [
              'Sit comfortably and close your eyes',
              'Inhale through your nose for 4 counts',
              'Hold your breath for 4 counts',
              'Exhale through your mouth for 4 counts',
              'Hold empty for 4 counts',
              'Repeat for 5-10 cycles'
            ],
            benefits: ['Improves focus', 'Reduces stress', 'Balances nervous system']
          }
        ],
        grounding: [
          {
            name: '5-4-3-2-1 Technique',
            duration: 'short',
            description: 'Use your five senses to ground yourself in the present',
            steps: [
              'Notice 5 things you can see around you',
              'Notice 4 things you can touch',
              'Notice 3 things you can hear',
              'Notice 2 things you can smell',
              'Notice 1 thing you can taste'
            ],
            benefits: ['Reduces anxiety', 'Stops panic attacks', 'Brings awareness to present']
          },
          {
            name: 'Physical Grounding',
            duration: 'short',
            description: 'Use physical sensations to anchor yourself',
            steps: [
              'Feel your feet on the ground',
              'Press your hands together firmly',
              'Hold an ice cube or cold object',
              'Stretch your arms above your head',
              'Notice the physical sensations'
            ],
            benefits: ['Immediate grounding', 'Interrupts dissociation', 'Quick relief']
          }
        ],
        mindfulness: [
          {
            name: 'Body Scan Meditation',
            duration: 'medium',
            description: 'Progressive awareness of body sensations',
            steps: [
              'Lie down comfortably',
              'Close your eyes and take deep breaths',
              'Start with your toes, notice any sensations',
              'Slowly move attention up through your body',
              'Notice each part without judgment',
              'Spend 15-20 minutes completing the scan'
            ],
            benefits: ['Reduces tension', 'Increases body awareness', 'Promotes relaxation']
          },
          {
            name: 'Mindful Walking',
            duration: 'medium',
            description: 'Focused attention on the act of walking',
            steps: [
              'Walk at a slower pace than usual',
              'Feel your feet making contact with the ground',
              'Notice the movement of your legs',
              'Pay attention to your breathing',
              'When your mind wanders, gently return to walking',
              'Continue for 10-15 minutes'
            ],
            benefits: ['Combines movement with mindfulness', 'Good for restlessness', 'Accessible anywhere']
          }
        ],
        relaxation: [
          {
            name: 'Progressive Muscle Relaxation',
            duration: 'long',
            description: 'Systematically tense and relax muscle groups',
            steps: [
              'Start with your toes, tense for 5-10 seconds',
              'Release and notice the relaxation',
              'Move to your calves, then thighs',
              'Continue up through your body: abdomen, arms, shoulders, face',
              'Hold each tension for 5-10 seconds',
              'Spend 15-30 seconds noticing the relaxation',
              'Complete the entire body over 15-20 minutes'
            ],
            benefits: ['Reduces physical tension', 'Improves sleep', 'Teaches relaxation response']
          }
        ],
        cognitive: [
          {
            name: 'Thought Challenging',
            duration: 'medium',
            description: 'Examine and reframe negative thoughts',
            steps: [
              'Identify the negative thought',
              'Ask: Is this thought realistic?',
              'Ask: What evidence supports or contradicts this?',
              'Ask: What would I tell a friend in this situation?',
              'Create a more balanced, helpful thought',
              'Practice the new thought'
            ],
            benefits: ['Reduces negative thinking', 'Improves mood', 'Builds coping skills']
          }
        ]
      };

      // Filter by type if specified
      let filteredExercises = exercises;
      if (type) {
        filteredExercises = { [type]: exercises[type] || [] };
      }

      // Filter by duration if specified
      if (duration) {
        Object.keys(filteredExercises).forEach(key => {
          filteredExercises[key] = filteredExercises[key].filter(exercise => 
            exercise.duration === duration
          );
        });
      }

      res.status(200).json({
        success: true,
        exercises: filteredExercises,
        filters: { type, duration },
        note: 'These exercises are complementary to professional treatment and should not replace therapy or medical care.',
        lastUpdated: new Date().toISOString()
      });

    } catch (error) {
      console.error('Get coping exercises error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error retrieving coping exercises'
      });
    }
  }
);

module.exports = router;