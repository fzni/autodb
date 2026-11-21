import React from 'react';
import type { Metadata } from 'next';
import AboutClient from '@/components/AboutClient';

export const metadata: Metadata = {
  title: 'User Guide & About AutoDB — Open Vehicle Specification Engine',
  description:
    'Complete user guide, architecture documentation, and telemetry explanation for AutoDB. Learn how to search specs, run power simulations, compare machines, and propose spec revisions.',
  alternates: {
    canonical: 'https://autodb.tech/about',
  },
  openGraph: {
    title: 'User Guide & About AutoDB — Open Vehicle Specification Engine',
    description:
      'Complete user guide, architecture documentation, and telemetry explanation for AutoDB. Learn how to search specs, run power simulations, compare machines, and propose spec revisions.',
    url: 'https://autodb.tech/about',
    siteName: 'AutoDB',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'User Guide & About AutoDB — Open Vehicle Specification Engine',
    description:
      'Complete user guide, architecture documentation, and telemetry explanation for AutoDB. Learn how to search specs, run power simulations, compare machines, and propose spec revisions.',
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
