import React from 'react';
import { getAllBrands } from '@/lib/db';
import BrandsClient from '@/components/BrandsClient';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Manufacturer & Brand Directory — AutoDB',
  description:
    'Explore automotive manufacturers, racing constructors, and commercial heavy transport engineering marques catalogued in AutoDB precision telemetry.',
  alternates: {
    canonical: 'https://autodb.tech/brands',
  },
  openGraph: {
    title: 'Manufacturer & Brand Directory — AutoDB',
    description:
      'Explore automotive manufacturers, racing constructors, and commercial heavy transport engineering marques catalogued in AutoDB precision telemetry.',
    url: 'https://autodb.tech/brands',
    siteName: 'AutoDB Precision Telemetry',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Manufacturer & Brand Directory — AutoDB',
    description:
      'Explore automotive manufacturers, racing constructors, and commercial heavy transport engineering marques catalogued in AutoDB precision telemetry.',
  },
};

export default async function BrandsPage() {
  const brands = getAllBrands();
  return <BrandsClient brands={brands} />;
}
