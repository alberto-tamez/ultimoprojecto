import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@workos-inc/authkit-nextjs/components';
import { apiClient } from '../api/client';
import { MeResponse, ApiError, ApiResult } from '../api/types';

// Infer the WorkOSUser type from the useAuth hook's return value for user
type InferredWorkOSUser = ReturnType<typeof useAuth>['user'];

interface UseWorkOSAuthReturn {
  workosUser: InferredWorkOSUser;
  backendUser: MeResponse | null;
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}

export const useWorkOSAuth = (): UseWorkOSAuthReturn => {
  const { user: workosUserFromAuthKit, signOut: workosSignOut } = useAuth();

  const [backendUser, setBackendUser] = useState<MeResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start loading as true
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Handles the case where AuthKit is still determining the user state.
    // workosUserFromAuthKit will be `undefined` initially.
    if (workosUserFromAuthKit === undefined) {
      if (isMounted && !isLoading) {
        setIsLoading(true); // Ensure loading is true while AuthKit resolves
      }
      return; // Wait for AuthKit to provide a user object or null
    }

    // AuthKit has resolved. workosUserFromAuthKit is now either a user object or null.
    if (workosUserFromAuthKit) {
      // AuthKit has an authenticated user. Attempt to fetch/sync backend user.
      if (isMounted && !isLoading) {
        setIsLoading(true);
      }
      apiClient.getCurrentUser()
        .then((apiResult: ApiResult<MeResponse>) => {
          if (isMounted) {
            if (apiResult.success) {
              // Successfully fetched data
              if (apiResult.data) {
                setBackendUser(apiResult.data);
                setError(null);
              } else {
                // This case implies success: true but no data, which might be an unexpected API contract violation.
                console.error('Backend user fetch error: Successful response but no data.');
                setError(new Error('Failed to process user data: No data received.'));
                setBackendUser(null);
              }
            } else {
              // apiResult.success is false, so apiResult.error is guaranteed to exist.
              const errorMessage = apiResult.error.message || 'Unknown error fetching backend user.';
              console.error('Backend user fetch error:', errorMessage, apiResult.error.details);
              setError(new Error(errorMessage));
              setBackendUser(null);
            }
          }
        })
        .catch((err: any) => {
          if (isMounted) {
            console.error('Exception during backend user fetch:', err);
            setError(err instanceof Error ? err : new Error('An unexpected error occurred.'));
            setBackendUser(null);
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });
    } else {
      // No AuthKit user (workosUserFromAuthKit is null), so clear backend user and stop loading.
      if (isMounted) {
        setBackendUser(null);
        setError(null); // Clear any previous errors
        setIsLoading(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [workosUserFromAuthKit]); // Re-run effect when AuthKit user state changes

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await apiClient.logout(); // Call backend logout
      await workosSignOut();    // Sign out from WorkOS AuthKit
      // AuthKit's useAuth will update workosUserFromAuthKit to null,
      // which will trigger the useEffect to clear backendUser.
      // Explicitly clear state here for immediate UI feedback.
      setBackendUser(null);
      setError(null);
    } catch (err: any) {
      console.error('Logout failed:', err);
      setError(err instanceof Error ? err : new Error('Logout failed'));
    } finally {
      setIsLoading(false);
    }
  }, [workosSignOut]); // Removed isMounted from deps as it's managed internally

  // isAuthenticated is true only if both AuthKit and backend confirm user identity.
  const isAuthenticated = !!workosUserFromAuthKit && !!backendUser;

  return {
    workosUser: workosUserFromAuthKit,
    backendUser,
    isLoading,
    error,
    isAuthenticated,
    logout,
  };
};
