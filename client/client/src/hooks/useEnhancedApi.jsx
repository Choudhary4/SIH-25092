import React from 'react';
import { useApi } from '../hooks/useApi.js';
import RateLimitNotification from '../components/common/RateLimitNotification.jsx';
import { handleApiCallWithRetry } from '../utils/apiRetry.js';

/**
 * Higher-order component that adds rate limit and retry handling to any component
 */
export const withApiHandling = (WrappedComponent) => {
  return function ApiHandledComponent(props) {
    const { callApi, rateLimitError, clearRateLimitError } = useApi();
    const [retryCount, setRetryCount] = React.useState(0);

    const enhancedApiCall = React.useCallback(async (endpoint, method, data, options = {}) => {
      return handleApiCallWithRetry(
        () => callApi(endpoint, method, data, options),
        {
          maxRetries: 3,
          respectRateLimit: true,
          onRateLimit: (rateLimitInfo) => {
            console.log('Rate limit encountered:', rateLimitInfo);
          },
          onRetry: (error, retriesLeft) => {
            console.log(`Retrying API call. ${retriesLeft} retries left.`, error);
            setRetryCount(count => count + 1);
          }
        }
      );
    }, [callApi]);

    const handleRetryAfterRateLimit = React.useCallback(() => {
      clearRateLimitError();
      setRetryCount(0);
    }, [clearRateLimitError]);

    return (
      <div>
        {rateLimitError && (
          <div className="mb-4">
            <RateLimitNotification
              error={rateLimitError}
              onRetry={handleRetryAfterRateLimit}
              onDismiss={clearRateLimitError}
            />
          </div>
        )}
        
        <WrappedComponent
          {...props}
          apiCall={enhancedApiCall}
          rateLimitError={rateLimitError}
          retryCount={retryCount}
          onClearRateLimit={clearRateLimitError}
        />
      </div>
    );
  };
};

/**
 * Hook for enhanced API calls with automatic retry and rate limit handling
 */
export const useEnhancedApi = () => {
  const { callApi, loading, error, rateLimitError, clearRateLimitError } = useApi();
  const [retryCount, setRetryCount] = React.useState(0);

  const enhancedApiCall = React.useCallback(async (endpoint, method, data, options = {}) => {
    setRetryCount(0);
    
    return handleApiCallWithRetry(
      () => callApi(endpoint, method, data, options),
      {
        maxRetries: options.maxRetries || 3,
        respectRateLimit: true,
        onRateLimit: (rateLimitInfo) => {
          console.log('Rate limit encountered:', rateLimitInfo);
        },
        onRetry: (error, retriesLeft) => {
          console.log(`Retrying API call. ${retriesLeft} retries left.`, error);
          setRetryCount(count => count + 1);
        }
      }
    );
  }, [callApi]);

  return {
    apiCall: enhancedApiCall,
    loading,
    error,
    rateLimitError,
    retryCount,
    clearRateLimitError
  };
};