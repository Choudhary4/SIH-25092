const express = require('express');
const { body } = require('express-validator');
const {
  createScreening,
  getScreening,
  getMyScreenings
} = require('../controllers/screening.controller');
const { protect, optionalAuth, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Validation middleware for screening creation
const screeningValidation = [
  body('tool')
    .isIn(['PHQ-9', 'GAD-7'])
    .withMessage('Tool must be either PHQ-9 or GAD-7'),
  body('responses')
    .isArray({ min: 7, max: 9 })
    .withMessage('Responses must be an array with 7-9 elements')
    .custom((value, { req }) => {
      const expectedLength = req.body.tool === 'PHQ-9' ? 9 : 7;
      if (value.length !== expectedLength) {
        throw new Error(`${req.body.tool} requires exactly ${expectedLength} responses`);
      }
      
      // Validate each response is an integer between 0-3
      const invalidResponses = value.filter(r => 
        !Number.isInteger(r) || r < 0 || r > 3
      );
      
      if (invalidResponses.length > 0) {
        throw new Error('All responses must be integers between 0 and 3');
      }
      
      return true;
    }),
  body('studentId')
    .optional()
    .isMongoId()
    .withMessage('Student ID must be a valid MongoDB ObjectId'),
  body('consentToShare')
    .optional()
    .isBoolean()
    .withMessage('Consent to share must be a boolean'),
  body('sessionId')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Session ID must be 1-100 characters long')
];

// Public routes (allow anonymous screenings)
router.post('/', optionalAuth, screeningValidation, createScreening);

// Protected routes (require authentication)
router.get('/my-history', protect, getMyScreenings);
router.get('/:id', protect, getScreening);

// Admin/Counselor routes (require elevated permissions)
// These routes would be used by counselors to review screenings
router.get('/high-risk', protect, authorize('counsellor', 'admin', 'moderator'), async (req, res) => {
  try {
    const Screening = require('../models/screening.model');
    const { limit = 50 } = req.query;
    
    const highRiskScreenings = await Screening.findHighRiskScreenings(parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: highRiskScreenings.length,
      screenings: highRiskScreenings
    });
  } catch (error) {
    console.error('Get high-risk screenings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving high-risk screenings'
    });
  }
});

// Get screening statistics (for dashboard)
router.get('/stats/overview', protect, authorize('counsellor', 'admin', 'moderator'), async (req, res) => {
  try {
    const Screening = require('../models/screening.model');
    const { startDate, endDate } = req.query;
    
    const dateRange = {};
    if (startDate) dateRange.start = startDate;
    if (endDate) dateRange.end = endDate;
    
    const statistics = await Screening.getStatistics(dateRange);
    
    res.status(200).json({
      success: true,
      statistics
    });
  } catch (error) {
    console.error('Get screening statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving screening statistics'
    });
  }
});

// Mark screening as reviewed by counselor
router.put('/:id/review', protect, authorize('counsellor', 'admin', 'moderator'), [
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
], async (req, res) => {
  try {
    const Screening = require('../models/screening.model');
    const { notes } = req.body;
    
    const screening = await Screening.findById(req.params.id);
    if (!screening) {
      return res.status(404).json({
        success: false,
        message: 'Screening not found'
      });
    }
    
    await screening.markAsReviewed(req.user.id, notes);
    
    res.status(200).json({
      success: true,
      message: 'Screening marked as reviewed',
      screening
    });
  } catch (error) {
    console.error('Mark screening as reviewed error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error marking screening as reviewed'
    });
  }
});

module.exports = router;