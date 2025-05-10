import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserData(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      const response = await axios.get('/api/v1/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/v1/auth/login', {
        username: email,
        password
      });
      
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      
      await fetchUserData(access_token);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      await axios.post('/api/v1/auth/register', userData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
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
