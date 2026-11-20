import React from 'react';
import { notFound } from 'next/navigation';
import { getVehicleBySlug, getVehicleComments } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-helpers';
import VehicleDossierClient from '@/components/VehicleDossierClient';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const vehicle = getVehicleBySlug(params.slug);
  if (!vehicle) {
    return {
      title: 'Vehicle Not Found — AutoDB',
    };
  }

  return {
    title: `${vehicle.year} ${vehicle.make} ${vehicle.model} Telemetry & Specs — AutoDB`,
    description: `${vehicle.make} ${vehicle.model} (${vehicle.generation}): ${vehicle.powertrain.hp} HP, ${vehicle.chassis.curb_weight_kg} kg, ${vehicle.powertrain.drivetrain}. ${vehicle.summary}`,
  };
}

export default async function VehicleDossierPage({ params }: PageProps) {
  const currentUser = getCurrentUser();
  const vehicle = getVehicleBySlug(params.slug, currentUser?.id);

  if (!vehicle) {
    notFound();
  }

  const initialComments = getVehicleComments(params.slug);

  return <VehicleDossierClient vehicle={vehicle} initialComments={initialComments} />;
}
