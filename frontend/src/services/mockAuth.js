// Mock authentication service for development
const STORAGE_KEY = 'mock_auth_user';

// Mock user data
const mockUsers = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
    avatar: '/assets/images/default-avatar.svg',
  },
  {
    id: 2,
    name: 'Student User',
    email: 'student@example.com',
    password: 'password123',
    role: 'student',
    avatar: '/assets/images/default-avatar.svg',
  },
  {
    id: 3,
    name: 'Teacher User',
    email: 'teacher@example.com',
    password: 'password123',
    role: 'teacher',
    avatar: '/assets/images/default-avatar.svg',
  },
];

// Helper to simulate API delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Get current user from storage
const getCurrentUser = () => {
  const userJson = localStorage.getItem(STORAGE_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

// Mock login
const login = async (email, password) => {
  // Simulate API delay
  await delay(800);

  const user = mockUsers.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Create a copy without the password
  const { password: _, ...userWithoutPassword } = user;

  // Store in localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userWithoutPassword));

  return userWithoutPassword;
};

// Mock register
const register = async userData => {
  // Simulate API delay
  await delay(800);

  // Check if email already exists
  if (mockUsers.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
    throw new Error('Email already in use');
  }

  // Create new user
  const newUser = {
    id: mockUsers.length + 1,
    name: userData.name,
    email: userData.email,
    password: userData.password,
    role: 'student', // Default role
    avatar: '/assets/images/default-avatar.svg',
  };

  // Add to mock database
  mockUsers.push(newUser);

  // Create a copy without the password
  const { password: _, ...userWithoutPassword } = newUser;

  // Store in localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userWithoutPassword));

  return userWithoutPassword;
};

// Mock logout
const logout = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// Mock update profile
const updateProfile = async userData => {
  // Simulate API delay
  await delay(800);

  const currentUser = getCurrentUser();

  if (!currentUser) {
    throw new Error('Not authenticated');
  }

  // Update user in mock database
  const userIndex = mockUsers.findIndex(u => u.id === currentUser.id);

  if (userIndex === -1) {
    throw new Error('User not found');
  }

  // Update fields
  mockUsers[userIndex] = {
    ...mockUsers[userIndex],
    name: userData.name || mockUsers[userIndex].name,
    email: userData.email || mockUsers[userIndex].email,
    avatar: userData.avatar || mockUsers[userIndex].avatar,
    bio: userData.bio || mockUsers[userIndex].bio,
  };

  // Create updated user without password
  const { password: _, ...updatedUser } = mockUsers[userIndex];

  // Update in localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

  return updatedUser;
};

// Mock change password
const changePassword = async passwordData => {
  // Simulate API delay
  await delay(800);

  const currentUser = getCurrentUser();

  if (!currentUser) {
    throw new Error('Not authenticated');
  }

  // Find user in mock database
  const userIndex = mockUsers.findIndex(u => u.id === currentUser.id);

  if (userIndex === -1) {
    throw new Error('User not found');
  }

  // Check current password
  if (mockUsers[userIndex].password !== passwordData.currentPassword) {
    throw new Error('Current password is incorrect');
  }

  // Update password
  mockUsers[userIndex].password = passwordData.newPassword;

  return { success: true };
};

export const mockAuthService = {
  getCurrentUser,
  login,
  register,
  logout,
  updateProfile,
  changePassword,
};

export default mockAuthService;
