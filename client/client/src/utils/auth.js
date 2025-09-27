/**
 * Secure token storage utilities
 * Handles both localStorage (fallback) and secure httpOnly cookies (when available)
 */

const TOKEN_KEY = 'MannMitra_token'
const USER_KEY = 'MannMitra_user'
const REFRESH_TOKEN_KEY = 'MannMitra_refresh_token'

// Check if we're in a secure context (HTTPS)
const isSecureContext = () => {
  return window.location.protocol === 'https:' || window.location.hostname === 'localhost'
}

// Cookie utilities for secure token storage
const cookieUtils = {
  set: (name, value, options = {}) => {
    const defaults = {
      path: '/',
      secure: isSecureContext(),
      sameSite: 'strict',
      ...options
    }

    let cookieString = `${name}=${encodeURIComponent(value)}`
    
    Object.entries(defaults).forEach(([key, val]) => {
      if (val === true) {
        cookieString += `; ${key}`
      } else if (val !== false && val !== undefined) {
        cookieString += `; ${key}=${val}`
      }
    })

    document.cookie = cookieString
  },

  get: (name) => {
    const cookies = document.cookie.split(';')
    for (let cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=')
      if (cookieName === name) {
        return decodeURIComponent(cookieValue)
      }
    }
    return null
  },

  remove: (name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
  }
}

// Main token storage interface
export const tokenStorage = {
  /**
   * Store authentication token
   * @param {string} token - JWT token
   * @param {Object} options - Storage options
   */
  setToken: (token, options = {}) => {
    if (!token) {
      console.warn('Attempting to store empty token')
      return
    }

    try {
      if (options.useSecureCookies && isSecureContext()) {
        // Store in secure httpOnly cookie (requires server support)
        cookieUtils.set(TOKEN_KEY, token, {
          httpOnly: false, // Client-side accessible for now
          secure: true,
          sameSite: 'strict',
          maxAge: options.maxAge || 86400 // 24 hours default
        })
      } else {
        // Fallback to localStorage
        localStorage.setItem(TOKEN_KEY, token)
      }
    } catch (error) {
      console.error('Error storing token:', error)
      // Fallback to memory storage if all else fails
      window._MannMitraToken = token
    }
  },

  /**
   * Retrieve authentication token
   * @returns {string|null} JWT token or null
   */
  getToken: () => {
    try {
      // Try secure cookie first
      const cookieToken = cookieUtils.get(TOKEN_KEY)
      if (cookieToken) {
        return cookieToken
      }

      // Fallback to localStorage
      const localToken = localStorage.getItem(TOKEN_KEY)
      if (localToken) {
        return localToken
      }

      // Last resort: memory storage
      return window._MannMitraToken || null
    } catch (error) {
      console.error('Error retrieving token:', error)
      return null
    }
  },

  /**
   * Remove authentication token
   */
  removeToken: () => {
    try {
      cookieUtils.remove(TOKEN_KEY)
      localStorage.removeItem(TOKEN_KEY)
      delete window._MannMitraToken
    } catch (error) {
      console.error('Error removing token:', error)
    }
  },

  /**
   * Store refresh token
   * @param {string} refreshToken - Refresh token
   */
  setRefreshToken: (refreshToken) => {
    if (!refreshToken) return

    try {
      if (isSecureContext()) {
        cookieUtils.set(REFRESH_TOKEN_KEY, refreshToken, {
          secure: true,
          sameSite: 'strict',
          maxAge: 604800 // 7 days
        })
      } else {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
      }
    } catch (error) {
      console.error('Error storing refresh token:', error)
    }
  },

  /**
   * Retrieve refresh token
   * @returns {string|null} Refresh token or null
   */
  getRefreshToken: () => {
    try {
      return cookieUtils.get(REFRESH_TOKEN_KEY) || localStorage.getItem(REFRESH_TOKEN_KEY)
    } catch (error) {
      console.error('Error retrieving refresh token:', error)
      return null
    }
  },

  /**
   * Remove refresh token
   */
  removeRefreshToken: () => {
    try {
      cookieUtils.remove(REFRESH_TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
    } catch (error) {
      console.error('Error removing refresh token:', error)
    }
  }
}

// User data storage utilities
export const userStorage = {
  /**
   * Store user data
   * @param {Object} user - User object
   */
  setUser: (user) => {
    if (!user) return

    try {
      const userData = JSON.stringify(user)
      localStorage.setItem(USER_KEY, userData)
    } catch (error) {
      console.error('Error storing user data:', error)
      // Fallback to memory storage
      window._MannMitraUser = user
    }
  },

  /**
   * Retrieve user data
   * @returns {Object|null} User object or null
   */
  getUser: () => {
    try {
      const userData = localStorage.getItem(USER_KEY)
      if (userData) {
        return JSON.parse(userData)
      }
      return window._MannMitraUser || null
    } catch (error) {
      console.error('Error retrieving user data:', error)
      return null
    }
  },

  /**
   * Remove user data
   */
  removeUser: () => {
    try {
      localStorage.removeItem(USER_KEY)
      delete window._MannMitraUser
    } catch (error) {
      console.error('Error removing user data:', error)
    }
  },

  /**
   * Update user data
   * @param {Object} updates - User data updates
   */
  updateUser: (updates) => {
    try {
      const currentUser = userStorage.getUser()
      if (currentUser) {
        const updatedUser = { ...currentUser, ...updates }
        userStorage.setUser(updatedUser)
        return updatedUser
      }
      return null
    } catch (error) {
      console.error('Error updating user data:', error)
      return null
    }
  }
}

// JWT token utilities
export const jwtUtils = {
  /**
   * Decode JWT token (client-side only, do not use for security)
   * @param {string} token - JWT token
   * @returns {Object|null} Decoded token payload or null
   */
  decode: (token) => {
    if (!token) return null

    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format')
      }

      const payload = parts[1]
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
      return JSON.parse(decoded)
    } catch (error) {
      console.error('Error decoding JWT:', error)
      return null
    }
  },

  /**
   * Check if token is expired
   * @param {string} token - JWT token
   * @returns {boolean} True if expired, false otherwise
   */
  isExpired: (token) => {
    const decoded = jwtUtils.decode(token)
    if (!decoded || !decoded.exp) {
      return true
    }

    const currentTime = Math.floor(Date.now() / 1000)
    return decoded.exp < currentTime
  },

  /**
   * Get token expiration time
   * @param {string} token - JWT token
   * @returns {Date|null} Expiration date or null
   */
  getExpiration: (token) => {
    const decoded = jwtUtils.decode(token)
    if (!decoded || !decoded.exp) {
      return null
    }

    return new Date(decoded.exp * 1000)
  },

  /**
   * Get time until token expires
   * @param {string} token - JWT token
   * @returns {number} Milliseconds until expiration, -1 if expired
   */
  getTimeUntilExpiry: (token) => {
    const expiration = jwtUtils.getExpiration(token)
    if (!expiration) {
      return -1
    }

    const timeUntilExpiry = expiration.getTime() - Date.now()
    return Math.max(0, timeUntilExpiry)
  }
}

// Clear all stored authentication data
export const clearAllAuthData = () => {
  tokenStorage.removeToken()
  tokenStorage.removeRefreshToken()
  userStorage.removeUser()
}

// Validate stored token and user data consistency
export const validateStoredAuth = () => {
  const token = tokenStorage.getToken()
  const user = userStorage.getUser()

  if (!token && !user) {
    return { valid: true, token: null, user: null }
  }

  if (token && !user) {
    // Token exists but no user data - invalid state
    tokenStorage.removeToken()
    return { valid: false, token: null, user: null }
  }

  if (!token && user) {
    // User data exists but no token - invalid state
    userStorage.removeUser()
    return { valid: false, token: null, user: null }
  }

  if (jwtUtils.isExpired(token)) {
    // Token is expired
    clearAllAuthData()
    return { valid: false, token: null, user: null, expired: true }
  }

  return { valid: true, token, user }
}

export default {
  tokenStorage,
  userStorage,
  jwtUtils,
  clearAllAuthData,
  validateStoredAuth
}