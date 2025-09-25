import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'safari-pinned-tab.svg'],
      
      // Workbox configuration for advanced caching strategies
      workbox: {
        // Include all static assets in precache
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg,json}',
          'assets/**/*',
          'locales/**/*.json'
        ],
        
        // Custom caching strategies
        runtimeCaching: [
          // Cache API responses for offline screening
          {
            urlPattern: /^https:\/\/.*\.(?:json)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          },
          
          // Cache screening questionnaire data
          {
            urlPattern: /\/api\/v1\/screening/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'screening-cache',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          
          // Cache resource hub content
          {
            urlPattern: /\/api\/v1\/resources/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'resources-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          },
          
          // Cache helpline directory
          {
            urlPattern: /\/api\/v1\/helplines/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'helplines-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          
          // Cache images and media
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|mp4|mp3|wav)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'media-cache',
              expiration: {
                maxEntries: 300,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          
          // Cache fonts
          {
            urlPattern: /\.(?:woff|woff2|ttf|eot)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          
          // Cache external CDN resources
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets'
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          
          // Background sync for offline form submissions
          {
            urlPattern: /\/api\/v1\/screening\/submit/,
            handler: 'NetworkOnly',
            options: {
              backgroundSync: {
                name: 'screening-queue',
                options: {
                  maxRetentionTime: 24 * 60 // Retry for max of 24 Hours
                }
              }
            }
          }
        ],
        
        // Skip waiting to activate new service worker immediately
        skipWaiting: true,
        clientsClaim: true
      },
      
      // Manifest configuration
      manifest: {
        name: 'MindCare - Mental Health Platform',
        short_name: 'MindCare',
        description: 'Comprehensive mental health support platform with AI assistance, professional booking, and community forum',
        theme_color: '#4F46E5',
        background_color: '#F8FAFC',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          }
        ],
        
        // Shortcuts for quick access
        shortcuts: [
          {
            name: 'Mental Health Screening',
            short_name: 'Screening',
            description: 'Take a quick mental health assessment',
            url: '/screening',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'AI Chat Support',
            short_name: 'Chat',
            description: 'Get instant AI support',
            url: '/chat',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Book Appointment',
            short_name: 'Booking',
            description: 'Schedule with a professional',
            url: '/booking',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Community Forum',
            short_name: 'Forum',
            description: 'Connect with others',
            url: '/forum',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          }
        ],
        
        // Categories for app stores
        categories: ['health', 'medical', 'wellness', 'lifestyle'],
        
        // Screenshots for enhanced install prompt
        screenshots: [
          {
            src: 'screenshot-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: 'screenshot-narrow.png',  
            sizes: '750x1334',
            type: 'image/png',
            form_factor: 'narrow'
          }
        ]
      },
      
      // Development configuration
      devOptions: {
        enabled: false, // Enable for development testing
        type: 'module'
      }
    })
  ],
  
  // Build configuration
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate chunks for better caching
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          motion: ['framer-motion'],
          charts: ['recharts'],
          i18n: ['react-i18next', 'i18next'],
          utils: ['axios', '@tanstack/react-query']
        }
      }
    }
  },
  
  // Server configuration for development
  server: {
    port: 3000,
    open: true
  },
  
  // Preview configuration
  preview: {
    port: 3000
  }
})
