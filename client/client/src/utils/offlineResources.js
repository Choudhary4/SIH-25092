/**
 * Offline Resource System
 * Manages caching and offline access to resource hub content
 */

import { resourceStorage, mediaStorage } from './offlineStorage';
import { api } from './api';

class OfflineResourceManager {
  constructor() {
    this.cachingInProgress = new Set();
    this.networkFirst = true; // Try network first, fall back to cache
  }

  /**
   * Get resources with offline support
   * @param {string} category - Resource category filter
   * @param {boolean} forceNetwork - Force network request
   */
  async getResources(category = null, forceNetwork = false) {
    const cacheKey = `resources_${category || 'all'}`;
    
    // If network first and online, try network first
    if (this.networkFirst && navigator.onLine && !forceNetwork) {
      try {
        const response = await api.get('/v1/resources', {
          params: category ? { category } : {},
          timeout: 5000 // 5 second timeout
        });
        
        const resources = response.data?.resources || [];
        
        // Cache the resources for offline use
        await this.cacheResourceList(resources);
        
        return {
          data: resources,
          source: 'network',
          cached: true
        };
      } catch (error) {
        console.warn('🌐 Network request failed, falling back to cache:', error.message);
      }
    }
    
    // Fallback to cached resources
    const cachedResources = await resourceStorage.getCached(category);
    
    if (cachedResources.length > 0) {
      return {
        data: cachedResources,
        source: 'cache',
        cached: true
      };
    }
    
    // No cached data available
    if (!navigator.onLine) {
      throw new Error('No cached resources available offline');
    }
    
    // Last resort: try network anyway
    try {
      const response = await api.get('/v1/resources', {
        params: category ? { category } : {}
      });
      
      const resources = response.data?.resources || [];
      await this.cacheResourceList(resources);
      
      return {
        data: resources,
        source: 'network',
        cached: true
      };
    } catch (error) {
      throw new Error('Unable to load resources online or offline');
    }
  }

  /**
   * Cache a list of resources
   * @param {Array} resources - Resources to cache
   */
  async cacheResourceList(resources) {
    const cachePromises = resources.map(resource => 
      resourceStorage.cacheResource(resource)
    );
    
    await Promise.allSettled(cachePromises);
    
    console.log(`📚 Cached ${resources.length} resources`);
  }

  /**
   * Get specific resource with media caching
   * @param {string} resourceId - Resource ID
   * @param {boolean} cacheMedia - Whether to cache associated media
   */
  async getResource(resourceId, cacheMedia = false) {
    // Update last accessed time
    await resourceStorage.updateLastAccessed(resourceId);
    
    let resource;
    
    // Try to get from cache first
    const cachedResources = await resourceStorage.getCached();
    resource = cachedResources.find(r => r.id === resourceId);
    
    // If not in cache or network available, try network
    if (!resource || navigator.onLine) {
      try {
        const response = await api.get(`/v1/resources/${resourceId}`);
        resource = response.data;
        
        // Cache the updated resource
        await resourceStorage.cacheResource(resource);
      } catch (error) {
        if (!resource) {
          throw new Error('Resource not available offline');
        }
        console.warn('Using cached resource due to network error:', error.message);
      }
    }
    
    // Cache media files if requested and resource has media
    if (cacheMedia && resource && (resource.videoUrl || resource.audioUrl)) {
      await this.cacheResourceMedia(resource);
    }
    
    return {
      data: resource,
      source: cachedResources.find(r => r.id === resourceId) ? 'cache' : 'network'
    };
  }

  /**
   * Cache media files for a resource
   * @param {Object} resource - Resource with media URLs
   */
  async cacheResourceMedia(resource) {
    const mediaUrls = [];
    
    if (resource.videoUrl) mediaUrls.push({ url: resource.videoUrl, type: 'video' });
    if (resource.audioUrl) mediaUrls.push({ url: resource.audioUrl, type: 'audio' });
    if (resource.thumbnailUrl) mediaUrls.push({ url: resource.thumbnailUrl, type: 'image' });
    
    for (const media of mediaUrls) {
      if (this.cachingInProgress.has(media.url)) {
        continue; // Already caching this media
      }
      
      try {
        this.cachingInProgress.add(media.url);
        
        // Check if already cached
        const isCached = await mediaStorage.isCached(media.url);
        if (isCached) {
          continue;
        }
        
        console.log(`📥 Caching ${media.type}:`, media.url);
        
        // Fetch and cache the media
        const response = await fetch(media.url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const blob = await response.blob();
        
        const metadata = {
          type: media.type,
          resourceId: resource.id,
          title: resource.title,
          duration: resource.duration,
          size: blob.size
        };
        
        await mediaStorage.cacheMedia(media.url, blob, metadata);
        
        console.log(`✅ Cached ${media.type} successfully`);
        
      } catch (error) {
        console.error(`❌ Failed to cache ${media.type}:`, error);
      } finally {
        this.cachingInProgress.delete(media.url);
      }
    }
  }

  /**
   * Get cached media URL for playback
   * @param {string} originalUrl - Original media URL
   */
  async getCachedMediaUrl(originalUrl) {
    try {
      const cachedUrl = await mediaStorage.getCachedMedia(originalUrl);
      if (cachedUrl) {
        console.log('🎵 Using cached media:', originalUrl);
        return cachedUrl;
      }
    } catch (error) {
      console.error('Failed to get cached media:', error);
    }
    
    // Return original URL if not cached or error
    return originalUrl;
  }

  /**
   * Preload resources for offline use
   * @param {Array} categories - Categories to preload
   * @param {boolean} includeMedia - Whether to cache media files
   */
  async preloadResources(categories = [], includeMedia = false) {
    console.log('📦 Starting resource preload...');
    
    try {
      // Load resources for each category
      const categoryPromises = categories.map(async (category) => {
        const result = await this.getResources(category, true); // Force network
        
        if (includeMedia) {
          // Cache media for each resource
          const mediaPromises = result.data.map(resource => 
            this.cacheResourceMedia(resource)
          );
          await Promise.allSettled(mediaPromises);
        }
        
        return result.data.length;
      });
      
      const results = await Promise.allSettled(categoryPromises);
      const totalCached = results
        .filter(r => r.status === 'fulfilled')
        .reduce((sum, r) => sum + r.value, 0);
      
      console.log(`✅ Preloaded ${totalCached} resources`);
      
      return {
        success: true,
        totalCached,
        mediaIncluded: includeMedia
      };
      
    } catch (error) {
      console.error('❌ Resource preload failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Search cached resources
   * @param {string} query - Search query
   * @param {string} category - Category filter
   */
  async searchCachedResources(query, category = null) {
    const cachedResources = await resourceStorage.getCached(category);
    
    if (!query) {
      return cachedResources;
    }
    
    const queryLower = query.toLowerCase();
    
    return cachedResources.filter(resource => 
      resource.title?.toLowerCase().includes(queryLower) ||
      resource.description?.toLowerCase().includes(queryLower) ||
      resource.tags?.some(tag => tag.toLowerCase().includes(queryLower))
    );
  }

  /**
   * Get offline storage statistics
   */
  async getStorageStats() {
    try {
      const cachedResources = await resourceStorage.getCached();
      
      // Count by category
      const byCategory = cachedResources.reduce((acc, resource) => {
        acc[resource.category] = (acc[resource.category] || 0) + 1;
        return acc;
      }, {});
      
      // Count by type
      const byType = cachedResources.reduce((acc, resource) => {
        acc[resource.type] = (acc[resource.type] || 0) + 1;
        return acc;
      }, {});
      
      return {
        totalResources: cachedResources.length,
        byCategory,
        byType,
        lastUpdated: Math.max(...cachedResources.map(r => r.cachedAt || 0))
      };
      
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return {
        totalResources: 0,
        byCategory: {},
        byType: {},
        lastUpdated: 0
      };
    }
  }

  /**
   * Clear cached resources
   * @param {number} maxAge - Maximum age in milliseconds
   */
  async clearCache(maxAge = null) {
    try {
      if (maxAge) {
        await resourceStorage.cleanOldCache(maxAge);
        await mediaStorage.cleanOldMedia(maxAge);
      } else {
        // Clear all cached resources (this would need additional implementation)
        console.log('Full cache clear not implemented yet');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const offlineResourceManager = new OfflineResourceManager();

// Resource categories for preloading
export const RESOURCE_CATEGORIES = {
  ANXIETY: 'anxiety',
  DEPRESSION: 'depression',
  STRESS: 'stress',
  MEDITATION: 'meditation',
  BREATHING: 'breathing',
  SLEEP: 'sleep',
  CRISIS: 'crisis',
  SUPPORT: 'support'
};

// Export the manager instance and utilities
export default offlineResourceManager;

export {
  OfflineResourceManager,
  offlineResourceManager as resourceManager
};