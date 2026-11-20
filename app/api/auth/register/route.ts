import { NextRequest, NextResponse } from 'next/server';
import { registerUser, createSession, isAdmin } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { handle } = body;

    if (!handle || typeof handle !== 'string') {
      return NextResponse.json({ error: 'Handle is required' }, { status: 400 });
    }

    handle = handle.trim();
    if (!handle.startsWith('@')) {
      handle = `@${handle}`;
    }

    if (handle.length < 3 || handle.length > 30) {
      return NextResponse.json(
        { error: 'Handle must be between 2 and 30 characters' },
        { status: 400 }
      );
    }

    if (handle.toLowerCase() === '@admin') {
      return NextResponse.json(
        { error: 'The @admin handle is reserved. Please choose another username.' },
        { status: 400 }
      );
    }

    const { user, secretKey } = registerUser(handle);
    const sessionToken = createSession(user.id);

    const res = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        handle: user.handle,
        role: user.role,
        secret_key: secretKey,
      },
      secretKey,
      isAdmin: false,
    });

    res.cookies.set('autodb_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to register account' }, { status: 400 });
  }
}
