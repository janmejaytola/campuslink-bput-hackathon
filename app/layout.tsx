import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';

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

const antiFlashScript = `
(function() {
  try {
    var t = localStorage.getItem('campuslink_theme');
    var m = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = t === 'dark' || (!t && m) || (t === 'system' && m) || !t;
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.style.colorScheme = 'light';
    }
    if (localStorage.getItem('campuslink_reduced_motion') === 'true') {
      document.documentElement.classList.add('reduced-motion');
    }
    if (localStorage.getItem('campuslink_density') === 'compact') {
      document.documentElement.classList.add('density-compact');
    }
    if (localStorage.getItem('campuslink_high_contrast') === 'true') {
      document.documentElement.classList.add('high-contrast');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: antiFlashScript }} />
      </head>
      <body className="min-h-screen bg-[#020817] text-[#F4FAFF] antialiased selection:bg-[#16CFFF]/25 selection:text-white transition-colors duration-150" suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
