import { useState, useEffect, useCallback, useRef } from 'react';
import realTimeAnalyticsService from '../services/realTimeAnalyticsService';
import toast from 'react-hot-toast';

/**
 * Custom hook for real-time analytics data
 * Provides easy access to live analytics updates with automatic connection management
 */
export const useRealTimeAnalytics = (options = {}) => {
  const {
    autoConnect = true,
    enableNotifications = true,
    subscriptions = ['analytics', 'violations', 'trustScores'],
    filters = {},
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalExams: 0,
      totalStudents: 0,
      activeUsers: 0,
      violations: 0,
      trustScore: 0,
    },
    recentViolations: [],
    trustScoreUpdates: [],
    systemMetrics: {},
    lastUpdate: null,
  });
  const [error, setError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const listenersRef = useRef(new Map());
  const notificationQueueRef = useRef([]);

  /**
   * Handle connection status changes
   */
  const handleConnectionChange = useCallback(
    status => {
      setConnectionStatus(status);
      setIsConnected(status === 'connected');

      if (status === 'connected') {
        setError(null);
        setReconnectAttempts(0);
        if (enableNotifications) {
          toast.success('Real-time analytics connected');
        }
      } else if (status === 'disconnected') {
        if (enableNotifications) {
          toast.error('Real-time analytics disconnected');
        }
      }
    },
    [enableNotifications]
  );

  /**
   * Handle analytics updates
   */
  const handleAnalyticsUpdate = useCallback(data => {
    setAnalyticsData(prev => ({
      ...prev,
      overview: {
        ...prev.overview,
        ...data,
      },
      lastUpdate: new Date(),
    }));
  }, []);

  /**
   * Handle violation alerts
   */
  const handleViolationAlert = useCallback(
    violation => {
      setAnalyticsData(prev => ({
        ...prev,
        recentViolations: [violation, ...prev.recentViolations.slice(0, 9)], // Keep last 10
        lastUpdate: new Date(),
      }));

      if (enableNotifications && violation.severity === 'high') {
        toast.error(`High severity violation: ${violation.type}`, {
          duration: 5000,
          icon: '🚨',
        });
      }
    },
    [enableNotifications]
  );

  /**
   * Handle trust score updates
   */
  const handleTrustScoreUpdate = useCallback(
    update => {
      setAnalyticsData(prev => ({
        ...prev,
        trustScoreUpdates: [update, ...prev.trustScoreUpdates.slice(0, 19)], // Keep last 20
        lastUpdate: new Date(),
      }));

      if (enableNotifications && update.score < 60) {
        toast.warning(`Low trust score: ${Math.round(update.score)}%`, {
          duration: 4000,
          icon: '⚠️',
        });
      }
    },
    [enableNotifications]
  );

  /**
   * Handle system metrics updates
   */
  const handleSystemMetrics = useCallback(metrics => {
    setAnalyticsData(prev => ({
      ...prev,
      systemMetrics: metrics,
      lastUpdate: new Date(),
    }));
  }, []);

  /**
   * Handle connection errors
   */
  const handleError = useCallback(
    errorData => {
      setError(errorData.error);
      if (enableNotifications) {
        toast.error('Analytics connection error');
      }
    },
    [enableNotifications]
  );

  /**
   * Handle reconnection attempts
   */
  const handleReconnectAttempt = useCallback(() => {
    setReconnectAttempts(prev => prev + 1);
  }, []);

  /**
   * Setup event listeners
   */
  const setupListeners = useCallback(() => {
    const listeners = [
      ['connected', () => handleConnectionChange('connected')],
      ['disconnected', () => handleConnectionChange('disconnected')],
      ['analyticsUpdate', handleAnalyticsUpdate],
      ['violationAlert', handleViolationAlert],
      ['trustScoreUpdate', handleTrustScoreUpdate],
      ['systemMetrics', handleSystemMetrics],
      ['error', handleError],
      ['reconnectAttempt', handleReconnectAttempt],
    ];

    listeners.forEach(([event, handler]) => {
      realTimeAnalyticsService.on(event, handler);
      listenersRef.current.set(event, handler);
    });
  }, [
    handleConnectionChange,
    handleAnalyticsUpdate,
    handleViolationAlert,
    handleTrustScoreUpdate,
    handleSystemMetrics,
    handleError,
    handleReconnectAttempt,
  ]);

  /**
   * Cleanup event listeners
   */
  const cleanupListeners = useCallback(() => {
    listenersRef.current.forEach((handler, event) => {
      realTimeAnalyticsService.off(event, handler);
    });
    listenersRef.current.clear();
  }, []);

  /**
   * Connect to real-time analytics
   */
  const connect = useCallback(() => {
    try {
      realTimeAnalyticsService.connect();

      // Setup subscriptions after connection
      setTimeout(() => {
        if (subscriptions.includes('analytics')) {
          realTimeAnalyticsService.subscribeToAnalytics(filters);
        }
        if (subscriptions.includes('violations')) {
          realTimeAnalyticsService.subscribeToViolations();
        }
        if (subscriptions.includes('trustScores')) {
          realTimeAnalyticsService.subscribeToTrustScores();
        }
        if (subscriptions.includes('systemMetrics')) {
          realTimeAnalyticsService.subscribeToSystemMetrics();
        }
      }, 1000);
    } catch (error) {
      setError(error);
      console.error('Failed to connect to real-time analytics:', error);
    }
  }, [subscriptions, filters]);

  /**
   * Disconnect from real-time analytics
   */
  const disconnect = useCallback(() => {
    realTimeAnalyticsService.disconnect();
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  /**
   * Manually refresh data
   */
  const refreshData = useCallback(() => {
    if (isConnected) {
      realTimeAnalyticsService.requestHistoricalData('overview', '1h');
    }
  }, [isConnected]);

  /**
   * Subscribe to specific exam violations
   */
  const subscribeToExam = useCallback(
    examId => {
      if (isConnected) {
        realTimeAnalyticsService.subscribeToViolations([examId]);
      }
    },
    [isConnected]
  );

  /**
   * Subscribe to specific student trust scores
   */
  const subscribeToStudent = useCallback(
    studentId => {
      if (isConnected) {
        realTimeAnalyticsService.subscribeToTrustScores([studentId]);
      }
    },
    [isConnected]
  );

  /**
   * Get connection statistics
   */
  const getConnectionStats = useCallback(() => {
    return {
      ...realTimeAnalyticsService.getConnectionStatus(),
      reconnectAttempts,
      error,
    };
  }, [reconnectAttempts, error]);

  // Setup and cleanup on mount/unmount
  useEffect(() => {
    setupListeners();

    if (autoConnect) {
      connect();
    }

    // Start mock data in development
    if (import.meta.env.VITE_ENABLE_MOCK_DATA === 'true') {
      realTimeAnalyticsService.startMockData();
    }

    return () => {
      cleanupListeners();
      disconnect();
    };
  }, [setupListeners, cleanupListeners, autoConnect, connect, disconnect]);

  return {
    // Connection state
    isConnected,
    connectionStatus,
    error,
    reconnectAttempts,

    // Data
    analyticsData,

    // Actions
    connect,
    disconnect,
    refreshData,
    subscribeToExam,
    subscribeToStudent,

    // Utilities
    getConnectionStats,
  };
};

/**
 * Hook for real-time violation monitoring
 */
export const useRealTimeViolations = (examIds = []) => {
  const [violations, setViolations] = useState([]);
  const [alertCount, setAlertCount] = useState(0);

  const handleViolationAlert = useCallback(
    violation => {
      if (examIds.length === 0 || examIds.includes(violation.examId)) {
        setViolations(prev => [violation, ...prev.slice(0, 49)]); // Keep last 50
        setAlertCount(prev => prev + 1);
      }
    },
    [examIds]
  );

  useEffect(() => {
    realTimeAnalyticsService.on('violationAlert', handleViolationAlert);

    if (examIds.length > 0) {
      realTimeAnalyticsService.subscribeToViolations(examIds);
    }

    return () => {
      realTimeAnalyticsService.off('violationAlert', handleViolationAlert);
    };
  }, [examIds, handleViolationAlert]);

  const clearViolations = useCallback(() => {
    setViolations([]);
    setAlertCount(0);
  }, []);

  return {
    violations,
    alertCount,
    clearViolations,
  };
};

/**
 * Hook for real-time trust score monitoring
 */
export const useRealTimeTrustScores = (studentIds = []) => {
  const [trustScores, setTrustScores] = useState(new Map());
  const [lowScoreAlerts, setLowScoreAlerts] = useState([]);

  const handleTrustScoreUpdate = useCallback(
    update => {
      if (studentIds.length === 0 || studentIds.includes(update.studentId)) {
        setTrustScores(prev => new Map(prev.set(update.studentId, update)));

        if (update.score < 70) {
          setLowScoreAlerts(prev => [update, ...prev.slice(0, 9)]); // Keep last 10
        }
      }
    },
    [studentIds]
  );

  useEffect(() => {
    realTimeAnalyticsService.on('trustScoreUpdate', handleTrustScoreUpdate);

    if (studentIds.length > 0) {
      realTimeAnalyticsService.subscribeToTrustScores(studentIds);
    }

    return () => {
      realTimeAnalyticsService.off('trustScoreUpdate', handleTrustScoreUpdate);
    };
  }, [studentIds, handleTrustScoreUpdate]);

  const getTrustScore = useCallback(
    studentId => {
      return trustScores.get(studentId);
    },
    [trustScores]
  );

  const clearAlerts = useCallback(() => {
    setLowScoreAlerts([]);
  }, []);

  return {
    trustScores: Array.from(trustScores.values()),
    lowScoreAlerts,
    getTrustScore,
    clearAlerts,
  };
};

export default useRealTimeAnalytics;
