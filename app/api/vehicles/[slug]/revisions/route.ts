import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { getSpecRevisions, createSpecRevision, getVehicleBySlug } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const revisions = getSpecRevisions({ vehicleSlug: slug });
    return NextResponse.json({ revisions });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch revisions' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Cryptographic key authentication required to propose spec edits.' },
        { status: 401 }
      );
    }

    const slug = params.slug;
    const vehicle = getVehicleBySlug(slug);
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    const body = await req.json();
    const { changes, summary } = body;

    if (!changes || typeof changes !== 'object') {
      return NextResponse.json({ error: 'Proposed changes must be a valid JSON object.' }, { status: 400 });
    }

    const changeSummary = summary && typeof summary === 'string' && summary.trim()
      ? summary.trim()
      : 'Community telemetry correction';

    const revision = createSpecRevision(
      slug,
      user.handle,
      user.key_fingerprint || 'KEY:HOLDER',
      JSON.stringify(changes),
      changeSummary
    );

    return NextResponse.json({ ok: true, revision });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to submit proposal' }, { status: 500 });
  }
}
