import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

/**
 * Back button component that navigates to the previous page
 * @param {Object} props - Component props
 * @param {string} props.to - Optional specific route to navigate to
 * @param {string} props.label - Optional label to display next to the icon
 * @param {string} props.className - Optional additional CSS classes
 */
const BackButton = ({ to, label, className = '' }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center justify-center h-8 px-2 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors duration-200 focus:outline-none ${className}`}
      aria-label={t('common.back')}
    >
      <ChevronLeftIcon className="h-5 w-5" />
      {label && <span className="ml-1 text-sm font-medium">{label}</span>}
    </button>
  );
};

export default BackButton;
