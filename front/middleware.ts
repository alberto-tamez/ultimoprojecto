// file: middleware.ts

import { authkitMiddleware } from '@workos-inc/authkit-nextjs';
import { NextResponse } from 'next/server';

// Public paths that don't require authentication
// Public paths that don't require authentication
// The /callback path is handled by AuthKit and should not be public here.
const publicPaths = [
  // '/' was removed, making the root path protected by middleware
  '/login',
  '/signed-out',
  '/_next',
  '/favicon.ico',
  '/api/auth/me', // If this is a public endpoint to check session status
];

// Configure the authkit middleware
export default authkitMiddleware({
  // Always enable debug logging in development
  debug: process.env.NODE_ENV !== 'production',
  middlewareAuth: {
    enabled: true,
    unauthenticatedPaths: publicPaths,
  },
  // Use the redirect URI from environment variables
  // This MUST match the WORKOS_REDIRECT_URI in your WorkOS dashboard and backend .env
  // And should point to your frontend's AuthKit callback handler (e.g., app/callback/route.ts)
  redirectUri: process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI,

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
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth (WorkOS AuthKit's internal API routes, if they exist and are used by AuthKit directly)
     * - callback (The AuthKit callback route itself, which is handled by AuthKit)
     * We want the middleware to run on most paths to protect them, but not on these specific exceptions.
     * The `authkitMiddleware` itself will handle the /callback route appropriately.
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth/|callback).*)',
  ],
};