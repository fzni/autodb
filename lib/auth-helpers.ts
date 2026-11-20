import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { getSession } from './db';
import { User } from './types';

export function getCurrentUser(req?: NextRequest): User | null {
  let sessionToken: string | undefined;

  if (req) {
    sessionToken = req.cookies.get('autodb_session')?.value;
    if (!sessionToken) {
      // Check authorization header as fallback (Bearer <token>)
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        sessionToken = authHeader.substring(7);
      }
    }
  }

  if (!sessionToken) {
    try {
      const cookieStore = cookies();
      sessionToken = cookieStore.get('autodb_session')?.value;
    } catch (e) {
      // Fallback
    }
  }

  if (!sessionToken) return null;

  const data = getSession(sessionToken);
  if (!data) return null;

  return data.user;
}
