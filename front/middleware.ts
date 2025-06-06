// file: middleware.ts

import { authkitMiddleware } from '@workos-inc/authkit-nextjs';

// Configure the authkit middleware
export default authkitMiddleware({
  middlewareAuth: {
    enabled: true,
    unauthenticatedPaths: [
      '/',              // Assuming your homepage should be public. If not, remove this.
      '/login',         // The login page itself must be public.
      '/callback',      // The route WorkOS redirects to after login must be public.
      '/signed-out',    // The page shown after a user logs out.
    ],
  },
  redirectUri: process.env.WORKOS_REDIRECT_URI,
  debug: process.env.NODE_ENV !== 'production'
});

// The `config` object specifies which paths the middleware should run on.
// This is a crucial performance and logic optimization.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};