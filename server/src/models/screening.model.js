const mongoose = require('mongoose');

const screeningSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // Allow anonymous screenings
    index: true
  },
  tool: {
    type: String,
    required: [true, 'Screening tool is required'],
    enum: {
      values: ['PHQ-9', 'GAD-7'],
      message: 'Tool must be either PHQ-9 or GAD-7'
    },
    index: true
  },
  responses: {
    type: [Number],
    required: [true, 'Responses are required'],
    validate: {
      validator: function(responses) {
        // Validate response values are between 0-3 for both tools
        return responses.every(response => 
          Number.isInteger(response) && response >= 0 && response <= 3
        );
      },
      message: 'All responses must be integers between 0 and 3'
    }
  },
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: [0, 'Score cannot be negative'],
    max: [27, 'Score cannot exceed 27'] // Max possible for PHQ-9
  },
  severity: {
    type: String,
    required: [true, 'Severity is required'],
    enum: {
      values: ['Minimal', 'Mild', 'Moderate', 'Moderately severe', 'Severe'],
      message: 'Invalid severity level'
    },
    index: true
  },
  triageAction: {
    type: String,
    required: [true, 'Triage action is required'],
    enum: {
      values: ['routine', 'monitor', 'refer', 'crisis_escalation'],
      message: 'Invalid triage action'
    },
    index: true
  },
  consentToShare: {
    type: Boolean,
    required: [true, 'Consent to share is required'],
    default: false
  },
  // Additional metadata
  isAnonymous: {
    type: Boolean,
    default: function() {
      return this.studentId === null;
    }
  },
  // Store IP address for anonymous screenings (for rate limiting)
  ipAddress: {
    type: String,
    default: null
  },
  // Session identifier for anonymous users
  sessionId: {
    type: String,
    default: null
  },
  // Flag for high-risk screenings
  isHighRisk: {
    type: Boolean,
    default: false,
    index: true
  },
  // Counselor notes (if reviewed)
  counselorNotes: {
    type: String,
    default: null
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
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
    transform: function(doc, ret) {
      // Remove sensitive information for anonymous screenings
      if (doc.isAnonymous) {
        delete ret.ipAddress;
        delete ret.sessionId;
      }
      delete ret.__v;
      return ret;
    }
  }
});

// Pre-save validation to ensure response count matches tool requirements
screeningSchema.pre('save', function(next) {
  const expectedLength = this.tool === 'PHQ-9' ? 9 : 7;
  
  if (this.responses.length !== expectedLength) {
    return next(new Error(`${this.tool} requires exactly ${expectedLength} responses`));
  }
  
  // Update timestamp
  this.updatedAt = Date.now();
  next();
});

// Index for efficient querying
screeningSchema.index({ createdAt: -1 });
screeningSchema.index({ studentId: 1, createdAt: -1 });
screeningSchema.index({ tool: 1, severity: 1 });
screeningSchema.index({ triageAction: 1, createdAt: -1 });

// Static method to get screening statistics
screeningSchema.statics.getStatistics = async function(dateRange = {}) {
  const match = {};
  
  if (dateRange.start || dateRange.end) {
    match.createdAt = {};
    if (dateRange.start) match.createdAt.$gte = new Date(dateRange.start);
    if (dateRange.end) match.createdAt.$lte = new Date(dateRange.end);
  }

  return await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          tool: '$tool',
          severity: '$severity'
        },
        count: { $sum: 1 },
        avgScore: { $avg: '$score' }
      }
    },
    {
      $group: {
        _id: '$_id.tool',
        severityBreakdown: {
          $push: {
            severity: '$_id.severity',
            count: '$count',
            avgScore: '$avgScore'
          }
        },
        totalCount: { $sum: '$count' }
      }
    }
  ]);
};

// Static method to find high-risk screenings
screeningSchema.statics.findHighRiskScreenings = function(limit = 50) {
  return this.find({
    $or: [
      { triageAction: 'crisis_escalation' },
      { isHighRisk: true }
    ]
  })
  .populate('studentId', 'name email collegeId')
  .populate('reviewedBy', 'name email')
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Instance method to mark as reviewed
screeningSchema.methods.markAsReviewed = async function(reviewerId, notes = null) {
  this.reviewedBy = reviewerId;
  this.reviewedAt = new Date();
  if (notes) {
    this.counselorNotes = notes;
  }
  return await this.save();
};

// Instance method to check if screening needs immediate attention
screeningSchema.methods.needsImmediateAttention = function() {
  return this.triageAction === 'crisis_escalation' || this.isHighRisk;
};

const Screening = mongoose.model('Screening', screeningSchema);

module.exports = Screening;