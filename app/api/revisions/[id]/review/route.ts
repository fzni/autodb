import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { getSpecRevisionById, updateSpecRevisionStatus, getVehicleBySlug, isAdmin } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Key login required.' }, { status: 401 });
    }

    const revisionId = params.id;
    const revision = getSpecRevisionById(revisionId);
    if (!revision) {
      return NextResponse.json({ error: 'Revision proposal not found' }, { status: 404 });
    }

    if (revision.status !== 'pending') {
      return NextResponse.json({ error: `Revision is already ${revision.status}.` }, { status: 400 });
    }

    const vehicle = getVehicleBySlug(revision.vehicle_slug);
    if (!vehicle) {
      return NextResponse.json({ error: 'Associated vehicle no longer exists' }, { status: 404 });
    }

    // Verify authority: Admin OR the original vehicle creator
    const isCreator =
      (vehicle.contributor_handle && vehicle.contributor_handle.toLowerCase() === user.handle.toLowerCase()) ||
      (vehicle.contributor_fingerprint && vehicle.contributor_fingerprint === user.key_fingerprint);

    const isSystemAdmin = isAdmin(user);

    if (!isCreator && !isSystemAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Only the vehicle creator or an administrator can review this proposal.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const action = body.action;
    const modifiedChanges = body.modifiedChanges;

    if (action !== 'approved' && action !== 'rejected') {
      return NextResponse.json({ error: 'Invalid review action. Must be "approved" or "rejected".' }, { status: 400 });
    }

    const success = updateSpecRevisionStatus(revisionId, action, user.handle, modifiedChanges);
    const updatedVehicle = action === 'approved' ? getVehicleBySlug(revision.vehicle_slug) : null;

    return NextResponse.json({
      ok: success,
      status: action,
      vehicle: updatedVehicle,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Review failed' }, { status: 500 });
  }
}
