import { NextResponse } from 'next/server';
import { signOut } from '@workos-inc/authkit-nextjs';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
if (!APP_URL) {
  throw new Error('NEXT_PUBLIC_APP_URL environment variable is not set');
}

export async function GET() {
  try {
    // Redirect to WorkOS logout endpoint, which will then redirect to /signed-out
    return await signOut({
      returnTo: `${APP_URL}/signed-out`,
    });
  } catch (error) {
    console.error('Error during logout:', error);
    const errorUrl = new URL('/login?error=logout_failed', APP_URL);
    return NextResponse.redirect(errorUrl);
  }
}