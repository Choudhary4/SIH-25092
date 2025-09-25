const express = require('express');
const { query } = require('express-validator');
const {
  getAdminOverview,
  getUserAnalytics,
  getCrisisDashboard
} = require('../controllers/admin.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { createCustomRateLimit } = require('../middlewares/rateLimit');

const router = express.Router();

// Rate limiting for admin operations (higher limits for dashboard usage)
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

module.exports = router;