'use server';

import { redirect } from 'next/navigation';

export default async function Page() {
  const clientId = process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI;
  const provider = 'GoogleOAuth';

  if (!clientId || !redirectUri) {
    throw new Error('Missing WorkOS OAuth environment variables.');
  }

  const workosUrl = `https://api.workos.com/sso/authorize?client_id=${encodeURIComponent(clientId)}&provider=${encodeURIComponent(provider)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  redirect(workosUrl);
  return null;
}
