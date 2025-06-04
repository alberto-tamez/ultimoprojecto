import { NextApiRequest, NextApiResponse } from 'next';
import { clearTokenCookie } from '../../../lib/session';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  clearTokenCookie(res);
  res.redirect('/');
}