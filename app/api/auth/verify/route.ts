import { NextRequest, NextResponse } from 'next/server';
import { getUserByHandle, getChallenge, deleteChallenge, createSession, isAdmin } from '@/lib/db';
import { verifyWebCryptoSignature } from '@/lib/crypto-server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { handle, nonce, signature } = body;

    if (!handle || !nonce || !signature) {
      return NextResponse.json(
        { error: 'Missing handle, nonce, or signature' },
        { status: 400 }
      );
    }

    handle = handle.trim();
    if (!handle.startsWith('@')) {
      handle = `@${handle}`;
    }

    const challenge = getChallenge(nonce);
    if (!challenge) {
      return NextResponse.json(
        { error: 'Challenge expired or invalid. Please try again.' },
        { status: 400 }
      );
    }

    if (challenge.user_handle.toLowerCase() !== handle.toLowerCase()) {
      return NextResponse.json(
        { error: 'Challenge does not match specified user handle.' },
        { status: 400 }
      );
    }

    const user = getUserByHandle(handle);
    if (!user || !user.public_key_jwk) {
      return NextResponse.json({ error: 'User or public key not found' }, { status: 404 });
    }

    // Verify cryptographic signature
    const isValid = verifyWebCryptoSignature(user.public_key_jwk, nonce, signature);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Cryptographic signature verification failed. Private key mismatch.' },
        { status: 401 }
      );
    }

    // Challenge consumed
    deleteChallenge(nonce);

    // Create session
    const sessionToken = createSession(user.id);
    const userIsAdmin = isAdmin(user);

    const response = NextResponse.json({
      ok: true,
      isAdmin: userIsAdmin,
      user: {
        id: user.id,
        handle: user.handle,
        key_fingerprint: user.key_fingerprint,
        role: userIsAdmin ? 'admin' : 'contributor',
        created_at: user.created_at,
      },
    });

    response.cookies.set('autodb_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    console.error('Verify error:', err);
    return NextResponse.json(
      { error: err.message || 'Signature verification failure' },
      { status: 500 }
    );
  }
}
