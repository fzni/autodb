import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeContext';
import { AuthProvider } from '@/components/AuthContext';
import { CompareProvider } from '@/components/CompareContext';
import Navbar from '@/components/Navbar';
import KeyAuthModal from '@/components/KeyAuthModal';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'AutoDB — Universal Vehicle Specification & Telemetry Engine',
  description:
    'Universal vehicle telemetry repository covering Road cars, Heavy Commercial haulers, and Motorsport machines. Vote on vehicles, join discussions, and inspect precision telemetry.',
  keywords: [
    'vehicle specifications',
    'car telemetry',
    'f1 prototypes',
    'commercial trucks',
    'powertrain specs',
    'power to weight ratio',
    'autodb',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0E17] text-slate-900 dark:text-slate-100 antialiased selection:bg-[#31bacc] selection:text-black flex flex-col font-sans transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>
            <CompareProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              <KeyAuthModal />
            </CompareProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
