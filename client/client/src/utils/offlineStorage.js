/**
 * Offline Storage Manager
 * Handles IndexedDB operations for offline functionality
 */

import { openDB } from 'idb';
import localforage from 'localforage';

// IndexedDB configuration
const DB_NAME = 'MindCareDB';
const DB_VERSION = 1;

// Store names
const STORES = {
  SCREENING: 'screening',
  RESOURCES: 'resources',
  HELPLINES: 'helplines',
  SYNC_QUEUE: 'sync_queue',
  MEDIA_METADATA: 'media_metadata'
};

// Initialize IndexedDB
let db = null;

export const initDB = async () => {
  try {
    db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(database) {
        // Screening store for offline questionnaires
        if (!database.objectStoreNames.contains(STORES.SCREENING)) {
          const screeningStore = database.createObjectStore(STORES.SCREENING, {
            keyPath: 'id',
            autoIncrement: true
          });
          screeningStore.createIndex('timestamp', 'timestamp');
          screeningStore.createIndex('status', 'status'); // 'pending', 'synced', 'failed'
          screeningStore.createIndex('userId', 'userId');
        }

        // Resources store for caching resource hub content
        if (!database.objectStoreNames.contains(STORES.RESOURCES)) {
          const resourceStore = database.createObjectStore(STORES.RESOURCES, {
            keyPath: 'id'
          });
          resourceStore.createIndex('category', 'category');
          resourceStore.createIndex('type', 'type'); // 'video', 'audio', 'article'
          resourceStore.createIndex('lastAccessed', 'lastAccessed');
          resourceStore.createIndex('cached', 'cached');
        }

        // Helplines store for offline access to emergency contacts
        if (!database.objectStoreNames.contains(STORES.HELPLINES)) {
          const helplineStore = database.createObjectStore(STORES.HELPLINES, {
            keyPath: 'id'
          });
          helplineStore.createIndex('country', 'country');
          helplineStore.createIndex('state', 'state');
          helplineStore.createIndex('category', 'category'); // 'crisis', 'counseling', 'support'
          helplineStore.createIndex('priority', 'priority');
        }

        // Sync queue for offline actions
        if (!database.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const syncStore = database.createObjectStore(STORES.SYNC_QUEUE, {
            keyPath: 'id',
            autoIncrement: true
          });
          syncStore.createIndex('action', 'action'); // 'POST', 'PUT', 'DELETE'
          syncStore.createIndex('endpoint', 'endpoint');
          syncStore.createIndex('priority', 'priority');
          syncStore.createIndex('timestamp', 'timestamp');
        }

        // Media metadata store for video/audio caching
        if (!database.objectStoreNames.contains(STORES.MEDIA_METADATA)) {
          const mediaStore = database.createObjectStore(STORES.MEDIA_METADATA, {
            keyPath: 'url'
          });
          mediaStore.createIndex('type', 'type');
          mediaStore.createIndex('size', 'size');
          mediaStore.createIndex('duration', 'duration');
          mediaStore.createIndex('cached', 'cached');
        }
      }
    });
    
    console.log('🗃️ IndexedDB initialized successfully');
    return db;
  } catch (error) {
    console.error('❌ Failed to initialize IndexedDB:', error);
    throw error;
  }
};

// Screening Storage Operations
export const screeningStorage = {
  // Save screening data offline
  async save(screeningData) {
    try {
      const database = db || await initDB();
      const tx = database.transaction(STORES.SCREENING, 'readwrite');
      const store = tx.objectStore(STORES.SCREENING);
      
      const data = {
        ...screeningData,
        timestamp: Date.now(),
        status: 'pending',
        id: Date.now() + Math.random() // Temporary ID
      };
      
      await store.add(data);
      await tx.complete;
      
      console.log('📊 Screening saved offline:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Failed to save screening offline:', error);
      throw error;
    }
  },

  // Get all pending screenings for sync
  async getPending() {
    try {
      const database = db || await initDB();
      const tx = database.transaction(STORES.SCREENING, 'readonly');
      const store = tx.objectStore(STORES.SCREENING);
      const index = store.index('status');
      
      return await index.getAll('pending');
    } catch (error) {
      console.error('❌ Failed to get pending screenings:', error);
      return [];
    }
  },

  // Mark screening as synced
  async markSynced(id, serverResponse) {
    try {
      const database = db || await initDB();
      const tx = database.transaction(STORES.SCREENING, 'readwrite');
      const store = tx.objectStore(STORES.SCREENING);
      
      const screening = await store.get(id);
      if (screening) {
        screening.status = 'synced';
        screening.serverResponse = serverResponse;
        screening.syncedAt = Date.now();
        await store.put(screening);
      }
      
      await tx.complete;
    } catch (error) {
      console.error('❌ Failed to mark screening as synced:', error);
    }
  },

  // Get screening history
  async getHistory(userId) {
    try {
      const database = db || await initDB();
      const tx = database.transaction(STORES.SCREENING, 'readonly');
      const store = tx.objectStore(STORES.SCREENING);
      
      if (userId) {
        const index = store.index('userId');
        return await index.getAll(userId);
      } else {
        return await store.getAll();
      }
    } catch (error) {
      console.error('❌ Failed to get screening history:', error);
      return [];
    }
  }
};

// Resource Storage Operations
export const resourceStorage = {
  // Cache resource metadata
  async cacheResource(resource) {
    try {
      const database = db || await initDB();
      const tx = database.transaction(STORES.RESOURCES, 'readwrite');
      const store = tx.objectStore(STORES.RESOURCES);
      
      const data = {
        ...resource,
        cached: true,
        cachedAt: Date.now(),
        lastAccessed: Date.now()
      };
      
      await store.put(data);
      await tx.complete;
      
      console.log('📚 Resource cached:', resource.id);
    } catch (error) {
      console.error('❌ Failed to cache resource:', error);
    }
  },

  // Get cached resources
  async getCached(category = null) {
    try {
      const database = db || await initDB();
      const tx = database.transaction(STORES.RESOURCES, 'readonly');
      const store = tx.objectStore(STORES.RESOURCES);
      
      if (category) {
        const index = store.index('category');
        return await index.getAll(category);
      } else {
        return await store.getAll();
      }
    } catch (error) {
      console.error('❌ Failed to get cached resources:', error);
      return [];
    }
  },

  // Update last accessed time
  async updateLastAccessed(id) {
    try {
      const database = db || await initDB();
      const tx = database.transaction(STORES.RESOURCES, 'readwrite');
      const store = tx.objectStore(STORES.RESOURCES);
      
      const resource = await store.get(id);
      if (resource) {
        resource.lastAccessed = Date.now();
        await store.put(resource);
      }
      
      await tx.complete;
    } catch (error) {
      console.error('❌ Failed to update last accessed:', error);
    }
  },

  // Clean old cached resources
  async cleanOldCache(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 days
    try {
      const database = db || await initDB();
      const tx = database.transaction(STORES.RESOURCES, 'readwrite');
      const store = tx.objectStore(STORES.RESOURCES);
      const index = store.index('lastAccessed');
      
      const cutoff = Date.now() - maxAge;
      const cursor = await index.openCursor(IDBKeyRange.upperBound(cutoff));
      
      while (cursor) {
        await cursor.delete();
        cursor = await cursor.continue();
      }
      
      await tx.complete;
      console.log('🧹 Old cached resources cleaned');
    } catch (error) {
      console.error('❌ Failed to clean old cache:', error);
    }
  }
};

// Helpline Storage Operations
export const helplineStorage = {
  // Cache helpline directory
  async cacheHelplines(helplines) {
    try {
      const database = db || await initDB();
      const tx = database.transaction(STORES.HELPLINES, 'readwrite');
      const store = tx.objectStore(STORES.HELPLINES);
      
      // Clear existing data
      await store.clear();
      
      // Add new helplines
      for (const helpline of helplines) {
        await store.add({
          ...helpline,
          cachedAt: Date.now()
        });
      }
      
      await tx.complete;
      console.log('🆘 Helplines cached:', helplines.length);
    } catch (error) {
      console.error('❌ Failed to cache helplines:', error);
    }
  },

  // Get helplines by location
  async getByLocation(country, state = null) {
    try {
      const database = db || await initDB();
      const tx = database.transaction(STORES.HELPLINES, 'readonly');
      const store = tx.objectStore(STORES.HELPLINES);
      const countryIndex = store.index('country');
      
      let results = await countryIndex.getAll(country);
      
      if (state) {
        results = results.filter(helpline => helpline.state === state);
      }
      
      // Sort by priority
      return results.sort((a, b) => (a.priority || 0) - (b.priority || 0));
    } catch (error) {
      console.error('❌ Failed to get helplines by location:', error);
      return [];
    }
  },

  // Get helplines by category
  async getByCategory(category) {
    try {
      const database = db || await initDB();
      const tx = database.transaction(STORES.HELPLINES, 'readonly');
      const store = tx.objectStore(STORES.HELPLINES);
      const index = store.index('category');
      
      return await index.getAll(category);
    } catch (error) {
      console.error('❌ Failed to get helplines by category:', error);
      return [];
    }
  },

  // Get all helplines
  async getAll() {
    try {
      const database = db || await initDB();
      const tx = database.transaction(STORES.HELPLINES, 'readonly');
      const store = tx.objectStore(STORES.HELPLINES);
      
      return await store.getAll();
    } catch (error) {
      console.error('❌ Failed to get all helplines:', error);
      return [];
    }
  }
};

// Sync Queue Operations
export const syncQueue = {
  // Add action to sync queue
  async add(action, endpoint, data, priority = 0) {
    try {
      const database = db || await initDB();
      const tx = database.transaction(STORES.SYNC_QUEUE, 'readwrite');
      const store = tx.objectStore(STORES.SYNC_QUEUE);
      
      const queueItem = {
        action,
        endpoint,
        data,
        priority,
        timestamp: Date.now(),
        retries: 0,
        maxRetries: 3
      };
      
      await store.add(queueItem);
      await tx.complete;
      
      console.log('⏳ Added to sync queue:', { action, endpoint });
    } catch (error) {
      console.error('❌ Failed to add to sync queue:', error);
    }
  },

  // Get all pending sync items
  async getPending() {
    try {
      const database = db || await initDB();
      const tx = database.transaction(STORES.SYNC_QUEUE, 'readonly');
      const store = tx.objectStore(STORES.SYNC_QUEUE);
      
      const items = await store.getAll();
      
      // Sort by priority (higher first) then by timestamp
      return items.sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        return a.timestamp - b.timestamp;
      });
    } catch (error) {
      console.error('❌ Failed to get pending sync items:', error);
      return [];
    }
  },

  // Remove completed sync item
  async remove(id) {
    try {
      const database = db || await initDB();
      const tx = database.transaction(STORES.SYNC_QUEUE, 'readwrite');
      const store = tx.objectStore(STORES.SYNC_QUEUE);
      
      await store.delete(id);
      await tx.complete;
    } catch (error) {
      console.error('❌ Failed to remove sync item:', error);
    }
  },

  // Update retry count
  async incrementRetries(id) {
    try {
      const database = db || await initDB();
      const tx = database.transaction(STORES.SYNC_QUEUE, 'readwrite');
      const store = tx.objectStore(STORES.SYNC_QUEUE);
      
      const item = await store.get(id);
      if (item) {
        item.retries = (item.retries || 0) + 1;
        item.lastRetry = Date.now();
        await store.put(item);
      }
      
      await tx.complete;
    } catch (error) {
      console.error('❌ Failed to increment retries:', error);
    }
  }
};

// Media Storage Operations (using localforage for large files)
export const mediaStorage = {
  // Initialize localforage
  init() {
    localforage.config({
      name: 'MindCareMedia',
      storeName: 'media_files',
      description: 'Cached media files for offline access'
    });
  },

  // Cache media file
  async cacheMedia(url, blob, metadata = {}) {
    try {
      // Store the blob in localforage
      await localforage.setItem(url, blob);
      
      // Store metadata in IndexedDB
      const database = db || await initDB();
      const tx = database.transaction(STORES.MEDIA_METADATA, 'readwrite');
      const store = tx.objectStore(STORES.MEDIA_METADATA);
      
      await store.put({
        url,
        ...metadata,
        size: blob.size,
        type: blob.type,
        cached: true,
        cachedAt: Date.now()
      });
      
      await tx.complete;
      console.log('🎵 Media cached:', url);
    } catch (error) {
      console.error('❌ Failed to cache media:', error);
    }
  },

  // Get cached media
  async getCachedMedia(url) {
    try {
      const blob = await localforage.getItem(url);
      if (blob) {
        return URL.createObjectURL(blob);
      }
      return null;
    } catch (error) {
      console.error('❌ Failed to get cached media:', error);
      return null;
    }
  },

  // Check if media is cached
  async isCached(url) {
    try {
      const database = db || await initDB();
      const tx = database.transaction(STORES.MEDIA_METADATA, 'readonly');
      const store = tx.objectStore(STORES.MEDIA_METADATA);
      
      const metadata = await store.get(url);
      return metadata && metadata.cached;
    } catch (error) {
      console.error('❌ Failed to check if media is cached:', error);
      return false;
    }
  },

  // Clean old media cache
  async cleanOldMedia(maxAge = 30 * 24 * 60 * 60 * 1000) { // 30 days
    try {
      const database = db || await initDB();
      const tx = database.transaction(STORES.MEDIA_METADATA, 'readwrite');
      const store = tx.objectStore(STORES.MEDIA_METADATA);
      
      const cutoff = Date.now() - maxAge;
      const cursor = await store.openCursor();
      
      while (cursor) {
        const metadata = cursor.value;
        if (metadata.cachedAt < cutoff) {
          // Remove from localforage
          await localforage.removeItem(metadata.url);
          // Remove metadata
          await cursor.delete();
        }
        cursor = await cursor.continue();
      }
      
      await tx.complete;
      console.log('🧹 Old media cache cleaned');
    } catch (error) {
      console.error('❌ Failed to clean old media cache:', error);
    }
  }
};

// Storage manager initialization
export const initOfflineStorage = async () => {
  try {
    await initDB();
    mediaStorage.init();
    
    // Clean old data periodically
    resourceStorage.cleanOldCache();
    mediaStorage.cleanOldMedia();
    
    console.log('✅ Offline storage initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize offline storage:', error);
  }
};

// Export stores for direct access if needed
export { STORES };