import { NextResponse } from 'next/server';
import { signOut } from '@workos-inc/authkit-nextjs';

export async function GET() {
  try {
    // Redirect to WorkOS logout endpoint, which will then redirect to /signed-out
    return await signOut({
      returnTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/signed-out`,
    });
  } catch (error) {
    console.error('Error during logout:', error);
    const errorUrl = new URL(
      '/login?error=logout_failed',
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    );
    return NextResponse.redirect(errorUrl);
  }
}