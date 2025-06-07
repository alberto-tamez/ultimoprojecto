import { NextResponse } from 'next/server';

// TODO: Exchange code for profile/session with your backend or WorkOS API
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return NextResponse.redirect(`${baseUrl}/dashboard`);
}