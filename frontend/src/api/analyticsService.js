import api from './api';

/**
 * Analytics Service
 * Handles all analytics-related API calls
 */
class AnalyticsService {
  /**
   * Get advanced analytics data
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} API response
   */
  async getAdvancedAnalytics(params = {}) {
    try {
      const response = await api.get('/analytics/advanced', {
        params,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching advanced analytics:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch advanced analytics',
      };
    }
  }

  /**
   * Get overview analytics
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} API response
   */
  async getOverview(params = {}) {
    try {
      const response = await api.get('/analytics/overview', {
        params,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching analytics overview:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch analytics overview',
      };
    }
  }

  /**
   * Get violation trends
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} API response
   */
  async getViolationTrends(params = {}) {
    try {
      const response = await api.get('/analytics/violations/trends', {
        params,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching violation trends:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch violation trends',
      };
    }
  }

  /**
   * Get trust score distribution
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} API response
   */
  async getTrustScoreDistribution(params = {}) {
    try {
      const response = await api.get('/analytics/trust-score/distribution', {
        params,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching trust score distribution:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch trust score distribution',
      };
    }
  }

  /**
   * Get exam performance analytics
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} API response
   */
  async getExamPerformance(params = {}) {
    try {
      const response = await api.get('/analytics/exams/performance', {
        params,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching exam performance:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch exam performance',
      };
    }
  }

  /**
   * Get student analytics
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} API response
   */
  async getStudentAnalytics(params = {}) {
    try {
      const response = await api.get('/analytics/students', {
        params,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching student analytics:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch student analytics',
      };
    }
  }

  /**
   * Get department analytics
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} API response
   */
  async getDepartmentAnalytics(params = {}) {
    try {
      const response = await api.get('/analytics/departments', {
        params,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching department analytics:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch department analytics',
      };
    }
  }

  /**
   * Get real-time metrics
   * @returns {Promise<Object>} API response
   */
  async getRealTimeMetrics() {
    try {
      const response = await api.get('/analytics/real-time');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching real-time metrics:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch real-time metrics',
      };
    }
  }

  /**
   * Export analytics data
   * @param {Object} params - Export parameters
   * @returns {Promise<Object>} API response
   */
  async exportAnalytics(params = {}) {
    try {
      const response = await api.post('/analytics/export', params, {
        responseType: 'blob',
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error exporting analytics:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to export analytics',
      };
    }
  }

  /**
   * Get analytics filters
   * @returns {Promise<Object>} API response
   */
  async getFilters() {
    try {
      const response = await api.get('/analytics/filters');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching analytics filters:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch analytics filters',
      };
    }
  }

  /**
   * Generate analytics report
   * @param {Object} params - Report parameters
   * @returns {Promise<Object>} API response
   */
  async generateReport(params = {}) {
    try {
      const response = await api.post('/analytics/reports', params);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error generating analytics report:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to generate analytics report',
      };
    }
  }

  /**
   * Get hourly activity data
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} API response
   */
  async getHourlyActivity(params = {}) {
    try {
      const response = await api.get('/analytics/activity/hourly', {
        params,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching hourly activity:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch hourly activity',
      };
    }
  }

  /**
   * Get comparative analytics
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} API response
   */
  async getComparativeAnalytics(params = {}) {
    try {
      const response = await api.get('/analytics/comparative', {
        params,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching comparative analytics:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch comparative analytics',
      };
    }
  }

  /**
   * Get predictive insights
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} API response
   */
  async getPredictiveInsights(params = {}) {
    try {
      const response = await api.get('/analytics/predictive', {
        params,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching predictive insights:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch predictive insights',
      };
    }
  }
}

// Create and export service instance
const analyticsService = new AnalyticsService();
export default analyticsService;
