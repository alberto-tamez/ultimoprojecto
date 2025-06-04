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

    try {
      // Call the logout API route
      const response = await fetch('/api/auth/logout', { 
        method: 'GET',
        redirect: 'follow'
      });
      
      // If we get here, the fetch didn't follow the redirect (shouldn't happen with redirect: 'follow')
      // So we'll handle it manually
      if (response.redirected) {
        window.location.href = response.url;
      } else {
        // Fallback to signed-out page
        window.location.href = '/signed-out';
      }
    } catch (error) {
      console.error('Error during sign out:', error);
      // Still redirect to signed-out page even if there's an error
      window.location.href = '/signed-out';
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