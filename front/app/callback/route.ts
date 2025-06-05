import { handleAuth } from '@workos-inc/authkit-nextjs';
import { NextResponse } from 'next/server';

// After successful authentication, redirect to the dashboard
export const GET = handleAuth({
  returnPathname: '/',
  onError: ({ error }) => {
    // On error, redirect to login with error message
    const errorUrl = new URL('/login', process.env.NEXT_PUBLIC_APP_URL);
    errorUrl.searchParams.set('error', 'auth_failed');
    if (error instanceof Error) {
      errorUrl.searchParams.set('message', error.message);
    }
    return NextResponse.redirect(errorUrl);
  },
});