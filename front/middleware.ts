import { authkitMiddleware } from '@workos-inc/authkit-nextjs';

export default authkitMiddleware({
  middlewareAuth: {
    enabled: true,
    // Allow access to authentication-related paths
    unauthenticatedPaths: [
      '/login',
      '/callback',
      '/signed-out',
      '/api/auth/logout'
    ],
  },
});

// Match all paths except static files and api routes that don't need auth
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
