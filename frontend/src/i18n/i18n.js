import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import enTranslation from './locales/en/translation.json';
import bnTranslation from './locales/bn/translation.json';
import enFeedback from './locales/en/feedback.json';
import bnFeedback from './locales/bn/feedback.json';
import enNotifications from './locales/en/notifications.json';
import bnNotifications from './locales/bn/notifications.json';
import enProctoring from './locales/en/proctoring.json';
import bnProctoring from './locales/bn/proctoring.json';
import enExams from './locales/en/exams.json';
import bnExams from './locales/bn/exams.json';

// Define the translations
const resources = {
  en: {
    translation: enTranslation,
    feedback: enFeedback,
    notifications: enNotifications,
    proctoring: enProctoring,
    exams: enExams,
  },
  bn: {
    translation: bnTranslation,
    feedback: bnFeedback,
    notifications: bnNotifications,
    proctoring: bnProctoring,
    exams: bnExams,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false, // React already safes from XSS
    },
  });

// When language changes, save it to localStorage and update document attributes
i18n.on('languageChanged', lng => {
  localStorage.setItem('language', lng);

  // Update document language attribute
  document.documentElement.lang = lng;

  // Add a class to the body for language-specific styling
  document.body.className = document.body.className.replace(/lang-\w+/g, '');  
  document.body.classList.add(`lang-${lng}`);

  // Set the appropriate font family based on language
  if (lng === 'bn') {
    document.body.style.fontFamily = "'Hind Siliguri', sans-serif";
  } else {
    document.body.style.fontFamily = "'Inter', sans-serif";
  }
});

export default i18n;
