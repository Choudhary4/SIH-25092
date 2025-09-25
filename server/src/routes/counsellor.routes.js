const express = require('express');
const { query } = require('express-validator');
const User = require('../models/user.model');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// @desc    Get all available counsellors
// @route   GET /api/v1/counsellors
// @access  Private
const getCounsellors = async (req, res) => {
  try {
    const { specialization, available, page = 1, limit = 20 } = req.query;
    
    // Build query for counsellors
    let query = {
      role: 'counsellor',
      isActive: true
    };
    
    // Filter by specialization if provided
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }
    
    const counsellors = await User.find(query)
      .select('name email specialization profileImage rating experience languagePref createdAt')
      .sort({ rating: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await User.countDocuments(query);
    
    // Format counsellors for frontend
    const formattedCounsellors = counsellors.map(counsellor => ({
      id: counsellor._id,
      name: counsellor.name,
      email: counsellor.email,
      specialization: counsellor.specialization || 'General Counselling',
      profileImage: counsellor.profileImage,
      rating: counsellor.rating || 4.5,
      experience: counsellor.experience || 2,
      languages: counsellor.languagePref || 'en'
    }));

    res.json({
      success: true,
      count: formattedCounsellors.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      data: formattedCounsellors
    });

  } catch (error) {
    console.error('Get counsellors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving counsellors'
    });
  }
};

// @desc    Get counsellor by ID with availability
// @route   GET /api/v1/counsellors/:id
// @access  Private
const getCounsellorById = async (req, res) => {
  try {
    const counsellor = await User.findById(req.params.id)
      .select('name email specialization profileImage rating experience languagePref');
    
    if (!counsellor || counsellor.role !== 'counsellor' || !counsellor.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Counsellor not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: counsellor._id,
        name: counsellor.name,
        email: counsellor.email,
        specialization: counsellor.specialization || 'General Counselling',
        profileImage: counsellor.profileImage,
        rating: counsellor.rating || 4.5,
        experience: counsellor.experience || 2,
        languages: counsellor.languagePref || 'en'
      }
    });

  } catch (error) {
    console.error('Get counsellor by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving counsellor'
    });
  }
};

// @desc    Get counsellor's available time slots
// @route   GET /api/v1/counsellors/:id/slots
// @access  Private
const getCounsellorSlots = async (req, res) => {
  try {
    const counsellorId = req.params.id;
    const { date, days = 7 } = req.query;
    
    // Verify counsellor exists
    const counsellor = await User.findById(counsellorId);
    if (!counsellor || counsellor.role !== 'counsellor' || !counsellor.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Counsellor not found'
      });
    }

    // Get date range
    let startDate, endDate;
    if (date) {
      startDate = new Date(date);
      endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
    } else {
      startDate = new Date();
      endDate = new Date();
      endDate.setDate(endDate.getDate() + parseInt(days));
    }

    // Get existing appointments
    const Appointment = require('../models/appointment.model');
    const bookedSlots = await Appointment.find({
      counsellorId,
      slotStart: { $gte: startDate, $lt: endDate },
      status: { $in: ['requested', 'confirmed'] }
    }).select('slotStart slotEnd');

    // Generate available slots (this is a simplified version)
    // In a real application, you would have a more sophisticated scheduling system
    const availableSlots = [];
    const workingHours = {
      start: 9, // 9 AM
      end: 17,  // 5 PM
      slotDuration: 60 // 60 minutes
    };

    const currentDate = new Date(startDate);
    while (currentDate < endDate) {
      // Skip weekends for this example
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        for (let hour = workingHours.start; hour < workingHours.end; hour++) {
          const slotStart = new Date(currentDate);
          slotStart.setHours(hour, 0, 0, 0);
          
          const slotEnd = new Date(slotStart);
          slotEnd.setMinutes(slotEnd.getMinutes() + workingHours.slotDuration);

          // Skip past slots
          if (slotStart <= new Date()) continue;

          // Check if slot is not booked
          const isBooked = bookedSlots.some(booked => 
            (slotStart >= booked.slotStart && slotStart < booked.slotEnd) ||
            (slotEnd > booked.slotStart && slotEnd <= booked.slotEnd)
          );

          if (!isBooked) {
            availableSlots.push({
              id: `${counsellorId}_${slotStart.getTime()}`,
              startTime: slotStart,
              endTime: slotEnd,
              duration: workingHours.slotDuration,
              type: 'consultation'
            });
          }
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json({
      success: true,
      counsellorId,
      dateRange: { start: startDate, end: endDate },
      data: availableSlots
    });

  } catch (error) {
    console.error('Get counsellor slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving available slots'
    });
  }
};

// Apply validation middleware
const counsellorValidation = [
  query('specialization')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Specialization must be between 2 and 100 characters'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Routes
router.get('/', protect, counsellorValidation, getCounsellors);
router.get('/:id', protect, getCounsellorById);
router.get('/:id/slots', protect, getCounsellorSlots);

module.exports = router;