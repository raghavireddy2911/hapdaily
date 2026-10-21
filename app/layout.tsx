import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FlyingCartAnimation from '@/components/FlyingCartAnimation';

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Ayyappa Enterprises – Hapdaily | Hatsun & Arogya Fresh Dairy',
  description:
    'Fresh Arogya milk, Hatsun curd, ghee, and paneer delivered daily. Ayyappa Enterprises – Authorized Hapdaily dairy outlet.',
  keywords: [
    'Ayyappa Enterprises',
    'Hapdaily',
    'Arogya Milk',
    'Hatsun Curd',
    'Hatsun Ghee',
    'Fresh Dairy Delivery',
    'Milk shop',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-slate-50/50 text-slate-900 antialiased selection:bg-emerald-100 selection:text-emerald-900">
        <CartProvider>
          <Navbar />
          <FlyingCartAnimation />
          <main className="pt-16 sm:pt-20 min-h-screen">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
