'use client';

import { useCart } from '@/context/CartContext';
import { FlyingItem } from '@/types';
import { motion, AnimatePresence } from 'motion/react';

export default function FlyingCartAnimation() {
  const { flyingItems, cartIconRef } = useCart();

  const getCartPos = () => {
    if (cartIconRef.current) {
      const rect = cartIconRef.current.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }
    // Fallback: top-right corner
    return { x: window.innerWidth - 60, y: 30 };
  };

  return (
    <AnimatePresence>
      {flyingItems.map((item: FlyingItem) => {
        const cartPos = getCartPos();
        return (
          <motion.div
            key={item.id}
            className="fixed z-[9999] pointer-events-none w-14 h-14 rounded-full overflow-hidden border-2 border-green-400 shadow-xl"
            style={{ left: item.startX - 28, top: item.startY - 28 }}
            initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            animate={{
              opacity: [1, 1, 0],
              scale: [1, 0.6, 0.2],
              x: cartPos.x - item.startX,
              y: cartPos.y - item.startY,
            }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt="flying"
              className="w-full h-full object-cover"
            />
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
}

