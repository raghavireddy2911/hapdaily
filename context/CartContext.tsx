
'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from 'react';

import { Product, FlyingItem, OrderUnit } from '@/types';

export type { OrderUnit } from '@/types';

export interface UnitCartItem {
  product: Product;
  quantity: number;
  orderUnit: OrderUnit;
  packetsPerLitre: number;
}

interface CartContextValue {
  items: UnitCartItem[];

  addToCart: (
    product: Product,
    imageRef?: React.RefObject<HTMLElement | null>,
    quantity?: number,
    orderUnit?: OrderUnit,
    packetsPerLitre?: number
  ) => void;

  removeFromCart: (
    productId: string,
    orderUnit?: OrderUnit
  ) => void;

  updateQuantity: (
    productId: string,
    quantity: number,
    orderUnit?: OrderUnit
  ) => void;

  clearCart: () => void;

  totalItems: number;
  totalPrice: number;

  flyingItems: FlyingItem[];
  cartIconRef: React.RefObject<HTMLElement | null>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<UnitCartItem[]>([]);
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);

  const cartIconRef = useRef<HTMLElement | null>(null);

  const addToCart = useCallback(
    (
      product: Product,
      imageRef?: React.RefObject<HTMLElement | null>,
      quantity = 1,
      orderUnit: OrderUnit = 'packets',
      packetsPerLitre = 1
    ) => {
      if (!Number.isInteger(quantity) || quantity < 1) {
        return;
      }

      if (
        orderUnit === 'litres' &&
        (
          product.price_per_litre == null ||
          !Number.isFinite(Number(product.price_per_litre)) ||
          Number(product.price_per_litre) < 0
        )
      ) {
        return;
      }

      const safePacketsPerLitre = Math.max(
        1,
        Math.floor(packetsPerLitre)
      );

      // Preserve the flying-image animation.
      if (imageRef?.current && cartIconRef.current) {
        const imgRect = imageRef.current.getBoundingClientRect();
        const flyId = `${product.id}-${Date.now()}`;

        const newFlyItem: FlyingItem = {
          id: flyId,
          imageUrl: product.image_url,
          startX: imgRect.left + imgRect.width / 2,
          startY: imgRect.top + imgRect.height / 2,
        };

        setFlyingItems((prev) => [...prev, newFlyItem]);

        setTimeout(() => {
          setFlyingItems((prev) =>
            prev.filter((item) => item.id !== flyId)
          );
        }, 800);
      }

      setItems((prev) => {
        const existing = prev.find(
          (item) =>
            item.product.id === product.id &&
            item.orderUnit === orderUnit
        );

        if (existing) {
          return prev.map((item) =>
            item.product.id === product.id &&
            item.orderUnit === orderUnit
              ? {
                  ...item,
                  product,
                  quantity: item.quantity + quantity,
                  packetsPerLitre: safePacketsPerLitre,
                }
              : item
          );
        }

        return [
          ...prev,
          {
            product,
            quantity,
            orderUnit,
            packetsPerLitre: safePacketsPerLitre,
          },
        ];
      });
    },
    []
  );

  const removeFromCart = useCallback(
    (productId: string, orderUnit?: OrderUnit) => {
      setItems((prev) =>
        prev.filter(
          (item) =>
            !(
              item.product.id === productId &&
              (orderUnit === undefined ||
                item.orderUnit === orderUnit)
            )
        )
      );
    },
    []
  );

  const updateQuantity = useCallback(
    (
      productId: string,
      quantity: number,
      orderUnit?: OrderUnit
    ) => {
      if (!Number.isInteger(quantity) || quantity < 1) {
        return;
      }

      setItems((prev) =>
        prev.map((item) =>
          item.product.id === productId &&
          (orderUnit === undefined ||
            item.orderUnit === orderUnit)
            ? { ...item, quantity }
            : item
        )
      );
    },
    []
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Count the quantities actually ordered.
  // For mixed units, this is a count of order units, not packet equivalents.
  const totalItems = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Packets use packet price; litres use the saved litre price.
  const totalPrice = items.reduce((total, item) => {
    const unitPrice =
      item.orderUnit === 'litres'
        ? Number(item.product.price_per_litre ?? 0)
        : Number(item.product.price);

    return total + unitPrice * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        flyingItems,
        cartIconRef,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
}
