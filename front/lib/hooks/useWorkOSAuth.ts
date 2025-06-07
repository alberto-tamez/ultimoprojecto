import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@workos-inc/authkit-nextjs/components';
import { apiClient } from '../api/client';
import { MeResponse, ApiError, ApiResult } from '../api/types';

// Debug logging helper
const debugLog = (message: string, ...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[useWorkOSAuth] ${message}`, ...args);
  }
};

// Infer the WorkOSUser type from the useAuth hook's return value for user
type InferredWorkOSUser = ReturnType<typeof useAuth>['user']; // This is User | null | undefined

export interface UseWorkOSAuthReturn {
  workosUser: InferredWorkOSUser; // Already handles User | null | undefined
  backendUser: MeResponse | null;
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}

export const useWorkOSAuth = (): UseWorkOSAuthReturn => {
  const { user: authKitUser, signOut } = useAuth();

  const [backendUser, setBackendUser] = useState<MeResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch backend user data
  const fetchBackendUser = useCallback(async (currentAuthKitUser: InferredWorkOSUser) => {
    // Do not fetch if authKitUser is null (logged out) or undefined (resolving)
    if (!currentAuthKitUser) {
      debugLog('fetchBackendUser: No AuthKit user (null or undefined), skipping fetch.');
      // Ensure isLoading is false if we are not fetching because user is null (logged out)
      // If user is undefined (resolving), useEffect will handle isLoading
      if (currentAuthKitUser === null) {
        setIsLoading(false);
        setBackendUser(null); // Ensure backend user is also null
        setError(null); // Clear errors
      }
      return null;
    }

    debugLog('fetchBackendUser: Fetching backend user data for AuthKit user:', currentAuthKitUser.id);
    setIsLoading(true); // Set loading true before async operation
    try {
      const apiResult = await apiClient.getCurrentUser();
      debugLog('fetchBackendUser: Backend user data API result:', apiResult);
      if (apiResult.success) {
        debugLog('fetchBackendUser: Successfully fetched backend user:', apiResult.data);
        setError(null); // Clear previous errors on success
        return apiResult.data;
      } else {
        debugLog('fetchBackendUser: Failed to fetch backend user, error:', apiResult.error);
        setError(new Error(apiResult.error.message || 'Failed to fetch user data from backend'));
        return null;
      }
    } catch (e: any) {
      debugLog('fetchBackendUser: Exception during fetch:', e);
      setError(new Error(e.message || 'Exception while fetching user data'));
      return null;
    }
  }, []); // apiClient is stable

  useEffect(() => {
    let isMounted = true;
    debugLog('useEffect [authKitUser]: AuthKit user state changed:', authKitUser);

    if (authKitUser === undefined) {
      debugLog('useEffect [authKitUser]: AuthKit user is undefined, still resolving. Setting isLoading to true.');
      if (isMounted) setIsLoading(true);
      return; // Wait for AuthKit to resolve
    }

    if (authKitUser === null) {
      debugLog('useEffect [authKitUser]: AuthKit user is null (logged out). Clearing backend user and setting isLoading to false.');
      if (isMounted) {
        setBackendUser(null);
        setError(null);
        setIsLoading(false);
      }
      return;
    }

    // AuthKit user exists (is an object), try to fetch backend user
    debugLog('useEffect [authKitUser]: AuthKit user exists, proceeding to fetch/sync backend user.');
    // Set loading true before starting the fetch operation if not already true
    if (isMounted && !isLoading) setIsLoading(true);

    fetchBackendUser(authKitUser).then(fetchedUser => {
      if (isMounted) {
        setBackendUser(fetchedUser); // This will be null if fetch failed
        // Error state is handled within fetchBackendUser
        setIsLoading(false); // Done with operations for this authKitUser state
      }
    });

    return () => {
      debugLog('useEffect [authKitUser]: Unmounting or authKitUser changed again.');
      isMounted = false;
    };
  }, [authKitUser, fetchBackendUser, isLoading]); // Added isLoading to dependencies

  const logout = useCallback(async () => {
    debugLog('logout: Initiating logout.');
    setIsLoading(true);
    setError(null); // Clear errors on logout attempt
    try {
      debugLog('logout: Calling backend logout endpoint.');
      await apiClient.logout();
      debugLog('logout: Backend logout successful.');
    } catch (e: any) {
      debugLog('logout: Error during backend logout:', e);
      // Log the error but don't block AuthKit sign out
      console.error('[useWorkOSAuth] Backend logout failed:', e.message);
    } finally {
      // Always attempt to sign out from AuthKit
      try {
        debugLog('logout: Calling AuthKit signOut.');
        await signOut(); // This will trigger the useEffect to clear states
        debugLog('logout: AuthKit signOut successful.');
      } catch (authKitSignOutError: any) {
        debugLog('logout: Error during AuthKit signOut:', authKitSignOutError);
        setError(new Error(authKitSignOutError.message || 'AuthKit sign out failed'));
        setIsLoading(false); // Explicitly set loading false if AuthKit signOut fails
      }
      // If signOut is successful, authKitUser becomes null,
      // and the useEffect will set isLoading to false and clear backendUser.
      // If signOut fails, we've set isLoading false above.
    }
  }, [signOut]); // apiClient is stable

  const isAuthenticated = !!authKitUser && !!backendUser;
  debugLog('Render: isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'authKitUser:', authKitUser ? authKitUser.id : authKitUser, 'backendUser:', backendUser ? backendUser.id : backendUser);

  return {
    workosUser: authKitUser,
    backendUser,
    isLoading,
    error,
    isAuthenticated,
    logout,
  };
};
