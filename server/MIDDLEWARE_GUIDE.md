# Server Middleware Documentation

## Overview

This document explains the rate limiting, audit logging, and validation middleware implemented for the mental health platform API.

## 🛡️ Rate Limiting Middleware

### Location: `server/src/middlewares/rateLimit.js`

### Available Rate Limiters:

#### 1. **defaultRateLimit** (100 req/hour)
- **Usage**: General API endpoints
- **Limit**: 100 requests per hour per IP
- **Applied**: Globally to all routes

#### 2. **authRateLimit** (20 req/hour)
- **Usage**: Authentication endpoints (`/api/v1/auth/*`)
- **Limit**: 20 requests per hour per IP
- **Purpose**: Prevent brute force attacks

#### 3. **chatRateLimit** (50 req/hour)
- **Usage**: Chat endpoints (`/api/v1/chat/*`)
- **Limit**: 50 requests per hour per IP
- **Purpose**: Allow conversation flow while preventing spam

#### 4. **sensitiveRateLimit** (10 req/hour)
- **Usage**: Admin operations, crisis escalations
- **Limit**: 10 requests per hour per IP
- **Purpose**: Protect critical operations

#### 5. **publicRateLimit** (200 req/hour)
- **Usage**: Public, non-sensitive endpoints
- **Limit**: 200 requests per hour per IP
- **Purpose**: Relaxed limits for public data

### Implementation Example:

```javascript
const { authRateLimit, chatRateLimit } = require('../middlewares/rateLimit');

// Apply to specific routes
app.use('/api/v1/auth', authRateLimit, authRoutes);
app.use('/api/v1/chat', chatRateLimit, chatRoutes);
```

### Custom Rate Limits:

```javascript
const { createCustomRateLimit } = require('../middlewares/rateLimit');

// Create custom rate limit: 30 requests per 15 minutes
const customLimit = createCustomRateLimit(30, 15 * 60 * 1000, 'Custom limit exceeded');
app.use('/api/v1/custom', customLimit);
```

---

## 📋 Audit Logging Middleware

### Location: `server/src/middlewares/audit.js`

### MongoDB Model: `server/src/models/AuditLog.js`

### Available Audit Middlewares:

#### 1. **auditMiddleware()** - Standard Logging
- Logs sensitive actions only (by default)
- Configurable options for logging all requests

#### 2. **authAuditMiddleware** - Authentication Logging
- Logs all authentication attempts
- Excludes password data for security

#### 3. **adminAuditMiddleware** - Admin Action Logging
- Logs all admin operations
- Includes request body for full context

#### 4. **crisisAuditMiddleware** - Crisis Situation Logging
- Logs crisis-related actions with full context
- Includes both request and response data

### Logged Information:

```javascript
{
  method: 'POST',
  route: '/api/v1/screenings',
  originalUrl: '/api/v1/screenings',
  userId: ObjectId('...'),
  userEmail: 'user@example.com',
  userRole: 'student',
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  action: 'screening_submit',
  statusCode: 200,
  responseTime: 245, // milliseconds
  resourceId: 'screening_123',
  details: {
    assessmentType: 'PHQ-9',
    hasHighRisk: true,
    score: 15
  },
  isSensitive: true,
  requiresReview: false,
  createdAt: '2025-09-25T10:30:00Z'
}
```

### Sensitive Actions Tracked:

- **Authentication**: `login`, `logout`, `register`, `password_reset`
- **Mental Health**: `screening_submit`, `screening_view`
- **Appointments**: `booking_create`, `booking_cancel`, `booking_update`
- **Crisis**: `crisis_escalation`, `emergency_alert`
- **Chat**: `chat_start`, `chat_message`, `chat_end`
- **Forum**: `forum_post`, `forum_reply`, `forum_moderate`
- **Admin**: `admin_action`, `data_export`, `user_update`

### Implementation Example:

```javascript
const { auditMiddleware, authAuditMiddleware } = require('../middlewares/audit');

// Standard audit logging for sensitive routes
app.use('/api/v1/screenings', auditMiddleware(), screeningRoutes);

// Authentication-specific logging
app.use('/api/v1/auth', authAuditMiddleware, authRoutes);

// Custom audit configuration
app.use('/api/v1/custom', auditMiddleware({
  logAllRequests: true,      // Log all requests, not just sensitive ones
  includeRequestBody: true,  // Include request body in logs
  includeResponseBody: false // Exclude response body for privacy
}));
```

---

## 🔧 Integration in Server

### Current Implementation (`server/src/index.js`):

```javascript
// Global middleware applied to all routes
app.use(defaultRateLimit);           // 100 req/hour default
app.use('/api/', auditMiddleware()); // Audit logging for all API calls

// Route-specific middleware
app.use('/api/v1/auth', authRateLimit, authAuditMiddleware, authRoutes);
app.use('/api/v1/chat', chatRateLimit, crisisAuditMiddleware, chatRoutes);
app.use('/api/v1/admin', sensitiveRateLimit, adminAuditMiddleware, adminRoutes);
app.use('/api/v1/screenings', sensitiveRateLimit, crisisAuditMiddleware, screeningRoutes);
```

---

## 📊 AuditLog Model Features

### Static Methods:

```javascript
// Log an action
await AuditLog.logAction(auditData);

// Get user's audit history
const userLogs = await AuditLog.getUserAuditLogs(userId, 50);

// Get sensitive actions requiring review
const sensitiveActions = await AuditLog.getSensitiveActions(100);

// Get failed authentication attempts
const failedAttempts = await AuditLog.getFailedAuthAttempts(24); // last 24 hours
```

### Instance Methods:

```javascript
// Mark log entry for manual review
await auditLogEntry.markForReview('Suspicious activity detected');
```

### Database Features:

- **Indexes**: Optimized queries for userId, action, IP address, timestamps
- **TTL**: Auto-deletion after 2 years (GDPR compliance)
- **Error Handling**: Graceful failure without breaking main application

---

## 🚨 Security Features

### Rate Limiting Protection:

1. **Brute Force Prevention**: Strict limits on auth endpoints
2. **DDoS Mitigation**: Global rate limiting across all endpoints
3. **Resource Protection**: Different limits for different endpoint types
4. **IP-based Tracking**: Per-IP request counting

### Audit Trail Benefits:

1. **Compliance**: HIPAA, GDPR audit requirements
2. **Security Monitoring**: Track suspicious activities
3. **Incident Response**: Full request/response context
4. **User Activity**: Complete action history per user
5. **Performance Monitoring**: Response time tracking

### Crisis Detection Integration:

- Audit logs automatically flag crisis-related actions
- Real-time logging of screening results, chat safety triggers
- Integration with Socket.io alert system for immediate notification

---

## 📈 Monitoring & Analytics

### Console Logging:

All sensitive actions are logged to console with format:
```
📋 AUDIT: screening_submit | User: student@college.edu | Status: 200 | Route: /api/v1/screenings | IP: 192.168.1.1
```

### Database Queries for Analytics:

```javascript
// Most active users in last 7 days
await AuditLog.aggregate([
  { $match: { createdAt: { $gte: sevenDaysAgo } } },
  { $group: { _id: '$userId', count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 10 }
]);

// Failed authentication attempts by IP
await AuditLog.aggregate([
  { $match: { action: 'login', statusCode: { $gte: 400 } } },
  { $group: { _id: '$ipAddress', attempts: { $sum: 1 } } },
  { $sort: { attempts: -1 } }
]);

// Crisis escalations over time
await AuditLog.aggregate([
  { $match: { action: 'crisis_escalation' } },
  { $group: { 
    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
    count: { $sum: 1 }
  }},
  { $sort: { _id: 1 } }
]);
```

---

## 🛠️ Customization

### Adding New Rate Limits:

```javascript
// In your route file
const { createCustomRateLimit } = require('../middlewares/rateLimit');

const customLimit = createCustomRateLimit(
  50,                    // max requests
  30 * 60 * 1000,       // 30 minutes window
  'Custom rate exceeded' // error message
);

router.use(customLimit);
```

### Adding New Audit Actions:

1. Update `routeActionMap` in `audit.js`
2. Add action to `sensitiveActions` array if sensitive
3. Add case in `extractActionDetails()` for custom context

### Environment Configuration:

```env
# .env file
RATE_LIMIT_WINDOW_MS=3600000  # 1 hour
RATE_LIMIT_MAX_REQUESTS=100
AUDIT_LOG_ALL_REQUESTS=false
AUDIT_INCLUDE_RESPONSE_BODY=false
```

---

## 🧪 Testing

### Rate Limit Testing:

```bash
# Test auth rate limit (should block after 20 requests)
for i in {1..25}; do
  curl -X POST http://localhost:8000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
```

### Audit Log Verification:

```javascript
// Check if audit logs are being created
const recentLogs = await AuditLog.find()
  .sort({ createdAt: -1 })
  .limit(10);

console.log('Recent audit logs:', recentLogs);
```

This middleware system provides comprehensive security, monitoring, and compliance features for the mental health platform while maintaining performance and user experience.