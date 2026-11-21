import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { getCollectionWithVehicles, addVehicleToCollection, removeVehicleFromCollection, getVehicleBySlug } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized: Key login required.' }, { status: 401 });
    }

    const collectionId = params.id;
    const collection = getCollectionWithVehicles(collectionId);
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    if (collection.user_id !== currentUser.id) {
      return NextResponse.json({ error: 'Forbidden: You can only add vehicles to your own collections.' }, { status: 403 });
    }

    const body = await req.json();
    const { vehicle_slug } = body;

    if (!vehicle_slug) {
      return NextResponse.json({ error: 'Vehicle slug is required.' }, { status: 400 });
    }

    const vehicle = getVehicleBySlug(vehicle_slug);
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    const added = addVehicleToCollection(collectionId, vehicle_slug);
    return NextResponse.json({ ok: true, added });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to add vehicle to collection' }, { status: 500 });
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
    const collection = getCollectionWithVehicles(collectionId);
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    if (collection.user_id !== currentUser.id) {
      return NextResponse.json({ error: 'Forbidden: You can only edit your own collections.' }, { status: 403 });
    }

    const body = await req.json();
    const { vehicle_slug } = body;

    if (!vehicle_slug) {
      return NextResponse.json({ error: 'Vehicle slug is required.' }, { status: 400 });
    }

    const removed = removeVehicleFromCollection(collectionId, vehicle_slug);
    return NextResponse.json({ ok: true, removed });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to remove vehicle from collection' }, { status: 500 });
  }
}
