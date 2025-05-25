import api from './api';

/**
 * Authentication service for handling user authentication
 * Provides clean, readable methods for auth operations
 */
class AuthService {
  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User data and token
   */
  async login(email, password) {
    try {
      // Prepare form data as required by FastAPI OAuth2PasswordRequestForm
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token, token_type } = response.data;

      // Store token in localStorage
      localStorage.setItem('token', access_token);

      // Fetch user data
      const userData = await this.getCurrentUser();

      return {
        success: true,
        user: userData,
        token: access_token,
        tokenType: token_type,
      };
    } catch (error) {
      console.error('Login error:', error);

      // Extract error message from response
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Login failed. Please check your credentials.';

      return {
        success: false,
        message: errorMessage,
        error: error.response?.status || 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration result
   */
  async register(userData) {
    try {
      const response = await api.post('/auth/register', {
        email: userData.email,
        password: userData.password,
        full_name: userData.full_name || userData.name,
        role: userData.role || 'student',
        preferred_language: userData.preferred_language || 'en',
      });

      return {
        success: true,
        user: response.data,
        message: 'Registration successful! Please login to continue.',
      };
    } catch (error) {
      console.error('Registration error:', error);

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

      // Handle duplicate email error
      if (error.response?.status === 400) {
        return {
          success: false,
          message: 'Email already registered. Please use a different email.',
          error: 'EMAIL_EXISTS',
        };
      }

      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Registration failed. Please try again.';

      return {
        success: false,
        message: errorMessage,
        error: error.response?.status || 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Get current authenticated user
   * @returns {Promise<Object>} Current user data
   */
  async getCurrentUser() {
    try {
      const response = await api.get('/users/me');

      // Store user data in localStorage for quick access
      localStorage.setItem('user', JSON.stringify(response.data));

      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);

      // Clear invalid token
      if (error.response?.status === 401) {
        this.logout();
      }

      throw error;
    }
  }

  /**
   * Logout user
   * Clears all stored authentication data
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Clear any cached data
    localStorage.removeItem('theme');
    localStorage.removeItem('language');

    // Redirect to login page
    window.location.href = '/login';
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  }

  /**
   * Get stored user data
   * @returns {Object|null} User data or null
   */
  getStoredUser() {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  }

  /**
   * Get stored token
   * @returns {string|null} Token or null
   */
  getStoredToken() {
    return localStorage.getItem('token');
  }

  /**
   * Update user profile
   * @param {Object} profileData - Profile update data
   * @returns {Promise<Object>} Update result
   */
  async updateProfile(profileData) {
    try {
      const response = await api.put('/users/me', profileData);

      // Update stored user data
      localStorage.setItem('user', JSON.stringify(response.data));

      return {
        success: true,
        user: response.data,
        message: 'Profile updated successfully',
      };
    } catch (error) {
      console.error('Update profile error:', error);

      const errorMessage =
        error.response?.data?.detail || error.response?.data?.message || 'Failed to update profile';

      return {
        success: false,
        message: errorMessage,
        error: error.response?.status || 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Change user password
   * @param {Object} passwordData - Password change data
   * @returns {Promise<Object>} Change result
   */
  async changePassword(passwordData) {
    try {
      await api.put('/users/me/password', {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      });

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error) {
      console.error('Change password error:', error);

      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to change password';

      return {
        success: false,
        message: errorMessage,
        error: error.response?.status || 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Social login with Google or Facebook
   * @param {Object} socialData - Social login data
   * @returns {Promise<Object>} Login result
   */
  async socialLogin(socialData) {
    try {
      const response = await api.post('/auth/social-login', {
        provider: socialData.provider,
        token: socialData.token,
        user_info: socialData.user,
      });

      const { access_token, user } = response.data;

      // Store authentication data
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));

      return {
        success: true,
        user,
        token: access_token,
        message: 'Social login successful!',
      };
    } catch (error) {
      console.error('Social login error:', error);

      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Social login failed. Please try again.';

      return {
        success: false,
        message: errorMessage,
        error: error.response?.status || 'SOCIAL_LOGIN_ERROR',
      };
    }
  }

  /**
   * Refresh authentication token
   * @returns {Promise<Object>} Refresh result
   */
  async refreshToken() {
    try {
      const response = await api.post('/auth/refresh');
      const { access_token } = response.data;

      localStorage.setItem('token', access_token);

      return {
        success: true,
        token: access_token,
      };
    } catch (error) {
      console.error('Token refresh error:', error);

      // If refresh fails, logout user
      this.logout();

      return {
        success: false,
        message: 'Session expired. Please login again.',
      };
    }
  }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService;
