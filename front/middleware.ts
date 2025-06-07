// file: middleware.ts

// Using direct imports from Next.js to avoid module resolution issues
import { NextResponse, NextRequest } from 'next/server';

// DEBUG MODE: Set to true to completely bypass authentication
const DEBUG_BYPASS_AUTH = true;

// Simple passthrough middleware that does nothing - bypasses all authentication
export default function middleware(request: NextRequest) {
  console.log('🔓 DEBUG_BYPASS_AUTH is enabled. All authentication checks are bypassed!');
  return NextResponse.next();
}

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