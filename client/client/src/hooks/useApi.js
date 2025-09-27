import { useState } from 'react';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callApi = async (endpoint, method = 'GET', data = null, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const config = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      };

      // Add authorization header if token exists
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add body for POST, PUT, PATCH requests
      if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        config.body = JSON.stringify(data);
      }

      // Use full URL if endpoint starts with http, otherwise use relative path
      // Handle different ways to get the API URL
      let baseUrl;
      try {
        baseUrl = import.meta?.env?.VITE_API_URL || 
                 (typeof window !== 'undefined' && window.location.origin.includes('localhost') ? 
                  'http://localhost:5000' : 
                  'http://localhost:5000');
      } catch (e) {
        baseUrl = 'http://localhost:5000';
      }
      
      const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
      
      const response = await fetch(url, config);
      
      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
      }

      setLoading(false);
      return {
        success: true,
        data: responseData.data || responseData,
        message: responseData.message,
        status: response.status,
      };
    } catch (err) {
      console.error('API call error:', err);
      setError(err.message);
      setLoading(false);
      return {
        success: false,
        error: err.message,
        data: null,
      };
    }
  };

  return { callApi, loading, error };
};