const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  // Request Information
  method: {
    type: String,
    required: true,
    enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']
  },
  route: {
    type: String,
    required: true,
    maxlength: 500
  },
  originalUrl: {
    type: String,
    required: true,
    maxlength: 1000
  },
  
  // User Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null for anonymous requests
  },
  userEmail: {
    type: String,
    default: null
  },
  userRole: {
    type: String,
    enum: ['student', 'counsellor', 'admin', 'anonymous'],
    default: 'anonymous'
  },
  
  // Request Context
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    maxlength: 1000
  },
  
  // Audit Details
  action: {
    type: String,
    required: true,
    enum: [
      'login', 'logout', 'register',
      'screening_submit', 'screening_view',
      'booking_create', 'booking_cancel', 'booking_update',
      'crisis_escalation', 'emergency_alert',
      'chat_start', 'chat_message', 'chat_end',
      'forum_post', 'forum_reply', 'forum_moderate',
      'admin_action', 'data_export', 'user_update',
      'password_reset', 'profile_update',
      'api_access', 'sensitive_data_access'
    ]
  },
  
  // Response Information
  statusCode: {
    type: Number,
    required: true
  },
  responseTime: {
    type: Number, // milliseconds
    required: true
  },
  
  // Additional Context
  resourceId: {
    type: String, // ID of the resource being acted upon (booking ID, post ID, etc.)
    default: null
  },
  details: {
    type: mongoose.Schema.Types.Mixed, // Additional context specific to the action
    default: {}
  },
  
  // Security Flags
  isSensitive: {
    type: Boolean,
    default: false
  },
  requiresReview: {
    type: Boolean,
    default: false
  },
  
  // Geolocation (optional)
  location: {
    country: { type: String },
    region: { type: String },
    city: { type: String }
  },
  
  // Error Information (if applicable)
  error: {
    message: { type: String },
    stack: { type: String },
    code: { type: String }
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'auditlogs'
});

// Indexes for efficient querying
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ ipAddress: 1, createdAt: -1 });
auditLogSchema.index({ isSensitive: 1, createdAt: -1 });
auditLogSchema.index({ requiresReview: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 }); // For time-based queries

// TTL index to automatically delete logs after 2 years (for GDPR compliance)
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 }); // 2 years in seconds

// Virtual for formatted timestamp
auditLogSchema.virtual('formattedTimestamp').get(function() {
  return this.createdAt.toISOString();
});

// Static method to log an action
auditLogSchema.statics.logAction = async function(auditData) {
  try {
    const log = new this(auditData);
    await log.save();
    return log;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw error to prevent breaking the main application flow
    return null;
  }
};

// Static method to get audit logs for a user
auditLogSchema.statics.getUserAuditLogs = async function(userId, limit = 50) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('-error.stack -userAgent'); // Exclude sensitive/verbose fields
};

// Static method to get sensitive actions requiring review
auditLogSchema.statics.getSensitiveActions = async function(limit = 100) {
  return this.find({ 
    $or: [
      { isSensitive: true },
      { requiresReview: true },
      { action: { $in: ['crisis_escalation', 'emergency_alert', 'admin_action'] } }
    ]
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'name email role');
};

// Static method to get failed authentication attempts
auditLogSchema.statics.getFailedAuthAttempts = async function(hours = 24) {
  const since = new Date(Date.now() - (hours * 60 * 60 * 1000));
  return this.find({
    action: { $in: ['login', 'register'] },
    statusCode: { $gte: 400 },
    createdAt: { $gte: since }
  })
    .sort({ createdAt: -1 })
    .select('ipAddress userEmail statusCode createdAt details');
};

// Instance method to mark as requiring review
auditLogSchema.methods.markForReview = async function(reason) {
  this.requiresReview = true;
  this.details.reviewReason = reason;
  this.details.reviewRequestedAt = new Date();
  return this.save();
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;