import React from 'react';
import StudioClient from '@/components/StudioClient';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Specification Studio — AutoDB',
  description:
    'Contribute and edit vehicle specifications, telemetry metrics, and high-fidelity technical dossiers with cryptographic proof of authorship.',
};

export default function StudioPage() {
  return <StudioClient />;
}
