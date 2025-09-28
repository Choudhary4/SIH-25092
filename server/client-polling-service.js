// Chat Polling Service for Vercel Deployment
// This replaces Socket.io functionality with HTTP polling

class ChatPollingService {
  constructor(apiBaseUrl = '', pollingInterval = 3000) {
    this.apiBaseUrl = apiBaseUrl;
    this.pollingInterval = pollingInterval;
    this.activeRooms = new Map();
    this.eventListeners = new Map();
    this.isPolling = false;
    this.userId = null;
    this.userName = null;
  }

  // Initialize user
  init(userId, userName) {
    this.userId = userId;
    this.userName = userName;
  }

  // Join a room and start polling
  async joinRoom(roomId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/chat-realtime/rooms/${roomId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.userId,
          userName: this.userName
        })
      });

      const data = await response.json();
      
      if (data.success) {
        this.activeRooms.set(roomId, {
          lastMessageTime: new Date().toISOString(),
          messages: []
        });

        // Start polling for this room if not already polling
        if (!this.isPolling) {
          this.startPolling();
        }

        this.emit('room_joined', { roomId, activeUsers: data.activeUsers });
        return true;
      }
      
      throw new Error(data.message || 'Failed to join room');
    } catch (error) {
      console.error('Error joining room:', error);
      this.emit('error', { type: 'join_room', error: error.message });
      return false;
    }
  }

  // Leave a room
  async leaveRoom(roomId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/chat-realtime/rooms/${roomId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.userId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        this.activeRooms.delete(roomId);
        
        // Stop polling if no active rooms
        if (this.activeRooms.size === 0) {
          this.stopPolling();
        }

        this.emit('room_left', { roomId });
        return true;
      }
      
      throw new Error(data.message || 'Failed to leave room');
    } catch (error) {
      console.error('Error leaving room:', error);
      this.emit('error', { type: 'leave_room', error: error.message });
      return false;
    }
  }

  // Send a message to a room
  async sendMessage(roomId, message, messageType = 'text') {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/chat-realtime/messages/${roomId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          senderId: this.userId,
          senderName: this.userName,
          messageType
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Immediately emit the message to update UI
        this.emit('message', data.message);
        return data.message;
      }
      
      throw new Error(data.message || 'Failed to send message');
    } catch (error) {
      console.error('Error sending message:', error);
      this.emit('error', { type: 'send_message', error: error.message });
      return null;
    }
  }

  // Get message history for a room
  async getMessageHistory(roomId, limit = 50, before = null) {
    try {
      const params = new URLSearchParams({ limit: limit.toString() });
      if (before) params.append('before', before);

      const response = await fetch(
        `${this.apiBaseUrl}/api/chat-realtime/messages/${roomId}?${params}`
      );
      
      const data = await response.json();
      
      if (data.success) {
        return {
          messages: data.messages,
          hasMore: data.hasMore
        };
      }
      
      throw new Error(data.message || 'Failed to get messages');
    } catch (error) {
      console.error('Error getting message history:', error);
      this.emit('error', { type: 'get_messages', error: error.message });
      return { messages: [], hasMore: false };
    }
  }

  // Start polling for new messages
  startPolling() {
    if (this.isPolling) return;
    
    this.isPolling = true;
    this.pollForMessages();
  }

  // Stop polling
  stopPolling() {
    this.isPolling = false;
    if (this.pollingTimeout) {
      clearTimeout(this.pollingTimeout);
    }
  }

  // Poll for new messages in all active rooms
  async pollForMessages() {
    if (!this.isPolling) return;

    try {
      for (const [roomId, roomData] of this.activeRooms) {
        await this.checkForNewMessages(roomId, roomData);
      }
    } catch (error) {
      console.error('Error during polling:', error);
    }

    // Schedule next poll
    if (this.isPolling) {
      this.pollingTimeout = setTimeout(() => {
        this.pollForMessages();
      }, this.pollingInterval);
    }
  }

  // Check for new messages in a specific room
  async checkForNewMessages(roomId, roomData) {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/api/chat-realtime/messages/${roomId}?limit=20&after=${roomData.lastMessageTime}`
      );
      
      const data = await response.json();
      
      if (data.success && data.messages.length > 0) {
        // Filter out messages we already have
        const newMessages = data.messages.filter(msg => 
          new Date(msg.timestamp) > new Date(roomData.lastMessageTime)
        );

        if (newMessages.length > 0) {
          // Update last message time
          const latestMessage = newMessages[newMessages.length - 1];
          roomData.lastMessageTime = latestMessage.timestamp;

          // Emit new messages
          newMessages.forEach(message => {
            this.emit('message', message);
          });
        }
      }
    } catch (error) {
      console.error(`Error checking messages for room ${roomId}:`, error);
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  // Cleanup
  disconnect() {
    this.stopPolling();
    this.activeRooms.clear();
    this.eventListeners.clear();
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/chat-realtime/health`);
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

// Export for use in browser or Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChatPollingService;
} else if (typeof window !== 'undefined') {
  window.ChatPollingService = ChatPollingService;
}

// Usage example:
/*
const chatService = new ChatPollingService('https://your-api.vercel.app');
chatService.init('user123', 'John Doe');

// Listen for events
chatService.on('message', (message) => {
  console.log('New message:', message);
});

chatService.on('room_joined', (data) => {
  console.log('Joined room:', data.roomId);
});

// Join a room and start receiving messages
await chatService.joinRoom('appointment_12345');

// Send a message
await chatService.sendMessage('appointment_12345', 'Hello, world!');

// Get message history
const { messages, hasMore } = await chatService.getMessageHistory('appointment_12345');

// Leave room when done
await chatService.leaveRoom('appointment_12345');
*/