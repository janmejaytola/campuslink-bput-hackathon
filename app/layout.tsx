import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';

export const metadata: Metadata = {
  title: 'CAMPUSLINK | Campus Placement Intelligence Platform',
  description:
    'AI-powered campus placement intelligence and coordination platform for students, placement officers, and recruiters.',
  openGraph: {
    title: 'CAMPUSLINK | Campus Placement Intelligence Platform',
    description:
      'Coordinating campus placement drives, resume intelligence, conflict-aware scheduling, and candidate matching.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CAMPUSLINK | Campus Placement Intelligence Platform',
    description:
      'Coordinating campus placement drives, resume intelligence, conflict-aware scheduling, and candidate matching.',
  },
};

const antiFlashScript = `
(function() {
  try {
    var t = localStorage.getItem('campuslink_theme');
    var m = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = t === 'dark' || (t === 'system' && m);
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
    <html lang="en" className="light" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: antiFlashScript }} />
      </head>
      <body className="min-h-screen bg-[#F8FAFC] dark:bg-[#020817] text-slate-900 dark:text-[#F4FAFF] antialiased selection:bg-[#00C9C0]/25 selection:text-white transition-colors duration-150" suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
