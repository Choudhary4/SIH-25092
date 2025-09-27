const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import custom middleware
const { 
  defaultRateLimit, 
  authRateLimit, 
  chatRateLimit, 
  sensitiveRateLimit,
  publicRateLimit,
  createCustomRateLimit 
} = require('./middlewares/rateLimit');
const { 
  auditMiddleware, 
  authAuditMiddleware, 
  adminAuditMiddleware, 
  crisisAuditMiddleware 
} = require('./middlewares/audit');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io service
const socketService = require('./services/socket.service');
const io = socketService.initSocket(server);

// Create admin rate limit for global admin routes
const adminRateLimit = createCustomRateLimit(500, 15 * 60 * 1000); // 500 requests per 15 minutes for admins

// Export io instance for use in other modules
module.exports = { io };

// Global Middleware
app.use(helmet()); // Security headers
app.use(cors());
app.use(morgan('combined')); // HTTP request logging
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies

// Apply default rate limiting to all routes
app.use(defaultRateLimit);

// Apply audit logging middleware for all API routes
app.use('/api/', auditMiddleware());

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Socket.io is now handled by the socket service
// All connection handling, authentication, and event management
// is managed in ./services/socket.service.js

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes - Mount your routes here with specific middleware
const authRoutes = require('./routes/auth.routes');
const screeningRoutes = require('./routes/screening.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const counsellorRoutes = require('./routes/counsellor.routes');
const forumRoutes = require('./routes/forum.routes');
const adminRoutes = require('./routes/admin.routes');
const chatRoutes = require('./routes/chat.routes');

// Auth routes - stricter rate limiting and specific audit logging
app.use('/api/v1/auth', authRateLimit, authAuditMiddleware, authRoutes);

// Legacy auth route (for backwards compatibility)
app.use('/api/auth', authRateLimit, authAuditMiddleware, authRoutes);

// Chat routes - moderate rate limiting for conversation flow
app.use('/api/v1/chat', chatRateLimit, crisisAuditMiddleware, chatRoutes);

// Admin routes - higher limits for admin operations with detailed logging
app.use('/api/v1/admin', adminRateLimit, adminAuditMiddleware, adminRoutes);

// Screening routes - sensitive mental health data
app.use('/api/v1/screenings', sensitiveRateLimit, crisisAuditMiddleware, screeningRoutes);

// Legacy screening route (for backwards compatibility)
app.use('/api/screening', sensitiveRateLimit, crisisAuditMiddleware, screeningRoutes);

// Standard routes with default rate limiting (already applied globally)
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/counsellors', counsellorRoutes);
app.use('/api/v1/forum', forumRoutes);

// Example for additional routes:
// const userRoutes = require('./routes/users');
// app.use('/api/v1/users', userRoutes);

// API prefix for all routes
app.use('/api/v1', (req, res, next) => {
  // This middleware runs for all /api/v1/* routes
  // Add any common logic here (e.g., API versioning, additional auth checks)
  next();
});

// 404 handler for API routes
app.use('/api', (req, res, next) => {
  res.status(404).json({ 
    success: false, 
    message: 'API endpoint not found' 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io server ready for connections`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  
  // Cleanup socket service
  socketService.cleanup();
  
  server.close(() => {
    console.log('Process terminated');
  });
});