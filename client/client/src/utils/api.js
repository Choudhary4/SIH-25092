import axios from 'axios'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const TOKEN_KEY = 'mindcare_token'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  }
})

// Token management utilities
const tokenManager = {
  getToken: () => {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch (error) {
      console.error('Error getting token:', error)
      return null
    }
  },
  
  setToken: (token) => {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token)
      } else {
        localStorage.removeItem(TOKEN_KEY)
      }
    } catch (error) {
      console.error('Error setting token:', error)
    }
  },
  
  removeToken: () => {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch (error) {
      console.error('Error removing token:', error)
    }
  }
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken()
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => {
    // Log response time in development
    if (import.meta.env.MODE === 'development') {
      const endTime = new Date()
      const duration = endTime - response.config.metadata.startTime
      console.log(`API Call: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`)
    }
    
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message)
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        type: 'NETWORK_ERROR'
      })
    }
    
    const { status, data } = error.response
    
    // Handle 401 (Unauthorized) - Token expired or invalid
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        // Attempt to refresh token
        const refreshResponse = await api.post('/auth/refresh')
        const { token } = refreshResponse.data
        
        // Update token in storage and axios headers
        tokenManager.setToken(token)
        originalRequest.headers.Authorization = `Bearer ${token}`
        
        // Retry the original request
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, redirect to login
        tokenManager.removeToken()
        
        // Dispatch custom event for auth context to handle
        window.dispatchEvent(new CustomEvent('auth:logout'))
        
        return Promise.reject({
          message: 'Session expired. Please log in again.',
          type: 'TOKEN_EXPIRED'
        })
      }
    }
    
    // Handle other error statuses
    const errorMessage = data?.message || getErrorMessage(status)
    
    return Promise.reject({
      message: errorMessage,
      status,
      type: getErrorType(status),
      originalError: error
    })
  }
)

// Helper function to get error messages based on status codes
const getErrorMessage = (status) => {
  const errorMessages = {
    400: 'Bad request. Please check your input.',
    401: 'Authentication required.',
    403: 'Access denied. You don\'t have permission.',
    404: 'Resource not found.',
    409: 'Conflict. Resource already exists.',
    422: 'Validation error. Please check your input.',
    429: 'Too many requests. Please try again later.',
    500: 'Server error. Please try again later.',
    502: 'Server is temporarily unavailable.',
    503: 'Service unavailable. Please try again later.',
  }
  
  return errorMessages[status] || 'An unexpected error occurred.'
}

// Helper function to categorize error types
const getErrorType = (status) => {
  if (status >= 400 && status < 500) {
    return 'CLIENT_ERROR'
  } else if (status >= 500) {
    return 'SERVER_ERROR'
  }
  return 'UNKNOWN_ERROR'
}

// API wrapper functions with enhanced error handling
const apiWrapper = {
  // GET request
  get: async (url, config = {}) => {
    try {
      const response = await api.get(url, config)
      return response
    } catch (error) {
      throw error
    }
  },
  
  // POST request
  post: async (url, data = {}, config = {}) => {
    try {
      const response = await api.post(url, data, config)
      return response
    } catch (error) {
      throw error
    }
  },
  
  // PUT request
  put: async (url, data = {}, config = {}) => {
    try {
      const response = await api.put(url, data, config)
      return response
    } catch (error) {
      throw error
    }
  },
  
  // PATCH request
  patch: async (url, data = {}, config = {}) => {
    try {
      const response = await api.patch(url, data, config)
      return response
    } catch (error) {
      throw error
    }
  },
  
  // DELETE request
  delete: async (url, config = {}) => {
    try {
      const response = await api.delete(url, config)
      return response
    } catch (error) {
      throw error
    }
  }
}

// Specialized API endpoints
const authAPI = {
  login: (credentials) => apiWrapper.post('/auth/login', credentials),
  register: (userData) => apiWrapper.post('/auth/register', userData),
  logout: () => apiWrapper.post('/auth/logout'),
  refreshToken: () => apiWrapper.post('/auth/refresh'),
  verifyToken: () => apiWrapper.get('/auth/verify'),
  getProfile: () => apiWrapper.get('/v1/auth/profile'),
  forgotPassword: (email) => apiWrapper.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => apiWrapper.post('/auth/reset-password', { token, password }),
  updateProfile: (userData) => apiWrapper.put('/auth/profile', userData),
  changePassword: (passwordData) => apiWrapper.put('/auth/change-password', passwordData)
}

const screeningAPI = {
  getScreenings: () => apiWrapper.get('/screening'),
  createScreening: (data) => apiWrapper.post('/screening', data),
  getScreeningById: (id) => apiWrapper.get(`/screening/${id}`),
  updateScreening: (id, data) => apiWrapper.put(`/screening/${id}`, data),
  deleteScreening: (id) => apiWrapper.delete(`/screening/${id}`),
  getScreeningQuestions: () => apiWrapper.get('/screening/questions'),
  submitScreeningResponse: (data) => apiWrapper.post('/screening/responses', data)
}

const chatAPI = {
  getConversations: () => apiWrapper.get('/chat/conversations'),
  createConversation: () => apiWrapper.post('/chat/conversations'),
  getConversationById: (id) => apiWrapper.get(`/chat/conversations/${id}`),
  sendMessage: (conversationId, message) => apiWrapper.post(`/chat/conversations/${conversationId}/messages`, { message }),
  getMessages: (conversationId) => apiWrapper.get(`/chat/conversations/${conversationId}/messages`),
  deleteConversation: (id) => apiWrapper.delete(`/chat/conversations/${id}`)
}

const bookingAPI = {
  getAppointments: () => apiWrapper.get('/booking/appointments'),
  createAppointment: (data) => apiWrapper.post('/booking/appointments', data),
  getAppointmentById: (id) => apiWrapper.get(`/booking/appointments/${id}`),
  updateAppointment: (id, data) => apiWrapper.put(`/booking/appointments/${id}`, data),
  cancelAppointment: (id) => apiWrapper.delete(`/booking/appointments/${id}`),
  getAvailableSlots: (therapistId, date) => apiWrapper.get(`/booking/slots?therapistId=${therapistId}&date=${date}`),
  getTherapists: () => apiWrapper.get('/booking/therapists'),
  getTherapistById: (id) => apiWrapper.get(`/booking/therapists/${id}`)
}

const forumAPI = {
  // Thread management
  getThreads: (params = {}) => apiWrapper.get('/v1/forum/threads', { params }),
  createThread: (data) => apiWrapper.post('/v1/forum/threads', data),
  getThreadById: (id) => apiWrapper.get(`/v1/forum/threads/${id}`),
  updateThread: (id, data) => apiWrapper.put(`/v1/forum/threads/${id}`, data),
  deleteThread: (id) => apiWrapper.delete(`/v1/forum/threads/${id}`),
  
  // Legacy post methods (keeping for backward compatibility)
  getPosts: (params = {}) => apiWrapper.get('/forum/posts', { params }),
  createPost: (data) => apiWrapper.post('/forum/posts', data),
  getPostById: (id) => apiWrapper.get(`/forum/posts/${id}`),
  updatePost: (id, data) => apiWrapper.put(`/forum/posts/${id}`, data),
  deletePost: (id) => apiWrapper.delete(`/forum/posts/${id}`),
  
  // Comments/Replies
  getComments: (postId) => apiWrapper.get(`/forum/posts/${postId}/comments`),
  createComment: (postId, data) => apiWrapper.post(`/forum/posts/${postId}/comments`, data),
  updateComment: (postId, commentId, data) => apiWrapper.put(`/forum/posts/${postId}/comments/${commentId}`, data),
  deleteComment: (postId, commentId) => apiWrapper.delete(`/forum/posts/${postId}/comments/${commentId}`),
  
  // Categories
  getCategories: () => apiWrapper.get('/forum/categories'),
  
  // Moderation
  moderateThread: (data) => apiWrapper.post('/v1/forum/moderation', data)
}

const adminAPI = {
  getDashboardStats: () => apiWrapper.get('/admin/dashboard'),
  getOverview: (params = {}) => apiWrapper.get('/v1/admin/overview', { params }),
  getUsers: (params = {}) => apiWrapper.get('/admin/users', { params }),
  getUserById: (id) => apiWrapper.get(`/admin/users/${id}`),
  updateUser: (id, data) => apiWrapper.put(`/admin/users/${id}`, data),
  deleteUser: (id) => apiWrapper.delete(`/admin/users/${id}`),
  getAuditLogs: (params = {}) => apiWrapper.get('/admin/audit-logs', { params }),
  getSystemHealth: () => apiWrapper.get('/admin/system/health'),
  exportData: (type) => apiWrapper.get(`/admin/export/${type}`, { responseType: 'blob' })
}

// File upload utility
const uploadAPI = {
  uploadFile: async (file, onProgress) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
    
    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(percentCompleted)
      }
    }
    
    return apiWrapper.post('/upload', formData, config)
  }
}

// Custom hook for API access
export const useApi = () => {
  return {
    // Generic HTTP methods
    get: apiWrapper.get,
    post: apiWrapper.post,
    put: apiWrapper.put,
    patch: apiWrapper.patch,
    delete: apiWrapper.delete,
    
    // Specialized APIs
    auth: authAPI,
    screening: screeningAPI,
    chat: chatAPI,
    booking: bookingAPI,
    forum: forumAPI,
    admin: adminAPI,
    upload: uploadAPI,
    
    // Token management
    tokenManager
  }
}

// Export the main api instance and specialized endpoints
export {
  api,
  apiWrapper,
  authAPI,
  screeningAPI,
  chatAPI,
  bookingAPI,
  forumAPI,
  adminAPI,
  uploadAPI,
  tokenManager
}

// Default export
export default api