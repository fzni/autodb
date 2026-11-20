import { NextRequest, NextResponse } from 'next/server';
import { getVehicleBySlug, updateVehicle, deleteVehicle, isAdmin } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

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
    return NextResponse.json({ vehicle });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch vehicle' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const user = getCurrentUser(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Key login required.' },
        { status: 401 }
      );
    }

    if (!isAdmin(user)) {
      return NextResponse.json(
        { error: 'Forbidden: Only verified administrators can edit vehicle specifications.' },
        { status: 403 }
      );
    }

    const slug = params.slug;
    const existing = getVehicleBySlug(slug);
    if (!existing) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    const body = await req.json();
    const updated = updateVehicle(slug, body);

    return NextResponse.json({ ok: true, vehicle: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to update vehicle' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const user = getCurrentUser(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Key login required.' },
        { status: 401 }
      );
    }

    if (!isAdmin(user)) {
      return NextResponse.json(
        { error: 'Forbidden: Only verified administrators can delete vehicles.' },
        { status: 403 }
      );
    }

    const slug = params.slug;
    const existing = getVehicleBySlug(slug);
    if (!existing) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    deleteVehicle(slug);
    return NextResponse.json({ ok: true, message: 'Vehicle deleted' });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to delete vehicle' },
      { status: 500 }
    );
  }
}
