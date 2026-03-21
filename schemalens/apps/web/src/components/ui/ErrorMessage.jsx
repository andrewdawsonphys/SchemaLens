/**
 * Reusable error display components
 */

import React from 'react';

export function ErrorMessage({ 
  title = 'Something went wrong',
  message,
  action,
  actionLabel = 'Try again',
  className = ''
}) {
  return (
    <div className={`error-container p-6 text-center ${className}`}>
      <div className="error-icon mb-4">
        <svg 
          width="48" 
          height="48" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          className="mx-auto text-red-500"
        >
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      
      {message && (
        <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
          {message}
        </p>
      )}
      
      {action && (
        <button 
          onClick={action}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function InlineError({ message, onDismiss, className = '' }) {
  return (
    <div className={`inline-error p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded ${className}`}>
      <div className="flex items-center">
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          className="text-red-500 mr-2 flex-shrink-0"
        >
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        
        <span className="text-red-700 dark:text-red-300 text-sm flex-1">
          {message}
        </span>
        
        {onDismiss && (
          <button 
            onClick={onDismiss}
            className="text-red-500 hover:text-red-700 ml-2 p-1"
            aria-label="Dismiss error"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export function FullScreenError({ 
  title = 'Failed to Load Schema',
  message,
  onRetry
}) {
  return (
    <div className="app-content flex items-center justify-center min-h-screen">
      <ErrorMessage 
        title={title}
        message={message}
        action={onRetry || (() => window.location.reload())}
        actionLabel="Retry"
        className="max-w-lg"
      />
    </div>
  );
}

export default ErrorMessage;