import { useState, useEffect, useRef, useCallback } from 'react';
import websocketService from '../services/websocketService';

/**
 * Custom hook for WebSocket connections
 * @param {string} endpoint - WebSocket endpoint to connect to (e.g., 'notifications', 'proctoring')
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoConnect - Whether to automatically connect on mount (default: true)
 * @param {boolean} options.mockData - Whether to use mock data in development (default: true)
 * @returns {Object} WebSocket state and control functions
 */
export const useWebSocket = (endpoint, options = {}) => {
  const { autoConnect = true, mockData = true } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);

  // For mock implementation
  const mockIntervalRef = useRef(null);
  const listenerRemoverRef = useRef(null);

  // Check if we're in development mode and should use mock data
  const isMockWebSocket = mockData && import.meta.env.MODE === 'development';

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (isMockWebSocket) {
      console.log('Using mock WebSocket for endpoint:', endpoint);
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
          'Student switched tabs',
        ];

        let mockMessage;

        // Generate different mock data based on endpoint
        if (endpoint.includes('notification')) {
          mockMessage = {
            type: 'notification',
            notificationType: mockTypes[Math.floor(Math.random() * mockTypes.length)],
            message: mockMessages[Math.floor(Math.random() * mockMessages.length)],
            timestamp: new Date().toISOString(),
            id: Math.random().toString(36).substring(2, 15),
          };
        } else if (endpoint.includes('proctor')) {
          mockMessage = {
            type: 'violation',
            violationType: mockTypes[Math.floor(Math.random() * 3) + 2], // Only use warning, error, violation
            message: mockMessages[Math.floor(Math.random() * 4) + 3], // Only use violation messages
            timestamp: new Date().toISOString(),
            trustScoreImpact: Math.random() * 0.1,
            id: Math.random().toString(36).substring(2, 15),
          };
        } else if (endpoint.includes('trust')) {
          mockMessage = {
            type: 'trust_score_update',
            score: Math.round(Math.random() * 30 + 70), // 70-100 range
            violations: Math.floor(Math.random() * 3),
            timestamp: new Date().toISOString(),
          };
        } else {
          mockMessage = {
            type: 'generic',
            message: 'Mock data for ' + endpoint,
            timestamp: new Date().toISOString(),
          };
        }

        setLastMessage(mockMessage);
      }, 15000); // Generate a mock message every 15 seconds

      return;
    }

    try {
      // Use the WebSocket service to connect
      const ws = websocketService.connect(endpoint);
      setSocket(ws);

      // Add a listener for messages from this endpoint
      const handleMessage = data => {
        if (data.type === 'connection') {
          setIsConnected(data.status === 'connected');
          if (data.status !== 'connected') {
            setError({ code: data.code, reason: data.reason });
          } else {
            setError(null);
          }
        } else if (data.type === 'error') {
          setError(data.error);
        } else {
          setLastMessage(data);
        }
      };

      // Add the listener and store the removal function
      const removeListener = websocketService.addListener(endpoint, handleMessage);
      listenerRemoverRef.current = removeListener;
    } catch (err) {
      setError(err);
      console.error('Error connecting to WebSocket:', err);
    }
  }, [endpoint, isMockWebSocket]);

  // Send message through WebSocket
  const sendMessage = useCallback(
    data => {
      if (isMockWebSocket) {
        console.log('Mock WebSocket message sent:', data);

        // For mock implementation, simulate a response
        setTimeout(() => {
          const mockResponse = {
            type: 'response',
            requestId: data.id || Math.random().toString(36).substring(2, 15),
            success: true,
            timestamp: new Date().toISOString(),
          };
          setLastMessage(mockResponse);
        }, 500);

        return true;
      }

      return websocketService.send(endpoint, data);
    },
    [endpoint, isMockWebSocket]
  );

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (isMockWebSocket) {
      if (mockIntervalRef.current) {
        clearInterval(mockIntervalRef.current);
        mockIntervalRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    // Remove the listener
    if (listenerRemoverRef.current) {
      listenerRemoverRef.current();
      listenerRemoverRef.current = null;
    }

    // Disconnect from the WebSocket service
    websocketService.disconnect(endpoint);
    setSocket(null);
    setIsConnected(false);
  }, [endpoint, isMockWebSocket]);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect, autoConnect]);

  return {
    socket,
    isConnected,
    lastMessage,
    error,
    sendMessage,
    connect,
    disconnect,
  };
};
