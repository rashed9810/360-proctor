import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSwitcher from './LanguageSwitcher';

// Mock the react-i18next module
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: key => key,
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
    },
  }),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

describe('LanguageSwitcher', () => {
  it('renders select variant correctly', () => {
    render(<LanguageSwitcher variant="select" />);

    // Check if the select element is rendered
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toBeInTheDocument();

    // Check if both language options are available
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('বাংলা')).toBeInTheDocument();
  });

  it('renders dropdown variant correctly', () => {
    render(<LanguageSwitcher variant="dropdown" />);

    // Check if the button is rendered
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('English');

    // Click the button to open the dropdown
    fireEvent.click(button);

    // Check if both language options are available in the dropdown
    expect(screen.getAllByRole('menuitem').length).toBe(2);
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('বাংলা')).toBeInTheDocument();
  });

  it('applies different styles based on position prop', () => {
    const { rerender } = render(<LanguageSwitcher variant="dropdown" position="navbar" />);

    // Check navbar styling
    let button = screen.getByRole('button');
    expect(button.className).toContain('text-gray-700');

    // Rerender with auth position
    rerender(<LanguageSwitcher variant="dropdown" position="auth" />);

    // Check auth styling
    button = screen.getByRole('button');
    expect(button.className).toContain('text-gray-700 bg-white shadow-sm');
  });
});
