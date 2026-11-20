import { NextRequest, NextResponse } from 'next/server';
import { getUserBySecretKey, createSession, isAdmin } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { secretKey } = body;

    if (!secretKey || typeof secretKey !== 'string') {
      return NextResponse.json({ error: 'Secret Key is required.' }, { status: 400 });
    }

    const user = getUserBySecretKey(secretKey.trim());
    if (!user) {
      return NextResponse.json({ error: 'Invalid Secret Key ID. Please check your key or create a new handle.' }, { status: 401 });
    }

    const sessionToken = createSession(user.id);
    const userIsAdmin = isAdmin(user);

    const res = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        handle: user.handle,
        role: user.role,
        secret_key: user.secret_key,
      },
      isAdmin: userIsAdmin,
    });

    res.cookies.set('autodb_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return res;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Server error processing Secret Key.' }, { status: 500 });
  }
}
