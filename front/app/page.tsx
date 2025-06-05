'use client';

import { useState } from 'react';
// useRouter is not used, so it can be removed if not needed for other functionality later
// import { useRouter } from 'next/navigation'; 
import { signOut } from '@workos-inc/authkit-nextjs';
import { useAuth } from '@workos-inc/authkit-nextjs/components';
import { Navigation } from '@/components/navigation';
import { Dashboard } from '@/components/dashboard';

// Define a more specific type for the user object expected by Navigation
interface NavigationUser {
  email: string;
  name: string;
  role: string;
}

export default function MainPage() {
  // const router = useRouter(); // Not currently used
  const { user, loading } = useAuth({ ensureSignedIn: true });
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'profile'>('dashboard');

  const handleSignOut = async () => {
    try {
      // The logout API route /api/auth/logout will handle the redirect to /signed-out
      await signOut(); 
    } catch (err) {
      console.error('Error during sign out:', err);
      // Optionally, redirect to a generic error page or /signed-out as a fallback
      // window.location.href = '/signed-out?error=signout_failed_client';
    }
  };

  const handlePageChange = (page: 'dashboard' | 'profile') => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">Loading...</p>
      </div>
    );
  }

  if (!user) {
    // This state should ideally be handled by middleware + ensureSignedIn: true
    // by redirecting to the login page automatically.
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">Redirecting to login...</p>
      </div>
    );
  }

  // Prepare the user object for the Navigation component
  // The WorkOS User object might have nullable fields, so provide defaults.
  const navigationUser: NavigationUser | null = user
    ? {
        email: user.email ?? 'N/A',
        name: user.firstName
          ? `${user.firstName} ${user.lastName ?? ''}`.trim()
          : user.email ?? 'User',
        // Assuming 'role' might come from customAttributes or a similar field
        // If not, provide a default or adjust based on your WorkOS user schema
        role: (user as any).customAttributes?.role ?? (user as any).role ?? 'User',
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
            {user && (
              <div className="mt-4 text-left text-sm text-gray-700">
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>First Name:</strong> {user.firstName}</p>
                <p><strong>Last Name:</strong> {user.lastName}</p>
                {/* Add other user details as needed */}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
