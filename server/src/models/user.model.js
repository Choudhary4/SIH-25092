const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ]
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name must not exceed 50 characters']
  },
  collegeId: {
    type: String,
    required: [true, 'College ID is required'],
    trim: true
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: {
      values: ['student', 'counsellor', 'admin', 'moderator'],
      message: 'Role must be one of: student, counsellor, admin, moderator'
    },
    default: 'student'
  },
  languagePref: {
    type: String,
    default: 'en',
    trim: true,
    lowercase: true
  },
  // Additional fields for counsellors
  specialization: {
    type: String,
    trim: true,
    maxlength: [200, 'Specialization must not exceed 200 characters']
  },
  profileImage: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: null
  },
  experience: {
    type: Number,
    min: 0,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  // Anonymous display name for public interactions
  anonymousDisplayName: {
    type: String,
    trim: true,
    maxlength: [30, 'Anonymous display name must not exceed 30 characters']
  }
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt
  toJSON: {
    transform: function(doc, ret) {
      // Remove sensitive information when converting to JSON
      delete ret.passwordHash;
      delete ret.__v;
      return ret;
    }
  }
});

// Pre-save hook to hash password when it's modified
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('passwordHash')) {
    return next();
  }

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save hook to generate anonymous display name and update updatedAt field
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Generate anonymous display name if it doesn't exist
  if (!this.anonymousDisplayName && this.isNew) {
    this.anonymousDisplayName = this.generateAnonymousDisplayName();
  }
  
  next();
});

// Instance method to generate anonymous display name
userSchema.methods.generateAnonymousDisplayName = function() {
  const adjectives = [
    'Wise', 'Brave', 'Kind', 'Calm', 'Hope', 'Joy', 'Peace', 'Star', 'Moon', 'Sun',
    'Ocean', 'Sky', 'Forest', 'River', 'Wind', 'Light', 'Dream', 'Spirit', 'Soul', 'Heart',
    'Gentle', 'Strong', 'Swift', 'Bright', 'Silent', 'Mystic', 'Noble', 'Pure', 'Free', 'Bold'
  ];
  
  const nouns = [
    'Seeker', 'Walker', 'Guide', 'Friend', 'Helper', 'Listener', 'Healer', 'Guardian', 'Companion', 'Voyager',
    'Dreamer', 'Thinker', 'Writer', 'Artist', 'Explorer', 'Wanderer', 'Scholar', 'Student', 'Teacher', 'Mentor',
    'Phoenix', 'Eagle', 'Dove', 'Butterfly', 'Lotus', 'Rose', 'Willow', 'Oak', 'Pine', 'Maple'
  ];
  
  // Generate consistent but anonymous name using user ID as seed
  const seed = this._id.toString();
  const hash = crypto.createHash('md5').update(seed).digest('hex');
  
  const adjIndex = parseInt(hash.substring(0, 2), 16) % adjectives.length;
  const nounIndex = parseInt(hash.substring(2, 4), 16) % nouns.length;
  const number = parseInt(hash.substring(4, 6), 16) % 1000;
  
  return `${adjectives[adjIndex]}${nouns[nounIndex]}${number.toString().padStart(3, '0')}`;
};

// Instance method to compare password
userSchema.methods.comparePassword = async function(plainPassword) {
  try {
    return await bcrypt.compare(plainPassword, this.passwordHash);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to update last login
userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  return await this.save();
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active users
userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true });
};

// Index for better query performance
// Note: email and collegeId indexes are automatically created due to unique: true
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

const User = mongoose.model('User', userSchema);

module.exports = User;