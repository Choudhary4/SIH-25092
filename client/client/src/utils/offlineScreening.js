/**
 * Offline Screening System
 * Handles offline storage and sync of mental health screenings
 */

import { screeningStorage, syncQueue } from './offlineStorage';
import { api } from './api';

class OfflineScreeningManager {
  constructor() {
    this.syncInProgress = false;
    this.syncListeners = new Set();
  }

  /**
   * Save screening data offline
   * @param {Object} screeningData - Screening form data
   * @param {string} userId - User ID (optional for anonymous)
   */
  async saveScreeningOffline(screeningData, userId = null) {
    try {
      const offlineScreening = {
        ...screeningData,
        userId: userId || 'anonymous',
        offlineMode: true,
        timestamp: Date.now(),
        formVersion: '1.0', // Track form version for compatibility
        browserInfo: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      };

      // Save to IndexedDB
      const savedScreening = await screeningStorage.save(offlineScreening);
      
      // Add to sync queue for later upload
      await syncQueue.add(
        'POST',
        '/v1/screening/submit',
        offlineScreening,
        1 // High priority
      );

      console.log('📋 Screening saved offline:', savedScreening.id);
      
      // Notify listeners
      this.notifyListeners('screening_saved', {
        id: savedScreening.id,
        offline: true
      });

      return {
        success: true,
        id: savedScreening.id,
        offline: true,
        message: 'Screening saved offline. Will sync when online.'
      };

    } catch (error) {
      console.error('❌ Failed to save screening offline:', error);
      throw new Error('Failed to save screening offline: ' + error.message);
    }
  }

  /**
   * Submit screening (online or offline)
   * @param {Object} screeningData - Screening form data
   * @param {string} userId - User ID
   */
  async submitScreening(screeningData, userId = null) {
    // Check if online
    if (!navigator.onLine) {
      return await this.saveScreeningOffline(screeningData, userId);
    }

    try {
      // Try to submit online first
      const response = await api.post('/v1/screening/submit', {
        ...screeningData,
        userId: userId || 'anonymous',
        timestamp: Date.now()
      });

      console.log('✅ Screening submitted online');
      
      this.notifyListeners('screening_submitted', {
        response: response.data,
        offline: false
      });

      return {
        success: true,
        data: response.data,
        offline: false,
        message: 'Screening submitted successfully'
      };

    } catch (error) {
      console.warn('🌐 Online submission failed, saving offline:', error.message);
      
      // Fallback to offline storage
      return await this.saveScreeningOffline(screeningData, userId);
    }
  }

  /**
   * Get screening questions with offline support
   * @param {string} type - Screening type (e.g., 'phq9')
   */
  async getScreeningQuestions(type = 'phq9') {
    const cacheKey = `screening_questions_${type}`;
    
    // Try to get from cache first
    let cachedQuestions = null;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        cachedQuestions = JSON.parse(cached);
        
        // Check if cache is still valid (24 hours)
        const cacheAge = Date.now() - cachedQuestions.cachedAt;
        if (cacheAge < 24 * 60 * 60 * 1000) {
          console.log('📋 Using cached screening questions');
          return {
            data: cachedQuestions.data,
            source: 'cache'
          };
        }
      }
    } catch (error) {
      console.warn('Failed to parse cached questions:', error);
    }

    // Try to fetch from network if online
    if (navigator.onLine) {
      try {
        const response = await api.get(`/v1/screening/questions/${type}`);
        const questions = response.data;

        // Cache the questions
        localStorage.setItem(cacheKey, JSON.stringify({
          data: questions,
          cachedAt: Date.now()
        }));

        console.log('📋 Fetched fresh screening questions');
        return {
          data: questions,
          source: 'network'
        };

      } catch (error) {
        console.warn('Failed to fetch questions online:', error.message);
      }
    }

    // Use cached questions as fallback
    if (cachedQuestions) {
      console.log('📋 Using stale cached screening questions');
      return {
        data: cachedQuestions.data,
        source: 'cache',
        stale: true
      };
    }

    // Return default PHQ-9 questions if nothing else works
    return {
      data: this.getDefaultPHQ9Questions(),
      source: 'default'
    };
  }

  /**
   * Get default PHQ-9 questions as fallback
   */
  getDefaultPHQ9Questions() {
    return {
      type: 'phq9',
      title: 'PHQ-9 Depression Screening',
      instructions: 'Over the last 2 weeks, how often have you been bothered by any of the following problems?',
      questions: [
        {
          id: 1,
          text: 'Little interest or pleasure in doing things',
          key: 'q1'
        },
        {
          id: 2,
          text: 'Feeling down, depressed, or hopeless',
          key: 'q2'
        },
        {
          id: 3,
          text: 'Trouble falling or staying asleep, or sleeping too much',
          key: 'q3'
        },
        {
          id: 4,
          text: 'Feeling tired or having little energy',
          key: 'q4'
        },
        {
          id: 5,
          text: 'Poor appetite or overeating',
          key: 'q5'
        },
        {
          id: 6,
          text: 'Feeling bad about yourself - or that you are a failure or have let yourself or your family down',
          key: 'q6'
        },
        {
          id: 7,
          text: 'Trouble concentrating on things, such as reading the newspaper or watching television',
          key: 'q7'
        },
        {
          id: 8,
          text: 'Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual',
          key: 'q8'
        },
        {
          id: 9,
          text: 'Thoughts that you would be better off dead, or of hurting yourself',
          key: 'q9'
        }
      ],
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    };
  }

  /**
   * Get user's screening history
   * @param {string} userId - User ID
   */
  async getScreeningHistory(userId) {
    try {
      const offlineHistory = await screeningStorage.getHistory(userId);
      
      // If online, try to get online history too
      if (navigator.onLine) {
        try {
          const response = await api.get(`/v1/screening/history${userId ? `?userId=${userId}` : ''}`);
          const onlineHistory = response.data?.screenings || [];
          
          // Merge online and offline history
          const combined = this.mergeHistories(onlineHistory, offlineHistory);
          
          return {
            data: combined,
            hasOfflineData: offlineHistory.length > 0
          };
          
        } catch (error) {
          console.warn('Failed to fetch online history:', error);
        }
      }
      
      // Return only offline history
      return {
        data: offlineHistory,
        hasOfflineData: true,
        offlineOnly: true
      };
      
    } catch (error) {
      console.error('Failed to get screening history:', error);
      return {
        data: [],
        hasOfflineData: false,
        error: error.message
      };
    }
  }

  /**
   * Merge online and offline screening histories
   * @param {Array} onlineHistory - History from server
   * @param {Array} offlineHistory - Local history
   */
  mergeHistories(onlineHistory, offlineHistory) {
    const combined = [...onlineHistory];
    
    // Add offline screenings that aren't already synced
    offlineHistory.forEach(offline => {
      if (offline.status === 'pending' || !onlineHistory.find(online => 
        online.timestamp === offline.timestamp && online.userId === offline.userId
      )) {
        combined.push({
          ...offline,
          offline: true
        });
      }
    });
    
    // Sort by timestamp (newest first)
    return combined.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Sync pending screenings with server
   */
  async syncPendingScreenings() {
    if (this.syncInProgress || !navigator.onLine) {
      return { success: false, reason: this.syncInProgress ? 'already_syncing' : 'offline' };
    }

    this.syncInProgress = true;
    
    try {
      const pendingScreenings = await screeningStorage.getPending();
      
      if (pendingScreenings.length === 0) {
        console.log('✅ No pending screenings to sync');
        return { success: true, synced: 0 };
      }

      console.log(`🔄 Syncing ${pendingScreenings.length} pending screenings...`);
      
      let syncedCount = 0;
      let failedCount = 0;

      for (const screening of pendingScreenings) {
        try {
          const response = await api.post('/v1/screening/submit', {
            ...screening,
            syncedOffline: true,
            originalTimestamp: screening.timestamp
          });

          // Mark as synced
          await screeningStorage.markSynced(screening.id, response.data);
          syncedCount++;

          console.log(`✅ Synced screening ${screening.id}`);

        } catch (error) {
          console.error(`❌ Failed to sync screening ${screening.id}:`, error);
          failedCount++;
        }
      }

      this.notifyListeners('sync_completed', {
        synced: syncedCount,
        failed: failedCount,
        total: pendingScreenings.length
      });

      return {
        success: true,
        synced: syncedCount,
        failed: failedCount,
        total: pendingScreenings.length
      };

    } catch (error) {
      console.error('❌ Sync process failed:', error);
      return {
        success: false,
        error: error.message
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Get sync status
   */
  async getSyncStatus() {
    try {
      const pendingScreenings = await screeningStorage.getPending();
      
      return {
        hasPendingData: pendingScreenings.length > 0,
        pendingCount: pendingScreenings.length,
        syncInProgress: this.syncInProgress,
        lastSyncAttempt: localStorage.getItem('lastSyncAttempt'),
        nextSyncScheduled: localStorage.getItem('nextSyncScheduled')
      };
    } catch (error) {
      return {
        hasPendingData: false,
        pendingCount: 0,
        syncInProgress: false,
        error: error.message
      };
    }
  }

  /**
   * Schedule automatic sync when online
   */
  scheduleAutoSync() {
    // Listen for online events
    window.addEventListener('online', () => {
      console.log('🌐 Back online, scheduling sync...');
      setTimeout(() => this.syncPendingScreenings(), 1000);
    });

    // Periodic sync when online
    setInterval(() => {
      if (navigator.onLine && !this.syncInProgress) {
        this.syncPendingScreenings();
      }
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Add event listener for screening events
   * @param {Function} callback - Event callback
   */
  addListener(callback) {
    this.syncListeners.add(callback);
  }

  /**
   * Remove event listener
   * @param {Function} callback - Event callback
   */
  removeListener(callback) {
    this.syncListeners.delete(callback);
  }

  /**
   * Notify all listeners of events
   * @param {string} event - Event type
   * @param {Object} data - Event data
   */
  notifyListeners(event, data) {
    this.syncListeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Error in sync listener:', error);
      }
    });
  }

  /**
   * Clear offline screening data
   * @param {boolean} onlySynced - Only clear synced data
   */
  async clearOfflineData(onlySynced = true) {
    try {
      // This would need implementation in storage layer
      console.log('Clear offline data not fully implemented yet');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const offlineScreeningManager = new OfflineScreeningManager();

// Auto-schedule sync
offlineScreeningManager.scheduleAutoSync();

export default offlineScreeningManager;
export { OfflineScreeningManager };