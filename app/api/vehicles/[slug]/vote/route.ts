import { NextRequest, NextResponse } from 'next/server';
import { getVehicleVotes, hasUserVoted, toggleVote, getVehicleBySlug } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-helpers';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const vehicle = getVehicleBySlug(slug);
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    const user = getCurrentUser(req);
    const count = getVehicleVotes(slug);
    const hasVoted = user ? hasUserVoted(slug, user.id) : false;

    return NextResponse.json({
      count,
      hasVoted,
      authenticated: !!user,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to retrieve votes' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const vehicle = getVehicleBySlug(slug);
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    const user = getCurrentUser(req);
    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Please log in with your Secret Key ID to vote on vehicles.',
          requiresAuth: true,
        },
        { status: 401 }
      );
    }

    const result = toggleVote(slug, user.id);

    return NextResponse.json({
      ok: true,
      voted: result.voted,
      count: result.count,
    });
  } catch (err: any) {
    console.error('Voting error:', err);
    return NextResponse.json({ error: 'Failed to process vote' }, { status: 500 });
  }
}
