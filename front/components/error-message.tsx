import React from 'react';

type ErrorLike = string | { message: string } | null | undefined;

interface ErrorMessageProps {
  error: ErrorLike;
  className?: string;
}

/**
 * A reusable error message component that safely renders errors.
 * Handles both string and object errors with a message property.
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  className = 'text-red-600 text-sm mt-2',
}) => {
  if (!error) return null;

  const message = typeof error === 'string' 
    ? error 
    : error && typeof error === 'object' && 'message' in error 
      ? error.message 
      : 'An unknown error occurred';

  return <div className={className}>{message}</div>;
};

// Usage:
// <ErrorMessage error={someError} />
