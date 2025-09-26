# PWA Implementation Guide - Mann-Mitra Platform

## Overview

This guide explains the complete PWA (Progressive Web App) implementation for the Mann-Mitra mental health platform, including offline caching, service workers, and installation prompts.

## 🏗️ Architecture Overview

### Core Components

1. **vite-plugin-pwa** - Automated PWA configuration and service worker generation
2. **Workbox** - Advanced caching strategies and background sync
3. **IndexedDB** - Offline data storage for complex data
4. **LocalForage** - Large file storage (videos/audio)
5. **Custom Components** - Installation prompts and status indicators

### Caching Strategy

```
Network First: API calls, dynamic content
Cache First: Media files (videos/audio), fonts, static assets
Stale While Revalidate: Resource hub pages, user data
Background Sync: Form submissions, screening results
```

## 📦 Installation & Setup

### 1. Dependencies

```bash
# PWA Dependencies
npm install --save-dev vite-plugin-pwa workbox-window

# Offline Storage
npm install idb localforage
```

### 2. Vite Configuration

The `vite.config.js` includes comprehensive PWA settings:

```javascript
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Runtime caching strategies
        runtimeCaching: [
          // API caching (network-first)
          {
            urlPattern: /^https:\/\/api\.Mann-Mitra\.com\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 5 * 60 }
            }
          },
          // Media caching (cache-first)
          {
            urlPattern: /\.(mp4|webm|mp3|wav|ogg)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'media-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 30 * 24 * 60 * 60 }
            }
          }
        ],
        // Background sync
        navigateFallback: '/offline',
        navigateFallbackDenylist: [/^\/_/, /\/api\//]
      }
    })
  ]
})
```

## 🗄️ Offline Storage System

### Storage Architecture

```
IndexedDB Stores:
├── screening (questionnaire responses)
├── resources (hub content + metadata)
├── helplines (emergency contacts)
├── sync_queue (pending submissions)
└── media_metadata (video/audio info)

LocalForage:
└── media_files (large video/audio blobs)
```

### Usage Examples

#### Offline Screening
```javascript
import { OfflineScreeningManager } from '@/utils/offlineScreening';

const screeningManager = new OfflineScreeningManager();

// Save screening offline
await screeningManager.saveScreeningOffline({
  type: 'PHQ-9',
  responses: [2, 1, 3, 2, 1, 2, 3, 1, 0],
  timestamp: Date.now()
});

// Submit when online (auto-syncs)
await screeningManager.submitScreening(screeningData);
```

#### Resource Caching
```javascript
import { OfflineResourceManager } from '@/utils/offlineResources';

const resourceManager = new OfflineResourceManager();

// Get resources (online/offline)
const resources = await resourceManager.getResources('mental-health');

// Preload for offline use
await resourceManager.preloadResources(['anxiety', 'depression']);

// Cache media
await resourceManager.cacheResourceMedia(resource.videoUrl);
```

#### Helpline Directory
```javascript
import { HelplineManager } from '@/utils/helplineDirectory';

const helplineManager = new HelplineManager();

// Get local helplines
const helplines = await helplineManager.getHelplinesByLocation('Mumbai');

// Emergency contacts
const emergency = await helplineManager.getEmergencyHelplines();
```

## 🎯 PWA Features

### Installation Prompt

The `PWAInstallPrompt` component handles:
- Auto-detection of installation eligibility
- User-friendly installation prompts
- Service worker update notifications
- Offline status indicators

```jsx
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

function App() {
  return (
    <div className="app">
      {/* Your app content */}
      <PWAInstallPrompt />
    </div>
  );
}
```

### Service Worker Registration

```javascript
import { initializePWA } from '@/utils/serviceWorkerRegistration';

// Initialize PWA
await initializePWA();

// Check status
const status = getServiceWorkerStatus();
console.log('PWA Status:', status);
```

## 📱 Manifest Configuration

The PWA manifest includes:

```json
{
  "name": "Mann-Mitra - Mental Health Support",
  "short_name": "Mann-Mitra",
  "theme_color": "#3B82F6",
  "background_color": "#FFFFFF",
  "display": "standalone",
  "orientation": "portrait",
  "scope": "/",
  "start_url": "/",
  "shortcuts": [
    {
      "name": "Mental Health Screening",
      "url": "/screening",
      "icons": [{"src": "/icons/screening-96.png", "sizes": "96x96"}]
    },
    {
      "name": "AI Chat Support",
      "url": "/chat",
      "icons": [{"src": "/icons/chat-96.png", "sizes": "96x96"}]
    }
  ]
}
```

## 🔄 Caching Strategies Explained

### 1. Network First (API Calls)
- **Use Case**: Dynamic content, user data, real-time information
- **Behavior**: Try network first, fallback to cache if offline
- **Example**: User profiles, screening results, chat messages

### 2. Cache First (Static Assets)
- **Use Case**: Images, videos, fonts, CSS, JS files
- **Behavior**: Serve from cache if available, network as fallback
- **Example**: Media files, static resources, app shell

### 3. Stale While Revalidate (Dynamic Content)
- **Use Case**: Content that changes but can be served stale
- **Behavior**: Serve from cache immediately, update cache in background
- **Example**: Resource hub articles, forum posts

### 4. Background Sync (Form Submissions)
- **Use Case**: Critical user actions that must be completed
- **Behavior**: Queue when offline, sync when connection restored
- **Example**: Screening submissions, appointment bookings

## 🚀 Implementation Steps

### Step 1: Add PWA Component to App

```jsx
// src/App.jsx
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

function App() {
  return (
    <Router>
      {/* Your routes */}
      <PWAInstallPrompt />
    </Router>
  );
}
```

### Step 2: Initialize Service Worker

```javascript
// src/main.jsx
import { initializePWA } from '@/utils/serviceWorkerRegistration';

// Initialize PWA after React app
ReactDOM.createRoot(document.getElementById('root')).render(<App />);

// Initialize PWA
if (import.meta.env.PROD) {
  initializePWA();
}
```

### Step 3: Use Offline Storage

```javascript
// In your components
import { OfflineScreeningManager } from '@/utils/offlineScreening';
import { OfflineResourceManager } from '@/utils/offlineResources';
import { HelplineManager } from '@/utils/helplineDirectory';

// Initialize managers
const screeningManager = new OfflineScreeningManager();
const resourceManager = new OfflineResourceManager();
const helplineManager = new HelplineManager();
```

## 🔧 Development & Testing

### Local Testing

```bash
# Build for production (required for PWA)
npm run build

# Serve built app
npm run preview

# Test on localhost:4173
```

### PWA Testing Checklist

- [ ] Install prompt appears
- [ ] App works offline
- [ ] Service worker registers successfully
- [ ] Caching strategies work correctly
- [ ] Background sync functions
- [ ] Manifest is valid
- [ ] Icons display properly

### Browser DevTools

1. **Application Tab**: Check service worker, manifest, storage
2. **Network Tab**: Verify caching behavior (from cache/network)
3. **Lighthouse**: Run PWA audit for optimization suggestions

## 📊 Performance Optimizations

### Cache Management
- API cache: 50 entries, 5 minutes expiration
- Media cache: 20 entries, 30 days expiration
- Resource cache: 100 entries, 7 days expiration

### Bundle Optimization
```javascript
// Vite config - manual chunks
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom'],
        'ui-vendor': ['framer-motion', '@headlessui/react'],
        'utils': ['axios', 'date-fns', 'lodash']
      }
    }
  }
}
```

## 🔒 Security Considerations

### Service Worker Security
- HTTPS required for production
- Same-origin policy enforcement
- Content Security Policy compliance

### Data Storage
- Sensitive data encryption
- Storage quota management
- Automatic cleanup of expired data

## 📈 Analytics & Monitoring

### PWA Events Tracked
```javascript
// Installation
gtag('event', 'pwa_install', {
  event_category: 'engagement',
  event_label: 'app_install'
});

// Service Worker Registration
gtag('event', 'sw_registration_success', {
  event_category: 'technical',
  event_label: 'service_worker'
});

// Offline Usage
gtag('event', 'offline_usage', {
  event_category: 'engagement',
  event_label: 'offline_feature'
});
```

## 🐛 Troubleshooting

### Common Issues

1. **Service Worker Not Registering**
   - Check HTTPS requirement
   - Verify file paths
   - Check browser console for errors

2. **Install Prompt Not Showing**
   - Ensure PWA criteria are met
   - Check manifest validity
   - Verify service worker installation

3. **Offline Features Not Working**
   - Check IndexedDB support
   - Verify caching strategies
   - Test network simulation

### Debug Commands

```javascript
// Check service worker status
navigator.serviceWorker.getRegistrations().then(console.log);

// Check cache storage
caches.keys().then(console.log);

// Check IndexedDB
// Open DevTools > Application > Storage
```

## 🔄 Update Strategy

### Service Worker Updates
- Automatic updates when new version deployed
- User notification for pending updates
- Manual update trigger available

### Cache Invalidation
- Version-based cache names
- Automatic cleanup of old caches
- Manual cache refresh options

## 📚 Additional Resources

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://web.dev/add-manifest/)

## 🎉 Success Metrics

### PWA Performance
- Install rate: Target 15-20% of users
- Offline usage: Track offline feature engagement
- Load time: <2s first contentful paint
- Cache hit rate: >80% for static assets

### User Experience
- Reduced bounce rate on slow connections
- Increased session duration
- Higher user retention
- Improved accessibility scores

---

**Next Steps:**
1. Test PWA functionality in production environment
2. Monitor performance and user adoption
3. Iterate based on user feedback
4. Consider advanced features (push notifications, app shortcuts)