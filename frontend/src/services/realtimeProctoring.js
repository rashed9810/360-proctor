/**
 * Real-time Proctoring Service for 360° Proctor
 * Handles WebSocket communication and AI-powered violation detection
 */

import { toast } from 'react-hot-toast';

class RealtimeProctoringService {
  constructor() {
    this.websocket = null;
    this.isConnected = false;
    this.sessionId = null;
    this.userId = null;
    this.callbacks = {
      onViolation: [],
      onTrustScoreUpdate: [],
      onFrameAnalysis: [],
      onError: [],
      onConnect: [],
      onDisconnect: [],
    };
    this.mediaStream = null;
    this.videoElement = null;
    this.canvas = null;
    this.frameInterval = null;
    this.heartbeatInterval = null;
  }

  /**
   * Initialize proctoring session
   */
  async initializeSession(sessionId, userId, examDuration = 60) {
    try {
      this.sessionId = sessionId;
      this.userId = userId;
      this.examDuration = examDuration;

      // Connect WebSocket
      await this.connectWebSocket();

      // Initialize camera
      await this.initializeCamera();

      // Start frame capture
      this.startFrameCapture();

      // Start heartbeat
      this.startHeartbeat();

      // Setup browser event listeners
      this.setupBrowserEventListeners();

      toast.success('Proctoring session initialized successfully');
      this.triggerCallbacks('onConnect', { sessionId, userId });
    } catch (error) {
      console.error('Failed to initialize proctoring session:', error);
      toast.error('Failed to initialize proctoring session');
      this.triggerCallbacks('onError', error);
      throw error;
    }
  }

  /**
   * Connect to WebSocket
   */
  async connectWebSocket() {
    return new Promise((resolve, reject) => {
      const wsUrl = `ws://localhost:8000/api/v1/proctoring/${this.sessionId}`;

      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        resolve();
      };

      this.websocket.onmessage = event => {
        this.handleWebSocketMessage(JSON.parse(event.data));
      };

      this.websocket.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.triggerCallbacks('onDisconnect');
      };

      this.websocket.onerror = error => {
        console.error('WebSocket error:', error);
        this.triggerCallbacks('onError', error);
        reject(error);
      };

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!this.isConnected) {
          reject(new Error('WebSocket connection timeout'));
        }
      }, 10000);
    });
  }

  /**
   * Initialize camera and video stream
   */
  async initializeCamera() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 15 },
        },
        audio: true,
      });

      // Create video element
      this.videoElement = document.createElement('video');
      this.videoElement.srcObject = this.mediaStream;
      this.videoElement.autoplay = true;
      this.videoElement.muted = true;

      // Create canvas for frame capture
      this.canvas = document.createElement('canvas');
      this.canvas.width = 640;
      this.canvas.height = 480;

      console.log('Camera initialized successfully');
    } catch (error) {
      console.error('Failed to initialize camera:', error);
      throw new Error('Camera access required for proctoring');
    }
  }

  /**
   * Start capturing and analyzing frames
   */
  startFrameCapture() {
    this.frameInterval = setInterval(() => {
      if (this.videoElement && this.canvas && this.isConnected) {
        this.captureAndAnalyzeFrame();
      }
    }, 2000); // Capture frame every 2 seconds
  }

  /**
   * Capture frame and send for analysis
   */
  captureAndAnalyzeFrame() {
    try {
      const ctx = this.canvas.getContext('2d');
      ctx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);

      // Convert to base64
      const frameData = this.canvas.toDataURL('image/jpeg', 0.8);

      // Send frame data to backend
      this.sendMessage({
        type: 'frame_data',
        frame: frameData,
        user_id: this.userId,
        timestamp: new Date().toISOString(),
        exam_duration: this.examDuration,
        current_time: this.getCurrentExamTime(),
      });
    } catch (error) {
      console.error('Error capturing frame:', error);
    }
  }

  /**
   * Setup browser event listeners for violation detection
   */
  setupBrowserEventListeners() {
    // Tab switch detection
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.sendBrowserEvent('tab_switch', {
          hidden: true,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Window blur detection
    window.addEventListener('blur', () => {
      this.sendBrowserEvent('window_blur', {
        timestamp: new Date().toISOString(),
      });
    });

    // Right-click detection
    document.addEventListener('contextmenu', e => {
      this.sendBrowserEvent('right_click', {
        x: e.clientX,
        y: e.clientY,
        timestamp: new Date().toISOString(),
      });
    });

    // Copy/paste detection
    document.addEventListener('copy', () => {
      this.sendBrowserEvent('copy_paste', {
        action: 'copy',
        timestamp: new Date().toISOString(),
      });
    });

    document.addEventListener('paste', () => {
      this.sendBrowserEvent('copy_paste', {
        action: 'paste',
        timestamp: new Date().toISOString(),
      });
    });

    // Fullscreen exit detection
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) {
        this.sendBrowserEvent('fullscreen_exit', {
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Keyboard shortcuts detection
    document.addEventListener('keydown', e => {
      // Detect common cheating shortcuts
      if (e.ctrlKey || e.metaKey) {
        const suspiciousKeys = ['c', 'v', 'a', 't', 'w', 'r', 'f'];
        if (suspiciousKeys.includes(e.key.toLowerCase())) {
          this.sendBrowserEvent('keyboard_shortcut', {
            key: e.key,
            ctrl: e.ctrlKey,
            meta: e.metaKey,
            timestamp: new Date().toISOString(),
          });
        }
      }
    });
  }

  /**
   * Send browser event to backend
   */
  sendBrowserEvent(eventType, eventData) {
    this.sendMessage({
      type: 'browser_event',
      event: {
        type: eventType,
        ...eventData,
      },
      user_id: this.userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Start heartbeat to keep connection alive
   */
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.sendMessage({
          type: 'heartbeat',
          timestamp: new Date().toISOString(),
          session_id: this.sessionId,
        });
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleWebSocketMessage(message) {
    console.log('Received message:', message);

    switch (message.type) {
      case 'frame_analysis':
        this.handleFrameAnalysis(message);
        break;
      case 'browser_event_processed':
        this.handleBrowserEventProcessed(message);
        break;
      case 'violation_detected':
        this.handleViolationDetected(message);
        break;
      case 'trust_score_update':
        this.handleTrustScoreUpdate(message);
        break;
      case 'error':
        this.handleError(message);
        break;
      case 'heartbeat_ack':
        // Heartbeat acknowledged
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  /**
   * Handle frame analysis results
   */
  handleFrameAnalysis(message) {
    const { ai_results, violations, trust_score } = message;

    // Trigger callbacks
    this.triggerCallbacks('onFrameAnalysis', {
      aiResults: ai_results,
      violations,
      trustScore: trust_score,
    });

    // Handle violations
    if (violations && violations.length > 0) {
      violations.forEach(violation => {
        this.handleViolation(violation);
      });
    }

    // Update trust score
    if (trust_score) {
      this.triggerCallbacks('onTrustScoreUpdate', trust_score);
    }
  }

  /**
   * Handle violation detection
   */
  handleViolation(violation) {
    console.warn('Violation detected:', violation);

    // Show toast notification based on severity
    const message = `${violation.description} (${violation.confidence * 100}% confidence)`;

    switch (violation.severity) {
      case 'critical':
        toast.error(message, { duration: 5000 });
        break;
      case 'high':
        toast.error(message, { duration: 4000 });
        break;
      case 'medium':
        toast(
          t => (
            <div className="flex items-center">
              <span className="text-yellow-600">⚠️</span>
              <span className="ml-2">{message}</span>
            </div>
          ),
          { duration: 3000 }
        );
        break;
      case 'low':
        toast(message, { duration: 2000 });
        break;
    }

    // Trigger violation callback
    this.triggerCallbacks('onViolation', violation);
  }

  /**
   * Handle browser event processing
   */
  handleBrowserEventProcessed(message) {
    if (message.violations && message.violations.length > 0) {
      message.violations.forEach(violation => {
        this.handleViolation(violation);
      });
    }
  }

  /**
   * Handle violation detected message
   */
  handleViolationDetected(message) {
    this.handleViolation(message);
  }

  /**
   * Handle trust score update
   */
  handleTrustScoreUpdate(message) {
    this.triggerCallbacks('onTrustScoreUpdate', message);
  }

  /**
   * Handle error messages
   */
  handleError(message) {
    console.error('Proctoring error:', message.message);
    toast.error(`Proctoring error: ${message.message}`);
    this.triggerCallbacks('onError', message);
  }

  /**
   * Send message to backend
   */
  sendMessage(message) {
    if (this.websocket && this.isConnected) {
      this.websocket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
    }
  }

  /**
   * Get current exam time in minutes
   */
  getCurrentExamTime() {
    // This should be implemented based on exam start time
    // For now, return a placeholder
    return 0;
  }

  /**
   * Add event callback
   */
  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    }
  }

  /**
   * Remove event callback
   */
  off(event, callback) {
    if (this.callbacks[event]) {
      const index = this.callbacks[event].indexOf(callback);
      if (index > -1) {
        this.callbacks[event].splice(index, 1);
      }
    }
  }

  /**
   * Trigger callbacks for an event
   */
  triggerCallbacks(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} callback:`, error);
        }
      });
    }
  }

  /**
   * End proctoring session
   */
  async endSession() {
    try {
      // Send session completion message
      this.sendMessage({
        type: 'session_status',
        status: 'completed',
        user_id: this.userId,
        exam_duration: this.examDuration,
        timestamp: new Date().toISOString(),
      });

      // Clean up
      this.cleanup();

      toast.success('Proctoring session ended');
      this.triggerCallbacks('onDisconnect');
    } catch (error) {
      console.error('Error ending session:', error);
      this.cleanup();
    }
  }

  /**
   * Clean up resources
   */
  cleanup() {
    // Stop intervals
    if (this.frameInterval) {
      clearInterval(this.frameInterval);
      this.frameInterval = null;
    }

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Stop media stream
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    // Close WebSocket
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }

    // Reset state
    this.isConnected = false;
    this.sessionId = null;
    this.userId = null;
    this.videoElement = null;
    this.canvas = null;
  }
}

// Export singleton instance
export const realtimeProctoringService = new RealtimeProctoringService();
export default realtimeProctoringService;
