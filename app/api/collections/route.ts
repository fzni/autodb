import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { createCollection, getUserCollections, getPublicCollectionsByUserId } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');
    const currentUser = await getCurrentUser(req);

    if (userId) {
      if (currentUser && currentUser.id === userId) {
        const collections = getUserCollections(userId);
        return NextResponse.json({ collections });
      } else {
        const collections = getPublicCollectionsByUserId(userId);
        return NextResponse.json({ collections });
      }
    }

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized: Key login required to view personal collections.' }, { status: 401 });
    }

    const collections = getUserCollections(currentUser.id);
    return NextResponse.json({ collections });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch collections' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized: Cryptographic key required to create collections.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, description = '', is_public = true } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Collection name is required.' }, { status: 400 });
    }

    const collection = createCollection(
      currentUser.id,
      name.trim(),
      typeof description === 'string' ? description.trim() : '',
      is_public ? 1 : 0
    );

    return NextResponse.json({ ok: true, collection });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create collection' }, { status: 500 });
  }
}
