/**
 * WebSocket service for real-time communication
 * This service handles WebSocket connections for various features:
 * - Real-time notifications
 * - Live proctoring updates
 * - Trust score updates
 */

class WebSocketService {
  constructor() {
    this.connections = {};
    this.listeners = {};
    this.reconnectTimeouts = {};
    this.isConnected = {};
    this.maxReconnectAttempts = 5;
    this.reconnectAttempts = {};
    this.baseUrl = 'ws://localhost:8000/ws'; // Will be replaced with environment variable in production
  }

  /**
   * Connect to a WebSocket endpoint
   * @param {string} endpoint - The endpoint to connect to (e.g., 'notifications', 'proctoring')
   * @returns {WebSocket} - The WebSocket connection
   */
  connect(endpoint) {
    if (this.connections[endpoint]) {
      return this.connections[endpoint];
    }

    const url = `${this.baseUrl}/${endpoint}`;
    const ws = new WebSocket(url);

    // Initialize listener array for this endpoint if it doesn't exist
    if (!this.listeners[endpoint]) {
      this.listeners[endpoint] = [];
    }

    // Initialize reconnect attempts counter
    this.reconnectAttempts[endpoint] = 0;

    // Set up event handlers
    ws.onopen = () => {
      console.log(`WebSocket connected: ${endpoint}`);
      this.isConnected[endpoint] = true;
      this.reconnectAttempts[endpoint] = 0; // Reset reconnect attempts on successful connection
      
      // Notify all listeners that connection is established
      this.notifyListeners(endpoint, { type: 'connection', status: 'connected' });
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Notify all listeners about the new message
        this.notifyListeners(endpoint, data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = (event) => {
      console.log(`WebSocket disconnected: ${endpoint}`, event.code, event.reason);
      this.isConnected[endpoint] = false;
      
      // Notify all listeners that connection is closed
      this.notifyListeners(endpoint, { 
        type: 'connection', 
        status: 'disconnected',
        code: event.code,
        reason: event.reason
      });
      
      // Attempt to reconnect if not closed cleanly and we haven't exceeded max attempts
      if (!event.wasClean && this.reconnectAttempts[endpoint] < this.maxReconnectAttempts) {
        this.reconnect(endpoint);
      }
    };

    ws.onerror = (error) => {
      console.error(`WebSocket error: ${endpoint}`, error);
      // Notify all listeners about the error
      this.notifyListeners(endpoint, { type: 'error', error });
    };

    this.connections[endpoint] = ws;
    return ws;
  }

  /**
   * Reconnect to a WebSocket endpoint with exponential backoff
   * @param {string} endpoint - The endpoint to reconnect to
   */
  reconnect(endpoint) {
    // Clear any existing reconnect timeout
    if (this.reconnectTimeouts[endpoint]) {
      clearTimeout(this.reconnectTimeouts[endpoint]);
    }

    // Increment reconnect attempts
    this.reconnectAttempts[endpoint]++;

    // Calculate backoff time (exponential with jitter)
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    const attempt = this.reconnectAttempts[endpoint];
    let delay = Math.min(maxDelay, baseDelay * Math.pow(2, attempt));
    // Add jitter to prevent all clients reconnecting simultaneously
    delay = delay * (0.8 + Math.random() * 0.4);

    console.log(`Attempting to reconnect to ${endpoint} in ${Math.round(delay / 1000)}s (attempt ${attempt}/${this.maxReconnectAttempts})`);

    // Set timeout for reconnection
    this.reconnectTimeouts[endpoint] = setTimeout(() => {
      console.log(`Reconnecting to ${endpoint}...`);
      
      // Close existing connection if it exists
      if (this.connections[endpoint]) {
        this.connections[endpoint].close();
        delete this.connections[endpoint];
      }
      
      // Attempt to reconnect
      this.connect(endpoint);
    }, delay);
  }

  /**
   * Disconnect from a WebSocket endpoint
   * @param {string} endpoint - The endpoint to disconnect from
   */
  disconnect(endpoint) {
    if (this.connections[endpoint]) {
      this.connections[endpoint].close();
      delete this.connections[endpoint];
    }

    // Clear any reconnect timeout
    if (this.reconnectTimeouts[endpoint]) {
      clearTimeout(this.reconnectTimeouts[endpoint]);
      delete this.reconnectTimeouts[endpoint];
    }

    this.isConnected[endpoint] = false;
  }

  /**
   * Send a message to a WebSocket endpoint
   * @param {string} endpoint - The endpoint to send the message to
   * @param {Object} data - The data to send
   * @returns {boolean} - Whether the message was sent successfully
   */
  send(endpoint, data) {
    if (!this.connections[endpoint] || !this.isConnected[endpoint]) {
      console.error(`Cannot send message: Not connected to ${endpoint}`);
      return false;
    }

    try {
      this.connections[endpoint].send(JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Error sending message to ${endpoint}:`, error);
      return false;
    }
  }

  /**
   * Add a listener for WebSocket messages
   * @param {string} endpoint - The endpoint to listen to
   * @param {Function} callback - The callback function to call when a message is received
   * @returns {Function} - A function to remove the listener
   */
  addListener(endpoint, callback) {
    if (!this.listeners[endpoint]) {
      this.listeners[endpoint] = [];
    }

    this.listeners[endpoint].push(callback);

    // Return a function to remove this listener
    return () => {
      this.listeners[endpoint] = this.listeners[endpoint].filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all listeners about a new message
   * @param {string} endpoint - The endpoint the message is from
   * @param {Object} data - The message data
   */
  notifyListeners(endpoint, data) {
    if (this.listeners[endpoint]) {
      this.listeners[endpoint].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket listener callback:', error);
        }
      });
    }
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();

export default websocketService;
