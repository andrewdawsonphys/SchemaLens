/**
 * Reusable loading spinner component
 */

import React from 'react';

export function LoadingSpinner({ size = 'medium', message = 'Loading...', className = '' }) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
      <div 
        className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-500 ${sizeClasses[size]}`}
        aria-label={message}
      />
      {message && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {message}
        </p>
      )}
    </div>
  );
}

export function FullScreenLoader({ message = 'Loading schema...' }) {
  return (
    <div className="app-content flex items-center justify-center min-h-screen">
      <LoadingSpinner size="large" message={message} />
    </div>
  );
}

export default LoadingSpinner;