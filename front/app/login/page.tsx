'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getSignInUrl } from '@workos-inc/authkit-nextjs';

/**
 * Login page component that handles authentication with WorkOS
 * Uses the WorkOS AuthKit middleware for authentication
 */
export default function LoginPage() {
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get URL search parameters
  const searchParams = useSearchParams();

  /**
   * Handle the sign-in button click
   * Redirects to the WorkOS login endpoint
   */
  const handleSignIn = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      // Always use the correct callback URI registered in WorkOS dashboard
      const redirectUri = process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI || 'http://localhost:3000/callback';
      const signInUrl = await getSignInUrl({
        redirectUri,
      });
      window.location.href = signInUrl;
    } catch (err) {
      console.error('Sign in error:', err);
      setError('Failed to start sign in process. Please try again.');
      setIsLoading(false);
    }
  };
  
  // Handle any authentication errors from the URL
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError('Authentication failed. Please try again.');
      
      // Clean up the URL by removing the error parameter
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('error');
      window.history.replaceState({}, document.title, cleanUrl.toString());
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600 mb-8">
            Sign in to access your dashboard
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg 
                  className="h-5 w-5 text-red-400" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-8">
          <button
            type="button"
            onClick={handleSignIn}
            disabled={isLoading}
            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${
              isLoading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <svg 
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Redirecting to login...
              </>
            ) : (
              'Sign in with WorkOS'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
