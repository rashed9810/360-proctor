import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

/**
 * Feedback form component for collecting user input
 */
const FeedbackForm = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'suggestion',
    message: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [charactersRemaining, setCharactersRemaining] = useState(500);

  const MAX_MESSAGE_LENGTH = 500;

  // Update character count when message changes
  useEffect(() => {
    setCharactersRemaining(MAX_MESSAGE_LENGTH - formData.message.length);
  }, [formData.message]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = e => {
      // Close form on Escape key
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }

      // Submit form on Ctrl+Enter or Command+Enter
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && isOpen) {
        const form = document.querySelector('form');
        if (form) {
          form.dispatchEvent(new Event('submit', { cancelable: true }));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleChange = e => {
    const { name, value } = e.target;

    if (name === 'message' && value.length > MAX_MESSAGE_LENGTH) {
      return; // Prevent exceeding character limit
    }

    if (name === 'email') {
      // Clear email error when field is empty (since it's optional)
      if (value === '') {
        setEmailError('');
      } else {
        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setEmailError(emailRegex.test(value) ? '' : t('feedback:feedback.invalidEmail'));
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Validate form before submission
    if (!formData.message.trim()) {
      toast.error(t('feedback:feedback.message') + ' ' + t('validation.required'));
      return;
    }

    // Validate email if provided
    if (formData.email && emailError) {
      toast.error(t('feedback:feedback.invalidEmail'));
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    try {
      // In a real app, you would send this data to your backend
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success(t('feedback:feedback.thankYou'));
      setFormData({
        type: 'suggestion',
        message: '',
        email: '',
      });
      setIsOpen(false);
    } catch (error) {
      toast.error(t('feedback:feedback.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-20 left-6 z-[100]">
      {/* Toggle button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#4a76e8] text-white rounded-full p-3 shadow-lg hover:bg-[#3a66d8] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4a76e8]"
        aria-label={isOpen ? t('feedback:feedback.close') : t('feedback:feedback.giveFeedback')}
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
        )}
      </motion.button>

      {/* Feedback form */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-80 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {t('feedback:feedback.title')}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                aria-label={t('feedback:feedback.close')}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('feedback:feedback.feedbackType')}
                </label>
                <div className="grid grid-cols-2 gap-2 mb-1">
                  {[
                    { value: 'suggestion', label: t('feedback:feedback.suggestion') },
                    { value: 'bug', label: t('feedback:feedback.bug') },
                    { value: 'feature', label: t('feedback:feedback.feature') },
                    { value: 'question', label: t('feedback:feedback.question') },
                  ].map(option => (
                    <label
                      key={option.value}
                      className={`
                        flex items-center justify-center px-3 py-2 rounded-md text-sm cursor-pointer transition-colors
                        ${
                          formData.type === option.value
                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 font-medium'
                            : 'bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="type"
                        value={option.value}
                        checked={formData.type === option.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('feedback:feedback.message')}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  maxLength={MAX_MESSAGE_LENGTH}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder={t('feedback:feedback.messagePlaceholder')}
                  required
                  aria-describedby="message-counter"
                />
                <div
                  id="message-counter"
                  className={`text-xs mt-1 text-right ${
                    charactersRemaining < 50
                      ? 'text-red-500 dark:text-red-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {t('feedback:feedback.characterCount', { count: charactersRemaining })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('feedback:feedback.email')}
                  <span className="text-gray-500 dark:text-gray-400 ml-1">
                    ({t('feedback:feedback.optional')})
                  </span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full rounded-md shadow-sm focus:ring-indigo-500 sm:text-sm ${
                    emailError
                      ? 'border-red-300 dark:border-red-600 focus:border-red-500 dark:bg-red-900/20 dark:text-red-100'
                      : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100'
                  }`}
                  placeholder={t('feedback:feedback.emailPlaceholder')}
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? 'email-error' : undefined}
                />
                {emailError && (
                  <p id="email-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {emailError}
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !!emailError}
                  className="inline-flex justify-center items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#4a76e8] hover:bg-[#3a66d8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4a76e8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  aria-label={t('feedback:feedback.sendFeedback')}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {t('feedback:feedback.submitting')}
                    </>
                  ) : (
                    <>
                      {t('feedback:feedback.sendFeedback')}
                      <PaperAirplaneIcon className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedbackForm;
