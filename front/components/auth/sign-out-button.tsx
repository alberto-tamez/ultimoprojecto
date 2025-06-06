'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { signOut } from '@workos-inc/authkit-nextjs';

interface SignOutButtonProps {
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  children?: React.ReactNode;
}

export function SignOutButton({ 
  className, 
  variant = 'default',
  children = 'Sign Out' 
}: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Step 1: Call backend logout endpoint to clear its session and cookie
      const backendRes = await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include', // Important to send cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!backendRes.ok) {
        // Log the error but proceed to AuthKit logout to ensure frontend session is cleared
        console.error('Backend sign out failed. Status:', backendRes.status, 'Response:', await backendRes.text());
        // Depending on policy, you might throw an error or just log and continue.
        // For robustness in logout, we'll attempt AuthKit logout regardless in the next step.
      }

      // Step 2: Call AuthKit's signOut to clear frontend session and handle redirection.
      // AuthKit's signOut will typically redirect to the configured sign-out page
      // or through WorkOS global logout, then to your app's signed-out page.
      await signOut(); 
      // No explicit window.location.href needed here; signOut handles page navigation.

    } catch (error) {
      console.error('Error during sign out process:', error);
      // If AuthKit's signOut itself fails or if there was a critical error before it,
      // this block will catch it. You might want a fallback redirect here if signOut
      // doesn't navigate on its own error, though typically it should.
      // Example fallback (consider if AuthKit's default redirect isn't working):
      // const appUrlFromEnv = process.env.NEXT_PUBLIC_APP_URL;
      // const finalSignedOutUrl = appUrlFromEnv 
      //   ? `${appUrlFromEnv}/signed-out` 
      //   : '/signed-out';
      // window.location.href = finalSignedOutUrl;
    } finally {
      // Since signOut() causes navigation, this part might not execute if successful.
      // If signOut can error without navigating, then it's useful to reset loading state.
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant={variant} 
      className={`relative ${className}`}
      onClick={handleSignOut}
      disabled={isLoading}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing out...
        </>
      ) : (
        children
      )}
    </Button>
  );
}