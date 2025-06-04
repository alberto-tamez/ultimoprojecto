import { serialize, parse } from 'cookie';

const TOKEN_NAME = 'session_token';
const MAX_AGE = 60 * 60 * 8; // 8 horas

export function setTokenCookie(res: any, token: string) {
  const cookie = serialize(TOKEN_NAME, token, {
    maxAge: MAX_AGE,
    expires: new Date(Date.now() + MAX_AGE * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
  });

  res.setHeader('Set-Cookie', cookie);
}

export function getTokenCookie(req: any) {
  const cookies = parse(req.headers.cookie || '');
  return cookies[TOKEN_NAME];
}

export function clearTokenCookie(res: any) {
  const cookie = serialize(TOKEN_NAME, '', {
    maxAge: -1,
    path: '/',
  });
  res.setHeader('Set-Cookie', cookie);
}