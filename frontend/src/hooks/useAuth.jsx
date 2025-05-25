import { useState, useEffect, createContext, useContext } from 'react';
import mockAuthService from '../services/mockAuth';

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
      const currentUser = mockAuthService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const user = await mockAuthService.login(email, password);
      setUser(user);
      setError(null);
      return user;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async userData => {
    try {
      const user = await mockAuthService.register(userData);
      setUser(user);
      setError(null);
      return user;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  const logout = () => {
    mockAuthService.logout();
    setUser(null);
  };

  const updateProfile = async userData => {
    try {
      const updatedUser = await mockAuthService.updateProfile(userData);
      setUser(updatedUser);
      setError(null);
      return updatedUser;
    } catch (err) {
      setError(err.message || 'Profile update failed');
      throw err;
    }
  };

  const changePassword = async passwordData => {
    try {
      await mockAuthService.changePassword(passwordData);
      setError(null);
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
    token: user ? 'mock-token' : null, // Mock token for WebSocket
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
