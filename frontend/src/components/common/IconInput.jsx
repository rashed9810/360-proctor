import React from 'react';

/**
 * Input field with icon component
 * @param {Object} props - Component props
 * @param {string} props.id - Input ID
 * @param {string} props.name - Input name
 * @param {string} props.type - Input type
 * @param {string} props.placeholder - Input placeholder
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Input change handler
 * @param {boolean} props.required - Whether the input is required
 * @param {string} props.autoComplete - Input autocomplete attribute
 * @param {React.ReactNode} props.icon - Icon component
 * @param {string} props.error - Error message
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.isFirst - Whether this is the first input in a group
 * @param {boolean} props.isLast - Whether this is the last input in a group
 */
const IconInput = ({
  id,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  autoComplete,
  icon: Icon,
  error,
  className = '',
  isFirst = false,
  isLast = false,
  ...rest
}) => {
  // Determine border radius classes based on position in input group
  const borderRadiusClasses = () => {
    if (isFirst && isLast) return 'rounded-md';
    if (isFirst) return 'rounded-t-md';
    if (isLast) return 'rounded-b-md';
    return '';
  };

  return (
    <div className="relative">
      {/* Icon */}
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
      )}

      {/* Input field */}
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className={`
          appearance-none relative block w-full px-3 py-2
          ${Icon ? 'pl-10' : 'pl-3'}
          border border-gray-300 dark:border-gray-700
          placeholder-gray-500 dark:placeholder-gray-400
          text-gray-900 dark:text-gray-100
          ${borderRadiusClasses()}
          focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10
          bg-white dark:bg-gray-800
          transition-colors duration-200
          ${error ? 'border-red-500 dark:border-red-500' : ''}
          ${className}
        `}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...rest}
      />

      {/* Error message */}
      {error && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-red-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default IconInput;
