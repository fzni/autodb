import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailByToken } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/?error=missing_verification_token', req.url));
  }

  const user = verifyEmailByToken(token);

  if (!user) {
    return NextResponse.redirect(
      new URL('/?error=invalid_or_expired_verification_token', req.url)
    );
  }

  const cleanHandle = user.handle.replace('@', '');
  return NextResponse.redirect(
    new URL(`/u/${cleanHandle}?verified=1`, req.url)
  );
}
