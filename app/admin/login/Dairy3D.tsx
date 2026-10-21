"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function Dairy3D() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-green-50 via-white to-blue-100 px-6 py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
        
        <div className="relative z-10">
          <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-800">
            Freshness Delivered Daily
          </span>

          <h2 className="mt-6 text-4xl font-extrabold text-slate-900 md:text-6xl">
            A little
            <span className="block text-green-600">
              goodness
            </span>
            in every drop.
          </h2>

          <p className="mt-5 max-w-lg text-slate-600 md:text-lg">
            Discover your favourite dairy products at
            Ayyappa Enterprises – Hapdaily.
          </p>

          <a
            href="/products"
            className="mt-8 inline-flex rounded-full bg-green-600 px-7 py-3 font-semibold text-white transition hover:bg-green-700"
          >
            Explore Products
          </a>
        </div>

        <div className="relative flex min-h-80 items-center justify-center">
          <div className="absolute h-64 w-64 rounded-full bg-green-200/60 blur-3xl" />

          <motion.div
            className="absolute left-5 top-10 text-5xl"
            animate={reduceMotion ? {} : { y: [0, -18, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            🥛
          </motion.div>

          <motion.div
            className="absolute right-8 top-12 text-4xl"
            animate={
              reduceMotion
                ? {}
                : { y: [0, 14, 0], rotate: [0, 12, 0] }
            }
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            🧈
          </motion.div>

          <motion.div
            className="relative z-10 flex h-64 w-44 flex-col items-center justify-center rounded-[2.5rem] border border-white bg-white/80 shadow-2xl backdrop-blur-md"
            animate={
              reduceMotion
                ? {}
                : { y: [0, -12, 0], rotate: [0, 3, 0] }
            }
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="absolute -top-5 h-10 w-16 rounded-t-xl bg-green-600" />

            <div className="flex h-44 w-36 flex-col items-center justify-center rounded-3xl bg-gradient-to-b from-green-50 to-green-100">
              <span className="text-5xl">🥛</span>

              <span className="mt-3 text-lg font-black tracking-wide text-green-800">
                HAPDAILY
              </span>

              <span className="mt-1 text-center text-[10px] text-slate-500">
                FRESHNESS IN EVERY DROP
              </span>
            </div>
          </motion.div>

          <motion.div
            className="absolute bottom-8 left-10 text-4xl"
            animate={reduceMotion ? {} : { y: [0, -12, 0] }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            🧀
          </motion.div>

          <motion.div
            className="absolute bottom-8 right-8 text-4xl"
            animate={reduceMotion ? {} : { y: [0, -15, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            🥣
          </motion.div>
        </div>
      </div>
    </section>
  );
}