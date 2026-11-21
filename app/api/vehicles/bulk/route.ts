import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { isAdmin, getVehicleBySlug, createVehicle } from '@/lib/db';
import { Vehicle } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!isAdmin(user)) {
      return NextResponse.json({ error: 'Admin clearance required for bulk vehicle import.' }, { status: 403 });
    }

    const body = await req.json();
    const rawVehicles = Array.isArray(body) ? body : body.vehicles;

    if (!Array.isArray(rawVehicles) || rawVehicles.length === 0) {
      return NextResponse.json({ error: 'Expected an array of vehicles in request body.' }, { status: 400 });
    }

    let inserted = 0;
    const skipped: string[] = [];
    const errors: string[] = [];

    for (const item of rawVehicles) {
      if (!item.make || !item.model || !item.year || !item.domain) {
        errors.push(`Incomplete vehicle record: missing make/model/year/domain for "${item.make || 'Unknown'} ${item.model || ''}"`);
        continue;
      }

      const makeStr = String(item.make).trim();
      const modelStr = String(item.model).trim();
      const genStr = String(item.generation || 'Standard').trim();

      const computedSlug = item.slug
        ? String(item.slug).trim().toLowerCase()
        : [makeStr, modelStr, genStr]
            .join('-')
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');

      // Check if duplicate slug already exists
      const existing = getVehicleBySlug(computedSlug);
      if (existing) {
        skipped.push(computedSlug);
        continue;
      }

      const now = new Date().toISOString();
      const vehicleId = item.id || `v-${computedSlug}-${Date.now().toString(36)}`;

      const newVehicle: Vehicle = {
        id: vehicleId,
        slug: computedSlug,
        make: makeStr,
        model: modelStr,
        generation: genStr,
        year: Number(item.year) || new Date().getFullYear(),
        domain: item.domain || 'Road',
        sub_category: item.sub_category || 'Performance Machine',
        hero_image: item.hero_image || 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1600&q=80',
        summary: item.summary || `${item.year} ${makeStr} ${modelStr}.`,
        powertrain: item.powertrain || {
          engine_type: 'Standard Powertrain',
          layout: 'Front-Engine',
          aspiration: 'Naturally Aspirated',
          hp: 300,
          kw: 224,
          torque_nm: 400,
          transmission: 'Manual',
          drivetrain: 'RWD',
          fuel_type: 'Petrol',
        },
        chassis: item.chassis || {
          curb_weight_kg: 1500,
          chassis_type: 'Monocoque',
        },
        domain_specific: item.domain_specific || {},
        contributor_handle: item.contributor_handle || user?.handle || '@admin',
        contributor_fingerprint: item.contributor_fingerprint || 'KEY:ADMIN',
        source_url: item.source_url || undefined,
        downforce_kg: item.downforce_kg !== undefined ? Number(item.downforce_kg) : undefined,
        downforce_speed_kmh: item.downforce_speed_kmh !== undefined ? Number(item.downforce_speed_kmh) : undefined,
        drag_coefficient: item.drag_coefficient !== undefined ? Number(item.drag_coefficient) : undefined,
        frontal_area_m2: item.frontal_area_m2 !== undefined ? Number(item.frontal_area_m2) : undefined,
        created_at: item.created_at || now,
        updated_at: item.updated_at || now,
      };

      try {
        createVehicle(newVehicle);
        inserted++;
      } catch (err: any) {
        errors.push(`Error inserting ${computedSlug}: ${err.message}`);
      }
    }

    return NextResponse.json({
      ok: true,
      total: rawVehicles.length,
      inserted,
      skippedCount: skipped.length,
      skippedSlugs: skipped,
      errors,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Bulk import processing failed.' }, { status: 500 });
  }
}
