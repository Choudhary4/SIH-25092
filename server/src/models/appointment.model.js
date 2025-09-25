const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/encryption');

const appointmentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required'],
    index: true
  },
  counsellorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Counsellor ID is required'],
    index: true
  },
  collegeId: {
    type: String,
    required: [true, 'College ID is required'],
    trim: true,
    index: true
  },
  slotStart: {
    type: Date,
    required: [true, 'Slot start time is required'],
    index: true,
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Slot start time must be in the future'
    }
  },
  slotEnd: {
    type: Date,
    required: [true, 'Slot end time is required'],
    validate: {
      validator: function(value) {
        return value > this.slotStart;
      },
      message: 'Slot end time must be after start time'
    }
  },
  mode: {
    type: String,
    required: [true, 'Appointment mode is required'],
    enum: {
      values: ['in-person', 'tele'],
      message: 'Mode must be either in-person or tele'
    },
    index: true
  },
  status: {
    type: String,
    required: [true, 'Appointment status is required'],
    enum: {
      values: ['requested', 'confirmed', 'cancelled', 'completed', 'no-show'],
      message: 'Invalid appointment status'
    },
    default: 'requested',
    index: true
  },
  // Encrypted private notes - stored as encrypted string
  privateNotesEncrypted: {
    type: String,
    default: null
  },
  // Additional fields for better appointment management
  reason: {
    type: String,
    maxlength: [500, 'Reason cannot exceed 500 characters'],
    trim: true
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  // Location details for in-person appointments
  location: {
    type: String,
    maxlength: [200, 'Location cannot exceed 200 characters'],
    trim: true
  },
  // Meeting details for tele appointments
  meetingLink: {
    type: String,
    trim: true
  },
  meetingId: {
    type: String,
    trim: true
  },
  // Cancellation details
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  cancellationReason: {
    type: String,
    maxlength: [300, 'Cancellation reason cannot exceed 300 characters'],
    trim: true
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  // Confirmation details
  confirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  confirmedAt: {
    type: Date,
    default: null
  },
  // Reminder settings
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderSentAt: {
    type: Date,
    default: null
  },
  // Follow-up appointment reference
  followUpAppointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret, options) {
      // Don't return encrypted notes in JSON unless specifically requested
      if (!options.includePrivateNotes) {
        delete ret.privateNotesEncrypted;
      }
      delete ret.__v;
      return ret;
    }
  }
});

// Compound indexes for efficient querying
appointmentSchema.index({ counsellorId: 1, slotStart: 1, slotEnd: 1 });
appointmentSchema.index({ studentId: 1, slotStart: 1 });
appointmentSchema.index({ slotStart: 1, slotEnd: 1, status: 1 });
appointmentSchema.index({ collegeId: 1, slotStart: 1 });
appointmentSchema.index({ status: 1, slotStart: 1 });

// Pre-save middleware to update timestamps
appointmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Pre-save middleware to validate slot duration (minimum 15 minutes)
appointmentSchema.pre('save', function(next) {
  const duration = (this.slotEnd - this.slotStart) / (1000 * 60); // Duration in minutes
  if (duration < 15) {
    return next(new Error('Appointment duration must be at least 15 minutes'));
  }
  if (duration > 240) { // Maximum 4 hours
    return next(new Error('Appointment duration cannot exceed 4 hours'));
  }
  next();
});

// Virtual for appointment duration in minutes
appointmentSchema.virtual('durationMinutes').get(function() {
  return Math.round((this.slotEnd - this.slotStart) / (1000 * 60));
});

// Virtual for checking if appointment is upcoming
appointmentSchema.virtual('isUpcoming').get(function() {
  return this.slotStart > new Date() && ['requested', 'confirmed'].includes(this.status);
});

// Virtual for checking if appointment is today
appointmentSchema.virtual('isToday').get(function() {
  const today = new Date();
  const appointmentDate = new Date(this.slotStart);
  return appointmentDate.toDateString() === today.toDateString();
});

// Instance method to set private notes (encrypts automatically)
appointmentSchema.methods.setPrivateNotes = function(notes) {
  if (!notes || notes.trim() === '') {
    this.privateNotesEncrypted = null;
    return;
  }
  
  try {
    this.privateNotesEncrypted = encrypt(notes.trim());
  } catch (error) {
    throw new Error('Failed to encrypt private notes: ' + error.message);
  }
};

// Instance method to get private notes (decrypts automatically)
appointmentSchema.methods.getPrivateNotes = function() {
  if (!this.privateNotesEncrypted) {
    return null;
  }
  
  try {
    return decrypt(this.privateNotesEncrypted);
  } catch (error) {
    console.error('Failed to decrypt private notes for appointment:', this._id, error);
    return '[Decryption Error - Notes Unavailable]';
  }
};

// Instance method to cancel appointment
appointmentSchema.methods.cancel = async function(cancelledBy, reason = null) {
  this.status = 'cancelled';
  this.cancelledBy = cancelledBy;
  this.cancellationReason = reason;
  this.cancelledAt = new Date();
  return await this.save();
};

// Instance method to confirm appointment
appointmentSchema.methods.confirm = async function(confirmedBy) {
  this.status = 'confirmed';
  this.confirmedBy = confirmedBy;
  this.confirmedAt = new Date();
  return await this.save();
};

// Instance method to complete appointment
appointmentSchema.methods.complete = async function() {
  this.status = 'completed';
  return await this.save();
};

// Static method to check counsellor availability
appointmentSchema.statics.checkAvailability = async function(counsellorId, slotStart, slotEnd, excludeId = null) {
  const query = {
    counsellorId: counsellorId,
    status: { $in: ['requested', 'confirmed'] }, // Only check active appointments
    $or: [
      // Overlapping conditions
      {
        slotStart: { $lt: slotEnd },
        slotEnd: { $gt: slotStart }
      }
    ]
  };
  
  // Exclude current appointment if updating
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  const conflictingAppointments = await this.find(query);
  
  return {
    isAvailable: conflictingAppointments.length === 0,
    conflicts: conflictingAppointments
  };
};

// Static method to get counsellor's appointments for a date range
appointmentSchema.statics.getCounsellorSchedule = function(counsellorId, startDate, endDate) {
  return this.find({
    counsellorId: counsellorId,
    slotStart: { $gte: startDate, $lte: endDate },
    status: { $in: ['requested', 'confirmed', 'completed'] }
  })
  .populate('studentId', 'name email collegeId')
  .sort({ slotStart: 1 });
};

// Static method to get student's appointments
appointmentSchema.statics.getStudentAppointments = function(studentId, includeCompleted = false) {
  const statusFilter = includeCompleted 
    ? { $in: ['requested', 'confirmed', 'completed', 'cancelled'] }
    : { $in: ['requested', 'confirmed'] };
    
  return this.find({
    studentId: studentId,
    status: statusFilter
  })
  .populate('counsellorId', 'name email')
  .sort({ slotStart: 1 });
};

// Static method to find appointments needing reminders
appointmentSchema.statics.findAppointmentsNeedingReminders = function(hoursAhead = 24) {
  const reminderTime = new Date(Date.now() + hoursAhead * 60 * 60 * 1000);
  
  return this.find({
    slotStart: { $lte: reminderTime, $gte: new Date() },
    status: 'confirmed',
    reminderSent: false
  })
  .populate('studentId', 'name email')
  .populate('counsellorId', 'name email');
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;