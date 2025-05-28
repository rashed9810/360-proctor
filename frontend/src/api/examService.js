import api from './api';

/**
 * Exam service for handling exam-related operations
 * Provides clean, readable methods for exam management
 */
class ExamService {
  /**
   * Get all exams (filtered by user role)
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of exams
   */
  async getAllExams(params = {}) {
    try {
      const { skip = 0, limit = 100, status, search } = params;

      const queryParams = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString(),
      });

      if (status) queryParams.append('status', status);
      if (search) queryParams.append('search', search);

      const response = await api.get(`/exams?${queryParams}`);

      return {
        success: true,
        data: response.data,
        total: response.data.length,
      };
    } catch (error) {
      console.error('Get exams error:', error);

      return {
        success: false,
        message: error.response?.data?.detail || 'Failed to fetch exams',
        data: [],
      };
    }
  }

  /**
   * Get exam by ID
   * @param {number} examId - Exam ID
   * @returns {Promise<Object>} Exam data
   */
  async getExamById(examId) {
    try {
      const response = await api.get(`/exams/${examId}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Get exam error:', error);

      return {
        success: false,
        message: error.response?.data?.detail || 'Failed to fetch exam',
        data: null,
      };
    }
  }

  /**
   * Create new exam
   * @param {Object} examData - Exam creation data
   * @returns {Promise<Object>} Created exam
   */
  async createExam(examData) {
    try {
      // Transform frontend data to backend format
      const backendData = this.transformToBackendFormat(examData);

      const response = await api.post('/exams', backendData);

      return {
        success: true,
        data: response.data,
        message: 'Exam created successfully',
      };
    } catch (error) {
      console.error('Create exam error:', error);

      // Handle validation errors
      if (error.response?.status === 422) {
        const validationErrors = error.response.data?.detail || [];
        const errorMessages = validationErrors
          .map(err => `${err.loc?.[1] || 'Field'}: ${err.msg}`)
          .join(', ');

        return {
          success: false,
          message: errorMessages || 'Validation failed',
          error: 'VALIDATION_ERROR',
        };
      }

      return {
        success: false,
        message: error.response?.data?.detail || 'Failed to create exam',
        error: error.response?.status || 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Update exam
   * @param {number} examId - Exam ID
   * @param {Object} examData - Exam update data
   * @returns {Promise<Object>} Updated exam
   */
  async updateExam(examId, examData) {
    try {
      // Transform frontend data to backend format
      const backendData = this.transformToBackendFormat(examData);

      const response = await api.put(`/exams/${examId}`, backendData);

      return {
        success: true,
        data: response.data,
        message: 'Exam updated successfully',
      };
    } catch (error) {
      console.error('Update exam error:', error);

      return {
        success: false,
        message: error.response?.data?.detail || 'Failed to update exam',
        error: error.response?.status || 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Delete exam
   * @param {number} examId - Exam ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteExam(examId) {
    try {
      await api.delete(`/exams/${examId}`);

      return {
        success: true,
        message: 'Exam deleted successfully',
      };
    } catch (error) {
      console.error('Delete exam error:', error);

      return {
        success: false,
        message: error.response?.data?.detail || 'Failed to delete exam',
        error: error.response?.status || 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Get exams for calendar view
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<Array>} Calendar events
   */
  async getExamsForCalendar(startDate, endDate) {
    try {
      const response = await this.getAllExams();

      if (!response.success) {
        return response;
      }

      // Transform exams to calendar events
      const events = response.data
        .filter(exam => {
          const examDate = new Date(exam.start_time);
          const start = new Date(startDate);
          const end = new Date(endDate);
          return examDate >= start && examDate <= end;
        })
        .map(exam => ({
          id: exam.id,
          title: exam.title,
          start: exam.start_time,
          end: exam.end_time,
          status: exam.status,
          description: exam.description,
          participants: exam.participants || 0,
        }));

      return {
        success: true,
        data: events,
      };
    } catch (error) {
      console.error('Get calendar exams error:', error);

      return {
        success: false,
        message: 'Failed to fetch calendar data',
        data: [],
      };
    }
  }

  /**
   * Transform frontend exam data to backend format
   * @param {Object} frontendData - Frontend exam data
   * @returns {Object} Backend-formatted data
   */
  transformToBackendFormat(frontendData) {
    return {
      title: frontendData.title,
      description: frontendData.description,
      start_time: this.combineDateAndTime(frontendData.startDate, frontendData.startTime),
      end_time: this.combineDateAndTime(frontendData.endDate, frontendData.endTime),
      duration_minutes: parseInt(frontendData.duration) || 60,
      status: frontendData.status || 'draft',

      // Proctoring settings
      enable_face_detection: frontendData.enableFaceDetection ?? true,
      enable_multiple_face_detection: frontendData.enableMultipleFaceDetection ?? true,
      enable_eye_tracking: frontendData.enableEyeTracking ?? true,
      enable_audio_detection: frontendData.enableAudioDetection ?? true,
      enable_tab_switch_detection: frontendData.enableTabSwitchDetection ?? true,
      enable_phone_detection: frontendData.enablePhoneDetection ?? true,

      // Trust score thresholds (convert percentage to decimal)
      warning_threshold: (frontendData.warningThreshold || 70) / 100,
      critical_threshold: (frontendData.criticalThreshold || 50) / 100,
    };
  }

  /**
   * Transform backend exam data to frontend format
   * @param {Object} backendData - Backend exam data
   * @returns {Object} Frontend-formatted data
   */
  transformToFrontendFormat(backendData) {
    const startDate = new Date(backendData.start_time);
    const endDate = new Date(backendData.end_time);

    return {
      id: backendData.id,
      title: backendData.title,
      description: backendData.description,
      startDate: startDate.toISOString().split('T')[0],
      startTime: startDate.toTimeString().slice(0, 5),
      endDate: endDate.toISOString().split('T')[0],
      endTime: endDate.toTimeString().slice(0, 5),
      duration: backendData.duration_minutes,
      status: backendData.status,

      // Proctoring settings
      enableFaceDetection: backendData.enable_face_detection,
      enableMultipleFaceDetection: backendData.enable_multiple_face_detection,
      enableEyeTracking: backendData.enable_eye_tracking,
      enableAudioDetection: backendData.enable_audio_detection,
      enableTabSwitchDetection: backendData.enable_tab_switch_detection,
      enablePhoneDetection: backendData.enable_phone_detection,

      // Trust score thresholds (convert decimal to percentage)
      warningThreshold: Math.round((backendData.warning_threshold || 0.7) * 100),
      criticalThreshold: Math.round((backendData.critical_threshold || 0.5) * 100),

      // Additional metadata
      createdAt: backendData.created_at,
      updatedAt: backendData.updated_at,
    };
  }

  /**
   * Combine date and time strings into ISO datetime
   * @param {string} date - Date string (YYYY-MM-DD)
   * @param {string} time - Time string (HH:MM)
   * @returns {string} ISO datetime string
   */
  combineDateAndTime(date, time) {
    if (!date || !time) {
      return new Date().toISOString();
    }

    return new Date(`${date}T${time}:00`).toISOString();
  }
}

// Create and export singleton instance
const examService = new ExamService();
export default examService;
