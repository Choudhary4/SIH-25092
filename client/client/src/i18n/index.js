import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation resources
import enTranslations from './locales/en.json';
import hiTranslations from './locales/hi.json';

// Language detection options
const detectionOptions = {
  // Order and from where user language should be detected
  order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
  
  // Keys or params to lookup language from
  lookupLocalStorage: 'i18nextLng',
  lookupFromPathIndex: 0,
  lookupFromSubdomainIndex: 0,

  // Cache user language on
  caches: ['localStorage'],

  // Optional expire and domain for set cookie
  cookieMinutes: 10080, // 7 days
  cookieDomain: window.location.hostname,

  // Only detect languages that are in the whitelist
  checkWhitelist: true
};

// i18n configuration
const i18nConfig = {
  resources: {
    en: {
      translation: enTranslations
    },
    hi: {
      translation: hiTranslations
    }
  },
  
  // Default language
  lng: 'en',
  
  // Fallback language
  fallbackLng: 'en',
  
  // Whitelist of allowed languages
  whitelist: ['en', 'hi'],
  
  // Key separator (nested translations)
  keySeparator: '.',
  
  // Namespace separator
  nsSeparator: ':',
  
  // Interpolation options
  interpolation: {
    escapeValue: false, // React already escapes values
    formatSeparator: ',',
    format: function(value, format, lng) {
      if (format === 'uppercase') return value.toUpperCase();
      if (format === 'lowercase') return value.toLowerCase();
      if (format === 'currency' && lng === 'hi') return `₹${value}`;
      if (format === 'currency') return `$${value}`;
      return value;
    }
  },
  
  // React i18next options
  react: {
    // Wait for translation to be loaded before rendering
    wait: true,
    // Bind i18n to React component
    bindI18n: 'languageChanged',
    // Bind store to React component
    bindI18nStore: '',
    // How to handle translation not found
    transSupportBasicHtmlNodes: true,
    transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'em', 'span'],
    // Use suspense
    useSuspense: false
  },
  
  // Debug mode (disable in production)
  debug: process.env.NODE_ENV === 'development',
  
  // Backend options (if using i18next-http-backend)
  backend: {
    // Path where resources get loaded from
    loadPath: '/locales/{{lng}}/{{ns}}.json',
    
    // Allow cross domain requests
    crossDomain: false,
    
    // Allow credentials on cross domain requests
    withCredentials: false,
    
    // Request timeout
    requestOptions: {
      cache: 'default'
    }
  },
  
  // Language detection
  detection: detectionOptions
};

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init(i18nConfig);

// Export i18n instance
export default i18n;

// Export additional utilities
export const supportedLanguages = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिंदी',
    flag: '🇮🇳',
    rtl: false
  }
];

// Utility functions
export const getCurrentLanguage = () => i18n.language;

export const changeLanguage = (lng) => {
  return i18n.changeLanguage(lng);
};

export const isRTL = (lng = null) => {
  const language = lng || getCurrentLanguage();
  const langData = supportedLanguages.find(lang => lang.code === language);
  return langData ? langData.rtl : false;
};

export const getLanguageName = (code) => {
  const lang = supportedLanguages.find(lang => lang.code === code);
  return lang ? lang.name : code;
};

export const getNativeLanguageName = (code) => {
  const lang = supportedLanguages.find(lang => lang.code === code);
  return lang ? lang.nativeName : code;
};

export const getLanguageFlag = (code) => {
  const lang = supportedLanguages.find(lang => lang.code === code);
  return lang ? lang.flag : '🌐';
};

// Format functions for different locales
export const formatNumber = (number, lng = null) => {
  const language = lng || getCurrentLanguage();
  return new Intl.NumberFormat(language).format(number);
};

export const formatCurrency = (amount, currency = 'USD', lng = null) => {
  const language = lng || getCurrentLanguage();
  const currencyMap = {
    'hi': 'INR',
    'en': 'USD'
  };
  
  const finalCurrency = currencyMap[language] || currency;
  
  return new Intl.NumberFormat(language, {
    style: 'currency',
    currency: finalCurrency
  }).format(amount);
};

export const formatDate = (date, options = {}, lng = null) => {
  const language = lng || getCurrentLanguage();
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  const finalOptions = { ...defaultOptions, ...options };
  
  return new Intl.DateTimeFormat(language, finalOptions).format(new Date(date));
};

export const formatTime = (date, options = {}, lng = null) => {
  const language = lng || getCurrentLanguage();
  const defaultOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: language === 'en'
  };
  
  const finalOptions = { ...defaultOptions, ...options };
  
  return new Intl.DateTimeFormat(language, finalOptions).format(new Date(date));
};

// Pluralization helpers
export const pluralize = (count, key, lng = null) => {
  return i18n.t(key, { count, lng });
};

// Namespace helpers
export const t = (key, options = {}) => {
  return i18n.t(key, options);
};

export const exists = (key, options = {}) => {
  return i18n.exists(key, options);
};

// Event listeners for language changes
i18n.on('languageChanged', (lng) => {
  // Update document language attribute
  document.documentElement.setAttribute('lang', lng);
  
  // Update document direction for RTL languages
  document.documentElement.setAttribute('dir', isRTL(lng) ? 'rtl' : 'ltr');
  
  // Dispatch custom event for components that need to react to language changes
  window.dispatchEvent(new CustomEvent('languageChanged', { 
    detail: { 
      language: lng,
      isRTL: isRTL(lng)
    } 
  }));
});

// Initialize document attributes
document.documentElement.setAttribute('lang', getCurrentLanguage());
document.documentElement.setAttribute('dir', isRTL() ? 'rtl' : 'ltr');