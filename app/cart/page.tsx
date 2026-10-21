
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    totalPrice,
    totalItems,
  } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="bg-white p-8 sm:p-12 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50"
        >
          <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-5 text-3xl">
            🛒
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-2">
            Your Cart is Empty
          </h2>

          <p className="text-gray-500 text-xs sm:text-sm mb-6 max-w-sm mx-auto">
            Choose farm-fresh Arogya Milk packs or Hatsun Curd and Ghee
            from Ayyappa Enterprises.
          </p>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold px-6 py-3.5 rounded-2xl transition shadow-lg shadow-emerald-600/20 text-sm"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Browse Fresh Dairy</span>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">
            <span>Ayyappa Enterprises • Hapdaily Checkout</span>
          </div>

          <h1 className="text-3xl font-black text-gray-950">
            Review Your Cart
          </h1>

          <p className="text-xs text-gray-500 mt-0.5">
            {totalItems} unit{totalItems !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200/80 self-start sm:self-auto transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Add More Products</span>
        </Link>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Cart Item Cards */}
        <div className="lg:col-span-7 space-y-3.5">
          <AnimatePresence mode="popLayout">
            {items.map((item, i) => {
              const unitPrice =
                item.orderUnit === 'litres'
                  ? Number(item.product.price_per_litre ?? 0)
                  : Number(item.product.price);

              const itemTotal = unitPrice * item.quantity;

              return (
                <motion.div
                  key={`${item.product.id}-${item.orderUnit}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    scale: 0.95,
                    height: 0,
                    marginBottom: 0,
                  }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  className="bg-white rounded-3xl p-4 sm:p-5 flex items-center gap-4 shadow-sm border border-gray-100 hover:border-emerald-200/70 transition"
                >
                  {/* Product Thumbnail */}
                  <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100">
                    <Image
                      src={item.product.image_url}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="88px"
                    />

                    <span className="absolute bottom-1 left-1 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-black/70 text-white rounded-md">
                      {item.product.brand}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-gray-900 text-sm sm:text-base leading-snug truncate">
                      {item.product.name}
                    </h3>

                    <p className="text-xs text-gray-400 mt-0.5 font-medium">
                      ₹{unitPrice.toLocaleString('en-IN')} per{' '}
                      {item.orderUnit === 'litres' ? 'litre' : 'packet'}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Quantity: {item.quantity} {item.orderUnit}
                    </p>

                    <p className="text-emerald-700 font-black text-sm mt-1 sm:hidden">
                      ₹{itemTotal.toLocaleString('en-IN')}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => {
                        if (item.quantity > 1) {
                          updateQuantity(
                            item.product.id,
                            item.quantity - 1,
                            item.orderUnit
                          );
                        }
                      }}
                      disabled={item.quantity <= 1}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-gray-200 flex items-center justify-center text-gray-700 transition shadow-xs disabled:opacity-40"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>

                    <span className="w-6 text-center text-xs font-black text-gray-900">
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.product.id,
                          item.quantity + 1,
                          item.orderUnit
                        )
                      }
                      className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center text-white transition shadow-xs"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Item Total - Desktop */}
                  <div className="text-right min-w-[70px] hidden sm:block">
                    <p className="text-base font-black text-gray-950">
                      ₹{itemTotal.toLocaleString('en-IN')}
                    </p>
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() =>
                      removeFromCart(item.product.id, item.orderUnit)
                    }
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                    title="Remove item"
                    aria-label={`Remove ${item.product.name} (${item.orderUnit})`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-5">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:sticky lg:top-24 space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="font-black text-gray-950 text-lg">
                Order Breakdown
              </h2>

              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                Free Delivery
              </span>
            </div>

            {/* Line Items */}
            <div className="space-y-2 text-xs text-gray-600 max-h-48 overflow-y-auto pr-1">
              {items.map((item) => {
                const unitPrice =
                  item.orderUnit === 'litres'
                    ? Number(item.product.price_per_litre ?? 0)
                    : Number(item.product.price);

                const itemTotal = unitPrice * item.quantity;

                return (
                  <div
                    key={`${item.product.id}-${item.orderUnit}`}
                    className="flex justify-between items-center py-1"
                  >
                    <span className="truncate pr-2 font-medium">
                      {item.product.name} × {item.quantity}{' '}
                      {item.orderUnit}
                    </span>

                    <span className="font-bold text-gray-900 flex-shrink-0">
                      ₹{itemTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div className="border-t border-gray-100 pt-3 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">
                  ₹{totalPrice.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between text-gray-500">
                <span>Morning Batch Delivery Fee</span>
                <span className="font-bold text-emerald-600">
                  FREE
                </span>
              </div>

              <div className="flex justify-between text-base sm:text-lg font-black text-gray-950 pt-2 border-t border-gray-100">
                <span>Total Amount</span>
                <span className="text-emerald-700">
                  ₹{totalPrice.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Proceed */}
            <Link
              href="/checkout"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all duration-200 text-sm"
            >
              <span>Proceed to UPI Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Official Ayyappa Enterprises Hapdaily Outlet</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
