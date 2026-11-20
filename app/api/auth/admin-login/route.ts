import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSecret, getOrCreateAdminUser, createSession } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { secretKey } = body;

    if (!secretKey || typeof secretKey !== 'string') {
      return NextResponse.json({ error: 'Admin secret key is required.' }, { status: 400 });
    }

    const isValid = verifyAdminSecret(secretKey);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid admin secret key.' }, { status: 401 });
    }

    const adminUser = getOrCreateAdminUser();
    const sessionToken = createSession(adminUser.id);

    const res = NextResponse.json({
      ok: true,
      user: {
        id: adminUser.id,
        handle: adminUser.handle,
        role: 'admin',
        key_fingerprint: adminUser.key_fingerprint,
      },
      isAdmin: true,
    });

    // Set HttpOnly session cookie
    res.cookies.set('autodb_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return res;
  } catch (err: any) {
    console.error('Admin secret login error:', err);
    return NextResponse.json({ error: 'Server error processing admin key.' }, { status: 500 });
  }
}
