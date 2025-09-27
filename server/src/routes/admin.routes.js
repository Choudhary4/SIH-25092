const express = require('express');
const { query, body } = require('express-validator');
const {
  getAdminOverview,
  getUserAnalytics,
  getCrisisDashboard,
  createCounsellor,
  getCounsellors,
  getCounsellor,
  updateCounsellor,
  toggleCounsellorStatus,
  deleteCounsellor,
  resetCounsellorPassword
} = require('../controllers/admin.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { createCustomRateLimit, sensitiveRateLimit } = require('../middlewares/rateLimit');

const router = express.Router();

// Rate limiting strategy:
// - adminRateLimit: 500 requests per 15 minutes for most admin operations (create, read, update)
// - sensitiveRateLimit: 10 requests per hour for sensitive operations (delete, reset password, toggle status)
// - analyticsRateLimit: 100 requests per 5 minutes for dashboard analytics
const adminRateLimit = createCustomRateLimit(500, 15 * 60 * 1000); // 500 requests per 15 minutes for admins
const analyticsRateLimit = createCustomRateLimit(100, 5 * 60 * 1000); // 100 analytics requests per 5 minutes

// Middleware to protect all admin routes
router.use(protect);
router.use(authorize('admin')); // Only admins can access these routes

// @route   GET /api/v1/admin/overview
// @desc    Get comprehensive admin dashboard overview
// @access  Private (admin only)
router.get(
  '/overview',
  adminRateLimit,
  getAdminOverview
);

// @route   GET /api/v1/admin/users/analytics
// @desc    Get detailed user analytics and trends
// @access  Private (admin only)
router.get(
  '/users/analytics',
  analyticsRateLimit,
  [
    query('period')
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage('Period must be between 1 and 365 days')
  ],
  getUserAnalytics
);

// @route   GET /api/v1/admin/crisis/dashboard
// @desc    Get crisis management dashboard with active alerts
// @access  Private (admin only)
router.get(
  '/crisis/dashboard',
  adminRateLimit,
  getCrisisDashboard
);

// @route   GET /api/v1/admin/system/health
// @desc    Get system health metrics and status
// @access  Private (admin only)
router.get(
  '/system/health',
  adminRateLimit,
  async (req, res) => {
    try {
      const mongoose = require('mongoose');
      
      // Check database connection
      const dbStatus = mongoose.connection.readyState;
      const dbStatusMap = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      };

      // Get system metrics
      const systemMetrics = {
        database: {
          status: dbStatusMap[dbStatus] || 'unknown',
          connected: dbStatus === 1,
          host: mongoose.connection.host,
          name: mongoose.connection.name
        },
        server: {
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          nodeVersion: process.version,
          platform: process.platform,
          environment: process.env.NODE_ENV || 'development'
        },
        timestamp: new Date().toISOString()
      };

      // Check collection health
      const collections = await Promise.all([
        mongoose.connection.db.collection('users').countDocuments(),
        mongoose.connection.db.collection('screenings').countDocuments(),
        mongoose.connection.db.collection('appointments').countDocuments(),
        mongoose.connection.db.collection('forumposts').countDocuments()
      ]);

      systemMetrics.collections = {
        users: collections[0],
        screenings: collections[1],
        appointments: collections[2],
        forumPosts: collections[3]
      };

      res.status(200).json({
        success: true,
        healthy: dbStatus === 1,
        data: systemMetrics
      });

    } catch (error) {
      console.error('System health check error:', error);
      res.status(500).json({
        success: false,
        healthy: false,
        message: 'System health check failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// @route   GET /api/v1/admin/reports/export
// @desc    Export admin reports in various formats
// @access  Private (admin only)
router.get(
  '/reports/export',
  analyticsRateLimit,
  [
    query('type')
      .isIn(['screenings', 'appointments', 'forum', 'users', 'crisis'])
      .withMessage('Report type must be screenings, appointments, forum, users, or crisis'),
    query('format')
      .optional()
      .isIn(['json', 'csv'])
      .withMessage('Format must be json or csv'),
    query('period')
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage('Period must be between 1 and 365 days'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO 8601 date')
  ],
  async (req, res) => {
    try {
      const { type, format = 'json', period = 30, startDate, endDate } = req.query;
      
      // Calculate date range
      let dateFilter = {};
      if (startDate && endDate) {
        dateFilter = {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        };
      } else {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(period));
        dateFilter = { createdAt: { $gte: daysAgo } };
      }

      let data = [];
      let filename = '';

      switch (type) {
        case 'screenings':
          data = await require('../models/screening.model').find(dateFilter)
            .populate('userId', 'name email collegeId')
            .select('-responses') // Exclude sensitive response data
            .lean();
          filename = `screenings_report_${new Date().toISOString().split('T')[0]}`;
          break;

        case 'appointments':
          data = await require('../models/appointment.model').find(dateFilter)
            .populate('studentId', 'name email collegeId')
            .populate('counsellorId', 'name email')
            .select('-encryptedNotes') // Exclude encrypted notes
            .lean();
          filename = `appointments_report_${new Date().toISOString().split('T')[0]}`;
          break;

        case 'forum':
          data = await require('../models/forum.model').find(dateFilter)
            .populate('studentId', 'name collegeId')
            .select('-body -flaggedWords -likedBy -reportedBy') // Exclude sensitive content
            .lean();
          filename = `forum_report_${new Date().toISOString().split('T')[0]}`;
          break;

        case 'users':
          data = await require('../models/user.model').find(dateFilter)
            .select('-password -refreshTokens') // Exclude sensitive data
            .lean();
          filename = `users_report_${new Date().toISOString().split('T')[0]}`;
          break;

        case 'crisis':
          const [crisisScreenings, crisisForumPosts] = await Promise.all([
            require('../models/screening.model').find({
              ...dateFilter,
              riskLevel: 'high',
              isCrisisAlert: true
            })
            .populate('userId', 'name email collegeId')
            .select('-responses')
            .lean(),
            
            require('../models/forum.model').find({
              ...dateFilter,
              'contentFlags.selfHarm': true
            })
            .populate('studentId', 'name collegeId')
            .select('-body -flaggedWords')
            .lean()
          ]);
          
          data = {
            crisisScreenings,
            crisisForumPosts,
            summary: {
              totalCrisisScreenings: crisisScreenings.length,
              totalCrisisForumPosts: crisisForumPosts.length,
              totalCrisisAlerts: crisisScreenings.length + crisisForumPosts.length
            }
          };
          filename = `crisis_report_${new Date().toISOString().split('T')[0]}`;
          break;

        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid report type'
          });
      }

      // Set appropriate headers for download
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
        
        // For CSV, we'd need to implement CSV conversion
        // For now, return JSON with CSV headers
        res.status(501).json({
          success: false,
          message: 'CSV export not yet implemented. Please use JSON format.'
        });
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
        
        res.status(200).json({
          success: true,
          reportType: type,
          period: period,
          dateRange: dateFilter,
          recordCount: Array.isArray(data) ? data.length : (data.summary?.totalCrisisAlerts || 0),
          generatedAt: new Date().toISOString(),
          data
        });
      }

    } catch (error) {
      console.error('Export report error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error exporting report'
      });
    }
  }
);

// @route   GET /api/v1/admin/config
// @desc    Get system configuration and settings
// @access  Private (admin only)
router.get(
  '/config',
  adminRateLimit,
  async (req, res) => {
    try {
      const config = {
        features: {
          screeningEnabled: true,
          appointmentBookingEnabled: true,
          forumEnabled: true,
          anonymousPostingEnabled: true,
          contentModerationEnabled: true,
          crisisDetectionEnabled: true
        },
        limits: {
          maxPostLength: 5000,
          maxTitleLength: 200,
          maxTagsPerPost: 5,
          rateLimitRequests: 100,
          rateLimitWindow: 15 * 60 * 1000 // 15 minutes
        },
        contentFiltering: {
          selfHarmDetectionEnabled: true,
          profanityFilterEnabled: true,
          violenceDetectionEnabled: true,
          spamDetectionEnabled: true
        },
        crisis: {
          phq9HighRiskThreshold: 15,
          gad7HighRiskThreshold: 15,
          autoFlagSelfHarmContent: true,
          crisisHotline: '988',
          crisisTextLine: '741741'
        },
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        lastUpdated: new Date().toISOString()
      };

      res.status(200).json({
        success: true,
        config
      });

    } catch (error) {
      console.error('Get config error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error retrieving configuration'
      });
    }
  }
);

// Counsellor management routes
// @route   POST /api/v1/admin/counsellors
// @desc    Create new counsellor account
// @access  Private (admin only)
router.post(
  '/counsellors',
  adminRateLimit,
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('department')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Department must not exceed 100 characters'),
    body('specialization')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Specialization must not exceed 200 characters'),
    body('experience')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Experience must be a positive number'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ],
  createCounsellor
);

// @route   GET /api/v1/admin/counsellors
// @desc    Get all counsellors for admin management
// @access  Private (admin only)
router.get(
  '/counsellors',
  adminRateLimit,
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('status')
      .optional()
      .isIn(['active', 'inactive'])
      .withMessage('Status must be active or inactive'),
    query('department')
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage('Department filter cannot be empty'),
    query('search')
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage('Search query must not be empty')
  ],
  getCounsellors
);

// @route   GET /api/v1/admin/counsellors/:id
// @desc    Get single counsellor details
// @access  Private (admin only)
router.get(
  '/counsellors/:id',
  adminRateLimit,
  getCounsellor
);

// @route   PUT /api/v1/admin/counsellors/:id
// @desc    Update counsellor details and availability
// @access  Private (admin only)
router.put(
  '/counsellors/:id',
  adminRateLimit,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('department')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Department must not exceed 100 characters'),
    body('specialization')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Specialization must not exceed 200 characters'),
    body('experience')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Experience must be a positive number'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean value')
  ],
  updateCounsellor
);

// @route   PATCH /api/v1/admin/counsellors/:id/status
// @desc    Activate/Deactivate counsellor
// @access  Private (admin only)
router.patch(
  '/counsellors/:id/status',
  sensitiveRateLimit, // Use sensitive rate limit for status changes
  [
    body('isActive')
      .isBoolean()
      .withMessage('isActive must be a boolean value')
  ],
  toggleCounsellorStatus
);

// @route   DELETE /api/v1/admin/counsellors/:id
// @desc    Delete counsellor (soft delete)
// @access  Private (admin only)
router.delete(
  '/counsellors/:id',
  sensitiveRateLimit, // Use sensitive rate limit for delete operations
  deleteCounsellor
);

// @route   POST /api/v1/admin/counsellors/:id/reset-password
// @desc    Reset counsellor password
// @access  Private (admin only)
router.post(
  '/counsellors/:id/reset-password',
  sensitiveRateLimit, // Use sensitive rate limit for password reset operations
  [
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long')
  ],
  resetCounsellorPassword
);

module.exports = router;