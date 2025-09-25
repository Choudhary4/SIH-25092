import { useState, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'

/**
 * Custom hook for handling API operations with consistent error handling
 * @param {Function} apiFunction - The API function to execute
 * @param {Object} options - Configuration options
 * @returns {Object} - API state and execution function
 */
export const useApi = (apiFunction, options = {}) => {
  const [data, setData] = useState(options.initialData || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { logout } = useAuth()

  const execute = useCallback(async (...args) => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiFunction(...args)
      setData(response.data)
      return { success: true, data: response.data }
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred'
      setError(errorMessage)

      // Handle specific error types
      if (err.type === 'TOKEN_EXPIRED') {
        logout()
      }

      // Call error callback if provided
      if (options.onError) {
        options.onError(err)
      }

      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [apiFunction, options.onError, logout])

  const reset = useCallback(() => {
    setData(options.initialData || null)
    setError(null)
    setLoading(false)
  }, [options.initialData])

  return {
    data,
    loading,
    error,
    execute,
    reset
  }
}

/**
 * Hook for handling form submissions with API calls
 * @param {Function} apiFunction - The API function to execute
 * @param {Object} options - Configuration options
 * @returns {Object} - Form state and submission handler
 */
export const useApiForm = (apiFunction, options = {}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const { logout } = useAuth()

  const handleSubmit = useCallback(async (formData, additionalOptions = {}) => {
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await apiFunction(formData)
      setSuccess(true)

      // Call success callback if provided
      if (options.onSuccess) {
        options.onSuccess(response.data)
      }

      // Reset form if specified
      if (additionalOptions.resetOnSuccess && additionalOptions.resetForm) {
        additionalOptions.resetForm()
      }

      return { success: true, data: response.data }
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred'
      setError(errorMessage)

      // Handle specific error types
      if (err.type === 'TOKEN_EXPIRED') {
        logout()
      }

      // Call error callback if provided
      if (options.onError) {
        options.onError(err)
      }

      return { success: false, error: errorMessage }
    } finally {
      setIsSubmitting(false)
    }
  }, [apiFunction, options.onSuccess, options.onError, logout])

  const reset = useCallback(() => {
    setError(null)
    setSuccess(false)
    setIsSubmitting(false)
  }, [])

  return {
    isSubmitting,
    error,
    success,
    handleSubmit,
    reset
  }
}

/**
 * Hook for handling paginated API calls
 * @param {Function} apiFunction - The API function to execute
 * @param {Object} options - Configuration options
 * @returns {Object} - Paginated data state and controls
 */
export const usePaginatedApi = (apiFunction, options = {}) => {
  const [data, setData] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { logout } = useAuth()

  const fetchData = useCallback(async (page = 1, additionalParams = {}) => {
    setLoading(true)
    setError(null)

    try {
      const params = {
        page,
        limit: options.limit || 10,
        ...additionalParams
      }

      const response = await apiFunction(params)
      const { data: items, pagination } = response.data

      setData(items)
      setTotalPages(pagination?.totalPages || 1)
      setTotalItems(pagination?.totalItems || items.length)
      setCurrentPage(page)

      return { success: true, data: items }
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred'
      setError(errorMessage)

      // Handle specific error types
      if (err.type === 'TOKEN_EXPIRED') {
        logout()
      }

      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [apiFunction, options.limit, logout])

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      fetchData(currentPage + 1)
    }
  }, [currentPage, totalPages, fetchData])

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      fetchData(currentPage - 1)
    }
  }, [currentPage, fetchData])

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      fetchData(page)
    }
  }, [totalPages, fetchData])

  const refresh = useCallback(() => {
    fetchData(currentPage)
  }, [currentPage, fetchData])

  return {
    data,
    totalPages,
    totalItems,
    currentPage,
    loading,
    error,
    fetchData,
    nextPage,
    prevPage,
    goToPage,
    refresh
  }
}

export default useApi