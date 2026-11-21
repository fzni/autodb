import React from 'react';
import { notFound } from 'next/navigation';
import { getVehicleBySlug, getVehicleComments, getRelatedRivals, getSpecRevisions } from '@/lib/db';
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

  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model} Telemetry & Specs — AutoDB`;
  const description = `${vehicle.make} ${vehicle.model} (${vehicle.generation}): ${vehicle.powertrain.hp} HP, ${vehicle.chassis.curb_weight_kg} kg, ${vehicle.powertrain.drivetrain}. ${vehicle.summary}`;
  const url = `https://autodb.tech/vehicles/${vehicle.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'AutoDB Precision Telemetry',
      images: [
        {
          url: vehicle.hero_image,
          width: 1200,
          height: 630,
          alt: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [vehicle.hero_image],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function VehicleDossierPage({ params }: PageProps) {
  const currentUser = await getCurrentUser();
  const vehicle = getVehicleBySlug(params.slug, currentUser?.id);

  if (!vehicle) {
    notFound();
  }

  const initialComments = getVehicleComments(params.slug);
  const relatedRivals = getRelatedRivals(vehicle, 4);
  const approvedRevisions = getSpecRevisions({ vehicleSlug: params.slug, status: 'approved' });

  // Schema.org Vehicle and BreadcrumbList Structured Data
  const jsonLdVehicle = {
    '@context': 'https://schema.org',
    '@type': 'Vehicle',
    name: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
    manufacturer: {
      '@type': 'Organization',
      name: vehicle.make,
    },
    model: vehicle.model,
    vehicleModelDate: String(vehicle.year),
    description: vehicle.summary,
    image: vehicle.hero_image,
    url: `https://autodb.tech/vehicles/${vehicle.slug}`,
    driveWheelConfiguration: vehicle.powertrain.drivetrain,
    fuelType: vehicle.powertrain.fuel_type,
    vehicleEngine: {
      '@type': 'EngineSpecification',
      name: vehicle.powertrain.engine_type,
      enginePower: {
        '@type': 'QuantitativeValue',
        value: vehicle.powertrain.hp,
        unitText: 'HP',
      },
    },
    weight: {
      '@type': 'QuantitativeValue',
      value: vehicle.chassis.curb_weight_kg,
      unitText: 'kg',
    },
  };

  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'AutoDB',
        item: 'https://autodb.tech',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: vehicle.make,
        item: `https://autodb.tech/brands`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        item: `https://autodb.tech/vehicles/${vehicle.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdVehicle) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      <VehicleDossierClient
        vehicle={vehicle}
        initialComments={initialComments}
        relatedRivals={relatedRivals}
        approvedRevisions={approvedRevisions}
      />
    </>
  );
}
