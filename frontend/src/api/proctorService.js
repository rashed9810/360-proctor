import api from './api';

/**
 * Proctoring Service
 * Handles all proctoring-related API calls
 */
class ProctorService {
  /**
   * Start a proctoring session
   * @param {string} examId - Exam ID
   * @param {Object} settings - Proctoring settings
   * @returns {Promise<Object>} API response
   */
  async startSession(examId, settings = {}) {
    try {
      const response = await api.post(`/proctoring/sessions/${examId}/start`, {
        settings,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error starting proctoring session:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to start proctoring session',
      };
    }
  }

  /**
   * Stop a proctoring session
   * @param {string} examId - Exam ID
   * @returns {Promise<Object>} API response
   */
  async stopSession(examId) {
    try {
      const response = await api.post(`/proctoring/sessions/${examId}/stop`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error stopping proctoring session:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to stop proctoring session',
      };
    }
  }

  /**
   * Get monitoring data for an exam
   * @param {string} examId - Exam ID
   * @returns {Promise<Object>} API response
   */
  async getMonitoringData(examId) {
    try {
      const response = await api.get(`/proctoring/monitoring/${examId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch monitoring data',
      };
    }
  }

  /**
   * Handle a violation
   * @param {string} violationId - Violation ID
   * @param {string} action - Action to take
   * @returns {Promise<Object>} API response
   */
  async handleViolation(violationId, action) {
    try {
      const response = await api.post(`/proctoring/violations/${violationId}/handle`, {
        action,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error handling violation:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to handle violation',
      };
    }
  }

  /**
   * Submit frame data for analysis
   * @param {string} examId - Exam ID
   * @param {Object} frameData - Frame data
   * @returns {Promise<Object>} API response
   */
  async submitFrame(examId, frameData) {
    try {
      const response = await api.post(`/proctoring/frames/${examId}`, frameData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error submitting frame:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to submit frame',
      };
    }
  }

  /**
   * Get proctoring settings
   * @param {string} examId - Exam ID
   * @returns {Promise<Object>} API response
   */
  async getSettings(examId) {
    try {
      const response = await api.get(`/proctoring/settings/${examId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching proctoring settings:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch proctoring settings',
      };
    }
  }

  /**
   * Update proctoring settings
   * @param {string} examId - Exam ID
   * @param {Object} settings - New settings
   * @returns {Promise<Object>} API response
   */
  async updateSettings(examId, settings) {
    try {
      const response = await api.put(`/proctoring/settings/${examId}`, settings);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error updating proctoring settings:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update proctoring settings',
      };
    }
  }

  /**
   * Get violation history
   * @param {string} examId - Exam ID
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} API response
   */
  async getViolationHistory(examId, filters = {}) {
    try {
      const response = await api.get(`/proctoring/violations/${examId}`, {
        params: filters,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching violation history:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch violation history',
      };
    }
  }

  /**
   * Get student monitoring status
   * @param {string} examId - Exam ID
   * @returns {Promise<Object>} API response
   */
  async getStudentStatus(examId) {
    try {
      const response = await api.get(`/proctoring/students/${examId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching student status:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch student status',
      };
    }
  }

  /**
   * Generate proctoring report
   * @param {string} examId - Exam ID
   * @param {Object} options - Report options
   * @returns {Promise<Object>} API response
   */
  async generateReport(examId, options = {}) {
    try {
      const response = await api.post(`/proctoring/reports/${examId}`, options);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error generating proctoring report:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to generate proctoring report',
      };
    }
  }
}

// Create and export service instance
const proctorService = new ProctorService();
export default proctorService;
