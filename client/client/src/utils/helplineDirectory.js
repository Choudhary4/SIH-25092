/**
 * Offline Helpline Directory
 * Static cached directory of mental health helplines for offline access
 */

import { helplineStorage } from './offlineStorage';

// Static helpline data for offline access
const STATIC_HELPLINES = {
  india: [
    // National Crisis Helplines
    {
      id: 'in_kiran_1',
      name: 'KIRAN Mental Health Helpline',
      phone: '1800-599-0019',
      country: 'India',
      state: 'National',
      category: 'crisis',
      priority: 1,
      available: '24/7',
      languages: ['Hindi', 'English', 'Regional'],
      description: 'National mental health helpline by Ministry of Health',
      website: 'https://www.mohfw.gov.in',
      services: ['Crisis intervention', 'Counseling', 'Referrals'],
      isGovt: true
    },
    {
      id: 'in_vandrevala_1',
      name: 'Vandrevala Foundation Helpline',
      phone: '9999666555',
      country: 'India',
      state: 'National',
      category: 'crisis',
      priority: 2,
      available: '24/7',
      languages: ['English', 'Hindi'],
      description: 'Free mental health support and crisis intervention',
      website: 'https://www.vandrevalafoundation.com',
      services: ['Crisis counseling', 'Suicide prevention', 'Emotional support'],
      isGovt: false
    },
    {
      id: 'in_aasra_1',
      name: 'AASRA',
      phone: '91-9820466726',
      country: 'India',
      state: 'Maharashtra',
      category: 'crisis',
      priority: 3,
      available: '24/7',
      languages: ['English', 'Hindi'],
      description: 'Suicide prevention and crisis intervention',
      website: 'http://www.aasra.info',
      services: ['Suicide prevention', 'Crisis counseling', 'Emotional support'],
      isGovt: false
    },
    {
      id: 'in_sumaitri_1',
      name: 'Sumaitri',
      phone: '011-23389090',
      country: 'India',
      state: 'Delhi',
      category: 'crisis',
      priority: 4,
      available: '24/7',
      languages: ['English', 'Hindi'],
      description: 'Delhi-based crisis intervention center',
      website: 'https://www.sumaitri.net',
      services: ['Crisis counseling', 'Emotional support', 'Suicide prevention'],
      isGovt: false
    },

    // Regional Helplines
    {
      id: 'in_sneha_1',
      name: 'SNEHA',
      phone: '044-24640050',
      country: 'India',
      state: 'Tamil Nadu',
      category: 'crisis',
      priority: 5,
      available: '24/7',
      languages: ['Tamil', 'English'],
      description: 'Chennai-based suicide prevention center',
      website: 'http://www.snehaindia.org',
      services: ['Suicide prevention', 'Crisis counseling', 'Emotional support'],
      isGovt: false
    },
    {
      id: 'in_sahai_1',
      name: 'Sahai',
      phone: '080-25497777',
      country: 'India',
      state: 'Karnataka',
      category: 'crisis',
      priority: 6,
      available: '24/7',
      languages: ['Kannada', 'English', 'Hindi'],
      description: 'Bangalore-based emotional support helpline',
      website: 'http://www.sahai.co.in',
      services: ['Emotional support', 'Crisis counseling', 'Peer support'],
      isGovt: false
    },

    // Specialized Services
    {
      id: 'in_roshni_1',
      name: 'Roshni',
      phone: '040-66202000',
      country: 'India',
      state: 'Telangana',
      category: 'counseling',
      priority: 7,
      available: '11 AM - 9 PM',
      languages: ['Telugu', 'English', 'Hindi'],
      description: 'Hyderabad-based counseling helpline',
      website: 'http://www.roshni.org',
      services: ['Counseling', 'Emotional support', 'Mental health guidance'],
      isGovt: false
    },
    {
      id: 'in_parivarthan_1',
      name: 'Parivarthan',
      phone: '0674-2670059',
      country: 'India',
      state: 'Odisha',
      category: 'counseling',
      priority: 8,
      available: '10 AM - 6 PM',
      languages: ['Odia', 'English', 'Hindi'],
      description: 'Bhubaneswar-based mental health support',
      services: ['Counseling', 'Mental health support', 'Family counseling'],
      isGovt: false
    },

    // Youth-focused Services
    {
      id: 'in_youthline_1',
      name: 'YourDOST',
      phone: 'Online Only',
      country: 'India',
      state: 'National',
      category: 'support',
      priority: 9,
      available: '24/7',
      languages: ['English', 'Hindi'],
      description: 'Online mental health platform for youth',
      website: 'https://yourdost.com',
      services: ['Online counseling', 'Chat support', 'Mental health resources'],
      isGovt: false,
      isOnline: true
    },

    // Women-specific Services
    {
      id: 'in_women_helpline_1',
      name: 'Women Helpline',
      phone: '181',
      country: 'India',
      state: 'National',
      category: 'support',
      priority: 10,
      available: '24/7',
      languages: ['Hindi', 'English', 'Regional'],
      description: 'National helpline for women in distress',
      services: ['Crisis support', 'Counseling', 'Legal guidance'],
      isGovt: true,
      specialization: 'women'
    }
  ],

  // International helplines for reference
  international: [
    {
      id: 'us_988_1',
      name: 'Suicide & Crisis Lifeline',
      phone: '988',
      country: 'United States',
      state: 'National',
      category: 'crisis',
      priority: 1,
      available: '24/7',
      languages: ['English', 'Spanish'],
      description: 'National suicide prevention lifeline',
      website: 'https://988lifeline.org',
      services: ['Crisis intervention', 'Suicide prevention', 'Emotional support'],
      isGovt: true
    },
    {
      id: 'uk_samaritans_1',
      name: 'Samaritans',
      phone: '116 123',
      country: 'United Kingdom',
      state: 'National',
      category: 'crisis',
      priority: 1,
      available: '24/7',
      languages: ['English'],
      description: 'Free support for anyone in emotional distress',
      website: 'https://www.samaritans.org',
      services: ['Emotional support', 'Crisis counseling', 'Suicide prevention'],
      isGovt: false
    }
  ]
};

class HelplineManager {
  constructor() {
    this.initialized = false;
  }

  /**
   * Initialize helpline directory with static data
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Combine all helplines
      const allHelplines = [
        ...STATIC_HELPLINES.india,
        ...STATIC_HELPLINES.international
      ];

      // Cache helplines for offline access
      await helplineStorage.cacheHelplines(allHelplines);
      
      this.initialized = true;
      console.log('🆘 Helpline directory initialized with', allHelplines.length, 'entries');
      
    } catch (error) {
      console.error('❌ Failed to initialize helpline directory:', error);
    }
  }

  /**
   * Get helplines by location
   * @param {string} country - Country name
   * @param {string} state - State/region name (optional)
   */
  async getHelplinesByLocation(country = 'India', state = null) {
    await this.initialize();
    
    try {
      const helplines = await helplineStorage.getByLocation(country, state);
      
      // If no state-specific helplines found, include national ones
      if (state && helplines.length === 0) {
        const nationalHelplines = await helplineStorage.getByLocation(country, 'National');
        return nationalHelplines;
      }
      
      return helplines;
    } catch (error) {
      console.error('❌ Failed to get helplines by location:', error);
      return this.getFallbackHelplines(country);
    }
  }

  /**
   * Get helplines by category
   * @param {string} category - Category (crisis, counseling, support)
   */
  async getHelplinesByCategory(category) {
    await this.initialize();
    
    try {
      return await helplineStorage.getByCategory(category);
    } catch (error) {
      console.error('❌ Failed to get helplines by category:', error);
      return this.getFallbackHelplines();
    }
  }

  /**
   * Get emergency/crisis helplines (highest priority)
   */
  async getEmergencyHelplines(country = 'India') {
    await this.initialize();
    
    try {
      const allHelplines = await helplineStorage.getByLocation(country);
      return allHelplines
        .filter(h => h.category === 'crisis' && h.priority <= 5)
        .sort((a, b) => a.priority - b.priority);
    } catch (error) {
      console.error('❌ Failed to get emergency helplines:', error);
      return this.getFallbackHelplines(country).filter(h => h.category === 'crisis');
    }
  }

  /**
   * Search helplines by keywords
   * @param {string} query - Search query
   * @param {string} country - Country filter
   */
  async searchHelplines(query, country = 'India') {
    await this.initialize();
    
    try {
      const allHelplines = await helplineStorage.getByLocation(country);
      
      if (!query) return allHelplines;
      
      const queryLower = query.toLowerCase();
      
      return allHelplines.filter(helpline =>
        helpline.name.toLowerCase().includes(queryLower) ||
        helpline.description.toLowerCase().includes(queryLower) ||
        helpline.services.some(service => service.toLowerCase().includes(queryLower)) ||
        helpline.languages.some(lang => lang.toLowerCase().includes(queryLower))
      );
    } catch (error) {
      console.error('❌ Failed to search helplines:', error);
      return [];
    }
  }

  /**
   * Get all available helplines
   */
  async getAllHelplines() {
    await this.initialize();
    
    try {
      return await helplineStorage.getAll();
    } catch (error) {
      console.error('❌ Failed to get all helplines:', error);
      return [...STATIC_HELPLINES.india, ...STATIC_HELPLINES.international];
    }
  }

  /**
   * Get helpline statistics
   */
  async getStatistics() {
    await this.initialize();
    
    try {
      const allHelplines = await helplineStorage.getAll();
      
      const stats = {
        total: allHelplines.length,
        byCountry: {},
        byCategory: {},
        byLanguage: {},
        available24x7: 0,
        government: 0,
        private: 0
      };
      
      allHelplines.forEach(helpline => {
        // By country
        stats.byCountry[helpline.country] = (stats.byCountry[helpline.country] || 0) + 1;
        
        // By category
        stats.byCategory[helpline.category] = (stats.byCategory[helpline.category] || 0) + 1;
        
        // By languages
        helpline.languages.forEach(lang => {
          stats.byLanguage[lang] = (stats.byLanguage[lang] || 0) + 1;
        });
        
        // 24/7 availability
        if (helpline.available === '24/7') {
          stats.available24x7++;
        }
        
        // Government vs private
        if (helpline.isGovt) {
          stats.government++;
        } else {
          stats.private++;
        }
      });
      
      return stats;
    } catch (error) {
      console.error('❌ Failed to get statistics:', error);
      return { total: 0 };
    }
  }

  /**
   * Format helpline for display
   * @param {Object} helpline - Helpline data
   */
  formatHelpline(helpline) {
    return {
      ...helpline,
      formattedPhone: this.formatPhoneNumber(helpline.phone),
      displayName: helpline.name,
      displayDescription: helpline.description,
      isEmergency: helpline.category === 'crisis' && helpline.priority <= 3,
      tags: [
        helpline.category,
        helpline.available === '24/7' ? '24x7' : 'limited-hours',
        helpline.isGovt ? 'government' : 'private',
        ...helpline.languages.map(lang => lang.toLowerCase())
      ]
    };
  }

  /**
   * Format phone number for display
   * @param {string} phone - Phone number
   */
  formatPhoneNumber(phone) {
    if (phone === 'Online Only') return phone;
    
    // Basic formatting for Indian numbers
    if (phone.startsWith('91-')) {
      return '+91 ' + phone.substring(3);
    }
    if (phone.startsWith('0')) {
      return '+91 ' + phone.substring(1);
    }
    return phone;
  }

  /**
   * Get fallback helplines when database fails
   * @param {string} country - Country name
   */
  getFallbackHelplines(country = 'India') {
    if (country === 'India') {
      return STATIC_HELPLINES.india.slice(0, 5); // Top 5 helplines
    }
    return STATIC_HELPLINES.international.slice(0, 2);
  }

  /**
   * Check if helpline data needs update
   */
  async checkForUpdates() {
    try {
      // In a real app, this would check server for updates
      const lastUpdate = localStorage.getItem('helplines_last_update');
      const daysSinceUpdate = lastUpdate ? 
        (Date.now() - parseInt(lastUpdate)) / (1000 * 60 * 60 * 24) : 999;
      
      return {
        needsUpdate: daysSinceUpdate > 30, // Update monthly
        lastUpdate: lastUpdate ? new Date(parseInt(lastUpdate)) : null,
        daysSinceUpdate: Math.floor(daysSinceUpdate)
      };
    } catch (error) {
      return { needsUpdate: false, error: error.message };
    }
  }

  /**
   * Update helpline directory from server
   */
  async updateDirectory() {
    try {
      if (!navigator.onLine) {
        return { success: false, reason: 'offline' };
      }

      // In a real app, fetch from server
      // const response = await api.get('/v1/helplines');
      // await helplineStorage.cacheHelplines(response.data);
      
      localStorage.setItem('helplines_last_update', Date.now().toString());
      
      return { success: true, message: 'Directory updated successfully' };
    } catch (error) {
      console.error('❌ Failed to update helpline directory:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const helplineManager = new HelplineManager();

// Helpline categories
export const HELPLINE_CATEGORIES = {
  CRISIS: 'crisis',
  COUNSELING: 'counseling',
  SUPPORT: 'support'
};

// Export manager and utilities
export default helplineManager;
export { HelplineManager, STATIC_HELPLINES };