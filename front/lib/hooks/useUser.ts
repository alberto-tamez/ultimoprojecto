import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { MeResponse } from '../api/types';

/**
 * Custom hook to fetch the authenticated user's information.
 * User object matches MeResponse (see types for backend contract).
 */
interface UseUserResult {
  user: MeResponse | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<MeResponse | null>;
  isAuthenticated: boolean;
}

export function useUser(): UseUserResult {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const result = await apiClient.getCurrentUser();
      
      if (!result.success) {
        setError(result.error?.message || 'Failed to fetch user');
        return null;
      }
      
      setUser(result.data || null);
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const refreshUser = async () => {
    return fetchUser();
  };

  return { 
    user, 
    loading, 
    error, 
    refreshUser,
    isAuthenticated: !!user
  };
}
