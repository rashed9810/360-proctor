import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Mock the i18n module
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      changeLanguage: vi.fn(),
      language: 'en',
    },
  }),
}));

// Mock the AuthContext
vi.mock('./context/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    user: null,
    loading: false,
    isAuthenticated: false,
  }),
}));

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Check if the language switcher is rendered
    expect(screen.getByText(/Language/i)).toBeInTheDocument();
  });
});
