import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FlyingCartAnimation from '@/components/FlyingCartAnimation';
import PwaRegister from '@/components/PwaRegister';

export const viewport: Viewport = {
  themeColor: '#059669',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'HAP – Ayyappa Enterprises | Hatsun & Arogya Fresh Dairy',
  description:
    'Fresh Arogya milk, Hatsun curd, ghee, and paneer delivered daily. Ayyappa Enterprises – Authorized Hapdaily dairy outlet.',
  keywords: [
    'HAP',
    'Ayyappa Enterprises',
    'Hapdaily',
    'Arogya Milk',
    'Hatsun Curd',
    'Hatsun Ghee',
    'Fresh Dairy Delivery',
    'Milk shop',
  ],
  applicationName: 'HAP',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HAP',
    startupImage: ['/icons/icon-512x512.png'],
  },
  formatDetection: {
    telephone: true,
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="HAP" />
      </head>
      <body className="min-h-full bg-slate-50/50 text-slate-900 antialiased selection:bg-emerald-100 selection:text-emerald-900">
        <CartProvider>
          <Navbar />
          <FlyingCartAnimation />
          <main className="pt-16 sm:pt-20 min-h-screen">{children}</main>
          <Footer />
          <PwaRegister />
        </CartProvider>
      </body>
    </html>
  );
}
