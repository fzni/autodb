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
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is AutoDB?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'AutoDB is an open automotive specification and telemetry database cataloguing production road cars, motorsport machines, commercial haulers, and concept vehicles with verifiable technical numbers, mechanical drivetrain loss models, and aerodynamic lift-to-drag data.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is AutoDB free, or will it cost money?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'AutoDB has zero monetization options turned on for now. During this beta phase, everything is completely open for browsing, comparing, and contributing without paywalls, subscriptions, or ads.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does the AutoDB Power Simulator calculate Wheel Horsepower?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The simulator estimates mechanical transmission and drivetrain losses: Front-Wheel Drive (FWD) ~12% loss, Rear-Wheel Drive (RWD) ~15% loss, and All-Wheel Drive (AWD / 6x4) ~20% loss, plus adjustable driver and fuel ballast.',
        },
      },
      {
        '@type': 'Question',
        name: 'How are vehicle specifications verified on AutoDB?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Specifications require official verifiable sources, such as manufacturer press packs, FIA technical homologation certificates, or verified dynamometer run sheets. Community revisions are verified by administrators before being stamped into the database.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <AboutClient />
    </>
  );
}
