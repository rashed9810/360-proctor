/**
 * API Services Index
 * Central export point for all API services
 * Provides clean imports throughout the application
 */

// Core API instance
export { default as api } from './api';
import api from './api';

// Service classes
export { default as authService } from './authService';
export { default as examService } from './examService';
export { default as userService } from './userService';
export { default as proctorService } from './proctorService';
export { default as analyticsService } from './analyticsService';
import authService from './authService';
import examService from './examService';
import userService from './userService';
import proctorService from './proctorService';
import analyticsService from './analyticsService';

// Service instances for backward compatibility
export { default as AuthService } from './authService';
export { default as ExamService } from './examService';
export { default as UserService } from './userService';
export { default as ProctorService } from './proctorService';
export { default as AnalyticsService } from './analyticsService';

/**
 * API Error Handler
 * Centralized error handling utility
 */
export class ApiError extends Error {
  constructor(message, status, code, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /**
   * Create ApiError from axios error
   * @param {Object} axiosError - Axios error object
   * @returns {ApiError} Formatted API error
   */
  static fromAxiosError(axiosError) {
    if (axiosError.response) {
      // Server responded with error status
      const { status, data } = axiosError.response;
      const message = data?.detail || data?.message || `HTTP ${status} Error`;
      const code = data?.code || `HTTP_${status}`;

      return new ApiError(message, status, code, data);
    } else if (axiosError.request) {
      // Network error
      return new ApiError(
        'Network error. Please check your connection.',
        0,
        'NETWORK_ERROR',
        axiosError.request
      );
    } else {
      // Request setup error
      return new ApiError('Request configuration error', 0, 'REQUEST_ERROR', axiosError.message);
    }
  }

  /**
   * Check if error is a specific type
   * @param {string} code - Error code to check
   * @returns {boolean} Whether error matches code
   */
  is(code) {
    return this.code === code;
  }

  /**
   * Check if error is authentication related
   * @returns {boolean} Whether error is auth related
   */
  isAuthError() {
    return this.status === 401 || this.code === 'UNAUTHORIZED';
  }

  /**
   * Check if error is permission related
   * @returns {boolean} Whether error is permission related
   */
  isPermissionError() {
    return this.status === 403 || this.code === 'FORBIDDEN';
  }

  /**
   * Check if error is validation related
   * @returns {boolean} Whether error is validation related
   */
  isValidationError() {
    return this.status === 422 || this.code === 'VALIDATION_ERROR';
  }

  /**
   * Check if error is network related
   * @returns {boolean} Whether error is network related
   */
  isNetworkError() {
    return this.code === 'NETWORK_ERROR' || this.status === 0;
  }
}

/**
 * API Response Wrapper
 * Standardizes API response format
 */
export class ApiResponse {
  constructor(success, data = null, message = '', error = null) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.error = error;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Create success response
   * @param {*} data - Response data
   * @param {string} message - Success message
   * @returns {ApiResponse} Success response
   */
  static success(data, message = '') {
    return new ApiResponse(true, data, message);
  }

  /**
   * Create error response
   * @param {string} message - Error message
   * @param {*} error - Error details
   * @returns {ApiResponse} Error response
   */
  static error(message, error = null) {
    return new ApiResponse(false, null, message, error);
  }

  /**
   * Create response from axios response
   * @param {Object} axiosResponse - Axios response
   * @param {string} successMessage - Success message
   * @returns {ApiResponse} Formatted response
   */
  static fromAxiosResponse(axiosResponse, successMessage = '') {
    return new ApiResponse(true, axiosResponse.data, successMessage);
  }

  /**
   * Create response from axios error
   * @param {Object} axiosError - Axios error
   * @returns {ApiResponse} Error response
   */
  static fromAxiosError(axiosError) {
    const apiError = ApiError.fromAxiosError(axiosError);
    return new ApiResponse(false, null, apiError.message, apiError);
  }
}

/**
 * API Configuration
 * Centralized configuration for API services
 */
export const apiConfig = {
  // Base URLs
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  wsURL: import.meta.env.VITE_WS_URL || 'ws://localhost:8000',

  // Timeouts
  timeout: 30000,

  // Retry configuration
  retryAttempts: 3,
  retryDelay: 1000,

  // Cache configuration
  cacheTimeout: 5 * 60 * 1000, // 5 minutes

  // Feature flags
  features: {
    enableRetry: true,
    enableCache: true,
    enableLogging: import.meta.env.MODE === 'development',
  },
};

/**
 * API Utilities
 * Helper functions for API operations
 */
export const apiUtils = {
  /**
   * Format query parameters
   * @param {Object} params - Parameters object
   * @returns {string} Formatted query string
   */
  formatQueryParams(params) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    return searchParams.toString();
  },

  /**
   * Format date for API
   * @param {Date|string} date - Date to format
   * @returns {string} ISO date string
   */
  formatDate(date) {
    if (!date) return '';

    if (typeof date === 'string') {
      return new Date(date).toISOString();
    }

    return date.toISOString();
  },

  /**
   * Parse API date
   * @param {string} dateString - ISO date string
   * @returns {Date} Parsed date
   */
  parseDate(dateString) {
    return dateString ? new Date(dateString) : null;
  },

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} Whether email is valid
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Generate unique request ID
   * @returns {string} Unique request ID
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },
};

// Default export for convenience
export default {
  api,
  authService,
  examService,
  userService,
  proctorService,
  analyticsService,
  ApiError,
  ApiResponse,
  apiConfig,
  apiUtils,
};
