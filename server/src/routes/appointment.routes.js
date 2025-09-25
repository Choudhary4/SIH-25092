const express = require('express');
const { body, param, query } = require('express-validator');
const {
  createAppointment,
  getMyAppointments,
  getAppointment,
  updateAppointmentStatus,
  getCounsellorAvailability
} = require('../controllers/appointment.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Validation middleware for appointment creation
const appointmentValidation = [
  body('counsellorId')
    .isMongoId()
    .withMessage('Counsellor ID must be a valid MongoDB ObjectId'),
  body('slotStart')
    .isISO8601()
    .withMessage('Slot start time must be a valid ISO 8601 date')
    .custom((value) => {
      const date = new Date(value);
      if (date <= new Date()) {
        throw new Error('Slot start time must be in the future');
      }
      return true;
    }),
  body('slotEnd')
    .isISO8601()
    .withMessage('Slot end time must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      const startDate = new Date(req.body.slotStart);
      const endDate = new Date(value);
      
      if (endDate <= startDate) {
        throw new Error('Slot end time must be after start time');
      }
      
      const durationMinutes = (endDate - startDate) / (1000 * 60);
      if (durationMinutes < 15) {
        throw new Error('Appointment duration must be at least 15 minutes');
      }
      if (durationMinutes > 240) {
        throw new Error('Appointment duration cannot exceed 4 hours');
      }
      
      return true;
    }),
  body('mode')
    .isIn(['in-person', 'tele'])
    .withMessage('Mode must be either in-person or tele'),
  body('reason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters')
    .trim(),
  body('urgency')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Urgency must be one of: low, medium, high, urgent'),
  body('location')
    .if(body('mode').equals('in-person'))
    .notEmpty()
    .withMessage('Location is required for in-person appointments')
    .isLength({ max: 200 })
    .withMessage('Location cannot exceed 200 characters')
    .trim(),
  body('privateNotes')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Private notes cannot exceed 2000 characters')
    .trim()
];

// Validation middleware for status updates
const statusUpdateValidation = [
  param('id')
    .isMongoId()
    .withMessage('Appointment ID must be a valid MongoDB ObjectId'),
  body('status')
    .isIn(['requested', 'confirmed', 'cancelled', 'completed', 'no-show'])
    .withMessage('Invalid appointment status'),
  body('cancellationReason')
    .if(body('status').equals('cancelled'))
    .optional()
    .isLength({ max: 300 })
    .withMessage('Cancellation reason cannot exceed 300 characters')
    .trim(),
  body('location')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Location cannot exceed 200 characters')
    .trim(),
  body('meetingLink')
    .optional()
    .isURL()
    .withMessage('Meeting link must be a valid URL'),
  body('meetingId')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Meeting ID cannot exceed 100 characters')
    .trim()
];

// Validation middleware for counsellor availability
const availabilityValidation = [
  param('counsellorId')
    .isMongoId()
    .withMessage('Counsellor ID must be a valid MongoDB ObjectId'),
  query('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (req.query.startDate && value) {
        const startDate = new Date(req.query.startDate);
        const endDate = new Date(value);
        if (endDate <= startDate) {
          throw new Error('End date must be after start date');
        }
      }
      return true;
    })
];

// Routes

// Create new appointment (students only, but allow counsellors for admin purposes)
router.post('/', protect, appointmentValidation, createAppointment);

// Get user's appointments (students see their bookings, counsellors see their schedule)
router.get('/me', protect, getMyAppointments);

// Get counsellor availability (public access for booking interface)
router.get('/counsellor/:counsellorId/availability', protect, availabilityValidation, getCounsellorAvailability);

// Get specific appointment by ID
router.get('/:id', protect, [
  param('id').isMongoId().withMessage('Appointment ID must be a valid MongoDB ObjectId')
], getAppointment);

// Update appointment status (counsellors, admins, and students for cancellation)
router.patch('/:id/status', protect, statusUpdateValidation, updateAppointmentStatus);

// Admin/Counsellor routes for appointment management

// Get all appointments (admin/counsellor only)
router.get('/admin/all', protect, authorize('admin', 'counsellor'), async (req, res) => {
  try {
    const Appointment = require('../models/appointment.model');
    const { status, date, counsellorId, studentId, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    // Filter by status
    if (status && ['requested', 'confirmed', 'cancelled', 'completed', 'no-show'].includes(status)) {
      query.status = status;
    }
    
    // Filter by date
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.slotStart = { $gte: startDate, $lt: endDate };
    }
    
    // Filter by counsellor
    if (counsellorId) {
      query.counsellorId = counsellorId;
    }
    
    // Filter by student
    if (studentId) {
      query.studentId = studentId;
    }
    
    // If user is counsellor (not admin), only show their appointments
    if (req.user.role === 'counsellor') {
      query.counsellorId = req.user.id;
    }
    
    const appointments = await Appointment.find(query)
      .populate('studentId', 'name email collegeId')
      .populate('counsellorId', 'name email')
      .populate('cancelledBy', 'name email')
      .sort({ slotStart: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
      
    const total = await Appointment.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: appointments.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      appointments
    });
    
  } catch (error) {
    console.error('Get all appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving appointments'
    });
  }
});

// Get appointment statistics (admin/counsellor only)
router.get('/admin/stats', protect, authorize('admin', 'counsellor'), async (req, res) => {
  try {
    const Appointment = require('../models/appointment.model');
    const { startDate, endDate } = req.query;
    
    let matchQuery = {};
    
    // Date range filter
    if (startDate || endDate) {
      matchQuery.slotStart = {};
      if (startDate) matchQuery.slotStart.$gte = new Date(startDate);
      if (endDate) matchQuery.slotStart.$lte = new Date(endDate);
    }
    
    // If user is counsellor (not admin), only show their stats
    if (req.user.role === 'counsellor') {
      matchQuery.counsellorId = req.user.id;
    }
    
    const stats = await Appointment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          appointments: { $push: '$$ROOT' }
        }
      },
      {
        $group: {
          _id: null,
          totalAppointments: { $sum: '$count' },
          statusBreakdown: {
            $push: {
              status: '$_id',
              count: '$count'
            }
          }
        }
      }
    ]);
    
    // Calculate mode breakdown
    const modeStats = await Appointment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$mode',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Calculate urgency breakdown
    const urgencyStats = await Appointment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$urgency',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      statistics: {
        total: stats[0]?.totalAppointments || 0,
        statusBreakdown: stats[0]?.statusBreakdown || [],
        modeBreakdown: modeStats,
        urgencyBreakdown: urgencyStats
      }
    });
    
  } catch (error) {
    console.error('Get appointment statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving appointment statistics'
    });
  }
});

// Bulk update appointments (admin only)
router.patch('/admin/bulk-update', protect, authorize('admin'), [
  body('appointmentIds')
    .isArray({ min: 1 })
    .withMessage('Appointment IDs must be a non-empty array'),
  body('appointmentIds.*')
    .isMongoId()
    .withMessage('Each appointment ID must be a valid MongoDB ObjectId'),
  body('action')
    .isIn(['confirm', 'cancel', 'complete'])
    .withMessage('Action must be one of: confirm, cancel, complete'),
  body('reason')
    .optional()
    .isLength({ max: 300 })
    .withMessage('Reason cannot exceed 300 characters')
], async (req, res) => {
  try {
    const { appointmentIds, action, reason } = req.body;
    const Appointment = require('../models/appointment.model');
    
    const appointments = await Appointment.find({
      _id: { $in: appointmentIds }
    });
    
    if (appointments.length !== appointmentIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some appointment IDs were not found'
      });
    }
    
    const results = [];
    
    for (const appointment of appointments) {
      try {
        switch (action) {
          case 'confirm':
            await appointment.confirm(req.user.id);
            break;
          case 'cancel':
            await appointment.cancel(req.user.id, reason);
            break;
          case 'complete':
            await appointment.complete();
            break;
        }
        results.push({ id: appointment._id, success: true });
      } catch (error) {
        results.push({ id: appointment._id, success: false, error: error.message });
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Bulk ${action} operation completed`,
      results
    });
    
  } catch (error) {
    console.error('Bulk update appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during bulk update'
    });
  }
});

module.exports = router;