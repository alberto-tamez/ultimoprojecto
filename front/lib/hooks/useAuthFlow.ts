import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { ApiError } from '@/lib/api/types';

/**
 * Custom hook to handle authentication flow
 */
export function useAuthFlow() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initiate the login process
   */
  const login = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiClient.initiateLogin();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to initiate login');
      }

      // Redirect to the authorization URL
      if (result.data?.authorization_url) {
        window.location.href = result.data.authorization_url;
      } else {
        throw new Error('No authorization URL received');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setIsLoading(false);
      throw err;
    }
  }, []);

  /**
   * Handle login errors
   */
  const handleLoginError = useCallback((err: unknown): string => {
    let errorMessage = 'An unknown error occurred';
    
    if (err instanceof Error) {
      errorMessage = err.message;
    } else if (apiClient.isApiError(err)) {
      errorMessage = err.error.message;
    } else if (typeof err === 'string') {
      errorMessage = err;
    }
    
    setError(errorMessage);
    return errorMessage;
  }, []);

  return {
    login,
    isLoading,
    error,
    handleLoginError,
  };
}
