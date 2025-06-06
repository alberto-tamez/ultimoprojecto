'use client';

import { useEffect, useState } from 'react';
import { useAuthFlow } from '@/lib/hooks/useAuthFlow';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login, isLoading, error } = useAuthFlow();
  const [errorState, setErrorState] = useState<string | { message: string } | null>(null);
  const router = useRouter();

  // Auto-redirect to home if already authenticated
  useEffect(() => {
    // This is a simplified check - in a real app, you'd verify the session
    const checkAuth = async () => {
      try {
        const result = await fetch('/api/auth/session');
        if (result.ok) {
          router.push('/');
        }
      } catch (err) {
        console.error('Session check failed:', err);
      }
    };
    
    checkAuth();
  }, [router]);

  const handleSignIn = async () => {
    try {
      await login();
    } catch (err) {
      console.error('Login error:', err);
      if (typeof err === 'string') setErrorState(err);
      else if (err && typeof err === 'object' && 'message' in err) setErrorState({ message: (err as any).message });
      else setErrorState('Unknown error');
      // Error is already handled by the useAuthFlow hook
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        
        {errorState && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                {errorState && typeof errorState === 'string' && (
                  <p className="text-red-600 text-sm mt-2">{errorState}</p>
                )}
                {errorState && typeof errorState === 'object' && 'message' in errorState && (
                  <p className="text-red-600 text-sm mt-2">{errorState.message}</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-8">
          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isLoading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Redirecting...
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
