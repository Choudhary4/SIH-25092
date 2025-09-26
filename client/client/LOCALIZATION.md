# Mann-Mitra Platform - Localization Guide

This document provides comprehensive information about the internationalization (i18n) setup for the Mann-Mitra Platform.

## 🌍 Overview

The Mann-Mitra Platform supports multiple languages to serve a diverse user base. Currently implemented languages:

- **English (en)** - Default language
- **Hindi (hi)** - हिंदी भाषा समर्थन

## 🏗️ Architecture

### Core Technologies

- **i18next** - Main internationalization framework
- **react-i18next** - React integration for i18next
- **i18next-browser-languagedetector** - Automatic language detection

### File Structure

```
src/
├── i18n/
│   ├── index.js           # Main i18n configuration
│   └── locales/
│       ├── en.json        # English translations
│       └── hi.json        # Hindi translations
├── components/
│   └── common/
│       └── LanguageSwitcher.jsx  # Language selection component
```

## 🔧 Configuration

### Main Configuration (`src/i18n/index.js`)

```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Features included:
- Language detection (localStorage, navigator, subdomain)
- Resource loading with namespaces
- Formatting utilities (numbers, currency, dates)
- RTL/LTR support
- Pluralization helpers
- Real-time language switching
```

### Language Resources

#### English (`src/i18n/locales/en.json`)
- Complete UI translations for all components
- Organized by feature modules (nav, auth, screening, etc.)
- Includes error messages, success messages, and placeholders

#### Hindi (`src/i18n/locales/hi.json`)
- Full Hindi translations with proper Devanagari script
- Cultural adaptations for Indian context
- Consistent terminology across modules

## 🎨 Components

### LanguageSwitcher Component

**Location**: `src/components/common/LanguageSwitcher.jsx`

**Features**:
- Smooth animations with Framer Motion
- Flag indicators for visual recognition
- Mobile-responsive design
- Automatic document direction updates
- Dropdown menu with current language highlighting

**Usage**:
```jsx
import LanguageSwitcher from './components/common/LanguageSwitcher';

<LanguageSwitcher className="custom-class" />
```

**Props**:
- `className` (optional): Additional CSS classes for styling

## 📱 Integration

### Component Integration

```jsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t, i18n } = useTranslation();
  
  return (
    <div>
      <h1>{t('nav.home')}</h1>
      <p>{t('common.loading')}</p>
    </div>
  );
};
```

### Dynamic Content

```jsx
// With variables
{t('screening.questionProgress', { current: 1, total: 9 })}

// With pluralization
{t('forum.replies', { count: replyCount })}

// With context
{t('errors.validation', { context: 'email' })}
```

## 🔄 Language Detection

The system automatically detects user language based on:

1. **localStorage** - Previously selected language
2. **URL subdomain** - Language-specific subdomains
3. **Navigator language** - Browser language settings
4. **HTML lang attribute** - Document language
5. **Fallback** - English as default

## 🎯 Features

### 1. Real-time Language Switching
- Instant UI updates without page reload
- Persistent language selection
- Document direction updates (LTR/RTL)

### 2. Formatting Utilities
```javascript
// Number formatting
i18n.formatNumber(1234.56) // "1,234.56" (en) / "१,२३४.५६" (hi)

// Currency formatting
i18n.formatCurrency(1000, 'USD') // "$1,000.00" (en) / "$१,०००.००" (hi)

// Date formatting
i18n.formatDate(new Date()) // "12/25/2023" (en) / "२५/१२/२०२३" (hi)
```

### 3. Pluralization Support
```json
{
  "forum": {
    "replies_one": "{{count}} reply",
    "replies_other": "{{count}} replies"
  }
}
```

### 4. Context-based Translations
```json
{
  "button": {
    "save": "Save",
    "save_loading": "Saving...",
    "save_success": "Saved!"
  }
}
```

## 📋 Translation Keys Structure

### Hierarchical Organization
```json
{
  "nav": {
    "home": "Home",
    "screening": "Mental Health Screening"
  },
  "common": {
    "loading": "Loading...",
    "error": "Something went wrong"
  },
  "screening": {
    "title": "Mental Health Screening",
    "questions": {
      "phq9": {
        "q1": "Little interest or pleasure in doing things"
      }
    }
  }
}
```

### Module-based Categories
- **nav**: Navigation elements
- **common**: Shared UI elements
- **errors**: Error messages
- **success**: Success messages
- **auth**: Authentication flows
- **screening**: Mental health assessment
- **chat**: AI chat support
- **booking**: Appointment booking
- **forum**: Community forum
- **moderator**: Moderation tools
- **adminDashboard**: Admin analytics
- **language**: Language switcher

## 🔧 Development Workflow

### Adding New Languages

1. **Create translation file**:
   ```bash
   touch src/i18n/locales/[language-code].json
   ```

2. **Add to configuration**:
   ```javascript
   // In src/i18n/index.js
   import newLanguage from './locales/[language-code].json';
   
   resources: {
     [languageCode]: { translation: newLanguage }
   }
   ```

3. **Update LanguageSwitcher**:
   ```javascript
   const languages = [
     // existing languages...
     {
       code: 'newLang',
       name: 'New Language',
       flag: '🏁',
       direction: 'ltr'
     }
   ];
   ```

### Adding New Translation Keys

1. **Add to English file first** (`en.json`)
2. **Copy structure to other language files**
3. **Translate content appropriately**
4. **Test with LanguageSwitcher**

### Best Practices

1. **Key Naming**:
   - Use camelCase for nested objects
   - Use descriptive, hierarchical keys
   - Group related translations together

2. **Content Guidelines**:
   - Keep text length consistent across languages
   - Consider cultural context
   - Use appropriate formality levels
   - Include context for translators

3. **Variables**:
   - Use `{{variable}}` syntax
   - Provide fallback values
   - Document variable types

## 🧪 Testing

### Manual Testing
1. Switch languages using LanguageSwitcher
2. Verify all text updates correctly
3. Check for layout issues with longer text
4. Test RTL languages if applicable

### Automated Testing
```javascript
// Component testing with different languages
import { render } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';

test('renders component in Hindi', () => {
  i18n.changeLanguage('hi');
  render(
    <I18nextProvider i18n={i18n}>
      <MyComponent />
    </I18nextProvider>
  );
  // Test Hindi content
});
```

## 📱 Mobile Considerations

- Language switcher adapts to mobile screens
- Touch-friendly flag buttons
- Responsive dropdown positioning
- Mobile menu integration

## 🎨 Styling & Themes

### CSS Considerations
```css
/* RTL Support */
[dir="rtl"] .component {
  text-align: right;
  padding-right: 1rem;
  padding-left: 0;
}

/* Language-specific fonts */
:lang(hi) {
  font-family: 'Noto Sans Devanagari', sans-serif;
}
```

### Dark Mode Compatibility
- Language switcher supports dark/light themes
- Proper contrast ratios maintained
- Icon visibility across themes

## 🔮 Future Enhancements

### Planned Features
- [ ] Additional languages (Spanish, French, Arabic)
- [ ] Voice language detection
- [ ] Regional variants (en-US, en-GB)
- [ ] Translation management system
- [ ] Automated translation workflows

### Performance Optimizations
- [ ] Lazy loading of translation files
- [ ] Translation caching strategies
- [ ] Bundle size optimization
- [ ] CDN delivery for translations

## 🐛 Troubleshooting

### Common Issues

1. **Missing Translations**:
   ```javascript
   // Add fallback handling
   const text = t('key', 'Fallback text');
   ```

2. **Language Not Switching**:
   - Check localStorage permissions
   - Verify translation files are loaded
   - Clear browser cache

3. **Layout Issues**:
   - Test with longer German/Finnish texts
   - Check RTL language layouts
   - Verify responsive breakpoints

### Debug Mode
```javascript
// Enable i18next debug mode
i18n.debug = true;
```

## 📚 Resources

- [i18next Documentation](https://www.i18next.com/)
- [react-i18next Guide](https://react.i18next.com/)
- [Language Detection Plugin](https://github.com/i18next/i18next-browser-languageDetector)
- [Pluralization Rules](https://www.unicode.org/cldr/charts/43/supplemental/language_plural_rules.html)

## 🤝 Contributing

### Translation Contributions
1. Fork the repository
2. Add/update translation files
3. Test with LanguageSwitcher
4. Submit pull request with language tag

### Code Contributions
1. Follow existing naming conventions
2. Add tests for new i18n features
3. Update documentation
4. Ensure backward compatibility

---

**Note**: This localization system is designed to be scalable and maintainable. Always test language changes across different browsers and devices to ensure consistent user experience.