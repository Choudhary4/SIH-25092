/**
 * Service Worker Registration
 * Handles PWA service worker registration with proper error handling
 */

// Service Worker Configuration
const SW_CONFIG = {
  swUrl: '/sw.js',
  scope: '/',
  updateViaCache: 'imports',
  checkForUpdatesInterval: 60 * 60 * 1000 // Check every hour
};

// Registration state
let registration = null;
let isUpdateAvailable = false;
let isOfflineReady = false;

/**
 * Register service worker with comprehensive error handling
 */
export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    console.warn('⚠️ Service Worker not supported in this browser');
    return null;
  }

  try {
    // Register service worker
    registration = await navigator.serviceWorker.register(SW_CONFIG.swUrl, {
      scope: SW_CONFIG.scope,
      updateViaCache: SW_CONFIG.updateViaCache
    });

    console.log('✅ Service Worker registered successfully:', registration.scope);

    // Set up update listeners
    setupUpdateListeners(registration);

    // Set up periodic update checks
    setupPeriodicUpdateCheck(registration);

    // Handle waiting service worker
    if (registration.waiting) {
      console.log('🔄 Service Worker update available');
      isUpdateAvailable = true;
      notifyUpdateAvailable();
    }

    // Check if offline ready
    if (registration.active) {
      isOfflineReady = true;
      notifyOfflineReady();
    }

    return registration;

  } catch (error) {
    console.error('❌ Service Worker registration failed:', error);
    
    // Track registration failure
    if (typeof gtag !== 'undefined') {
      gtag('event', 'sw_registration_failed', {
        event_category: 'error',
        event_label: error.message
      });
    }
    
    return null;
  }
};

/**
 * Set up service worker update listeners
 */
const setupUpdateListeners = (registration) => {
  // Listen for new service worker installing
  registration.addEventListener('updatefound', () => {
    const newWorker = registration.installing;
    console.log('🔄 New service worker installing...');

    newWorker.addEventListener('statechange', () => {
      switch (newWorker.state) {
        case 'installed':
          if (navigator.serviceWorker.controller) {
            // New service worker available
            console.log('✨ New service worker installed, update available');
            isUpdateAvailable = true;
            notifyUpdateAvailable();
          } else {
            // First service worker installation
            console.log('✅ Service worker installed, app ready for offline use');
            isOfflineReady = true;
            notifyOfflineReady();
          }
          break;

        case 'activated':
          console.log('🚀 New service worker activated');
          break;

        case 'redundant':
          console.log('❌ New service worker became redundant');
          break;
      }
    });
  });

  // Listen for controller change (after update)
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('🔄 Service worker controller changed');
    if (!window.location.pathname.includes('/update-available')) {
      window.location.reload();
    }
  });
};

/**
 * Set up periodic update checks
 */
const setupPeriodicUpdateCheck = (registration) => {
  setInterval(() => {
    if (navigator.onLine) {
      registration.update().catch(error => {
        console.warn('⚠️ Service worker update check failed:', error);
      });
    }
  }, SW_CONFIG.checkForUpdatesInterval);
};

/**
 * Update service worker to the latest version
 */
export const updateServiceWorker = async () => {
  if (!registration || !registration.waiting) {
    console.warn('⚠️ No service worker waiting for activation');
    return false;
  }

  try {
    // Tell the waiting service worker to skip waiting
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    console.log('🔄 Service worker update initiated');
    return true;

  } catch (error) {
    console.error('❌ Failed to update service worker:', error);
    return false;
  }
};

/**
 * Unregister service worker (for development/testing)
 */
export const unregisterServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const result = await registration.unregister();
      console.log('🗑️ Service worker unregistered:', result);
      return result;
    }
    return false;

  } catch (error) {
    console.error('❌ Service worker unregistration failed:', error);
    return false;
  }
};

/**
 * Get service worker registration status
 */
export const getServiceWorkerStatus = () => {
  return {
    isSupported: 'serviceWorker' in navigator,
    isRegistered: !!registration,
    isUpdateAvailable,
    isOfflineReady,
    registration
  };
};

/**
 * Check if app is running in standalone mode (PWA)
 */
export const isPWAInstalled = () => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  );
};

/**
 * Notify about update availability
 */
const notifyUpdateAvailable = () => {
  // Dispatch custom event for React components
  window.dispatchEvent(new CustomEvent('sw-update-available', {
    detail: { registration }
  }));

  // Track update availability
  if (typeof gtag !== 'undefined') {
    gtag('event', 'sw_update_available', {
      event_category: 'engagement',
      event_label: 'service_worker'
    });
  }
};

/**
 * Notify about offline readiness
 */
const notifyOfflineReady = () => {
  // Dispatch custom event for React components
  window.dispatchEvent(new CustomEvent('sw-offline-ready', {
    detail: { registration }
  }));

  // Track offline readiness
  if (typeof gtag !== 'undefined') {
    gtag('event', 'sw_offline_ready', {
      event_category: 'engagement',
      event_label: 'service_worker'
    });
  }
};

/**
 * Handle service worker messages
 */
navigator.serviceWorker?.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'CACHE_UPDATED':
      console.log('📦 Cache updated:', payload);
      break;

    case 'OFFLINE_FALLBACK':
      console.log('📴 Serving offline fallback for:', payload.url);
      break;

    case 'BACKGROUND_SYNC':
      console.log('🔄 Background sync completed:', payload);
      break;

    case 'NOTIFICATION_CLICK':
      console.log('🔔 Notification clicked:', payload);
      break;

    default:
      console.log('📨 Service worker message:', event.data);
  }
});

/**
 * Initialize PWA and register service worker
 */
export const initializePWA = async () => {
  console.log('🚀 Initializing PWA...');

  // Register service worker
  const swRegistration = await registerServiceWorker();

  // Set up offline/online listeners
  window.addEventListener('online', () => {
    console.log('🌐 Back online');
    window.dispatchEvent(new CustomEvent('connectivity-change', {
      detail: { isOnline: true }
    }));
  });

  window.addEventListener('offline', () => {
    console.log('📴 Gone offline');
    window.dispatchEvent(new CustomEvent('connectivity-change', {
      detail: { isOnline: false }
    }));
  });

  // Set up beforeinstallprompt listener
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    console.log('📱 PWA install prompt available');
    
    window.dispatchEvent(new CustomEvent('pwa-install-prompt', {
      detail: { event }
    }));
  });

  // Set up appinstalled listener
  window.addEventListener('appinstalled', () => {
    console.log('📱 PWA installed successfully');
    
    window.dispatchEvent(new CustomEvent('pwa-installed'));
    
    // Track installation
    if (typeof gtag !== 'undefined') {
      gtag('event', 'pwa_installed', {
        event_category: 'engagement',
        event_label: 'app_install'
      });
    }
  });

  console.log('✅ PWA initialization complete');
  return swRegistration;
};

// Auto-initialize if running in browser
if (typeof window !== 'undefined' && document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePWA);
} else if (typeof window !== 'undefined') {
  initializePWA();
}

export default {
  registerServiceWorker,
  updateServiceWorker,
  unregisterServiceWorker,
  getServiceWorkerStatus,
  isPWAInstalled,
  initializePWA
};