'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Milk, Menu, X, Shield, LogOut, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRef, useState, useEffect } from 'react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { totalItems, cartIconRef } = useCart();
  const localRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(standalone);
    }
  }, []);

  // Fast cookie-based check — no network call on every route change
  const checkAuthStatus = () => {
    setIsLoggedIn(document.cookie.includes('sb-owner-email='));
  };

  useEffect(() => {
    checkAuthStatus();
  }, [pathname]);

  const handleNavbarLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    document.cookie = 'sb-owner-token=; path=/; max-age=0';
    document.cookie = 'sb-owner-email=; path=/; max-age=0';
    setIsLoggedIn(false);
    setMenuOpen(false);
    router.push('/login');
    router.refresh();
  };

  useEffect(() => {
    if (localRef.current) {
      // @ts-ignore
      cartIconRef.current = localRef.current;
    }
  }, [cartIconRef]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'All Products' },
    { href: '/products?brand=Hatsun', label: 'Hatsun' },
    { href: '/products?brand=Arogya', label: 'Arogya Milk' },
    { href: '/cart', label: 'Cart' },
  ];

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-emerald-100/60'
          : 'bg-white/90 backdrop-blur-sm border-b border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Left: Shop Branding */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-600 via-emerald-600 to-green-500 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
              <Milk className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black tracking-widest text-blue-600 uppercase">
                  Authorized Outlet
                </span>
                <span className="w-1 h-1 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-600">Fresh Daily</span>
              </div>
              <p className="text-base sm:text-lg font-black tracking-tight text-gray-900 leading-tight">
                Ayyappa Enterprises
              </p>
            </div>
          </Link>

          {/* Center: Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-gray-700 hover:text-emerald-600 transition-colors relative group py-1"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-blue-500 group-hover:w-full transition-all duration-200" />
              </Link>
            ))}
          </nav>

          {/* Right Side: Hapdaily Badge & Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Hapdaily Official Brand Badge (Top-Right as required) */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 via-emerald-50 to-teal-50 border border-blue-200/80 rounded-2xl px-3 py-1.5 shadow-sm">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-teal-500 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-xs">
                H
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold tracking-wider uppercase text-blue-600 leading-none">
                  Outlet
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-gray-900 tracking-tight leading-tight">
                  Hapdaily
                </span>
              </div>
            </div>

            {/* Shopping Cart Button */}
            <Link href="/cart" className="relative">
              <motion.button
                ref={localRef}
                className="relative w-11 h-11 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/60 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-sm"
                whileTap={{ scale: 0.92 }}
                aria-label="View Shopping Cart"
              >
                <ShoppingCart className="w-5 h-5 text-emerald-700" />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      key={totalItems}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[11px] font-black rounded-full flex items-center justify-center shadow-md ring-2 ring-white"
                    >
                      {totalItems > 99 ? '99+' : totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </Link>

            {/* When Logged In: Show Admin Dashboard & Logout (Hidden from regular customers) */}
            {isLoggedIn && (
              <div className="hidden sm:flex items-center gap-1.5">
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition border border-blue-200/70"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Dashboard</span>
                </Link>
                <button
                  onClick={handleNavbarLogout}
                  className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs transition border border-red-200/70"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 transition"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden bg-white border-t border-gray-100 shadow-xl"
          >
            <div className="px-5 py-4 space-y-1.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 transition"
                >
                  {link.label}
                </Link>
              ))}

              {/* Install HAP PWA Button (Visible on mobile web browsers) */}
              {!isStandalone && (
                <button
                  onClick={async () => {
                    setMenuOpen(false);
                    const promptEvent = (window as any).__hapInstallPrompt;
                    if (promptEvent) {
                      await promptEvent.prompt();
                    }
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100 transition text-left"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Install HAP App</span>
                </button>
              )}

              {/* Mobile: Admin Dashboard & Logout only when logged in */}
              {isLoggedIn && (
                <div className="pt-2 border-t border-gray-100 space-y-1.5">
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-bold bg-blue-50 text-blue-700"
                  >
                    <Shield className="w-4 h-4" /> Admin Dashboard
                  </Link>
                  <button
                    onClick={handleNavbarLogout}
                    className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold bg-red-50 text-red-600 text-left"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}