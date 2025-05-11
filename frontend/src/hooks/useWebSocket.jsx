import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for WebSocket connections
 * @param {string} url - WebSocket URL to connect to
 * @param {Object} options - Configuration options
 * @param {boolean} options.reconnect - Whether to automatically reconnect (default: true)
 * @param {number} options.reconnectInterval - Reconnection interval in ms (default: 5000)
 * @param {number} options.maxReconnectAttempts - Maximum reconnection attempts (default: 10)
 * @returns {Object} WebSocket state and control functions
 */
export const useWebSocket = (url, options = {}) => {
  const {
    reconnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 10,
  } = options;

  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  
  const reconnectAttempts = useRef(0);
  const reconnectTimeoutRef = useRef(null);

  // For mock implementation
  const mockMessagesRef = useRef([]);
  const mockIntervalRef = useRef(null);
  
  // Check if we're in development mode and using a mock WebSocket
  const isMockWebSocket = url.startsWith('mock://') || process.env.NODE_ENV === 'development';

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (isMockWebSocket) {
      console.log('Using mock WebSocket');
      // Set up mock WebSocket behavior
      setIsConnected(true);
      
      // Generate mock notifications periodically
      mockIntervalRef.current = setInterval(() => {
        const mockTypes = ['info', 'success', 'warning', 'error', 'violation'];
        const mockMessages = [
          'New exam scheduled',
          'Student login failed',
          'Exam started successfully',
          'Multiple violations detected',
          'Phone detected',
          'Face not visible',
          'Student switched tabs'
        ];
        
        const mockMessage = {
          type: 'notification',
          notificationType: mockTypes[Math.floor(Math.random() * mockTypes.length)],
          message: mockMessages[Math.floor(Math.random() * mockMessages.length)],
          timestamp: new Date().toISOString()
        };
        
        setLastMessage({ data: JSON.stringify(mockMessage) });
      }, 30000); // Generate a mock notification every 30 seconds
      
      return;
    }
    
    try {
      const ws = new WebSocket(url);
      
      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
      };
      
      ws.onmessage = (event) => {
        setLastMessage(event);
      };
      
      ws.onerror = (event) => {
        setError(event);
      };
      
      ws.onclose = () => {
        setIsConnected(false);
        
        // Attempt to reconnect if enabled
        if (reconnect && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current += 1;
            connect();
          }, reconnectInterval);
        }
      };
      
      setSocket(ws);
    } catch (err) {
      setError(err);
    }
  }, [url, reconnect, reconnectInterval, maxReconnectAttempts, isMockWebSocket]);

  // Send message through WebSocket
  const sendMessage = useCallback((data) => {
    if (isMockWebSocket) {
      console.log('Mock WebSocket message sent:', data);
      return;
    }
    
    if (socket && isConnected) {
      socket.send(JSON.stringify(data));
    } else {
      console.error('WebSocket is not connected');
    }
  }, [socket, isConnected, isMockWebSocket]);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (isMockWebSocket) {
      if (mockIntervalRef.current) {
        clearInterval(mockIntervalRef.current);
      }
      setIsConnected(false);
      return;
    }
    
    if (socket) {
      socket.close();
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  }, [socket, isMockWebSocket]);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    socket,
    isConnected,
    lastMessage,
    error,
    sendMessage,
    connect,
    disconnect
  };
};
