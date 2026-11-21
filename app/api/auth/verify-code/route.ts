import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { verifyEmailByCode } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Verification code is required' }, { status: 400 });
    }

    const updatedUser = verifyEmailByCode(user.id, code);
    if (!updatedUser) {
      return NextResponse.json({ error: 'Invalid or expired 6-digit verification code.' }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      message: 'Email successfully verified!',
      user: updatedUser,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Verification failure' }, { status: 500 });
  }
}
