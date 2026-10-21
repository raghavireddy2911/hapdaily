
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Truck,
  ShieldCheck,
  Clock,
  Sparkles,
  ChevronRight,
  Star,
  Check,
  Milk,
  PhoneCall,
  MapPin,
  HeartHandshake,
} from 'lucide-react';
import Dairy3D from './admin/login/Dairy3D';
import HeroAnimated from '@/HeroAnimated';
import HeroSection from '@/components/HeroSection';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';
import { mockProducts } from '@/lib/mockData';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'hatsun' | 'arogya'>('all');

  useEffect(() => {
    // Fetch products from API (which checks Supabase first, then mock)
    fetch('/api/products')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.products) {
          setProducts(res.products);
        }
      })
      .catch(() => {});
  }, []);

  const displayedProducts = products.filter((p) => {
    if (activeTab === 'hatsun') return p.brand === 'Hatsun';
    if (activeTab === 'arogya') return p.brand === 'Arogya';
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* ── Word-by-Word Hero ── */}
      <HeroAnimated />
      <Dairy3D />
      {/* ── Featured Brands Showcase Banner ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Arogya Card */}
          <motion.div
            whileHover={{ y: -4 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 p-6 sm:p-7 text-white shadow-xl shadow-blue-900/10"
          >
            <div className="relative z-10 max-w-sm">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black uppercase tracking-wider mb-2.5">
                Flagship Milk Partner
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
                Arogya Fresh Milk
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed mb-5">
                Standardized Green Magic & Full Cream Orange packs with optimal fat and protein. Delivered chilled every morning.
              </p>
              <Link
                href="/products?brand=Arogya"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-blue-800 text-xs sm:text-sm font-extrabold hover:bg-blue-50 transition shadow-md"
              >
                <span>Browse Arogya Milk</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />
          </motion.div>

          {/* Hatsun Card */}
          <motion.div
            whileHover={{ y: -4 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-700 via-red-600 to-amber-600 p-6 sm:p-7 text-white shadow-xl shadow-rose-900/10"
          >
            <div className="relative z-10 max-w-sm">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black uppercase tracking-wider mb-2.5">
                Dairy Specials
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
                Hatsun Curd & Ghee
              </h2>
              <p className="text-xs sm:text-sm text-rose-100 leading-relaxed mb-5">
                Aromatic cow ghee, thick homestyle curd pouches, succulent fresh paneer, and rich cooking butter.
              </p>
              <Link
                href="/products?brand=Hatsun"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-rose-800 text-xs sm:text-sm font-extrabold hover:bg-rose-50 transition shadow-md"
              >
                <span>Browse Hatsun Specials</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />
          </motion.div>
        </div>
      </section>

      {/* ── Feature Highlights ── */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                icon: Truck,
                title: 'Morning Doorstep Delivery',
                desc: 'Orders placed by 10:00 PM are delivered fresh at your doorstep by 7:30 AM.',
                gradient: 'from-blue-500 to-cyan-500',
              },
              {
                icon: ShieldCheck,
                title: 'Authorized Hapdaily Outlet',
                desc: 'Direct distributor of Hatsun Agro Product Ltd. 100% genuine and cold-chain maintained.',
                gradient: 'from-emerald-500 to-teal-500',
              },
              {
                icon: HeartHandshake,
                title: 'Honest Neighborhood Service',
                desc: 'Run with pride by Ayyappa Enterprises. Dedicated personal customer support.',
                gradient: 'from-amber-500 to-orange-500',
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition flex items-start gap-4"
              >
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-white flex-shrink-0 shadow-sm`}
                >
                  <f.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-sm sm:text-base mb-1">
                    {f.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fresh Daily Products Grid ── */}
      <section className="py-10 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header & Brand Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Today's Available Inventory</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-950">
                Fresh From The Dairy Farm
              </h2>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-2xl self-start sm:self-auto">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                  activeTab === 'all'
                    ? 'bg-white text-gray-950 shadow-sm'
                    : 'text-gray-600 hover:text-gray-950'
                }`}
              >
                All Brands ({products.length})
              </button>
              <button
                onClick={() => setActiveTab('arogya')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                  activeTab === 'arogya'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-blue-700'
                }`}
              >
                Arogya Milk
              </button>
              <button
                onClick={() => setActiveTab('hatsun')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                  activeTab === 'hatsun'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-rose-700'
                }`}
              >
                Hatsun Curd & Ghee
              </button>
            </div>
          </div>

          {/* Product Cards with Staggered Entrance */}
          {displayedProducts.length === 0 ? (
            <div className="py-16 text-center bg-gray-50/80 rounded-3xl border border-gray-100 max-w-md mx-auto">
              <div className="text-4xl mb-2">🥛</div>
              <h3 className="text-base font-bold text-gray-900">Fresh dairy stock arriving soon</h3>
              <p className="text-xs text-gray-500 mt-1">Our daily morning delivery updates fresh products daily.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {displayedProducts.slice(0, 8).map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}

          {/* View All Button */}
          <div className="mt-10 text-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gray-900 hover:bg-black text-white text-xs sm:text-sm font-bold transition shadow-md"
            >
              <span>Explore All Products & Packs</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Community Love
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-950 mt-1">
              Loved by Families Every Morning
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                quote:
                  'We have been taking Arogya Green Magic milk from Ayyappa Enterprises for 3 years. Never a single day missed, always chilled and pure.',
                name: 'K. Srinivasan',
                tag: 'Daily Subscriber',
                rating: 5,
              },
              {
                quote:
                  'Hatsun Cow Ghee aroma reminds me of authentic village bilona ghee. And the shop owners are very polite and helpful.',
                name: 'Padmavathi R.',
                tag: 'Home Chef',
                rating: 5,
              },
              {
                quote:
                  'Super convenient online UPI checkout. I order evening milk and curd packs and they arrive before we wake up!',
                name: 'Anand Kumar',
                tag: 'IT Professional',
                rating: 5,
              },
            ].map((t, idx) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-1 text-amber-400 mb-3">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed italic mb-4">
                    "{t.quote}"
                  </p>
                </div>
                <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-gray-900 text-xs sm:text-sm">{t.name}</h4>
                    <span className="text-[11px] text-emerald-600 font-semibold">{t.tag}</span>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">Verified Buyer</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
