import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

/**
 * Custom dropdown component with consistent positioning
 * @param {Object} props - Component props
 * @param {string} props.value - Current selected value
 * @param {Function} props.onChange - Function to handle value change
 * @param {Array} props.options - Array of options [{value: string, label: string}]
 * @param {string} props.label - Optional label for the dropdown
 * @param {string} props.className - Optional additional CSS classes
 * @param {string} props.position - Vertical position of dropdown ('bottom' or 'top', default: 'bottom')
 * @param {string} props.horizontalPosition - Horizontal position of dropdown ('right' or 'left', default: 'right')
 */
const CustomDropdown = ({
  value,
  onChange,
  options,
  label,
  className = '',
  position = 'bottom',
  horizontalPosition = 'right',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
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

  // Handle option selection
  const handleSelect = optionValue => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {label && <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">{label}:</span>}

      <button
        type="button"
        className="inline-flex justify-between items-center w-full rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm px-3 sm:px-4 py-2.5 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="truncate">{selectedOption.label}</span>
        <ChevronDownIcon
          className={`ml-1 sm:ml-2 -mr-1 h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          className={`origin-top-right absolute ${position === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'} ${horizontalPosition === 'left' ? 'left-0' : 'right-0'} w-full min-w-[180px] max-w-[250px] rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-20`}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
        >
          <div className="py-1 max-h-60 overflow-auto" role="none">
            {options.map(option => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  option.value === value
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                } transition-colors duration-150`}
                role="menuitem"
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
