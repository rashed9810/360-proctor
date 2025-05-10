import React from 'react';
import { useTranslation } from 'react-i18next';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
    // You can also log the error to an error reporting service here
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-2" />
            <h2 className="text-lg font-semibold text-red-800">{this.props.t('common.error')}</h2>
          </div>
          <p className="mt-2 text-sm text-red-700">
            {this.state.error && this.state.error.toString()}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {this.props.t('common.reset')}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrap the ErrorBoundary with useTranslation
const ErrorBoundaryWithTranslation = props => {
  const { t } = useTranslation();
  return <ErrorBoundary {...props} t={t} />;
};

export default ErrorBoundaryWithTranslation;
