import React from 'react';
import { useRateLimitMonitor } from '../../utils/rateLimitTester.js';

const RateLimitStatusIndicator = ({ endpoint, className = "" }) => {
  const { requestCount, remaining, wouldBeRateLimited } = useRateLimitMonitor(endpoint);

  // Don't show in production unless there's an issue
  if (process.env.NODE_ENV === 'production' && !wouldBeRateLimited) {
    return null;
  }

  const getStatusColor = () => {
    if (wouldBeRateLimited) return 'text-red-600 bg-red-100';
    if (remaining < 10) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getStatusIcon = () => {
    if (wouldBeRateLimited) return '🚫';
    if (remaining < 10) return '⚠️';
    return '✅';
  };

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()} ${className}`}>
      <span className="mr-1">{getStatusIcon()}</span>
      <span>API: {remaining} left</span>
      {process.env.NODE_ENV === 'development' && (
        <span className="ml-1 text-xs opacity-75">({requestCount} used)</span>
      )}
    </div>
  );
};

export default RateLimitStatusIndicator;