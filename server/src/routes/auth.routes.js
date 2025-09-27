const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  adminLogin,
  counsellorLogin,
  adminSignup
} = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// Validation middleware for registration
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  body('collegeId')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('College ID must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9]+$/)
    .withMessage('College ID can only contain letters and numbers'),
  body('role')
    .optional()
    .isIn(['student', 'counsellor', 'admin', 'moderator'])
    .withMessage('Role must be one of: student, counsellor, admin, moderator'),
  body('languagePref')
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage('Language preference must be a valid language code')
];

// Validation middleware for login
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Validation middleware for profile update
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  body('languagePref')
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage('Language preference must be a valid language code')
];

// Public routes
router.post('/register', registerValidation, register); // Students only
router.post('/login', loginValidation, login); // Students only

// Admin specific routes
router.post('/admin/signup', [
  body('collegeName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('College name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('phoneNumber')
    .matches(/^[0-9]{10}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
  body('department')
    .isIn(['Student Welfare', 'Psychology', 'IQAC', 'Super Admin'])
    .withMessage('Please select a valid department'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol')
], adminSignup);
router.post('/admin/login', loginValidation, adminLogin);

// Counsellor specific routes  
router.post('/counsellor/login', loginValidation, counsellorLogin);

// Protected routes (require authentication)
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfileValidation, updateProfile);

module.exports = router;