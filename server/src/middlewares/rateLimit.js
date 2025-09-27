const rateLimit = require('express-rate-limit');

/**
 * Default rate limiting middleware
 * 1000 requests per hour for general API endpoints (increased for normal usage)
 */
const defaultRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests from this IP',
    message: 'Please try again later. Rate limit: 1000 requests per hour.',
    retryAfter: '1 hour'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    console.log(`🚫 Rate limit exceeded for IP: ${req.ip}, Route: ${req.originalUrl}`);
    res.status(429).json({
      error: 'Too many requests',
      message: 'You have exceeded the rate limit. Please try again later.',
      retryAfter: Math.ceil(60 * 60) // seconds until reset
    });
  }
});

/**
 * Balanced rate limiting for authentication endpoints
 * 100 requests per hour - strict enough for security, flexible for development
 */
const authRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Limit each IP to 100 auth requests per hour
  message: {
    error: 'Too many authentication attempts',
    message: 'Please try again later. Rate limit: 100 attempts per hour.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests, not just failed ones
  handler: (req, res) => {
    console.log(`🔒 Auth rate limit exceeded for IP: ${req.ip}, Route: ${req.originalUrl}`);
    res.status(429).json({
      error: 'Too many authentication attempts',
      message: 'Account security: Too many login attempts. Please wait before trying again.',
      retryAfter: Math.ceil(60 * 60),
      securityNotice: 'This IP has been temporarily blocked due to excessive authentication attempts.'
    });
  }
});

/**
 * Moderate rate limiting for chat endpoints
 * 300 requests per hour to prevent spam while allowing conversation flow
 */
const chatRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 300, // Limit each IP to 300 chat requests per hour
  message: {
    error: 'Too many chat requests',
    message: 'Please slow down your conversation. Rate limit: 300 messages per hour.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`💬 Chat rate limit exceeded for IP: ${req.ip}, Route: ${req.originalUrl}`);
    res.status(429).json({
      error: 'Chat rate limit exceeded',
      message: 'You\'re sending messages too quickly. Please take a moment before continuing the conversation.',
      retryAfter: Math.ceil(60 * 60),
      suggestion: 'Consider taking a break or speaking with a counselor if you need immediate support.'
    });
  }
});

/**
 * Strict rate limiting for sensitive operations
 * 50 requests per hour for critical actions like screenings and escalations
 */
const sensitiveRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each IP to 50 sensitive operations per hour
  message: {
    error: 'Too many sensitive operations',
    message: 'Rate limit for sensitive operations: 50 per hour.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`⚠️  Sensitive operation rate limit exceeded for IP: ${req.ip}, Route: ${req.originalUrl}`);
    res.status(429).json({
      error: 'Sensitive operation rate limit exceeded',
      message: 'Too many sensitive operations attempted. Please contact support if this is urgent.',
      retryAfter: Math.ceil(60 * 60)
    });
  }
});

/**
 * Relaxed rate limiting for public endpoints
 * 200 requests per hour for non-sensitive public data
 */
const publicRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 200, // Limit each IP to 200 requests per hour
  message: {
    error: 'Too many requests',
    message: 'Rate limit: 200 requests per hour.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`📋 Public rate limit exceeded for IP: ${req.ip}, Route: ${req.originalUrl}`);
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many requests to public endpoints. Please try again later.',
      retryAfter: Math.ceil(60 * 60)
    });
  }
});

/**
 * Custom rate limit factory for specific use cases
 * @param {number} max - Maximum requests per window
 * @param {number} windowMs - Time window in milliseconds
 * @param {string} message - Custom error message
 * @returns {Function} Rate limit middleware
 */
const createCustomRateLimit = (max, windowMs, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Rate limit exceeded',
      message: message || `Too many requests. Limit: ${max} per ${Math.ceil(windowMs / 60000)} minutes.`,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      console.log(`🛠️  Custom rate limit exceeded for IP: ${req.ip}, Route: ${req.originalUrl}, Limit: ${max}/${Math.ceil(windowMs / 60000)}min`);
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: message || `Too many requests. Please wait before trying again.`,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

module.exports = {
  defaultRateLimit,
  authRateLimit,
  chatRateLimit,
  sensitiveRateLimit,
  publicRateLimit,
  createCustomRateLimit
};