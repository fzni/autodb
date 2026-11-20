import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { deleteSession } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('autodb_session')?.value;
  if (sessionToken) {
    deleteSession(sessionToken);
  }

  const response = NextResponse.json({ ok: true, message: 'Logged out successfully' });
  response.cookies.delete('autodb_session');
  return response;
}
