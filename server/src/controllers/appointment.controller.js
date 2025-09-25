const { validationResult } = require('express-validator');
const Appointment = require('../models/appointment.model');
const User = require('../models/user.model');

// @desc    Create new appointment booking
// @route   POST /api/v1/appointments
// @access  Private (students and counsellors)
const createAppointment = async (req, res, next) => {
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

    const {
      counsellorId,
      slotStart,
      slotEnd,
      mode,
      reason,
      urgency,
      location,
      privateNotes
    } = req.body;

    // Convert string dates to Date objects
    const startDate = new Date(slotStart);
    const endDate = new Date(slotEnd);

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format for slot start or end time'
      });
    }

    // Check if appointment is in the future
    if (startDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Appointment must be scheduled for a future time'
      });
    }

    // Validate appointment duration (15 minutes to 4 hours)
    const durationMinutes = (endDate - startDate) / (1000 * 60);
    if (durationMinutes < 15) {
      return res.status(400).json({
        success: false,
        message: 'Appointment duration must be at least 15 minutes'
      });
    }
    if (durationMinutes > 240) {
      return res.status(400).json({
        success: false,
        message: 'Appointment duration cannot exceed 4 hours'
      });
    }

    // Verify counsellor exists and has appropriate role
    const counsellor = await User.findById(counsellorId);
    if (!counsellor) {
      return res.status(400).json({
        success: false,
        message: 'Counsellor not found'
      });
    }

    if (!['counsellor', 'admin'].includes(counsellor.role)) {
      return res.status(400).json({
        success: false,
        message: 'Selected user is not authorized to provide counselling services'
      });
    }

    // CRITICAL: Check counsellor availability to prevent double bookings
    const availabilityCheck = await Appointment.checkAvailability(
      counsellorId,
      startDate,
      endDate
    );

    if (!availabilityCheck.isAvailable) {
      return res.status(409).json({
        success: false,
        message: 'Counsellor is not available during the requested time slot',
        conflicts: availabilityCheck.conflicts.map(conflict => ({
          id: conflict._id,
          slotStart: conflict.slotStart,
          slotEnd: conflict.slotEnd,
          status: conflict.status
        }))
      });
    }

    // Get student information
    const student = await User.findById(req.user.id);
    if (!student) {
      return res.status(400).json({
        success: false,
        message: 'Student user not found'
      });
    }

    // Validate location for in-person appointments
    if (mode === 'in-person' && !location) {
      return res.status(400).json({
        success: false,
        message: 'Location is required for in-person appointments'
      });
    }

    // Create appointment
    const appointmentData = {
      studentId: req.user.id,
      counsellorId,
      collegeId: student.collegeId,
      slotStart: startDate,
      slotEnd: endDate,
      mode,
      reason: reason?.trim() || null,
      urgency: urgency || 'medium',
      location: mode === 'in-person' ? location?.trim() : null
    };

    const appointment = new Appointment(appointmentData);

    // Encrypt private notes if provided
    if (privateNotes && privateNotes.trim()) {
      try {
        appointment.setPrivateNotes(privateNotes.trim());
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Failed to encrypt private notes: ' + error.message
        });
      }
    }

    // Save appointment
    await appointment.save();

    // Populate the response with user details
    await appointment.populate([
      { path: 'studentId', select: 'name email collegeId' },
      { path: 'counsellorId', select: 'name email' }
    ]);

    // Log the booking for monitoring
    console.log(`New appointment booked:`, {
      appointmentId: appointment._id,
      studentId: req.user.id,
      counsellorId,
      slotStart: startDate.toISOString(),
      slotEnd: endDate.toISOString(),
      mode,
      urgency
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment: {
        id: appointment._id,
        studentId: appointment.studentId,
        counsellorId: appointment.counsellorId,
        collegeId: appointment.collegeId,
        slotStart: appointment.slotStart,
        slotEnd: appointment.slotEnd,
        mode: appointment.mode,
        status: appointment.status,
        reason: appointment.reason,
        urgency: appointment.urgency,
        location: appointment.location,
        durationMinutes: appointment.durationMinutes,
        createdAt: appointment.createdAt
      }
    });

  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during appointment booking'
    });
  }
};

// @desc    Get user's appointments
// @route   GET /api/v1/appointments/me
// @access  Private
const getMyAppointments = async (req, res, next) => {
  try {
    const { status, upcoming = 'false', includeCompleted = 'false' } = req.query;
    
    // Build query based on user role
    let query = {};
    
    if (req.user.role === 'student') {
      query.studentId = req.user.id;
    } else if (['counsellor', 'admin'].includes(req.user.role)) {
      query.counsellorId = req.user.id;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view appointments'
      });
    }

    // Filter by status if provided
    if (status && ['requested', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      query.status = status;
    } else if (upcoming === 'true') {
      // Show only upcoming appointments
      query.slotStart = { $gte: new Date() };
      query.status = { $in: ['requested', 'confirmed'] };
    } else if (includeCompleted === 'false') {
      // Exclude completed and cancelled by default
      query.status = { $in: ['requested', 'confirmed'] };
    }

    const appointments = await Appointment.find(query)
      .populate('studentId', 'name email collegeId')
      .populate('counsellorId', 'name email')
      .populate('cancelledBy', 'name email')
      .populate('confirmedBy', 'name email')
      .sort({ slotStart: 1 });

    // Decrypt private notes for each appointment if user is authorized
    const appointmentsWithNotes = appointments.map(appointment => {
      const appointmentObj = appointment.toObject();
      
      // Only the student who booked or the assigned counsellor can see private notes
      const canViewNotes = (
        (req.user.role === 'student' && appointment.studentId._id.toString() === req.user.id) ||
        ((['counsellor', 'admin'].includes(req.user.role)) && appointment.counsellorId._id.toString() === req.user.id)
      );

      if (canViewNotes) {
        appointmentObj.privateNotes = appointment.getPrivateNotes();
      }

      return appointmentObj;
    });

    res.status(200).json({
      success: true,
      count: appointmentsWithNotes.length,
      appointments: appointmentsWithNotes
    });

  } catch (error) {
    console.error('Get my appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving appointments'
    });
  }
};

// @desc    Get specific appointment by ID
// @route   GET /api/v1/appointments/:id
// @access  Private
const getAppointment = async (req, res, next) => {
  try {
    const appointmentId = req.params.id;
    
    const appointment = await Appointment.findById(appointmentId)
      .populate('studentId', 'name email collegeId')
      .populate('counsellorId', 'name email')
      .populate('cancelledBy', 'name email')
      .populate('confirmedBy', 'name email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check access permissions
    const isStudent = appointment.studentId._id.toString() === req.user.id;
    const isCounsellor = appointment.counsellorId._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isStudent && !isCounsellor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this appointment'
      });
    }

    const appointmentObj = appointment.toObject();
    
    // Add private notes if authorized
    if (isStudent || isCounsellor || isAdmin) {
      appointmentObj.privateNotes = appointment.getPrivateNotes();
    }

    res.status(200).json({
      success: true,
      appointment: appointmentObj
    });

  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving appointment'
    });
  }
};

// @desc    Update appointment status
// @route   PATCH /api/v1/appointments/:id/status
// @access  Private (counsellors and admins)
const updateAppointmentStatus = async (req, res, next) => {
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

    const appointmentId = req.params.id;
    const { status, cancellationReason, location, meetingLink, meetingId } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    const isCounsellor = appointment.counsellorId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const isStudent = appointment.studentId.toString() === req.user.id;
    
    // Only counsellors, admins, and students (for cancellation) can update status
    if (!isCounsellor && !isAdmin && !(isStudent && status === 'cancelled')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }

    // Validate status transitions
    const validTransitions = {
      'requested': ['confirmed', 'cancelled'],
      'confirmed': ['completed', 'cancelled', 'no-show'],
      'cancelled': [], // Cannot change from cancelled
      'completed': [], // Cannot change from completed
      'no-show': [] // Cannot change from no-show
    };

    if (!validTransitions[appointment.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change appointment status from ${appointment.status} to ${status}`
      });
    }

    // Handle different status updates
    try {
      switch (status) {
        case 'confirmed':
          await appointment.confirm(req.user.id);
          
          // Update meeting details for tele appointments
          if (appointment.mode === 'tele') {
            if (meetingLink) appointment.meetingLink = meetingLink.trim();
            if (meetingId) appointment.meetingId = meetingId.trim();
          }
          
          // Update location for in-person appointments
          if (appointment.mode === 'in-person' && location) {
            appointment.location = location.trim();
          }
          
          await appointment.save();
          break;

        case 'cancelled':
          await appointment.cancel(req.user.id, cancellationReason);
          break;

        case 'completed':
          await appointment.complete();
          break;

        case 'no-show':
          appointment.status = 'no-show';
          await appointment.save();
          break;

        default:
          appointment.status = status;
          await appointment.save();
      }

      // Populate the response
      await appointment.populate([
        { path: 'studentId', select: 'name email collegeId' },
        { path: 'counsellorId', select: 'name email' },
        { path: 'cancelledBy', select: 'name email' },
        { path: 'confirmedBy', select: 'name email' }
      ]);

      res.status(200).json({
        success: true,
        message: `Appointment ${status} successfully`,
        appointment
      });

    } catch (updateError) {
      console.error('Status update error:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update appointment status'
      });
    }

  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating appointment status'
    });
  }
};

// @desc    Get counsellor availability
// @route   GET /api/v1/appointments/counsellor/:counsellorId/availability
// @access  Private
const getCounsellorAvailability = async (req, res, next) => {
  try {
    const { counsellorId } = req.params;
    const { date, startDate, endDate } = req.query;

    // Verify counsellor exists
    const counsellor = await User.findById(counsellorId);
    if (!counsellor || !['counsellor', 'admin'].includes(counsellor.role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid counsellor ID'
      });
    }

    let queryStartDate, queryEndDate;

    if (date) {
      // Single date query
      queryStartDate = new Date(date);
      queryEndDate = new Date(date);
      queryEndDate.setDate(queryEndDate.getDate() + 1);
    } else if (startDate && endDate) {
      // Date range query
      queryStartDate = new Date(startDate);
      queryEndDate = new Date(endDate);
    } else {
      // Default to next 7 days
      queryStartDate = new Date();
      queryEndDate = new Date();
      queryEndDate.setDate(queryEndDate.getDate() + 7);
    }

    const bookedSlots = await Appointment.find({
      counsellorId,
      slotStart: { $gte: queryStartDate, $lt: queryEndDate },
      status: { $in: ['requested', 'confirmed'] }
    }).select('slotStart slotEnd status');

    res.status(200).json({
      success: true,
      counsellorId,
      counsellorName: counsellor.name,
      dateRange: {
        start: queryStartDate,
        end: queryEndDate
      },
      bookedSlots
    });

  } catch (error) {
    console.error('Get counsellor availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving counsellor availability'
    });
  }
};

module.exports = {
  createAppointment,
  getMyAppointments,
  getAppointment,
  updateAppointmentStatus,
  getCounsellorAvailability
};