import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { getCollectionWithVehicles, deleteCollection } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const collectionId = params.id;
    const collection = getCollectionWithVehicles(collectionId);
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    const currentUser = await getCurrentUser(req);
    if (!collection.is_public && (!currentUser || currentUser.id !== collection.user_id)) {
      return NextResponse.json({ error: 'Collection is private' }, { status: 403 });
    }

    return NextResponse.json({ collection });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch collection' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized: Key login required.' }, { status: 401 });
    }

    const collectionId = params.id;
    const success = deleteCollection(collectionId, currentUser.id);
    if (!success) {
      return NextResponse.json(
        { error: 'Collection not found or you are not authorized to delete it.' },
        { status: 403 }
      );
    }

    return NextResponse.json({ ok: true, message: 'Collection deleted successfully.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete collection' }, { status: 500 });
  }
}
