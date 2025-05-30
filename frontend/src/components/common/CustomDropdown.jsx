import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { setupDropdownKeyboardNav } from '../../utils/accessibility';

/**
 * Custom dropdown component with consistent positioning and accessibility features
 * @param {Object} props - Component props
 * @param {string} props.value - Current selected value
 * @param {Function} props.onChange - Function to handle value change
 * @param {Array} props.options - Array of options [{value: string, label: string}]
 * @param {string} props.label - Optional label for the dropdown
 * @param {string} props.className - Optional additional CSS classes
 * @param {string} props.position - Vertical position of dropdown ('bottom' or 'top', default: 'bottom')
 * @param {string} props.horizontalPosition - Horizontal position of dropdown ('right' or 'left', default: 'right')
 * @param {string} props.id - Optional ID for the dropdown (generated if not provided)
 * @param {string} props.ariaLabel - Optional ARIA label for the dropdown
 */
const CustomDropdown = ({
  value,
  onChange,
  options,
  label,
  className = '',
  position = 'bottom',
  horizontalPosition = 'right',
  id,
  ariaLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const uniqueId = useRef(`dropdown-${Math.random().toString(36).substring(2, 9)}`);

  // Use provided ID or generated one
  const dropdownId = id || uniqueId.current;
  const menuId = `${dropdownId}-menu`;
  const labelId = label ? `${dropdownId}-label` : undefined;

  const selectedOption = options.find(option => option.value === value) || options[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Set up keyboard navigation
  useEffect(() => {
    if (isOpen && buttonRef.current && menuRef.current) {
      // First menu item should receive focus when menu opens
      const firstMenuItem = menuRef.current.querySelector('[role="menuitem"]');
      if (firstMenuItem) {
        firstMenuItem.focus();
      }
    }
  }, [isOpen]);

  // Handle option selection
  const handleSelect = optionValue => {
    onChange(optionValue);
    setIsOpen(false);

    // Return focus to the dropdown button after selection
    if (buttonRef.current) {
      buttonRef.current.focus();
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = e => {
    if (!isOpen) {
      // Open menu on arrow down, enter or space
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
    } else {
      // Close menu on escape
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }
  };

  return (
    <div
      className={`relative inline-block text-left ${className}`}
      ref={dropdownRef}
      id={dropdownId}
    >
      {label && (
        <span id={labelId} className="text-sm text-gray-500 dark:text-gray-400 mr-2">
          {label}:
        </span>
      )}

      <button
        type="button"
        ref={buttonRef}
        className="inline-flex justify-between items-center w-full rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm px-3 sm:px-4 py-2.5 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={labelId}
        aria-label={ariaLabel || (label ? undefined : 'Select an option')}
        id={`${dropdownId}-button`}
        aria-controls={isOpen ? menuId : undefined}
      >
        <span className="truncate">{selectedOption.label}</span>
        <ChevronDownIcon
          className={`ml-1 sm:ml-2 -mr-1 h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          id={menuId}
          className={`origin-top-right absolute ${position === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'} ${horizontalPosition === 'left' ? 'left-0' : 'right-0'} w-full min-w-[180px] max-w-[250px] rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-20`}
          role="listbox"
          aria-labelledby={`${dropdownId}-button`}
          tabIndex={-1}
        >
          <div className="py-1 max-h-60 overflow-auto" role="presentation">
            {options.map((option, index) => (
              <button
                key={option.value}
                id={`${dropdownId}-option-${index}`}
                onClick={() => handleSelect(option.value)}
                onKeyDown={e => {
                  // Handle arrow key navigation
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextOption = menuRef.current?.querySelector(
                      `#${dropdownId}-option-${index + 1}`
                    );
                    if (nextOption) nextOption.focus();
                    else menuRef.current?.querySelector(`#${dropdownId}-option-0`)?.focus();
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevOption = menuRef.current?.querySelector(
                      `#${dropdownId}-option-${index - 1}`
                    );
                    if (prevOption) prevOption.focus();
                    else {
                      const lastIndex = options.length - 1;
                      menuRef.current?.querySelector(`#${dropdownId}-option-${lastIndex}`)?.focus();
                    }
                  } else if (e.key === 'Home') {
                    e.preventDefault();
                    menuRef.current?.querySelector(`#${dropdownId}-option-0`)?.focus();
                  } else if (e.key === 'End') {
                    e.preventDefault();
                    const lastIndex = options.length - 1;
                    menuRef.current?.querySelector(`#${dropdownId}-option-${lastIndex}`)?.focus();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    setIsOpen(false);
                    buttonRef.current?.focus();
                  } else if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect(option.value);
                  }
                }}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  option.value === value
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                } transition-colors duration-150 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700`}
                role="option"
                aria-selected={option.value === value}
                tabIndex={0}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
