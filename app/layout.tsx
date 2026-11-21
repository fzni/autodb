import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeContext';
import { AuthProvider } from '@/components/AuthContext';
import { CompareProvider } from '@/components/CompareContext';
import { UnitProvider } from '@/components/UnitContext';
import Navbar from '@/components/Navbar';
import KeyAuthModal from '@/components/KeyAuthModal';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  metadataBase: new URL('https://autodb.tech'),
  title: {
    default: 'AutoDB — Vehicle Specs & Database',
    template: '%s | AutoDB',
  },
  description:
    'The open vehicle database. Browse specs for road cars, motorsport machines, and commercial vehicles. Compare, explore, and contribute.',
  keywords: [
    'vehicle specifications',
    'car database',
    'motorsport specs',
    'commercial trucks',
    'powertrain specs',
    'power to weight ratio',
    'aerodynamics',
    'autodb',
  ],
  openGraph: {
    title: 'AutoDB — Vehicle Specs & Database',
    description: 'The open vehicle database. Browse, compare, and contribute specs.',
    url: 'https://autodb.tech',
    siteName: 'AutoDB',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AutoDB — Vehicle Specs & Database',
    description: 'The open vehicle database. Browse, compare, and contribute specs.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLdWebSite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AutoDB',
    url: 'https://autodb.tech',
    description:
      'The open vehicle database. Browse specs for road cars, motorsport machines, and commercial vehicles.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://autodb.tech/?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] text-slate-900 dark:text-slate-100 antialiased selection:bg-[#E11D48] selection:text-black flex flex-col transition-colors duration-200`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
        <ThemeProvider>
          <AuthProvider>
            <UnitProvider>
              <CompareProvider>
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
                <KeyAuthModal />
              </CompareProvider>
            </UnitProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
