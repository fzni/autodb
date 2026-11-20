import { NextRequest, NextResponse } from 'next/server';
import { getUserByHandle, createChallenge } from '@/lib/db';

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

    const user = getUserByHandle(handle);
    if (!user) {
      return NextResponse.json(
        { error: `User with handle ${handle} not found. Please sign up first.` },
        { status: 404 }
      );
    }

    const nonce = createChallenge(handle);

    return NextResponse.json({
      nonce,
      handle: user.handle,
      key_fingerprint: user.key_fingerprint,
    });
  } catch (err: any) {
    console.error('Challenge error:', err);
    return NextResponse.json(
      { error: err.message || 'Error generating challenge' },
      { status: 500 }
    );
  }
}
