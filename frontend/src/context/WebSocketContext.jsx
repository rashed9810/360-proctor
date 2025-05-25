import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import websocketService from '../services/websocket';
import toast from 'react-hot-toast';

/**
 * WebSocket Context for Real-time Communication
 * Provides WebSocket functionality to React components
 */

const WebSocketContext = createContext({});

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [notifications, setNotifications] = useState([]);
  const [violations, setViolations] = useState([]);
  const [examUpdates, setExamUpdates] = useState([]);

  // Initialize WebSocket connection when user is authenticated
  useEffect(() => {
    if (user && token) {
      connectWebSocket();
    } else {
      disconnectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [user, token]);

  /**
   * Connect to WebSocket server
   */
  const connectWebSocket = useCallback(() => {
    if (!token) return;

    setConnectionStatus('connecting');
    websocketService.connect(token);

    // Set up event listeners
    const unsubscribeConnected = websocketService.on('connected', handleConnected);
    const unsubscribeDisconnected = websocketService.on('disconnected', handleDisconnected);
    const unsubscribeError = websocketService.on('error', handleError);
    const unsubscribeNotification = websocketService.on('notification', handleNotification);
    const unsubscribeViolation = websocketService.on('violation', handleViolation);
    const unsubscribeExamUpdate = websocketService.on('exam_update', handleExamUpdate);
    const unsubscribeMaxReconnect = websocketService.on('max_reconnect_attempts', handleMaxReconnect);

    // Cleanup function
    return () => {
      unsubscribeConnected();
      unsubscribeDisconnected();
      unsubscribeError();
      unsubscribeNotification();
      unsubscribeViolation();
      unsubscribeExamUpdate();
      unsubscribeMaxReconnect();
    };
  }, [token]);

  /**
   * Disconnect from WebSocket server
   */
  const disconnectWebSocket = useCallback(() => {
    websocketService.disconnect();
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  /**
   * Handle WebSocket connection
   */
  const handleConnected = useCallback((data) => {
    setIsConnected(true);
    setConnectionStatus('connected');
    toast.success('Connected to real-time updates', {
      duration: 2000,
      position: 'bottom-right',
    });
  }, []);

  /**
   * Handle WebSocket disconnection
   */
  const handleDisconnected = useCallback((data) => {
    setIsConnected(false);
    setConnectionStatus('disconnected');
    
    if (data.code !== 1000) {
      toast.error('Connection lost. Attempting to reconnect...', {
        duration: 3000,
        position: 'bottom-right',
      });
    }
  }, []);

  /**
   * Handle WebSocket errors
   */
  const handleError = useCallback((data) => {
    console.error('WebSocket error:', data.error);
    setConnectionStatus('error');
    toast.error('Connection error occurred', {
      duration: 3000,
      position: 'bottom-right',
    });
  }, []);

  /**
   * Handle incoming notifications
   */
  const handleNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50
    
    // Show toast notification
    toast(notification.message, {
      icon: getNotificationIcon(notification.type),
      duration: 4000,
      position: 'top-right',
    });
  }, []);

  /**
   * Handle violation alerts
   */
  const handleViolation = useCallback((violation) => {
    setViolations(prev => [violation, ...prev.slice(0, 99)]); // Keep last 100
    
    // Show urgent toast for violations
    toast.error(`Violation detected: ${violation.description}`, {
      duration: 6000,
      position: 'top-center',
    });
  }, []);

  /**
   * Handle exam updates
   */
  const handleExamUpdate = useCallback((update) => {
    setExamUpdates(prev => [update, ...prev.slice(0, 49)]); // Keep last 50
    
    // Show toast for important exam updates
    if (update.type === 'status_change') {
      toast(update.message, {
        icon: '📋',
        duration: 3000,
        position: 'top-right',
      });
    }
  }, []);

  /**
   * Handle max reconnection attempts reached
   */
  const handleMaxReconnect = useCallback((data) => {
    setConnectionStatus('failed');
    toast.error('Unable to establish connection. Please refresh the page.', {
      duration: 0, // Don't auto-dismiss
      position: 'top-center',
    });
  }, []);

  /**
   * Get notification icon based on type
   */
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      case 'exam': return '📋';
      case 'violation': return '🚨';
      default: return '🔔';
    }
  };

  /**
   * Send message through WebSocket
   */
  const sendMessage = useCallback((type, payload) => {
    websocketService.send(type, payload);
  }, []);

  /**
   * Subscribe to WebSocket events
   */
  const subscribe = useCallback((event, callback) => {
    return websocketService.on(event, callback);
  }, []);

  /**
   * Join a room for targeted messages
   */
  const joinRoom = useCallback((roomId) => {
    websocketService.joinRoom(roomId);
  }, []);

  /**
   * Leave a room
   */
  const leaveRoom = useCallback((roomId) => {
    websocketService.leaveRoom(roomId);
  }, []);

  /**
   * Subscribe to exam updates
   */
  const subscribeToExam = useCallback((examId) => {
    websocketService.subscribeToExam(examId);
  }, []);

  /**
   * Unsubscribe from exam updates
   */
  const unsubscribeFromExam = useCallback((examId) => {
    websocketService.unsubscribeFromExam(examId);
  }, []);

  /**
   * Send proctoring data
   */
  const sendProctoringData = useCallback((examId, data) => {
    websocketService.sendProctoringData(examId, data);
  }, []);

  /**
   * Clear notifications
   */
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  /**
   * Clear violations
   */
  const clearViolations = useCallback(() => {
    setViolations([]);
  }, []);

  /**
   * Clear exam updates
   */
  const clearExamUpdates = useCallback(() => {
    setExamUpdates([]);
  }, []);

  /**
   * Mark notification as read
   */
  const markNotificationAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  /**
   * Get unread notification count
   */
  const getUnreadCount = useCallback(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  /**
   * Get connection statistics
   */
  const getConnectionStats = useCallback(() => {
    return websocketService.getConnectionStatus();
  }, []);

  // Context value
  const value = {
    // Connection state
    isConnected,
    connectionStatus,
    
    // Data
    notifications,
    violations,
    examUpdates,
    
    // Actions
    sendMessage,
    subscribe,
    joinRoom,
    leaveRoom,
    subscribeToExam,
    unsubscribeFromExam,
    sendProctoringData,
    
    // Utility functions
    clearNotifications,
    clearViolations,
    clearExamUpdates,
    markNotificationAsRead,
    getUnreadCount,
    getConnectionStats,
    
    // Connection management
    connectWebSocket,
    disconnectWebSocket,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketContext;
