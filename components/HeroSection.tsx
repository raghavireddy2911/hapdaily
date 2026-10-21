'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

interface HeroSectionProps {
  onShopClick?: () => void;
}

export default function HeroSection({ onShopClick }: HeroSectionProps) {
  // Word-by-word reveal array
  const headingWords = ['Welcome', 'to', 'Ayyappa', 'Enterprises'];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-emerald-50/40 to-white pt-8 pb-16 sm:pt-14 sm:pb-24">
      {/* Decorative ambient gradients */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-blue-300/20 via-emerald-300/25 to-teal-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-12 -left-12 w-64 h-64 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Heading, Badges, CTA */}
          <div className="lg:col-span-7 text-center lg:text-left">
            {/* Pill Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white shadow-sm border border-emerald-200/80 mb-5"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-bold text-gray-800 tracking-wide">
                Hapdaily Outlet • Fresh Morning Delivery
              </span>
            </motion.div>

            {/* Word-by-word Hero Reveal */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-950 tracking-tight leading-[1.1] mb-5">
              {headingWords.map((word, idx) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: 0.08 * idx,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={`inline-block mr-2.5 ${
                    word === 'Ayyappa'
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-emerald-600 to-teal-600'
                      : word === 'Enterprises'
                      ? 'text-gray-900'
                      : ''
                  }`}
                >
                  {word}
                </motion.span>
              ))}
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="block text-2xl sm:text-3xl lg:text-4xl font-extrabold text-emerald-600 mt-2"
              >
                Hatsun & Arogya Dairy Store 🥛
              </motion.span>
            </h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8"
            >
              Order genuine <strong>Arogya Standardized & Full Cream Milk</strong>, rich{' '}
              <strong>Hatsun Curd, Pure Ghee, and Fresh Paneer</strong>. Farm-fresh, hygienically
              chilled, and delivered straight to your home daily.
            </motion.p>

            {/* Brand Pills */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.38 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 mb-8"
            >
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100/70 border border-blue-200 rounded-xl text-xs font-bold text-blue-900">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Arogya Milk Range</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-100/70 border border-rose-200 rounded-xl text-xs font-bold text-rose-900">
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Hatsun Curd & Ghee</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100/70 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Hapdaily Guaranteed Fresh</span>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.45 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5"
            >
              <Link
                href="/products"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-500/25 hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Shop Today's Dairy</span>
              </Link>

              <Link
                href="/products?brand=Arogya"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 font-bold text-sm shadow-sm transition-all duration-200 hover:border-gray-300"
              >
                <span>View Arogya Range</span>
                <ArrowRight className="w-4 h-4 text-emerald-600" />
              </Link>
            </motion.div>
          </div>

          {/* Right Column: Hero Visual Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Backglow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400 to-blue-500 rounded-[2.5rem] rotate-3 opacity-20 filter blur-xl scale-95" />

              {/* Main Photo Card */}
              <div className="relative bg-white p-3 sm:p-4 rounded-[2.2rem] shadow-2xl border border-white/80">
                <div className="relative h-80 sm:h-96 w-full rounded-3xl overflow-hidden bg-gradient-to-tr from-blue-50 via-emerald-50 to-teal-50">
                  <Image
                    src="https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=85"
                    alt="Fresh Arogya and Hatsun Dairy at Ayyappa Enterprises"
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 500px"
                  />

                  {/* Top Badge */}
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/20">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Pure Hatsun & Arogya</span>
                  </div>

                  {/* Bottom Float Card */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-lg border border-white/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
                        HD
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 leading-tight">
                          Hapdaily Authorized Store
                        </p>
                        <p className="text-[11px] text-gray-500">
                          Fresh batches arrive at 5:30 AM
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        100% Pure
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating review card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="absolute -bottom-5 -left-4 sm:-left-6 bg-white rounded-2xl p-3.5 shadow-xl border border-gray-100 flex items-center gap-3 max-w-[240px]"
              >
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                  5★
                </div>
                <div>
                  <p className="text-xs font-extrabold text-gray-900">Neighborhood Favorite</p>
                  <p className="text-[10px] text-gray-500">500+ happy morning customers</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

