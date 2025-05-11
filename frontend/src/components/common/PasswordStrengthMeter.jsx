import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Password strength meter component
 * @param {Object} props - Component props
 * @param {string} props.password - The password to evaluate
 * @param {boolean} props.showCriteria - Whether to show password criteria
 */
const PasswordStrengthMeter = ({ password = '', showCriteria = true }) => {
  const { t } = useTranslation();

  // Password criteria checks
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  // Calculate strength score (0-4)
  const strengthScore = useMemo(() => {
    if (!password) return 0;
    
    let score = 0;
    if (hasMinLength) score++;
    if (hasUpperCase) score++;
    if (hasNumber) score++;
    if (hasSpecialChar) score++;
    
    return score;
  }, [password, hasMinLength, hasUpperCase, hasNumber, hasSpecialChar]);

  // Determine strength label and color
  const getStrengthInfo = () => {
    if (!password) return { label: '', color: 'bg-gray-200' };
    
    switch (strengthScore) {
      case 1:
        return { 
          label: t('profile.passwordWeak') || 'Weak', 
          color: 'bg-red-500',
          width: '25%'
        };
      case 2:
        return { 
          label: t('profile.passwordMedium') || 'Medium', 
          color: 'bg-yellow-500',
          width: '50%'
        };
      case 3:
        return { 
          label: t('profile.passwordMedium') || 'Medium', 
          color: 'bg-yellow-500',
          width: '75%'
        };
      case 4:
        return { 
          label: t('profile.passwordStrong') || 'Strong', 
          color: 'bg-green-500',
          width: '100%'
        };
      default:
        return { 
          label: '', 
          color: 'bg-gray-200',
          width: '0%'
        };
    }
  };

  const { label, color, width } = getStrengthInfo();

  return (
    <div className="mt-1 space-y-2">
      {/* Strength meter bar */}
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-300 ease-in-out`} 
          style={{ width }}
        />
      </div>
      
      {/* Strength label */}
      {password && (
        <div className="flex justify-between items-center text-xs">
          <span className="font-medium">{label}</span>
        </div>
      )}
      
      {/* Password criteria */}
      {showCriteria && password && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-2">
          <div className={`text-xs flex items-center ${hasMinLength ? 'text-green-600' : 'text-gray-500'}`}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-3.5 w-3.5 mr-1 ${hasMinLength ? 'text-green-600' : 'text-gray-400'}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              {hasMinLength ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              )}
            </svg>
            {t('profile.passwordLength') || 'At least 8 characters'}
          </div>
          
          <div className={`text-xs flex items-center ${hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-3.5 w-3.5 mr-1 ${hasUpperCase ? 'text-green-600' : 'text-gray-400'}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              {hasUpperCase ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              )}
            </svg>
            {t('profile.passwordUppercase') || 'At least one uppercase letter'}
          </div>
          
          <div className={`text-xs flex items-center ${hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-3.5 w-3.5 mr-1 ${hasNumber ? 'text-green-600' : 'text-gray-400'}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              {hasNumber ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              )}
            </svg>
            {t('profile.passwordNumber') || 'At least one number'}
          </div>
          
          <div className={`text-xs flex items-center ${hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-3.5 w-3.5 mr-1 ${hasSpecialChar ? 'text-green-600' : 'text-gray-400'}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              {hasSpecialChar ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              )}
            </svg>
            {t('profile.passwordSpecial') || 'At least one special character'}
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;
