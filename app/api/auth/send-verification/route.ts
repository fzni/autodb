import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { setUserEmailAndToken } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const email = body.email ? body.email.trim().toLowerCase() : user.email;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const token = 'emv_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    setUserEmailAndToken(user.id, email, token, expires);

    const emailRes = await sendVerificationEmail({
      toEmail: email,
      handle: user.handle,
      code,
      token,
    });

    return NextResponse.json({
      ok: true,
      message: emailRes.devMode
        ? 'Verification code logged to server console (SMTP not configured).'
        : `Verification email sent to ${email}.`,
      devMode: emailRes.devMode,
      code: emailRes.devMode ? code : undefined,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to send verification' }, { status: 500 });
  }
}
