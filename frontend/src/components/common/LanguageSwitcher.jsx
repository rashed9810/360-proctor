import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'bn', name: 'বাংলা' },
];

/**
 * Language switcher component that can be used throughout the application
 * @param {Object} props - Component props
 * @param {string} props.variant - 'dropdown' or 'select' (default: 'dropdown')
 * @param {string} props.position - 'navbar' or 'auth' (default: 'navbar')
 */
const LanguageSwitcher = ({ variant = 'dropdown', position = 'navbar' }) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = languageCode => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  // Styling based on position
  const positionStyles = {
    navbar: 'text-gray-700',
    auth: 'text-gray-700 bg-white shadow-sm',
  };

  // If variant is select, render a simple select dropdown
  if (variant === 'select') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="flex items-center space-x-1 sm:space-x-2">
          <GlobeAltIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
          <select
            onChange={e => changeLanguage(e.target.value)}
            value={i18n.language}
            className="bg-transparent border-none focus:ring-0 text-xs sm:text-sm font-medium text-gray-700 cursor-pointer py-1 pl-0 pr-4"
            aria-label={t('common.language')}
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </motion.div>
    );
  }

  // Default dropdown variant
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative inline-block text-left"
    >
      <button
        type="button"
        className={`inline-flex items-center justify-center px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 ${positionStyles[position]}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <GlobeAltIcon
          className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-gray-500"
          aria-hidden="true"
        />
        <span className="hidden xs:inline">{currentLanguage.name}</span>
        <span className="xs:hidden">{currentLanguage.code.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-32 sm:w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="language-menu"
          >
            {languages.map(language => (
              <button
                key={language.code}
                onClick={() => changeLanguage(language.code)}
                className={`block w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-100 transition-colors duration-150 ${
                  language.code === i18n.language
                    ? 'bg-gray-50 text-indigo-600 font-medium'
                    : 'text-gray-700'
                }`}
                role="menuitem"
              >
                {language.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default LanguageSwitcher;
