import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api/client';

type LoginOptions = {
  returnTo?: string;
};

/**
 * Custom hook to handle authentication flow
 */
export function useAuthFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initiate the login process
   */
  const login = useCallback(async (options?: LoginOptions) => {
    setIsLoading(true);
    setError(null);

    try {
      // Add returnTo parameter if provided
      const redirectUri = options?.returnTo 
        ? `${window.location.origin}/api/auth/callback?returnTo=${encodeURIComponent(options.returnTo)}`
        : undefined;

      const result = await apiClient.initiateLogin(redirectUri);

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
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An unknown error occurred during login';
      setError(errorMessage);
      setIsLoading(false);
      throw new Error(errorMessage);
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

  /**
   * Check if user is authenticated
   */
  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      return response.ok;
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    }
  }, []);

  return {
    login,
    isLoading,
    error,
    handleLoginError,
    checkAuth,
  };
}
