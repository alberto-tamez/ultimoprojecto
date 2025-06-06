'use client';

import { useState, useMemo } from 'react';
import { signOut } from '@workos-inc/authkit-nextjs';
import { useAuth } from '@workos-inc/authkit-nextjs/components';
import { useUser } from "@/lib/hooks/useUser";
import { apiClient } from "@/lib/api/client";
import { Navigation, type NavigationUser } from '@/components/navigation';
import { Dashboard } from '@/components/dashboard';
import { ErrorMessage } from '@/components/error-message';
import { UserProfile } from '@/components/user-profile';

/**
 * Main application page that handles authentication and routing
 */

export default function MainPage() {
  // Auth state from WorkOS
  const { user: authUser, loading: authLoading } = useAuth({ ensureSignedIn: true });
  
  // User data from our API
  const { user, loading: userLoading, error: userHookError, refreshUser } = useUser();
  
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'profile'>('dashboard');
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [error, setError] = useState<string | { message: string } | null>(null);

  // Memoize the transformed navigation user to prevent unnecessary re-renders
  const navigationUser: NavigationUser | null = useMemo(() => 
    user ? { ...user, role: user.is_admin ? 'admin' : 'user' } : null,
    [user]
  );

  // Handle sign out with error handling
  const handleSignOut = async () => {
    try {
      const result = await apiClient.logout();
      console.log('Logout result from API:', result); // Log the actual result

      if (result && typeof result.workos_logout_url === 'string' && result.workos_logout_url) {
        window.location.href = result.workos_logout_url;
      } else {
        console.warn('WorkOS logout URL not found or invalid, redirecting to /login. Received URL:', result?.workos_logout_url);
        window.location.href = '/login'; // Fallback redirect
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign out';
      // Log the full error object for more details, especially if it's not a standard Error instance
      console.error('Sign out error:', errorMessage, err); 
      setSignOutError(errorMessage);
      // Optionally, you could also redirect to /login here if preferred
      // window.location.href = '/login'; 
    }
  };

  const handlePageChange = (page: 'dashboard' | 'profile') => {
    setCurrentPage(page);
  };

  // Combine loading states
  const isLoading = authLoading || userLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-lg text-gray-700 mb-2">Loading your dashboard...</p>
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Handle errors
  if (userHookError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Data</h2>
          <div className="text-gray-700 mb-4">
            <p>We couldn't load your data.</p>
            <ErrorMessage error={userHookError} className="text-gray-700" />
          </div>
          <button
            onClick={refreshUser}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {navigationUser && (
        <Navigation 
          currentPage={currentPage} 
          onPageChange={handlePageChange} 
          onLogout={handleSignOut} 
          user={navigationUser} // Pass the transformed user object
        />
      )}
      <main className="flex-grow container mx-auto px-4 py-8">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'profile' && (
          <div className="text-center p-10 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-semibold">Profile Page</h2>
            <p className="text-gray-600">This is where user profile information will be displayed.</p>
            
            {/* Display any errors */}
            <ErrorMessage error={error} className="my-4" />
            
            {/* Display user profile if available */}
            {user && <UserProfile user={user} />}
          </div>
        )}
      </main>
    </div>
  );
}
