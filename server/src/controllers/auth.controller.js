const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/user.model');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Send response with token
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = generateToken(user._id);
  
  // Cookie options
  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      message,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        anonymousDisplayName: user.anonymousDisplayName,
        collegeId: user.collegeId,
        role: user.role,
        languagePref: user.languagePref,
        createdAt: user.createdAt
      }
    });
};

// @desc    Register user (students only)
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res, next) => {
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

    const { email, password, name, collegeId, languagePref } = req.body;

    // Only allow student registration through public route
    const role = 'student';

    // Check if user already exists
    let existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const user = await User.create({
      email,
      passwordHash: password, // Will be hashed by pre-save hook
      name,
      collegeId,
      role,
      languagePref: languagePref || 'en'
    });

    // Update last login
    await user.updateLastLogin();

    sendTokenResponse(user, 201, res, 'Student registered successfully');

  } catch (error) {
    console.error('Register error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `User with this ${field} already exists`
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Admin login (separate from student/counsellor login)
// @route   POST /api/v1/auth/admin/login
// @access  Public
const adminLogin = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check if admin exists
    const user = await User.findByEmail(email).select('+passwordHash');
    if (!user || user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Check if admin is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Admin account has been deactivated'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Update last login
    await user.updateLastLogin();

    sendTokenResponse(user, 200, res, 'Admin logged in successfully');

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin login'
    });
  }
};

// @desc    Counsellor login (separate from student login)
// @route   POST /api/v1/auth/counsellor/login
// @access  Public
const counsellorLogin = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check if counsellor exists
    const user = await User.findByEmail(email).select('+passwordHash');
    if (!user || user.role !== 'counsellor') {
      return res.status(401).json({
        success: false,
        message: 'Invalid counsellor credentials'
      });
    }

    // Check if counsellor is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Counsellor account has been deactivated'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid counsellor credentials'
      });
    }

    // Update last login
    await user.updateLastLogin();

    sendTokenResponse(user, 200, res, 'Counsellor logged in successfully');

  } catch (error) {
    console.error('Counsellor login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during counsellor login'
    });
  }
};

// @desc    Admin signup (separate from student registration)
// @route   POST /api/v1/auth/admin/signup
// @access  Public
const adminSignup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { collegeName, email, phoneNumber, department, collegeCode, password } = req.body;

    // Check if admin already exists
    let existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Generate admin ID (for collegeId field)
    const adminCount = await User.countDocuments({ role: 'admin' });
    const adminId = `ADMIN${String(adminCount + 1).padStart(4, '0')}`;

    // Create admin user
    const user = await User.create({
      email,
      passwordHash: password, // Will be hashed by pre-save hook
      name: collegeName, // Use college name as the admin name
      collegeId: adminId,
      role: 'admin',
      department,
      // Store additional admin-specific info in a way that fits the current schema
      // We can extend the schema later if needed
      phoneNumber: phoneNumber, // This field needs to be added to schema
      collegeCode: collegeCode, // This field needs to be added to schema
      languagePref: 'en'
    });

    // Update last login
    await user.updateLastLogin();

    sendTokenResponse(user, 201, res, 'Admin account created successfully');

  } catch (error) {
    console.error('Admin signup error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `Admin with this ${field} already exists`
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during admin registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res, next) => {
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

    const { email, password } = req.body;

    // Check if user exists and include password for comparison
    const user = await User.findByEmail(email).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.'
      });
    }

    // Validate password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Ensure anonymousDisplayName is generated if it doesn't exist
    if (!user.anonymousDisplayName) {
      user.anonymousDisplayName = user.generateAnonymousDisplayName();
      await user.save();
    }

    sendTokenResponse(user, 200, res, 'Login successful');

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Logout user / Clear cookie
// @route   POST /api/v1/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'User logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    // req.user is already the full user object from auth middleware
    const user = req.user;
    
    // Ensure anonymousDisplayName is generated if it doesn't exist
    if (!user.anonymousDisplayName) {
      user.anonymousDisplayName = user.generateAnonymousDisplayName();
      await user.save();
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/me
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, languagePref } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update allowed fields
    if (name) user.name = name;
    if (languagePref) user.languagePref = languagePref;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update'
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  adminLogin,
  counsellorLogin,
  adminSignup
};