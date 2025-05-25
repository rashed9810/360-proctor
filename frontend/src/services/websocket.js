/**
 * WebSocket Service for Real-time Communication
 * Handles real-time notifications, proctoring updates, and live data
 */

class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000;
    this.listeners = new Map();
    this.isConnected = false;
    this.heartbeatInterval = null;
    this.heartbeatTimeout = null;
  }

  /**
   * Connect to WebSocket server
   */
  connect(token) {
    try {
      const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws';
      const url = `${wsUrl}?token=${token}`;
      
      this.socket = new WebSocket(url);
      
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
      
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Handle WebSocket connection open
   */
  handleOpen(event) {
    console.log('WebSocket connected');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    
    // Start heartbeat
    this.startHeartbeat();
    
    // Emit connection event
    this.emit('connected', { timestamp: new Date() });
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(event) {
    try {
      const data = JSON.parse(event.data);
      
      // Handle heartbeat response
      if (data.type === 'pong') {
        this.handlePong();
        return;
      }
      
      // Emit message to listeners
      this.emit(data.type, data.payload);
      
      // Handle specific message types
      switch (data.type) {
        case 'notification':
          this.handleNotification(data.payload);
          break;
        case 'violation':
          this.handleViolation(data.payload);
          break;
        case 'exam_update':
          this.handleExamUpdate(data.payload);
          break;
        case 'student_status':
          this.handleStudentStatus(data.payload);
          break;
        case 'proctoring_alert':
          this.handleProctoringAlert(data.payload);
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
      
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  /**
   * Handle WebSocket connection close
   */
  handleClose(event) {
    console.log('WebSocket disconnected:', event.code, event.reason);
    this.isConnected = false;
    this.stopHeartbeat();
    
    // Emit disconnection event
    this.emit('disconnected', { 
      code: event.code, 
      reason: event.reason,
      timestamp: new Date()
    });
    
    // Schedule reconnection if not intentional
    if (event.code !== 1000) {
      this.scheduleReconnect();
    }
  }

  /**
   * Handle WebSocket errors
   */
  handleError(error) {
    console.error('WebSocket error:', error);
    this.emit('error', { error, timestamp: new Date() });
  }

  /**
   * Schedule reconnection attempt
   */
  scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Scheduling reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      setTimeout(() => {
        if (!this.isConnected) {
          this.connect();
        }
      }, this.reconnectInterval * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('max_reconnect_attempts', { attempts: this.reconnectAttempts });
    }
  }

  /**
   * Start heartbeat to keep connection alive
   */
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.send('ping', { timestamp: Date.now() });
        
        // Set timeout for pong response
        this.heartbeatTimeout = setTimeout(() => {
          console.warn('Heartbeat timeout - connection may be lost');
          this.socket?.close();
        }, 10000);
      }
    }, 30000); // Send ping every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  /**
   * Handle pong response
   */
  handlePong() {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  /**
   * Send message to WebSocket server
   */
  send(type, payload = {}) {
    if (this.isConnected && this.socket) {
      const message = JSON.stringify({ type, payload });
      this.socket.send(message);
    } else {
      console.warn('WebSocket not connected, message not sent:', type);
    }
  }

  /**
   * Subscribe to WebSocket events
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Emit event to listeners
   */
  emit(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket event callback:', error);
        }
      });
    }
  }

  /**
   * Handle notification messages
   */
  handleNotification(payload) {
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(payload.title, {
        body: payload.message,
        icon: '/favicon.ico',
        tag: payload.id,
      });
    }
  }

  /**
   * Handle violation alerts
   */
  handleViolation(payload) {
    console.log('Violation detected:', payload);
    // This will be handled by the proctoring interface
  }

  /**
   * Handle exam updates
   */
  handleExamUpdate(payload) {
    console.log('Exam update:', payload);
    // This will be handled by exam components
  }

  /**
   * Handle student status updates
   */
  handleStudentStatus(payload) {
    console.log('Student status update:', payload);
    // This will be handled by monitoring components
  }

  /**
   * Handle proctoring alerts
   */
  handleProctoringAlert(payload) {
    console.log('Proctoring alert:', payload);
    // This will be handled by proctoring components
  }

  /**
   * Join a room for targeted messages
   */
  joinRoom(roomId) {
    this.send('join_room', { room_id: roomId });
  }

  /**
   * Leave a room
   */
  leaveRoom(roomId) {
    this.send('leave_room', { room_id: roomId });
  }

  /**
   * Subscribe to exam updates
   */
  subscribeToExam(examId) {
    this.send('subscribe_exam', { exam_id: examId });
  }

  /**
   * Unsubscribe from exam updates
   */
  unsubscribeFromExam(examId) {
    this.send('unsubscribe_exam', { exam_id: examId });
  }

  /**
   * Send proctoring data
   */
  sendProctoringData(examId, data) {
    this.send('proctoring_data', {
      exam_id: examId,
      ...data
    });
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    this.isConnected = false;
    this.stopHeartbeat();
    
    if (this.socket) {
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      readyState: this.socket?.readyState,
    };
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;
