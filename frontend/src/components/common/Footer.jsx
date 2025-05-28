import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold">{t('appName')}</h3>
            <p className="text-gray-300 text-sm mt-1">{t('footerTagline')}</p>
          </div>

          <div className="text-center md:text-right">
            <p className="text-sm text-gray-300">
              &copy; {currentYear} {t('appName')}. {t('allRightsReserved')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
