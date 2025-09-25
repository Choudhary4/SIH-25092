const mongoose = require('mongoose');
const crypto = require('crypto');

const forumPostSchema = new mongoose.Schema({
  postId: {
    type: String,
    unique: true,
    required: true,
    default: function() {
      // Generate a unique post ID (8 characters alphanumeric)
      return crypto.randomBytes(4).toString('hex').toUpperCase();
    }
    // Note: index is automatically created due to unique: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // Allow anonymous posts
    index: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters long'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  body: {
    type: String,
    required: [true, 'Post body is required'],
    trim: true,
    minlength: [10, 'Post body must be at least 10 characters long'],
    maxlength: [5000, 'Post body cannot exceed 5000 characters']
  },
  language: {
    type: String,
    required: [true, 'Language is required'],
    default: 'en',
    enum: {
      values: ['en', 'hi', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'],
      message: 'Language must be a supported language code'
    },
    index: true
  },
  tags: {
    type: [String],
    validate: {
      validator: function(tags) {
        return tags.length <= 10; // Maximum 10 tags
      },
      message: 'Cannot have more than 10 tags'
    },
    default: [],
    index: true
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['pending_moderation', 'published', 'flagged', 'removed', 'draft'],
      message: 'Invalid post status'
    },
    default: 'pending_moderation',
    index: true
  },
  // Anonymized identifier for anonymous posts (consistent across posts by same user)
  anonymizedId: {
    type: String,
    default: function() {
      if (this.studentId) {
        // Generate consistent anonymized ID based on user ID and a secret
        const secret = process.env.ANONYMIZATION_SECRET || 'default-secret';
        return crypto.createHmac('sha256', secret)
          .update(this.studentId.toString())
          .digest('hex')
          .substring(0, 8)
          .toUpperCase();
      } else {
        // Truly anonymous posts get random ID
        return 'ANON' + crypto.randomBytes(2).toString('hex').toUpperCase();
      }
    },
    index: true
  },
  // Moderation fields
  moderationNotes: {
    type: String,
    maxlength: [1000, 'Moderation notes cannot exceed 1000 characters'],
    default: null
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  moderatedAt: {
    type: Date,
    default: null
  },
  // Content filtering flags
  contentFlags: {
    profanity: { type: Boolean, default: false },
    selfHarm: { type: Boolean, default: false },
    violence: { type: Boolean, default: false },
    spam: { type: Boolean, default: false },
    inappropriate: { type: Boolean, default: false }
  },
  flaggedWords: {
    type: [String],
    default: []
  },
  // Engagement metrics
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  reports: {
    type: Number,
    default: 0,
    min: 0
  },
  // User interactions
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reportedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'harmful', 'off-topic', 'other']
    },
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Post metadata
  isAnonymous: {
    type: Boolean,
    default: function() {
      return this.studentId === null;
    }
  },
  isPinned: {
    type: Boolean,
    default: false,
    index: true
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  // Related content
  parentPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumPost',
    default: null
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumPost'
  }],
  replyCount: {
    type: Number,
    default: 0,
    min: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now,
    index: true
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
      // Remove sensitive information from JSON output
      delete ret.flaggedWords;
      delete ret.likedBy;
      delete ret.reportedBy;
      delete ret.__v;
      
      // For anonymous posts, don't expose studentId
      if (doc.isAnonymous) {
        delete ret.studentId;
      }
      
      return ret;
    }
  }
});

// Compound indexes for efficient querying
forumPostSchema.index({ status: 1, createdAt: -1 });
forumPostSchema.index({ language: 1, status: 1, createdAt: -1 });
forumPostSchema.index({ tags: 1, status: 1, createdAt: -1 });
forumPostSchema.index({ anonymizedId: 1, createdAt: -1 });
forumPostSchema.index({ isPinned: -1, lastActivity: -1 });

// Text search index for title and body
forumPostSchema.index({
  title: 'text',
  body: 'text',
  tags: 'text'
});

// Pre-save middleware to update timestamps and process tags
forumPostSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Normalize tags (lowercase, trim, remove duplicates)
  if (this.tags && this.tags.length > 0) {
    this.tags = [...new Set(this.tags.map(tag => 
      tag.toLowerCase().trim().replace(/[^a-z0-9\-_]/g, '')
    ).filter(tag => tag.length > 0))];
  }
  
  // Update last activity time if status changed to published
  if (this.isModified('status') && this.status === 'published') {
    this.lastActivity = Date.now();
  }
  
  next();
});

// Virtual for checking if post needs moderation
forumPostSchema.virtual('needsModeration').get(function() {
  return this.status === 'pending_moderation' || this.status === 'flagged';
});

// Virtual for display author (anonymized or real name)
forumPostSchema.virtual('displayAuthor').get(function() {
  if (this.isAnonymous) {
    return `Anonymous ${this.anonymizedId}`;
  }
  return this.populated('studentId') ? this.studentId.name : 'Unknown User';
});

// Instance method to add a like
forumPostSchema.methods.addLike = async function(userId) {
  if (!this.likedBy.includes(userId)) {
    this.likedBy.push(userId);
    this.likes = this.likedBy.length;
    await this.save();
  }
  return this;
};

// Instance method to remove a like
forumPostSchema.methods.removeLike = async function(userId) {
  this.likedBy = this.likedBy.filter(id => !id.equals(userId));
  this.likes = this.likedBy.length;
  await this.save();
  return this;
};

// Instance method to add a report
forumPostSchema.methods.addReport = async function(userId, reason) {
  // Check if user already reported this post
  const existingReport = this.reportedBy.find(report => 
    report.userId.equals(userId)
  );
  
  if (!existingReport) {
    this.reportedBy.push({
      userId,
      reason,
      reportedAt: new Date()
    });
    this.reports = this.reportedBy.length;
    
    // Auto-flag posts with multiple reports
    if (this.reports >= 3 && this.status === 'published') {
      this.status = 'flagged';
    }
    
    await this.save();
  }
  
  return this;
};

// Instance method to moderate post
forumPostSchema.methods.moderate = async function(status, moderatorId, notes = null) {
  this.status = status;
  this.moderatedBy = moderatorId;
  this.moderatedAt = new Date();
  if (notes) {
    this.moderationNotes = notes;
  }
  return await this.save();
};

// Instance method to increment view count
forumPostSchema.methods.incrementViews = async function() {
  this.views += 1;
  return await this.save();
};

// Static method to find posts by tag
forumPostSchema.statics.findByTag = function(tag, limit = 20) {
  return this.find({
    tags: { $in: [tag.toLowerCase()] },
    status: 'published'
  })
  .populate('studentId', 'name collegeId')
  .sort({ isPinned: -1, lastActivity: -1 })
  .limit(limit);
};

// Static method to find posts needing moderation
forumPostSchema.statics.findNeedingModeration = function(limit = 50) {
  return this.find({
    status: { $in: ['pending_moderation', 'flagged'] }
  })
  .populate('studentId', 'name email collegeId')
  .sort({ createdAt: 1 }) // Oldest first for moderation queue
  .limit(limit);
};

// Static method to search posts
forumPostSchema.statics.searchPosts = function(query, options = {}) {
  const searchQuery = {
    $text: { $search: query },
    status: 'published'
  };
  
  if (options.language) {
    searchQuery.language = options.language;
  }
  
  if (options.tags && options.tags.length > 0) {
    searchQuery.tags = { $in: options.tags };
  }
  
  return this.find(searchQuery)
    .populate('studentId', 'name collegeId')
    .sort({ score: { $meta: 'textScore' }, isPinned: -1, lastActivity: -1 })
    .limit(options.limit || 20);
};

// Static method to get trending posts
forumPostSchema.statics.getTrendingPosts = function(days = 7, limit = 10) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        status: 'published',
        createdAt: { $gte: startDate }
      }
    },
    {
      $addFields: {
        engagementScore: {
          $add: [
            { $multiply: ['$likes', 2] },
            { $multiply: ['$views', 0.1] },
            { $multiply: ['$replyCount', 3] }
          ]
        }
      }
    },
    {
      $sort: { engagementScore: -1, createdAt: -1 }
    },
    {
      $limit: limit
    },
    {
      $lookup: {
        from: 'users',
        localField: 'studentId',
        foreignField: '_id',
        as: 'studentId',
        pipeline: [{ $project: { name: 1, collegeId: 1 } }]
      }
    },
    {
      $unwind: {
        path: '$studentId',
        preserveNullAndEmptyArrays: true
      }
    }
  ]);
};

// Static method to get post statistics
forumPostSchema.statics.getStatistics = function(dateRange = {}) {
  const match = {};
  
  if (dateRange.start || dateRange.end) {
    match.createdAt = {};
    if (dateRange.start) match.createdAt.$gte = new Date(dateRange.start);
    if (dateRange.end) match.createdAt.$lte = new Date(dateRange.end);
  }
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalViews: { $sum: '$views' },
        totalLikes: { $sum: '$likes' },
        totalReports: { $sum: '$reports' }
      }
    }
  ]);
};

const ForumPost = mongoose.model('ForumPost', forumPostSchema);

module.exports = ForumPost;