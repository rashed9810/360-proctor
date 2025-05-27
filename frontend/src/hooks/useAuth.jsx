import { useState, useEffect, createContext, useContext } from 'react';
import authService from '../api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (authService.isAuthenticated()) {
        const currentUser = authService.getStoredUser();
        if (currentUser) {
          setUser(currentUser);
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const result = await authService.login(email, password);
      if (result.success) {
        setUser(result.user);
        setError(null);
        return result.user;
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async userData => {
    try {
      const result = await authService.register(userData);
      if (result.success) {
        setUser(result.user);
        setError(null);
        return result.user;
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateProfile = async userData => {
    try {
      const result = await authService.updateProfile(userData);
      if (result.success) {
        setUser(result.user);
        setError(null);
        return result.user;
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err.message || 'Profile update failed');
      throw err;
    }
  };

  const changePassword = async passwordData => {
    try {
      const result = await authService.changePassword(passwordData);
      if (result.success) {
        setError(null);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err.message || 'Password change failed');
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,

    // Utility methods
    isAuthenticated: !!user,
    token: authService.getStoredToken(), // Real token from authService
    getUserRole: () => user?.role || null,
    getUserName: () => user?.full_name || user?.name || 'User',
    getUserEmail: () => user?.email || '',

    // Permission methods
    hasRole: role => user?.role === role,
    isAdmin: () => user?.role === 'admin',
    isTeacher: () => user?.role === 'teacher',
    isStudent: () => user?.role === 'student',
    canManageExams: () => user?.role === 'admin' || user?.role === 'teacher',
    canManageUsers: () => user?.role === 'admin',
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
