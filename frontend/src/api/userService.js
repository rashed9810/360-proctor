import api from './api';

/**
 * User service for handling user-related operations
 * Provides clean, readable methods for user management
 */
class UserService {
  /**
   * Get all users (admin only)
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of users
   */
  async getAllUsers(params = {}) {
    try {
      const { skip = 0, limit = 100, role, search, is_active } = params;
      
      const queryParams = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString(),
      });
      
      if (role) queryParams.append('role', role);
      if (search) queryParams.append('search', search);
      if (is_active !== undefined) queryParams.append('is_active', is_active.toString());

      const response = await api.get(`/users?${queryParams}`);
      
      return {
        success: true,
        data: response.data,
        total: response.data.length,
      };
    } catch (error) {
      console.error('Get users error:', error);
      
      return {
        success: false,
        message: error.response?.data?.detail || 'Failed to fetch users',
        data: [],
      };
    }
  }

  /**
   * Get user by ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User data
   */
  async getUserById(userId) {
    try {
      const response = await api.get(`/users/${userId}`);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Get user error:', error);
      
      return {
        success: false,
        message: error.response?.data?.detail || 'Failed to fetch user',
        data: null,
      };
    }
  }

  /**
   * Create new user (admin only)
   * @param {Object} userData - User creation data
   * @returns {Promise<Object>} Created user
   */
  async createUser(userData) {
    try {
      const response = await api.post('/users', {
        email: userData.email,
        password: userData.password,
        full_name: userData.full_name || userData.name,
        role: userData.role || 'student',
        is_active: userData.is_active ?? true,
        preferred_language: userData.preferred_language || 'en',
      });
      
      return {
        success: true,
        data: response.data,
        message: 'User created successfully',
      };
    } catch (error) {
      console.error('Create user error:', error);
      
      // Handle validation errors
      if (error.response?.status === 422) {
        const validationErrors = error.response.data?.detail || [];
        const errorMessages = validationErrors.map(err => 
          `${err.loc?.[1] || 'Field'}: ${err.msg}`
        ).join(', ');
        
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
          message: 'Email already exists. Please use a different email.',
          error: 'EMAIL_EXISTS',
        };
      }

      return {
        success: false,
        message: error.response?.data?.detail || 'Failed to create user',
        error: error.response?.status || 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Update user
   * @param {number} userId - User ID
   * @param {Object} userData - User update data
   * @returns {Promise<Object>} Updated user
   */
  async updateUser(userId, userData) {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      
      return {
        success: true,
        data: response.data,
        message: 'User updated successfully',
      };
    } catch (error) {
      console.error('Update user error:', error);
      
      return {
        success: false,
        message: error.response?.data?.detail || 'Failed to update user',
        error: error.response?.status || 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Delete user (admin only)
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteUser(userId) {
    try {
      await api.delete(`/users/${userId}`);
      
      return {
        success: true,
        message: 'User deleted successfully',
      };
    } catch (error) {
      console.error('Delete user error:', error);
      
      return {
        success: false,
        message: error.response?.data?.detail || 'Failed to delete user',
        error: error.response?.status || 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Get students (for exam assignment)
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of students
   */
  async getStudents(params = {}) {
    try {
      const response = await this.getAllUsers({
        ...params,
        role: 'student',
      });
      
      return response;
    } catch (error) {
      console.error('Get students error:', error);
      
      return {
        success: false,
        message: 'Failed to fetch students',
        data: [],
      };
    }
  }

  /**
   * Get teachers
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of teachers
   */
  async getTeachers(params = {}) {
    try {
      const response = await this.getAllUsers({
        ...params,
        role: 'teacher',
      });
      
      return response;
    } catch (error) {
      console.error('Get teachers error:', error);
      
      return {
        success: false,
        message: 'Failed to fetch teachers',
        data: [],
      };
    }
  }

  /**
   * Get user statistics
   * @returns {Promise<Object>} User statistics
   */
  async getUserStats() {
    try {
      const response = await api.get('/users/stats');
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Get user stats error:', error);
      
      // Fallback to calculating stats from user list
      try {
        const usersResponse = await this.getAllUsers({ limit: 1000 });
        
        if (usersResponse.success) {
          const users = usersResponse.data;
          const stats = {
            total: users.length,
            active: users.filter(u => u.is_active).length,
            students: users.filter(u => u.role === 'student').length,
            teachers: users.filter(u => u.role === 'teacher').length,
            admins: users.filter(u => u.role === 'admin').length,
          };
          
          return {
            success: true,
            data: stats,
          };
        }
      } catch (fallbackError) {
        console.error('Fallback stats calculation error:', fallbackError);
      }
      
      return {
        success: false,
        message: 'Failed to fetch user statistics',
        data: {
          total: 0,
          active: 0,
          students: 0,
          teachers: 0,
          admins: 0,
        },
      };
    }
  }

  /**
   * Activate/deactivate user
   * @param {number} userId - User ID
   * @param {boolean} isActive - Active status
   * @returns {Promise<Object>} Update result
   */
  async setUserActiveStatus(userId, isActive) {
    try {
      const response = await this.updateUser(userId, { is_active: isActive });
      
      return {
        ...response,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      };
    } catch (error) {
      console.error('Set user active status error:', error);
      
      return {
        success: false,
        message: `Failed to ${isActive ? 'activate' : 'deactivate'} user`,
        error: error.response?.status || 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Change user role
   * @param {number} userId - User ID
   * @param {string} newRole - New role (student, teacher, admin)
   * @returns {Promise<Object>} Update result
   */
  async changeUserRole(userId, newRole) {
    try {
      const response = await this.updateUser(userId, { role: newRole });
      
      return {
        ...response,
        message: `User role changed to ${newRole} successfully`,
      };
    } catch (error) {
      console.error('Change user role error:', error);
      
      return {
        success: false,
        message: 'Failed to change user role',
        error: error.response?.status || 'UNKNOWN_ERROR',
      };
    }
  }
}

// Create and export singleton instance
const userService = new UserService();
export default userService;
