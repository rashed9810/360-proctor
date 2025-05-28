import React from 'react';

/**
 * A reusable SVG background pattern component for auth pages
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.primaryColor - Primary color for the pattern (default: #6366F1)
 * @param {string} props.secondaryColor - Secondary color for the pattern (default: #4338CA)
 * @param {number} props.opacity - Opacity of the pattern (default: 0.05)
 */
const BackgroundPattern = ({
  className = '',
  primaryColor = '#6366F1',
  secondaryColor = '#4338CA',
  opacity = 0.05,
}) => {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <svg
        className="absolute w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern
            id="pattern-circles"
            x="0"
            y="0"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
            patternContentUnits="userSpaceOnUse"
          >
            {/* Large circle */}
            <circle cx="50" cy="50" r="30" fill={primaryColor} opacity={opacity} />

            {/* Small circles at cardinal points */}
            <circle cx="50" cy="10" r="5" fill={secondaryColor} opacity={opacity * 1.5} />
            <circle cx="90" cy="50" r="5" fill={secondaryColor} opacity={opacity * 1.5} />
            <circle cx="50" cy="90" r="5" fill={secondaryColor} opacity={opacity * 1.5} />
            <circle cx="10" cy="50" r="5" fill={secondaryColor} opacity={opacity * 1.5} />
          </pattern>

          <pattern
            id="pattern-dots"
            x="0"
            y="0"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
            patternContentUnits="userSpaceOnUse"
          >
            <circle cx="10" cy="10" r="1.5" fill={primaryColor} opacity={opacity * 2} />
          </pattern>

          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.03" />
            <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.03" />
          </linearGradient>
        </defs>

        {/* Background gradient */}
        <rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />

        {/* Pattern layers */}
        <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)" />
        <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-dots)" />

        {/* Decorative elements similar to the logo */}
        <circle cx="85%" cy="15%" r="100" fill={primaryColor} opacity="0.03" />
        <circle cx="15%" cy="85%" r="80" fill={secondaryColor} opacity="0.03" />

        {/* Arc element inspired by the 360° logo */}
        <path
          d="M80,80 A50,50 0 1,1 79.99,80"
          stroke={primaryColor}
          strokeWidth="3"
          fill="none"
          opacity="0.07"
        />
        <path
          d="M1000,200 A120,120 0 1,1 999.99,200"
          stroke={secondaryColor}
          strokeWidth="5"
          fill="none"
          opacity="0.05"
        />
      </svg>
    </div>
  );
};

export default BackgroundPattern;
