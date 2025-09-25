const AuditLog = require('../models/AuditLog');

/**
 * Map routes to audit actions for better categorization
 */
const routeActionMap = {
  // Authentication routes
  '/api/v1/auth/login': 'login',
  '/api/v1/auth/logout': 'logout', 
  '/api/v1/auth/register': 'register',
  '/api/v1/auth/reset-password': 'password_reset',
  
  // Screening routes
  '/api/v1/screenings': 'screening_submit',
  '/api/v1/screenings/': 'screening_view',
  
  // Booking routes
  '/api/v1/bookings': 'booking_create',
  '/api/v1/bookings/cancel': 'booking_cancel',
  '/api/v1/bookings/update': 'booking_update',
  
  // Chat routes
  '/api/v1/chat/start': 'chat_start',
  '/api/v1/chat/message': 'chat_message',
  '/api/v1/chat/end': 'chat_end',
  
  // Forum routes
  '/api/v1/forum/posts': 'forum_post',
  '/api/v1/forum/posts/reply': 'forum_reply',
  '/api/v1/forum/moderate': 'forum_moderate',
  
  // Admin routes
  '/api/v1/admin': 'admin_action',
  '/api/v1/admin/export': 'data_export',
  '/api/v1/admin/users': 'user_update',
  
  // Crisis and escalation
  '/api/v1/crisis': 'crisis_escalation',
  '/api/v1/emergency': 'emergency_alert'
};

/**
 * Determine if a route/action is sensitive and requires detailed logging
 */
const sensitiveRoutes = [
  '/api/v1/screenings',
  '/api/v1/chat',
  '/api/v1/bookings',
  '/api/v1/crisis',
  '/api/v1/emergency',
  '/api/v1/admin',
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/forum/moderate'
];

const sensitiveActions = [
  'screening_submit', 'screening_view',
  'booking_create', 'booking_cancel', 'booking_update',
  'crisis_escalation', 'emergency_alert',
  'chat_start', 'chat_message', 'chat_end',
  'admin_action', 'data_export', 'user_update',
  'forum_moderate',
  'login', 'register'
];

/**
 * Get the appropriate action based on the route and method
 */
const getActionFromRoute = (route, method) => {
  // Check exact match first
  if (routeActionMap[route]) {
    return routeActionMap[route];
  }
  
  // Check for partial matches
  for (const [routePattern, action] of Object.entries(routeActionMap)) {
    if (route.startsWith(routePattern)) {
      return action;
    }
  }
  
  // Default action based on method and route patterns
  if (route.includes('/auth/')) return 'login';
  if (route.includes('/screenings')) return method === 'POST' ? 'screening_submit' : 'screening_view';
  if (route.includes('/bookings')) return method === 'POST' ? 'booking_create' : 'booking_update';
  if (route.includes('/chat/')) return 'chat_message';
  if (route.includes('/forum/')) return 'forum_post';
  if (route.includes('/admin/')) return 'admin_action';
  if (route.includes('/crisis') || route.includes('/emergency')) return 'crisis_escalation';
  
  return 'api_access';
};

/**
 * Check if route/action is sensitive and requires detailed audit logging
 */
const isSensitiveRoute = (route, action) => {
  // Check if route matches sensitive patterns
  const routeIsSensitive = sensitiveRoutes.some(sensitiveRoute => 
    route.startsWith(sensitiveRoute)
  );
  
  // Check if action is sensitive
  const actionIsSensitive = sensitiveActions.includes(action);
  
  return routeIsSensitive || actionIsSensitive;
};

/**
 * Extract additional details from request based on the action type
 */
const extractActionDetails = (req, action) => {
  const details = {};
  
  switch (action) {
    case 'screening_submit':
      if (req.body) {
        details.assessmentType = req.body.type || 'unknown';
        details.hasHighRisk = req.body.isHighRisk || false;
        details.score = req.body.totalScore || null;
      }
      break;
      
    case 'booking_create':
    case 'booking_update':
    case 'booking_cancel':
      if (req.body) {
        details.appointmentDate = req.body.appointmentDate;
        details.counsellorId = req.body.counsellorId;
        details.bookingType = req.body.type;
      }
      if (req.params.id) {
        details.bookingId = req.params.id;
      }
      break;
      
    case 'chat_message':
      if (req.body) {
        details.messageLength = req.body.message ? req.body.message.length : 0;
        details.hasRisk = req.body.hasRisk || false;
        details.sessionId = req.body.sessionId;
      }
      break;
      
    case 'forum_post':
    case 'forum_reply':
      if (req.body) {
        details.postTitle = req.body.title ? req.body.title.substring(0, 50) : null;
        details.contentLength = req.body.content ? req.body.content.length : 0;
        details.isAnonymous = req.body.isAnonymous || false;
        details.hasFlags = req.body.contentFlags && req.body.contentFlags.length > 0;
      }
      break;
      
    case 'crisis_escalation':
    case 'emergency_alert':
      if (req.body) {
        details.escalationType = req.body.type;
        details.severity = req.body.severity;
        details.triggerSource = req.body.source; // 'screening', 'chat', 'forum', etc.
      }
      break;
      
    case 'login':
      details.loginAttempt = true;
      details.email = req.body ? req.body.email : null;
      break;
      
    case 'admin_action':
      if (req.body) {
        details.adminAction = req.body.action;
        details.targetUserId = req.body.targetUserId;
      }
      break;
  }
  
  return details;
};

/**
 * Main audit logging middleware
 * Logs sensitive actions to MongoDB for compliance and security monitoring
 */
const auditMiddleware = (options = {}) => {
  const {
    logAllRequests = false, // Set to true to log all requests, not just sensitive ones
    includeRequestBody = false, // Set to true to include request body in logs (careful with sensitive data)
    includeResponseBody = false // Set to true to include response body in logs
  } = options;
  
  return (req, res, next) => {
    const startTime = Date.now();
    
    // Capture the original response methods
    const originalSend = res.send;
    const originalJson = res.json;
    
    let responseBody = null;
    
    // Override response methods to capture response data if needed
    if (includeResponseBody) {
      res.send = function(data) {
        responseBody = data;
        return originalSend.call(this, data);
      };
      
      res.json = function(data) {
        responseBody = data;
        return originalJson.call(this, data);
      };
    }
    
    // When the response finishes, log the audit entry
    res.on('finish', async () => {
      try {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        const route = req.route ? req.route.path : req.path;
        const action = getActionFromRoute(req.originalUrl, req.method);
        const isSensitive = isSensitiveRoute(req.originalUrl, action);
        
        // Skip logging if not sensitive and not configured to log all requests
        if (!isSensitive && !logAllRequests) {
          return;
        }
        
        // Extract user information from JWT token if available
        let userId = null;
        let userEmail = null;
        let userRole = 'anonymous';
        
        if (req.user) {
          userId = req.user.id || req.user._id;
          userEmail = req.user.email;
          userRole = req.user.role || 'student';
        }
        
        // Extract additional details based on the action
        const actionDetails = extractActionDetails(req, action);
        
        // Prepare audit log data
        const auditData = {
          method: req.method,
          route: req.route ? req.route.path : req.path,
          originalUrl: req.originalUrl,
          userId,
          userEmail,
          userRole,
          ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
          userAgent: req.get('User-Agent'),
          action,
          statusCode: res.statusCode,
          responseTime,
          resourceId: req.params.id || null,
          details: {
            ...actionDetails,
            ...(includeRequestBody && req.body ? { requestBody: req.body } : {}),
            ...(includeResponseBody && responseBody ? { responseBody } : {}),
            headers: {
              referer: req.get('Referer'),
              origin: req.get('Origin')
            }
          },
          isSensitive,
          requiresReview: res.statusCode >= 400 && isSensitive // Flag failed sensitive operations for review
        };
        
        // Add error details if response indicates an error
        if (res.statusCode >= 400 && responseBody) {
          try {
            const errorData = typeof responseBody === 'string' ? JSON.parse(responseBody) : responseBody;
            auditData.error = {
              message: errorData.message || errorData.error,
              code: errorData.code
            };
          } catch (e) {
            // If response body is not JSON, just log the status
            auditData.error = {
              message: `HTTP ${res.statusCode} Error`,
              code: res.statusCode.toString()
            };
          }
        }
        
        // Log to database asynchronously
        await AuditLog.logAction(auditData);
        
        // Log sensitive actions to console for immediate visibility
        if (isSensitive) {
          console.log(`📋 AUDIT: ${action} | User: ${userEmail || 'anonymous'} | Status: ${res.statusCode} | Route: ${req.originalUrl} | IP: ${auditData.ipAddress}`);
        }
        
      } catch (error) {
        console.error('Audit logging failed:', error);
        // Don't throw error to prevent breaking the application
      }
    });
    
    next();
  };
};

/**
 * Middleware specifically for logging authentication attempts
 */
const authAuditMiddleware = auditMiddleware({
  logAllRequests: true, // Log all auth requests, successful or not
  includeRequestBody: false // Don't log passwords
});

/**
 * Middleware for logging admin actions
 */
const adminAuditMiddleware = auditMiddleware({
  logAllRequests: true,
  includeRequestBody: true, // Include request body for admin actions
  includeResponseBody: false
});

/**
 * Middleware for logging crisis-related actions
 */
const crisisAuditMiddleware = auditMiddleware({
  logAllRequests: true,
  includeRequestBody: true,
  includeResponseBody: true // Full context for crisis situations
});

module.exports = {
  auditMiddleware,
  authAuditMiddleware,
  adminAuditMiddleware,
  crisisAuditMiddleware
};