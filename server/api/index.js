const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

// Import custom middleware
const { 
  defaultRateLimit, 
  authRateLimit, 
  chatRateLimit, 
  sensitiveRateLimit,
  publicRateLimit,
  createCustomRateLimit 
} = require('../src/middlewares/rateLimit');
const { 
  auditMiddleware, 
  authAuditMiddleware, 
  adminAuditMiddleware, 
  crisisAuditMiddleware 
} = require('../src/middlewares/audit');

// Initialize Express app
const app = express();

// Create admin rate limit for global admin routes
const adminRateLimit = createCustomRateLimit(500, 15 * 60 * 1000);

// Global Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: process.env.CLIENT_URL || ['http://localhost:3000', 'https://your-frontend-domain.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Apply default rate limiting to all routes
app.use(defaultRateLimit);

// Apply audit logging middleware for all API routes
app.use('/api/', auditMiddleware());

// MongoDB Connection with connection pooling for serverless
let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection) {
    console.log('Using cached database connection');
    return cachedConnection;
  }
  
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MongoDB URI not provided in environment variables');
    }

    const conn = await mongoose.connect(mongoUri, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4 // Use IPv4, skip trying IPv6
    });

    cachedConnection = conn;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    throw error;
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Mann-Mitra Server API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/v1/auth',
      appointments: '/api/v1/appointments',
      chat: '/api/v1/chat',
      screenings: '/api/v1/screenings',
      forum: '/api/v1/forum',
      admin: '/api/v1/admin'
    }
  });
});

// API Routes
const authRoutes = require('../src/routes/auth.routes');
const screeningRoutes = require('../src/routes/screening.routes');
const appointmentRoutes = require('../src/routes/appointment.routes');
const counsellorRoutes = require('../src/routes/counsellor.routes');
const forumRoutes = require('../src/routes/forum.routes');
const adminRoutes = require('../src/routes/admin.routes');
const chatRoutes = require('../src/routes/chat.routes');
const chatRealtimeRoutes = require('./chat-realtime');

// Auth routes - stricter rate limiting and specific audit logging
app.use('/api/v1/auth', authRateLimit, authAuditMiddleware, authRoutes);
app.use('/api/auth', authRateLimit, authAuditMiddleware, authRoutes);

// Chat routes - moderate rate limiting for conversation flow
app.use('/api/v1/chat', chatRateLimit, crisisAuditMiddleware, chatRoutes);

// Real-time chat routes for Vercel (polling-based)
app.use('/api/chat-realtime', chatRateLimit, chatRealtimeRoutes);

// Admin routes - higher limits for admin operations with detailed logging
app.use('/api/v1/admin', adminRateLimit, adminAuditMiddleware, adminRoutes);

// Screening routes - sensitive mental health data
app.use('/api/v1/screenings', sensitiveRateLimit, crisisAuditMiddleware, screeningRoutes);
app.use('/api/screening', sensitiveRateLimit, crisisAuditMiddleware, screeningRoutes);

// Standard routes with default rate limiting
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/counsellors', counsellorRoutes);
app.use('/api/v1/forum', forumRoutes);

// 404 handler for API routes
app.use('/api', (req, res, next) => {
  res.status(404).json({ 
    success: false, 
    message: 'API endpoint not found',
    availableEndpoints: [
      '/api/v1/auth',
      '/api/v1/appointments', 
      '/api/v1/chat',
      '/api/v1/screenings',
      '/api/v1/forum',
      '/api/v1/admin'
    ]
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

// Serverless function handler
module.exports = async (req, res) => {
  try {
    // Ensure database connection
    await connectDB();
    
    // Handle the request
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};