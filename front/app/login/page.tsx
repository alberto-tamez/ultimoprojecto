'use client';

import { useRouter } from 'next/navigation';
import { getSignInUrl } from '@workos-inc/authkit-nextjs';

export default function LoginPage() {
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      const signInUrl = await getSignInUrl();
      router.push(signInUrl);
    } catch (error) {
      console.error('Error during sign in:', error);
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
        <div className="mt-8">
          <button
            onClick={handleSignIn}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign in with WorkOS
          </button>
        </div>
      </div>
    </div>
  );
}
