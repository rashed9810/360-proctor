import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BackButton from '../common/BackButton';

/**
 * Page header component with title and optional back button
 * @param {Object} props - Component props
 * @param {string} props.title - Page title
 * @param {boolean} props.showBackButton - Whether to show the back button
 * @param {string} props.backTo - Optional specific route to navigate back to
 * @param {string} props.backLabel - Optional label for the back button
 * @param {React.ReactNode} props.actions - Optional actions to display on the right
 */
const PageHeader = ({ 
  title, 
  showBackButton = false, 
  backTo, 
  backLabel, 
  actions,
  children
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  
  // Only show back button if explicitly requested or if we're not on the main dashboard
  const shouldShowBackButton = showBackButton || (location.pathname !== '/' && location.pathname !== '/dashboard');

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div className="flex items-center gap-3">
        {shouldShowBackButton && (
          <BackButton to={backTo} label={backLabel} />
        )}
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h1>
      </div>
      
      {actions && (
        <div className="flex items-center space-x-2 self-end sm:self-auto">
          {actions}
        </div>
      )}
      
      {children}
    </div>
  );
};

export default PageHeader;
