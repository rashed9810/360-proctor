/**
 * Real-Time Analytics Service
 * Handles WebSocket connections for live analytics data
 */

class RealTimeAnalyticsService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
    this.isConnected = false;
    this.heartbeatInterval = null;
    this.lastHeartbeat = null;
  }

  /**
   * Connect to WebSocket server
   */
  connect() {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/analytics';

    try {
      this.ws = new WebSocket(wsUrl);
      this.setupEventHandlers();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    }
  }

  /**
   * Setup WebSocket event handlers
   */
  setupEventHandlers() {
    this.ws.onopen = () => {
      console.log('Real-time analytics connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.emit('connected', { timestamp: new Date() });
    };

    this.ws.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = event => {
      console.log('Real-time analytics disconnected:', event.code, event.reason);
      this.isConnected = false;
      this.stopHeartbeat();
      this.emit('disconnected', { code: event.code, reason: event.reason });

      if (event.code !== 1000) {
        // Not a normal closure
        this.handleReconnect();
      }
    };

    this.ws.onerror = error => {
      console.error('WebSocket error:', error);
      this.emit('error', { error });
    };
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(data) {
    const { type, payload, timestamp } = data;

    switch (type) {
      case 'analytics_update':
        this.emit('analyticsUpdate', payload);
        break;
      case 'violation_alert':
        this.emit('violationAlert', payload);
        break;
      case 'trust_score_update':
        this.emit('trustScoreUpdate', payload);
        break;
      case 'exam_status_change':
        this.emit('examStatusChange', payload);
        break;
      case 'student_activity':
        this.emit('studentActivity', payload);
        break;
      case 'system_metrics':
        this.emit('systemMetrics', payload);
        break;
      case 'heartbeat':
        this.lastHeartbeat = new Date();
        break;
      default:
        console.warn('Unknown message type:', type);
    }
  }

  /**
   * Start heartbeat to keep connection alive
   */
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
        this.send('heartbeat', { timestamp: new Date() });
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Handle reconnection logic
   */
  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
    }
  }

  /**
   * Send message to WebSocket server
   */
  send(type, payload) {
    if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        type,
        payload,
        timestamp: new Date().toISOString(),
      };
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message:', type);
    }
  }

  /**
   * Subscribe to analytics updates
   */
  subscribeToAnalytics(filters = {}) {
    this.send('subscribe_analytics', {
      filters,
      realTime: true,
    });
  }

  /**
   * Subscribe to violation alerts
   */
  subscribeToViolations(examIds = []) {
    this.send('subscribe_violations', {
      examIds,
      severity: ['high', 'medium'],
    });
  }

  /**
   * Subscribe to trust score updates
   */
  subscribeToTrustScores(studentIds = []) {
    this.send('subscribe_trust_scores', {
      studentIds,
      threshold: 70, // Only get updates for scores below 70%
    });
  }

  /**
   * Subscribe to system metrics
   */
  subscribeToSystemMetrics() {
    this.send('subscribe_system_metrics', {
      metrics: ['cpu', 'memory', 'connections', 'response_time'],
      interval: 5000, // Update every 5 seconds
    });
  }

  /**
   * Request historical data
   */
  requestHistoricalData(type, timeRange) {
    this.send('request_historical_data', {
      type,
      timeRange,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Add event listener
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.isConnected = false;
    this.listeners.clear();
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: this.ws ? this.ws.readyState : WebSocket.CLOSED,
      reconnectAttempts: this.reconnectAttempts,
      lastHeartbeat: this.lastHeartbeat,
    };
  }

  /**
   * Mock real-time data for development
   */
  startMockData() {
    if (import.meta.env.VITE_ENABLE_MOCK_DATA === 'true') {
      console.log('Starting mock real-time analytics data');

      // Mock analytics updates every 5 seconds
      setInterval(() => {
        this.emit('analyticsUpdate', {
          totalExams: Math.floor(Math.random() * 200) + 100,
          activeUsers: Math.floor(Math.random() * 50) + 20,
          violations: Math.floor(Math.random() * 10),
          trustScore: Math.random() * 20 + 80,
          timestamp: new Date(),
        });
      }, 5000);

      // Mock violation alerts randomly
      setInterval(() => {
        if (Math.random() < 0.3) {
          // 30% chance
          this.emit('violationAlert', {
            id: Date.now(),
            type: ['faceNotDetected', 'multipleFaces', 'tabSwitch', 'phoneDetected'][
              Math.floor(Math.random() * 4)
            ],
            studentId: Math.floor(Math.random() * 100) + 1,
            examId: Math.floor(Math.random() * 20) + 1,
            severity: Math.random() > 0.5 ? 'high' : 'medium',
            timestamp: new Date(),
          });
        }
      }, 3000);

      // Mock trust score updates
      setInterval(() => {
        this.emit('trustScoreUpdate', {
          studentId: Math.floor(Math.random() * 100) + 1,
          examId: Math.floor(Math.random() * 20) + 1,
          score: Math.random() * 100,
          change: (Math.random() - 0.5) * 10,
          timestamp: new Date(),
        });
      }, 2000);
    }
  }
}

// Create and export singleton instance
const realTimeAnalyticsService = new RealTimeAnalyticsService();
export default realTimeAnalyticsService;
