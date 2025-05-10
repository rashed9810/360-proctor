import { useState, useEffect, useCallback } from 'react';

// Mock WebSocket implementation for development
export const useWebSocket = url => {
  const [lastMessage, setLastMessage] = useState(null);
  const [isConnected, setIsConnected] = useState(true);

  // Simulate connection
  useEffect(() => {
    console.log('Mock WebSocket Connected to:', url);
    setIsConnected(true);

    // Simulate receiving messages periodically
    const interval = setInterval(() => {
      // Generate random mock data
      const mockData = {
        type: ['trust_score_update', 'student_feed', 'violation', 'notification'][
          Math.floor(Math.random() * 4)
        ],
        score: Math.floor(Math.random() * 100),
        violations: Math.floor(Math.random() * 5),
        feed: {
          id: Math.floor(Math.random() * 1000),
          studentName: `Student ${Math.floor(Math.random() * 100)}`,
          imageUrl: `https://via.placeholder.com/160x90.png?text=Student+${Math.floor(Math.random() * 10)}`,
          hasViolation: Math.random() > 0.7,
        },
        violation: {
          id: Math.floor(Math.random() * 1000),
          type: ['face_not_visible', 'multiple_people', 'phone_detected'][
            Math.floor(Math.random() * 3)
          ],
          timestamp: new Date().toISOString(),
        },
        notificationType: ['violation', 'success', 'info'][Math.floor(Math.random() * 3)],
        message: [
          'Student switched tabs',
          'Multiple people detected',
          'Phone detected',
          'Face not visible',
          'Exam started successfully',
          'New exam scheduled',
        ][Math.floor(Math.random() * 6)],
      };

      // Create a mock event object
      const mockEvent = {
        data: JSON.stringify(mockData),
      };

      // Only set message occasionally to avoid too much noise
      if (Math.random() > 0.7) {
        setLastMessage(mockEvent);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      console.log('Mock WebSocket Disconnected');
    };
  }, [url]);

  const sendMessage = useCallback(message => {
    console.log('Mock WebSocket sending message:', message);
    // Simulate response
    setTimeout(() => {
      const mockResponse = {
        type: 'response',
        status: 'success',
        message: 'Message received',
        data: message,
      };

      setLastMessage({
        data: JSON.stringify(mockResponse),
      });
    }, 500);
  }, []);

  return {
    lastMessage,
    isConnected,
    sendMessage,
  };
};
