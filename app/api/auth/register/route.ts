import { NextRequest, NextResponse } from 'next/server';
import { registerUser, createSession, setUserEmailAndToken } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { handle, email } = body;

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

    const { user, secretKey } = registerUser(handle, email);
    const sessionToken = createSession(user.id);

    // If an email was provided, issue verification token and dispatch email
    let emailStatus = null;
    if (email && typeof email === 'string' && email.includes('@')) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const token = 'emv_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      const expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

      setUserEmailAndToken(user.id, email, token, expires);
      emailStatus = await sendVerificationEmail({
        toEmail: email,
        handle: user.handle,
        code,
        token,
      });
    }

    const res = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        handle: user.handle,
        role: user.role,
        secret_key: secretKey,
        email: user.email,
        email_verified: 0,
      },
      secretKey,
      isAdmin: false,
      emailVerificationSent: !!emailStatus,
      emailDevMode: emailStatus?.devMode || false,
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
