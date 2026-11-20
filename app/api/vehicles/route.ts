import { NextRequest, NextResponse } from 'next/server';
import { getAllVehicles, createVehicle, getVehicleBySlug, isAdmin } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-helpers';
import { Vehicle } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain') || undefined;
    const drivetrain = searchParams.get('drivetrain') || undefined;
    const query = searchParams.get('query') || undefined;
    const sort = searchParams.get('sort') || undefined;

    const vehicles = getAllVehicles({
      domain,
      drivetrain,
      query,
      sort,
    });

    return NextResponse.json({ vehicles, total: vehicles.length });
  } catch (err: any) {
    console.error('Error fetching vehicles:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch vehicles' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUser(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Cryptographic Key Authentication required.' },
        { status: 401 }
      );
    }

    if (!isAdmin(user)) {
      return NextResponse.json(
        { error: 'Forbidden: Only verified administrators can add vehicles to AutoDB.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      make,
      model,
      generation,
      year,
      domain,
      sub_category,
      hero_image,
      summary,
      powertrain,
      chassis,
      domain_specific,
    } = body;

    if (!make || !model || !year || !domain || !hero_image) {
      return NextResponse.json(
        { error: 'Missing required vehicle fields (make, model, year, domain, hero_image)' },
        { status: 400 }
      );
    }

    // Generate slug
    const baseSlug = `${make}-${model}-${generation || ''}-${year}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = baseSlug;
    let counter = 1;
    while (getVehicleBySlug(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const newVehicle: Vehicle = {
      id: 'v-' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36),
      slug,
      make: make.trim(),
      model: model.trim(),
      generation: (generation || 'Standard').trim(),
      year: Number(year),
      domain,
      sub_category: (sub_category || `${domain} Vehicle`).trim(),
      hero_image: hero_image.trim(),
      summary: (summary || `${year} ${make} ${model} specification dossier.`).trim(),
      powertrain: powertrain || {
        engine_type: 'Standard',
        layout: 'Longitudinal',
        aspiration: 'Naturally Aspirated',
        hp: 0,
        kw: 0,
        torque_nm: 0,
        transmission: 'Standard',
        drivetrain: 'RWD',
        fuel_type: 'Petrol',
      },
      chassis: chassis || {
        curb_weight_kg: 1500,
        chassis_type: 'Monocoque',
      },
      domain_specific: domain_specific || {},
      contributor_handle: user.handle,
      contributor_fingerprint: user.key_fingerprint || 'KEY:ADMIN',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    createVehicle(newVehicle);

    return NextResponse.json({ ok: true, vehicle: newVehicle }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating vehicle:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create vehicle' },
      { status: 500 }
    );
  }
}
