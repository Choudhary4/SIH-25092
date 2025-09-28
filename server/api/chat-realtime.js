// Socket.io Alternative for Vercel Deployment
// Since Vercel doesn't support WebSockets, we'll implement a polling-based chat system

const express = require('express');
const mongoose = require('mongoose');

// Simple in-memory store for active connections (for demo purposes)
// In production, use Redis or a database
let activeConnections = new Map();
let chatRooms = new Map();

const router = express.Router();

// Get messages for a chat room
router.get('/messages/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, before } = req.query;
    
    // In a real implementation, fetch from database
    const messages = chatRooms.get(roomId) || [];
    
    let filteredMessages = messages;
    if (before) {
      const beforeDate = new Date(before);
      filteredMessages = messages.filter(msg => new Date(msg.timestamp) < beforeDate);
    }
    
    // Sort by timestamp and limit
    const sortedMessages = filteredMessages
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, parseInt(limit));
    
    res.json({
      success: true,
      messages: sortedMessages.reverse(), // Reverse to show chronologically
      hasMore: messages.length > sortedMessages.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message
    });
  }
});

// Send a message to a chat room
router.post('/messages/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { message, senderId, senderName, messageType = 'text' } = req.body;
    
    if (!message || !senderId || !senderName) {
      return res.status(400).json({
        success: false,
        message: 'Message, senderId, and senderName are required'
      });
    }
    
    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: message.trim(),
      senderId,
      senderName,
      messageType,
      timestamp: new Date().toISOString(),
      roomId
    };
    
    // Store message in room
    if (!chatRooms.has(roomId)) {
      chatRooms.set(roomId, []);
    }
    
    const roomMessages = chatRooms.get(roomId);
    roomMessages.push(newMessage);
    
    // Keep only last 1000 messages per room
    if (roomMessages.length > 1000) {
      roomMessages.splice(0, roomMessages.length - 1000);
    }
    
    // In production, save to database here
    // await Message.create(newMessage);
    
    res.json({
      success: true,
      message: newMessage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
});

// Join a chat room
router.post('/rooms/:roomId/join', (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId, userName } = req.body;
    
    if (!userId || !userName) {
      return res.status(400).json({
        success: false,
        message: 'userId and userName are required'
      });
    }
    
    // Track active connection
    activeConnections.set(userId, {
      userId,
      userName,
      roomId,
      joinedAt: new Date().toISOString(),
      lastSeen: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'Successfully joined room',
      roomId,
      activeUsers: Array.from(activeConnections.values()).filter(user => user.roomId === roomId)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error joining room',
      error: error.message
    });
  }
});

// Leave a chat room
router.post('/rooms/:roomId/leave', (req, res) => {
  try {
    const { userId } = req.body;
    
    if (activeConnections.has(userId)) {
      activeConnections.delete(userId);
    }
    
    res.json({
      success: true,
      message: 'Successfully left room'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error leaving room',
      error: error.message
    });
  }
});

// Get active users in a room
router.get('/rooms/:roomId/users', (req, res) => {
  try {
    const { roomId } = req.params;
    
    const activeUsers = Array.from(activeConnections.values())
      .filter(user => user.roomId === roomId)
      .map(user => ({
        userId: user.userId,
        userName: user.userName,
        joinedAt: user.joinedAt,
        lastSeen: user.lastSeen
      }));
    
    res.json({
      success: true,
      activeUsers,
      count: activeUsers.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting active users',
      error: error.message
    });
  }
});

// Health check for chat service
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'Chat service running',
    activeConnections: activeConnections.size,
    activeRooms: chatRooms.size,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;