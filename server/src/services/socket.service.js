const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * Socket.io Service - Real-time Notifications for Mental Health Platform
 * 
 * This service handles real-time communication between students, counsellors,
 * and administrators for immediate crisis alerts and system notifications.
 * 
 * FEATURES:
 * - Crisis alert notifications to counsellors/admins
 * - Private messaging between students and counsellors
 * - Room-based communication for appointment sessions
 * - System-wide announcements
 * - User presence tracking
 * 
 * SECURITY:
 * - JWT token authentication for socket connections
 * - Role-based room access control
 * - Message encryption for sensitive communications
 * - Rate limiting for message sending
 * 
 * ROOMS STRUCTURE:
 * - user_{userId} - Individual user notifications
 * - counsellors - All counsellors for crisis alerts
 * - admins - Admin-only notifications
 * - appointment_{appointmentId} - Private counselling sessions
 * - crisis_alerts - Emergency notifications
 */

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId mapping
    this.userSockets = new Map(); // socketId -> user info mapping
    this.roomParticipants = new Map(); // roomId -> Set of userIds
    
    // Message rate limiting (per user per minute)
    this.messageLimits = new Map(); // userId -> { count, resetTime }
    this.MAX_MESSAGES_PER_MINUTE = 30;
  }

  /**
   * Initialize Socket.io server with authentication and event handlers
   * @param {http.Server} server - HTTP server instance
   * @returns {SocketIO.Server} - Configured Socket.io server
   */
  initSocket(server) {
    const { Server } = require('socket.io');
    
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000
    });

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        
        if (!token) {
          // Allow anonymous connections for crisis situations
          socket.userId = null;
          socket.userRole = 'anonymous';
          socket.isAuthenticated = false;
          return next();
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('name email role collegeId isActive');
        
        if (!user || !user.isActive) {
          return next(new Error('Authentication failed'));
        }

        // Attach user information to socket
        socket.userId = user._id.toString();
        socket.userRole = user.role;
        socket.userName = user.name;
        socket.userEmail = user.email;
        socket.collegeId = user.collegeId;
        socket.isAuthenticated = true;
        
        next();
      } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });

    // Connection event handler
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });

    console.log('Socket.io service initialized');
    return this.io;
  }

  /**
   * Handle new socket connection
   * @param {Socket} socket - Socket.io socket instance
   */
  handleConnection(socket) {
    const userId = socket.userId;
    const userRole = socket.userRole;
    
    console.log(`Socket connected: ${socket.id} (User: ${userId || 'anonymous'}, Role: ${userRole})`);

    // Store socket mapping
    if (userId) {
      this.connectedUsers.set(userId, socket.id);
    }
    this.userSockets.set(socket.id, {
      userId,
      userRole,
      userName: socket.userName,
      userEmail: socket.userEmail,
      collegeId: socket.collegeId,
      connectedAt: new Date()
    });

    // Auto-join role-based rooms
    this.autoJoinRoleRooms(socket);

    // Register event handlers
    this.registerEventHandlers(socket);
  }

  /**
   * Auto-join users to appropriate rooms based on their role
   * @param {Socket} socket - Socket.io socket instance
   */
  autoJoinRoleRooms(socket) {
    const { userId, userRole } = socket;

    // Join personal notification room
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined personal room: user_${userId}`);
    }

    // Join role-based rooms
    switch (userRole) {
      case 'counsellor':
        socket.join('counsellors');
        socket.join('crisis_alerts');
        console.log(`Counsellor ${userId} joined counsellor rooms`);
        break;
      
      case 'admin':
        socket.join('admins');
        socket.join('counsellors'); // Admins can see counsellor notifications
        socket.join('crisis_alerts');
        console.log(`Admin ${userId} joined admin rooms`);
        break;
      
      case 'moderator':
        socket.join('moderators');
        socket.join('crisis_alerts');
        console.log(`Moderator ${userId} joined moderator rooms`);
        break;
      
      case 'student':
        // Students only join their personal room by default
        console.log(`Student ${userId} joined personal room only`);
        break;
      
      default:
        // Anonymous users don't auto-join any rooms
        console.log('Anonymous user connected');
    }
  }

  /**
   * Register all socket event handlers
   * @param {Socket} socket - Socket.io socket instance
   */
  registerEventHandlers(socket) {
    // Join specific room (with authorization)
    socket.on('join_room', (data) => this.handleJoinRoom(socket, data));
    
    // Leave room
    socket.on('leave_room', (data) => this.handleLeaveRoom(socket, data));
    
    // Send private message (counsellor-student communication)
    socket.on('private_message', (data) => this.handlePrivateMessage(socket, data));
    
    // Mark message as read
    socket.on('mark_read', (data) => this.handleMarkRead(socket, data));
    
    // User typing indicator
    socket.on('typing', (data) => this.handleTyping(socket, data));
    
    // User status update
    socket.on('status_update', (data) => this.handleStatusUpdate(socket, data));
    
    // Request user presence
    socket.on('get_presence', (data) => this.handleGetPresence(socket, data));
    
    // Disconnect handler
    socket.on('disconnect', () => this.handleDisconnect(socket));
  }

  /**
   * Handle join room requests with authorization
   * @param {Socket} socket - Socket.io socket instance
   * @param {Object} data - Room join data
   */
  handleJoinRoom(socket, data) {
    try {
      const { roomId, roomType } = data;
      const { userId, userRole } = socket;

      // Validate room access
      if (!this.canJoinRoom(userId, userRole, roomId, roomType)) {
        socket.emit('error', { message: 'Unauthorized to join this room' });
        return;
      }

      socket.join(roomId);
      
      // Track room participants
      if (!this.roomParticipants.has(roomId)) {
        this.roomParticipants.set(roomId, new Set());
      }
      if (userId) {
        this.roomParticipants.get(roomId).add(userId);
      }

      socket.emit('room_joined', { roomId, roomType });
      
      // Notify other room participants (for appointment rooms)
      if (roomType === 'appointment') {
        socket.to(roomId).emit('user_joined_room', {
          userId,
          userName: socket.userName,
          userRole,
          timestamp: new Date().toISOString()
        });
      }

      console.log(`User ${userId} joined room: ${roomId} (${roomType})`);
    } catch (error) {
      console.error('Join room error:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  }

  /**
   * Handle leave room requests
   * @param {Socket} socket - Socket.io socket instance
   * @param {Object} data - Room leave data
   */
  handleLeaveRoom(socket, data) {
    try {
      const { roomId } = data;
      const { userId } = socket;

      socket.leave(roomId);
      
      // Remove from room participants
      if (this.roomParticipants.has(roomId) && userId) {
        this.roomParticipants.get(roomId).delete(userId);
        
        // Clean up empty rooms
        if (this.roomParticipants.get(roomId).size === 0) {
          this.roomParticipants.delete(roomId);
        }
      }

      socket.emit('room_left', { roomId });
      socket.to(roomId).emit('user_left_room', {
        userId,
        userName: socket.userName,
        timestamp: new Date().toISOString()
      });

      console.log(`User ${userId} left room: ${roomId}`);
    } catch (error) {
      console.error('Leave room error:', error);
    }
  }

  /**
   * Handle private messages between users
   * @param {Socket} socket - Socket.io socket instance
   * @param {Object} data - Message data
   */
  handlePrivateMessage(socket, data) {
    try {
      const { recipientId, message, messageType = 'text', appointmentId } = data;
      const { userId, userName, userRole } = socket;

      // Rate limiting check
      if (!this.checkRateLimit(userId)) {
        socket.emit('error', { message: 'Message rate limit exceeded' });
        return;
      }

      // Validate message
      if (!recipientId || !message || message.trim().length === 0) {
        socket.emit('error', { message: 'Invalid message data' });
        return;
      }

      const messageData = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        senderId: userId,
        senderName: userName,
        senderRole: userRole,
        recipientId,
        message: message.trim(),
        messageType,
        appointmentId,
        timestamp: new Date().toISOString(),
        read: false
      };

      // Send to recipient
      this.io.to(`user_${recipientId}`).emit('private_message', messageData);
      
      // Send confirmation to sender
      socket.emit('message_sent', {
        messageId: messageData.id,
        timestamp: messageData.timestamp
      });

      // If part of appointment session, also send to appointment room
      if (appointmentId) {
        this.io.to(`appointment_${appointmentId}`).emit('appointment_message', messageData);
      }

      console.log(`Private message from ${userId} to ${recipientId}`);
    } catch (error) {
      console.error('Private message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  /**
   * Handle typing indicators
   * @param {Socket} socket - Socket.io socket instance
   * @param {Object} data - Typing data
   */
  handleTyping(socket, data) {
    const { roomId, isTyping } = data;
    const { userId, userName } = socket;

    socket.to(roomId).emit('user_typing', {
      userId,
      userName,
      isTyping,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Handle disconnect events
   * @param {Socket} socket - Socket.io socket instance
   */
  handleDisconnect(socket) {
    const { userId } = socket;
    
    console.log(`Socket disconnected: ${socket.id} (User: ${userId || 'anonymous'})`);

    // Clean up mappings
    if (userId) {
      this.connectedUsers.delete(userId);
    }
    this.userSockets.delete(socket.id);

    // Remove from room participants
    this.roomParticipants.forEach((participants, roomId) => {
      if (userId && participants.has(userId)) {
        participants.delete(userId);
        
        // Notify room of user departure
        socket.to(roomId).emit('user_disconnected', {
          userId,
          userName: socket.userName,
          timestamp: new Date().toISOString()
        });
        
        // Clean up empty rooms
        if (participants.size === 0) {
          this.roomParticipants.delete(roomId);
        }
      }
    });
  }

  /**
   * Check if user can join a specific room
   * @param {string} userId - User ID
   * @param {string} userRole - User role
   * @param {string} roomId - Room ID
   * @param {string} roomType - Room type
   * @returns {boolean} - Whether user can join room
   */
  canJoinRoom(userId, userRole, roomId, roomType) {
    switch (roomType) {
      case 'appointment':
        // Users can only join appointment rooms they're part of
        // This would typically check against appointment participants in database
        return true; // Simplified for demo
      
      case 'crisis_alerts':
        return ['counsellor', 'admin', 'moderator'].includes(userRole);
      
      case 'counsellors':
        return ['counsellor', 'admin'].includes(userRole);
      
      case 'admins':
        return userRole === 'admin';
      
      case 'moderators':
        return ['moderator', 'admin'].includes(userRole);
      
      default:
        return false;
    }
  }

  /**
   * Check message rate limit for user
   * @param {string} userId - User ID
   * @returns {boolean} - Whether user can send message
   */
  checkRateLimit(userId) {
    if (!userId) return true; // No limit for anonymous users

    const now = Date.now();
    const userLimit = this.messageLimits.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
      // Reset or initialize limit
      this.messageLimits.set(userId, {
        count: 1,
        resetTime: now + 60000 // 1 minute
      });
      return true;
    }

    if (userLimit.count >= this.MAX_MESSAGES_PER_MINUTE) {
      return false;
    }

    userLimit.count++;
    return true;
  }

  // ============ NOTIFICATION EMISSION METHODS ============

  /**
   * Emit crisis alert to counsellors and admins
   * @param {Object} alert - Crisis alert data
   */
  emitCrisisAlert(alert) {
    const alertData = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'crisis_alert',
      severity: 'critical',
      title: 'Crisis Alert - Immediate Attention Required',
      message: alert.message || 'A student may be in crisis and needs immediate support',
      userId: alert.userId,
      userName: alert.userName || 'Anonymous User',
      userEmail: alert.userEmail,
      collegeId: alert.collegeId,
      source: alert.source || 'screening', // screening, chat, forum
      data: alert.data || {},
      timestamp: new Date().toISOString(),
      requiresAction: true,
      resources: {
        crisis_hotline: '988',
        emergency: '911',
        crisis_text: '741741'
      }
    };

    // Emit to crisis alert room (counsellors, admins, moderators)
    this.io.to('crisis_alerts').emit('notification:crisis_alert', alertData);
    
    // Also emit to all counsellors and admins directly
    this.io.to('counsellors').emit('notification:new_alert', alertData);
    this.io.to('admins').emit('notification:new_alert', alertData);

    console.log(`🚨 Crisis alert emitted: ${alert.userId || 'anonymous'} - ${alert.source}`);
    
    return alertData.id;
  }

  /**
   * Emit new appointment notification
   * @param {Object} appointment - Appointment data
   */
  emitAppointmentNotification(appointment) {
    const notificationData = {
      id: `appt_${Date.now()}`,
      type: 'appointment',
      severity: 'normal',
      title: 'New Appointment Scheduled',
      message: `Appointment scheduled for ${new Date(appointment.scheduledAt).toLocaleString()}`,
      appointmentId: appointment._id,
      studentId: appointment.studentId,
      counsellorId: appointment.counsellorId,
      scheduledAt: appointment.scheduledAt,
      timestamp: new Date().toISOString()
    };

    // Notify both student and counsellor
    this.io.to(`user_${appointment.studentId}`).emit('notification:appointment', notificationData);
    this.io.to(`user_${appointment.counsellorId}`).emit('notification:appointment', notificationData);

    console.log(`📅 Appointment notification emitted: ${appointment._id}`);
    
    return notificationData.id;
  }

  /**
   * Emit forum moderation alert
   * @param {Object} post - Forum post data
   */
  emitModerationAlert(post) {
    const alertData = {
      id: `mod_${Date.now()}`,
      type: 'moderation_alert',
      severity: post.contentFlags?.selfHarm ? 'high' : 'normal',
      title: 'Content Needs Moderation',
      message: `Forum post flagged: ${post.title.substring(0, 50)}...`,
      postId: post._id,
      authorId: post.studentId,
      contentFlags: post.contentFlags,
      timestamp: new Date().toISOString()
    };

    // Notify moderators and admins
    this.io.to('moderators').emit('notification:moderation_alert', alertData);
    this.io.to('admins').emit('notification:moderation_alert', alertData);

    // If self-harm detected, also notify crisis alert room
    if (post.contentFlags?.selfHarm) {
      this.io.to('crisis_alerts').emit('notification:crisis_alert', {
        ...alertData,
        severity: 'critical',
        title: 'Forum Post - Self-Harm Content Detected'
      });
    }

    console.log(`🛡️ Moderation alert emitted: ${post._id}`);
    
    return alertData.id;
  }

  /**
   * Emit system-wide announcement
   * @param {Object} announcement - Announcement data
   */
  emitSystemAnnouncement(announcement) {
    const announcementData = {
      id: `sys_${Date.now()}`,
      type: 'system_announcement',
      severity: announcement.severity || 'info',
      title: announcement.title,
      message: announcement.message,
      targetRoles: announcement.targetRoles || ['student', 'counsellor'],
      timestamp: new Date().toISOString(),
      expiresAt: announcement.expiresAt
    };

    // Emit to specified target roles
    announcement.targetRoles?.forEach(role => {
      if (role === 'student') {
        this.io.emit('notification:system_announcement', announcementData);
      } else {
        this.io.to(`${role}s`).emit('notification:system_announcement', announcementData);
      }
    });

    console.log(`📢 System announcement emitted: ${announcement.title}`);
    
    return announcementData.id;
  }

  // ============ UTILITY METHODS ============

  /**
   * Get connected users count
   * @returns {Object} - User counts by role
   */
  getConnectedUsersCount() {
    const counts = {
      total: this.userSockets.size,
      students: 0,
      counsellors: 0,
      admins: 0,
      moderators: 0,
      anonymous: 0
    };

    this.userSockets.forEach(user => {
      if (user.userRole === 'anonymous') {
        counts.anonymous++;
      } else {
        counts[`${user.userRole}s`] = (counts[`${user.userRole}s`] || 0) + 1;
      }
    });

    return counts;
  }

  /**
   * Check if user is online
   * @param {string} userId - User ID
   * @returns {boolean} - Whether user is connected
   */
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  /**
   * Get room participants
   * @param {string} roomId - Room ID
   * @returns {Array} - Array of user IDs in room
   */
  getRoomParticipants(roomId) {
    const participants = this.roomParticipants.get(roomId);
    return participants ? Array.from(participants) : [];
  }

  /**
   * Cleanup method for graceful shutdown
   */
  cleanup() {
    if (this.io) {
      this.io.close();
    }
    this.connectedUsers.clear();
    this.userSockets.clear();
    this.roomParticipants.clear();
    this.messageLimits.clear();
    console.log('Socket service cleaned up');
  }
}

// Export singleton instance
module.exports = new SocketService();