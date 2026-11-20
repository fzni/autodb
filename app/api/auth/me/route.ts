import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { isAdmin } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null, isAdmin: false });
  }

  const userIsAdmin = isAdmin(user);

  return NextResponse.json({
    authenticated: true,
    isAdmin: userIsAdmin,
    user: {
      id: user.id,
      handle: user.handle,
      secret_key: user.secret_key,
      role: userIsAdmin ? 'admin' : 'contributor',
      created_at: user.created_at,
    },
  });
}
