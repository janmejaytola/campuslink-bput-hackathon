import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'CAMPUSLINK | AI-Powered Campus Placement Intelligence Platform',
  description:
    'AI-powered campus placement intelligence and coordination platform for students, placement officers, and recruiters. BPUT Hackathon 2026 PS10.',
  openGraph: {
    title: 'CAMPUSLINK | BPUT Campus Placement Platform',
    description:
      'Coordinating campus placement drives, AI resume intelligence, conflict-aware scheduling, and candidate matching.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CAMPUSLINK | BPUT Campus Placement Platform',
    description:
      'Coordinating campus placement drives, AI resume intelligence, conflict-aware scheduling, and candidate matching.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F8FAFC] antialiased text-slate-800" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
