'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { CheckCircle2, ShoppingCart, Home, Phone, Calendar, Clock, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order_number') || 'HD-NEW';
  const total = searchParams.get('total') || '0';
  const customerName = searchParams.get('name') || 'Valued Customer';
  const paymentMethod = searchParams.get('method') || 'upi';

  useEffect(() => {
    // Trigger celebratory confetti effect
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#059669', '#2563eb', '#10b981', '#f59e0b'],
      });
    } catch {}
  }, []);

  return (
    <div className="max-w-xl mx-auto px-4 py-12 sm:py-20 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 180 }}
        className="bg-white rounded-[2.5rem] p-7 sm:p-10 shadow-xl border border-emerald-100 space-y-6"
      >
        {/* Animated Checkmark Circle */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            Order Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 mt-3">
            Thank You, {customerName}! 🎉
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
            Your fresh dairy order has been received by <strong>Ayyappa Enterprises – Hapdaily</strong>.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 text-left border border-gray-100 space-y-2.5 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-gray-200">
            <span className="text-gray-500">Order Reference</span>
            <span className="font-mono font-black text-gray-900 text-sm">{orderNumber}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500">Total Order Amount</span>
            <span className="font-black text-emerald-700 text-sm">₹{Number(total).toFixed(0)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500">Payment Status</span>
            <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
              {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Verification In Progress'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500">Expected Delivery</span>
            <span className="font-bold text-blue-700 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Tomorrow, 6:00 AM – 7:30 AM
            </span>
          </div>
        </div>

        {/* Contact Help */}
        <div className="p-3 bg-blue-50/80 rounded-2xl text-[11px] text-blue-900 text-left flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span>
            Have questions about early morning delivery? Call Ayyappa Enterprises at <strong>+91 98400 12345</strong>.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/products"
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Order More Dairy</span>
          </Link>

          <Link
            href="/"
            className="flex-1 py-3 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <p className="text-sm font-bold text-gray-400">Loading order receipt...</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
