import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { getSpecRevisions, getPendingRevisionsCount, isAdmin } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    const { searchParams } = new URL(req.url);
    const countOnly = searchParams.get('countOnly') === 'true';

    const pendingCount = getPendingRevisionsCount();

    if (countOnly) {
      return NextResponse.json({ pendingCount });
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Key login required' }, { status: 401 });
    }

    const status = searchParams.get('status') || undefined;
    const vehicleSlug = searchParams.get('slug') || undefined;

    // Admin can see all proposals; regular users see proposals for their vehicles or made by them
    const isSystemAdmin = isAdmin(user);

    let revisions = getSpecRevisions({ status, vehicleSlug });

    if (!isSystemAdmin) {
      revisions = revisions.filter(
        (r) =>
          r.proposer_handle.toLowerCase() === user.handle.toLowerCase() ||
          r.vehicle?.contributor_handle?.toLowerCase() === user.handle.toLowerCase()
      );
    }

    return NextResponse.json({
      revisions,
      pendingCount,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch revisions' }, { status: 500 });
  }
}
