import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import PollingProvider from '@/components/PollingProvider';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Lichess Takip Paneli',
  description: 'Lichess oyuncularını anlık takip et, oyun başladığında bildirim al.',
  manifest: '/manifest.json',
  icons: {
    icon: '/chess-icon.png',
    apple: '/chess-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0d0d0d',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppProvider>
          <PollingProvider>
            <ServiceWorkerRegister />
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
          </PollingProvider>
        </AppProvider>
      </body>
    </html>
  );
}
