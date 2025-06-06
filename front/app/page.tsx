'use client';

import { useState } from 'react';
import { signOut } from '@workos-inc/authkit-nextjs';
import { useAuth } from '@workos-inc/authkit-nextjs/components';
import { useUser } from "@/lib/hooks/useUser";
import { apiClient } from "@/lib/api/client";
import { Navigation, type NavigationUser } from '@/components/navigation';
import { Dashboard } from '@/components/dashboard';

/**
 * Main application page that handles authentication and routing
 */

export default function MainPage() {
  // Auth state from WorkOS
  const { user: authUser, loading: authLoading } = useAuth({ ensureSignedIn: true });
  
  // User data from our API
  const { user, loading: userLoading, error: userError, refreshUser } = useUser();
  
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'profile'>('dashboard');
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [error, setError] = useState<string | { message: string } | null>(null);

  // Handle sign out with error handling
  const handleSignOut = async () => {
    try {
      const result = await apiClient.logout();
      window.location.href = result.workos_logout_url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign out';
      console.error('Sign out error:', errorMessage);
      setSignOutError(errorMessage);
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
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Data</h2>
          <p className="text-gray-700 mb-4">
            We couldn't load your data.
            {typeof error === 'string' && ` ${error}`}
            {typeof error === 'object' && error && 'message' in error && ` ${error.message}`}
          </p>
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

  // Prepare the user object for the Navigation component
  const navigationUser: NavigationUser | null = user
    ? {
        ...user,
        role: user.is_admin ? 'admin' : 'user',
      }
    : null;

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
            {error && typeof error === 'string' && (
  <div className="text-red-600 text-sm mt-2">{error}</div>
)}
{error && typeof error === 'object' && 'message' in error && (
  <div className="text-red-600 text-sm mt-2">{error.message}</div>
)}
            {user && (
              <div className="mt-4 text-left text-sm text-gray-700">
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>WorkOS User ID:</strong> {user.workos_user_id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Name:</strong> {user.full_name}</p>
                <p><strong>Admin:</strong> {user.is_admin ? 'Yes' : 'No'}</p>
                {/* Add other user details as needed */}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
