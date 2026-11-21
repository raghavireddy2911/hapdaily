
'use client';

import { useRef, useState } from 'react';
import type { RefObject } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import {
  ShoppingCart,
  AlertCircle,
  Plus,
  Minus,
} from 'lucide-react';

import { Product, OrderUnit } from '@/types';
import { useCart } from '@/context/CartContext';
import CustomPopup, { PopupConfig } from '@/components/CustomPopup';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({
  product,
  index = 0,
}: ProductCardProps) {
  const { addToCart } = useCart();

  const imageRef = useRef<HTMLDivElement>(null);

  const [orderUnit, setOrderUnit] = useState<OrderUnit>('packets');
  const [quantity, setQuantity] = useState(1);
  const [popup, setPopup] = useState<PopupConfig | null>(null);

  // Retained for the informational packet-equivalent display only.
  // Change these rules if your actual packaging differs.
  const productName = product.name.toLowerCase();

  const packetsPerLitre = productName.includes('small')
    ? 5
    : productName.includes('big')
      ? 2
      : 1;

  const packetQuantity =
    orderUnit === 'litres'
      ? quantity * packetsPerLitre
      : quantity;

  // Packets use price; litres use the saved litre price.
  const unitPrice =
    orderUnit === 'litres'
      ? Number(product.price_per_litre ?? 0)
      : Number(product.price);

  const totalPrice = quantity * unitPrice;

  const brandBadge =
    product.brand === 'Arogya'
      ? 'bg-blue-600 text-white shadow-blue-500/20'
      : product.brand === 'Hatsun'
        ? 'bg-rose-600 text-white shadow-rose-500/20'
        : 'bg-emerald-600 text-white shadow-emerald-500/20';

  const updateQuantity = (value: number) => {
    if (Number.isFinite(value)) {
      setQuantity(Math.max(1, Math.floor(value)));
    }
  };

  const handleAddToCart = () => {
    if (!product.available) return;

    if (
      orderUnit === 'litres' &&
      (
        product.price_per_litre == null ||
        !Number.isFinite(Number(product.price_per_litre)) ||
        Number(product.price_per_litre) < 0
      )
    ) {
      setPopup({
        isOpen: true,
        type: 'alert',
        title: 'Litre Price Not Available',
        message: 'A valid per-litre price has not been set for this item. Please select "Packets" to add it to your cart.',
        confirmText: 'Understood',
      });
      return;
    }

    addToCart(
      product,
      imageRef as RefObject<HTMLElement | null>,
      quantity,
      orderUnit,
      packetsPerLitre
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{
        duration: 0.35,
        delay: Math.min(index * 0.05, 0.3),
        ease: 'easeOut',
      }}
      whileHover={{
        y: -6,
        transition: { duration: 0.2 },
      }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl"
    >
      <div>
        {/* Product image */}
        <div
          ref={imageRef}
          className="relative h-52 overflow-hidden bg-gradient-to-br from-blue-50/50 via-emerald-50/30 to-amber-50/40 sm:h-56"
        >
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 opacity-60 transition-opacity group-hover:opacity-40" />

          <div className="absolute left-3 right-3 top-3 flex items-center justify-between">
            <span
              className={`rounded-xl px-2.5 py-1 text-[11px] font-black uppercase tracking-wider shadow-md ${brandBadge}`}
            >
              {product.brand}
            </span>

            <span className="rounded-xl border border-white/40 bg-white/95 px-2.5 py-1 text-[11px] font-bold text-gray-800 backdrop-blur-md">
              {product.unit}
            </span>
          </div>

          {!product.available && (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/60 p-4 backdrop-blur-[2px]">
              <span className="flex items-center gap-1.5 rounded-full bg-red-500/95 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                <AlertCircle className="h-3.5 w-3.5" />
                Out of Stock Today
              </span>
            </div>
          )}
        </div>

        {/* Product information */}
        <div className="p-4 sm:p-5">
          <div className="mb-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-600">
            <span>{product.category}</span>
            <span>•</span>
            <span className="font-medium text-gray-400">
              100% Pure
            </span>
          </div>

          <h3 className="line-clamp-2 text-base font-extrabold leading-snug text-gray-900 transition-colors group-hover:text-emerald-700">
            {product.name}
          </h3>

          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">
            {product.description}
          </p>

          {/* Unit selector */}
          <div className="mt-4">
            <label className="mb-2 block text-xs font-bold text-gray-700">
              Order unit
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setOrderUnit('packets');
                  setQuantity(1);
                }}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                  orderUnit === 'packets'
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-400'
                }`}
              >
                Packets
              </button>

              <button
                type="button"
                onClick={() => {
                  setOrderUnit('litres');
                  setQuantity(1);
                }}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                  orderUnit === 'litres'
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-400'
                }`}
              >
                Litres
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div className="mt-4">
            <label
              htmlFor={`quantity-${product.id}`}
              className="mb-2 block text-xs font-bold text-gray-700"
            >
              Quantity ({orderUnit})
            </label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => updateQuantity(quantity - 1)}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:bg-gray-100 disabled:opacity-40"
              >
                <Minus className="h-4 w-4" />
              </button>

              <input
                id={`quantity-${product.id}`}
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(event) => {
                  const value = event.target.value;

                  if (value === '') {
                    setQuantity(1);
                    return;
                  }

                  const parsed = Number(value);

                  if (Number.isInteger(parsed) && parsed >= 1) {
                    setQuantity(parsed);
                  }
                }}
                className="h-10 min-w-0 flex-1 rounded-xl border border-gray-200 text-center text-sm font-bold text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />

              <button
                type="button"
                onClick={() => updateQuantity(quantity + 1)}
                aria-label="Increase quantity"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:bg-gray-100"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Informational conversion */}
          {orderUnit === 'litres' && (
            <div className="mt-3 rounded-xl bg-emerald-50 p-3">
              <p className="text-xs font-semibold text-emerald-800">
                Approximate packet equivalent
              </p>

              <p className="mt-1 text-sm font-bold text-emerald-700">
                {packetQuantity} packets
              </p>
            </div>
          )}

          {/* Price */}
          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
            <div>
              <p className="text-xs text-gray-500">
                Price per {orderUnit === 'litres' ? 'litre' : 'packet'}
              </p>

              <p className="text-sm font-semibold text-gray-700">
                ₹{unitPrice.toLocaleString('en-IN')}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Total price
              </p>

              <p className="text-2xl font-black text-gray-900">
                ₹{totalPrice.toLocaleString('en-IN')}
              </p>
            </div>

            <p className="text-right text-[10px] font-medium text-gray-400">
              {quantity} {orderUnit}
              <br />
              {product.available ? 'Available today' : 'Unavailable'}
            </p>
          </div>
        </div>
      </div>

      {/* Add to cart */}
      <div className="p-4 pt-0 sm:p-5 sm:pt-0">
        <motion.button
          onClick={handleAddToCart}
          disabled={!product.available}
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.02 }}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-200 ${
            product.available
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700 hover:shadow-lg'
              : 'cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-400'
          }`}
        >
          <ShoppingCart className="h-4 w-4" />

          {orderUnit === 'litres'
            ? `Order ${quantity} Litre${quantity > 1 ? 's' : ''}`
            : `Add ${quantity} Packet${quantity > 1 ? 's' : ''}`}
        </motion.button>
      </div>

      <CustomPopup popup={popup} onClose={() => setPopup(null)} />
    </motion.div>
  );
}
