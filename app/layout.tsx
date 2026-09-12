import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Borno Voice — Bangla and English in one voice',
  description:
    'Type a sentence the way Bangladeshis actually write it, Bangla with English mixed in, and hear it read aloud in a natural voice. Built at Shahjalal University of Science & Technology.',
  manifest: '/manifest.webmanifest',
  applicationName: 'Borno Voice',
  appleWebApp: {
    capable: true,
    title: 'Borno Voice',
    statusBarStyle: 'default',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-180.png',
  },
  openGraph: {
    title: 'Borno Voice',
    description: 'Code-mixed Bangla–English text to speech, built at SUST.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#2E1A6B',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function () {});
  });
}`,
          }}
        />
      </body>
    </html>
  );
}
