// file: middleware.ts

import { authkitMiddleware } from '@workos-inc/authkit-nextjs';
import { NextResponse } from 'next/server';

// Public paths that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/api/auth/callback',
  '/signed-out',
  '/_next',
  '/favicon.ico',
  '/api/auth/me',
];

// Configure the authkit middleware
export default authkitMiddleware({
  middlewareAuth: {
    enabled: true,
    unauthenticatedPaths: publicPaths,
  },
  // Use the redirect URI from environment variables
  redirectUri: process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI || 'http://localhost:3000/api/auth/callback',
  // Enable debug logging in development
  debug: process.env.NODE_ENV !== 'production',
});

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};