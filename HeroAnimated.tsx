'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'motion/react';

const IMG =
  'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80';

const words = ['Fresh', 'milk,', 'every', 'single', 'day.'];
const ticker = [
  'Fresh Daily', 'Hatsun', 'Arogya Milk', 'Curd',
  'Paneer', 'Ghee', 'Trusted Quality',
];
const features = [
  { emoji: '🥛', title: 'Fresh Every Day', text: 'Fresh stock arrives at the shop daily.' },
  { emoji: '🏪', title: 'Visit Our Shop', text: 'Pick up your milk and dairy at the counter.' },
  { emoji: '✅', title: 'Trusted Brands', text: 'Hatsun and Arogya, always genuine.' },
];

export default function HeroAnimated() {
  const { scrollY } = useScroll();
  const yBack = useTransform(scrollY, [0, 500], [0, 120]);
  const yFront = useTransform(scrollY, [0, 500], [0, -90]);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-white">
        {/* Drifting gradient blobs */}
        <motion.div
          className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-emerald-300/40 blur-3xl"
          animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-20 -right-24 w-96 h-96 rounded-full bg-blue-300/40 blur-3xl"
          animate={{ x: [0, -50, 0], y: [0, 60, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-amber-200/50 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-28 grid lg:grid-cols-2 gap-10 items-center">
          {/* Text side */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block text-[11px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full"
            >
              Authorized Dairy Outlet
            </motion.span>

            <h1 className="mt-4 text-4xl sm:text-6xl font-black text-gray-950 leading-tight">
              {words.map((w, i) => (
                <motion.span
                  key={i}
                  className="inline-block mr-3"
                  initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ delay: 0.2 + i * 0.12, duration: 0.6 }}
                >
                  {w}
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-4 text-gray-600 text-base sm:text-lg max-w-md"
            >
              Check today&rsquo;s fresh Hatsun and Arogya products and prices,
              then visit our shop to pick them up.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="mt-7 flex flex-wrap gap-3"
            >
              <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
                <Link
                  href="/products"
                  className="inline-block px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold shadow-lg shadow-emerald-600/30"
                >
                  See Today&rsquo;s Products
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
                <Link
                  href="/cart"
                  className="inline-block px-7 py-3.5 rounded-2xl bg-white border border-gray-200 text-gray-900 font-extrabold"
                >
                  View Cart
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Floating images side */}
          <div className="relative h-72 sm:h-[26rem]">
            <motion.div style={{ y: yBack }} className="absolute right-0 top-0">
              <motion.img
                src={IMG}
                alt="Fresh milk"
                className="w-48 sm:w-64 h-60 sm:h-80 object-cover rounded-[2rem] shadow-2xl"
                initial={{ opacity: 0, scale: 0.7, rotate: 8 }}
                animate={{ opacity: 1, scale: 1, rotate: [6, 2, 6], y: [0, -16, 0] }}
                transition={{
                  opacity: { duration: 0.8 },
                  scale: { duration: 0.8 },
                  rotate: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
                  y: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
                }}
              />
            </motion.div>

            <motion.div style={{ y: yFront }} className="absolute left-0 bottom-0">
              <motion.img
                src={IMG}
                alt="Dairy products"
                className="w-36 sm:w-48 h-44 sm:h-60 object-cover rounded-[2rem] shadow-2xl border-4 border-white"
                initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: [-6, -2, -6], y: [0, 18, 0] }}
                transition={{
                  opacity: { duration: 0.8, delay: 0.3 },
                  scale: { duration: 0.8, delay: 0.3 },
                  rotate: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
                  y: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
                }}
              />
            </motion.div>

            {/* Floating badge */}
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl px-4 py-3 text-center"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <p className="text-2xl">⭐</p>
              <p className="text-xs font-black text-gray-900">Fresh Daily</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SCROLLING TICKER */}
      <div className="overflow-hidden bg-gray-950 py-3">
        <motion.div
          className="flex gap-10 whitespace-nowrap w-max"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        >
          {[...ticker, ...ticker, ...ticker, ...ticker].map((t, i) => (
            <span key={i} className="text-emerald-400 font-black text-sm uppercase tracking-widest">
              {t} <span className="text-white/30 ml-10">✦</span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 grid sm:grid-cols-3 gap-5">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: i * 0.15, duration: 0.6 }}
            whileHover={{ y: -8 }}
            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-shadow"
          >
            <div className="text-4xl">{f.emoji}</div>
            <h3 className="mt-3 font-black text-gray-950">{f.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{f.text}</p>
          </motion.div>
        ))}
      </section>
    </div>
  );
}