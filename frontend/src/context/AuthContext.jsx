import { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * Initialize authentication state
   * Check for existing token and fetch user data
   */
  const initializeAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is already authenticated
      if (authService.isAuthenticated()) {
        // Try to get stored user data first
        const storedUser = authService.getStoredUser();

        if (storedUser) {
          setUser(storedUser);

          // Verify token is still valid by fetching fresh user data
          try {
            const freshUserData = await authService.getCurrentUser();
            setUser(freshUserData);
          } catch (error) {
            // Token might be expired, clear auth state
            console.warn('Token verification failed:', error);
            authService.logout();
            setUser(null);
          }
        } else {
          // No stored user data, fetch from server
          try {
            const userData = await authService.getCurrentUser();
            setUser(userData);
          } catch (error) {
            console.error('Failed to fetch user data:', error);
            authService.logout();
            setUser(null);
          }
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setError('Failed to initialize authentication');
      authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Login result
   */
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const result = await authService.login(email, password);

      if (result.success) {
        setUser(result.user);
        return { success: true, user: result.user };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMessage = 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration result
   */
  const register = async userData => {
    try {
      setLoading(true);
      setError(null);

      const result = await authService.register(userData);

      if (result.success) {
        return { success: true, message: result.message };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMessage = 'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user
   * Clears all authentication state
   */
  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
  };

  /**
   * Update user profile
   * @param {Object} profileData - Profile update data
   * @returns {Promise<Object>} Update result
   */
  const updateProfile = async profileData => {
    try {
      setLoading(true);
      setError(null);

      const result = await authService.updateProfile(profileData);

      if (result.success) {
        setUser(result.user);
        return { success: true, user: result.user, message: result.message };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMessage = 'Failed to update profile. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Change user password
   * @param {Object} passwordData - Password change data
   * @returns {Promise<Object>} Change result
   */
  const changePassword = async passwordData => {
    try {
      setLoading(true);
      setError(null);

      const result = await authService.changePassword(passwordData);

      if (result.success) {
        return { success: true, message: result.message };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMessage = 'Failed to change password. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   * @returns {boolean} Whether user has role
   */
  const hasRole = role => {
    return user?.role === role;
  };

  /**
   * Check if user is admin
   * @returns {boolean} Whether user is admin
   */
  const isAdmin = () => {
    return hasRole('admin');
  };

  /**
   * Check if user is teacher
   * @returns {boolean} Whether user is teacher
   */
  const isTeacher = () => {
    return hasRole('teacher');
  };

  /**
   * Check if user is student
   * @returns {boolean} Whether user is student
   */
  const isStudent = () => {
    return hasRole('student');
  };

  /**
   * Check if user can manage exams
   * @returns {boolean} Whether user can manage exams
   */
  const canManageExams = () => {
    return isAdmin() || isTeacher();
  };

  /**
   * Check if user can manage users
   * @returns {boolean} Whether user can manage users
   */
  const canManageUsers = () => {
    return isAdmin();
  };

  const value = {
    // State
    user,
    loading,
    error,

    // Authentication methods
    login,
    register,
    logout,

    // Profile methods
    updateProfile,
    changePassword,

    // Permission methods
    hasRole,
    isAdmin,
    isTeacher,
    isStudent,
    canManageExams,
    canManageUsers,

    // Utility methods
    isAuthenticated: !!user,
    getUserRole: () => user?.role || null,
    getUserName: () => user?.full_name || user?.name || 'User',
    getUserEmail: () => user?.email || '',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
