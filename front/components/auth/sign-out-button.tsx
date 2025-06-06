'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

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

    const appUrlFromEnv = process.env.NEXT_PUBLIC_APP_URL;
    const finalSignedOutUrl = appUrlFromEnv 
      ? `${appUrlFromEnv}/signed-out` 
      : '/signed-out';

    if (!appUrlFromEnv) {
        console.warn(
        'NEXT_PUBLIC_APP_URL is not set. Sign-out redirect will be relative, which might be incorrect on deployed environments.'
        );
    }

    try {
      // Call backend logout endpoint to clear session and cookie
      const res = await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error('Failed to sign out.');
      }

      // Redirect only after backend confirms logout
      window.location.href = finalSignedOutUrl;
      return;
    
      // Call the logout API route.
      // The `fetch` with `redirect: 'follow'` should mean the browser
      // follows all redirects issued by the server (including from WorkOS).
      await fetch('/api/auth/logout', { 
        method: 'GET',
        redirect: 'follow'
      });
      
      // After the fetch, the browser should have been redirected to the
      // final URL (e.g., `${appUrlFromEnv}/signed-out`).
      // We explicitly navigate to the correctly constructed `finalSignedOutUrl`
      // if not already there, to ensure the correct domain.
      if (window.location.href !== finalSignedOutUrl) {
        window.location.href = finalSignedOutUrl;
      }
    } catch (error) {
      console.error('Error during sign out:', error);
      // On error, also redirect to the final signed-out URL.
      window.location.href = finalSignedOutUrl;
    } finally {
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