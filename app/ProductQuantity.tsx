"use client";

import { useMemo, useState } from "react";

type ProductQuantityProps = {
  productName: string;
  pricePerPacket: number;
  packetsPerLitre: number;
  onAddToCart?: (item: {
    productName: string;
    unit: "packets" | "litres";
    quantity: number;
    packets: number;
    totalPrice: number;
  }) => void;
};

export default function ProductQuantity({
  productName,
  pricePerPacket,
  packetsPerLitre,
  onAddToCart,
}: ProductQuantityProps) {
  const [unit, setUnit] = useState<"packets" | "litres">("packets");
  const [quantity, setQuantity] = useState(1);

  const details = useMemo(() => {
    const packets =
      unit === "litres"
        ? quantity * packetsPerLitre
        : quantity;

    return {
      packets,
      totalPrice: packets * pricePerPacket,
    };
  }, [unit, quantity, packetsPerLitre, pricePerPacket]);

  return (
    <div className="mt-4 space-y-3 rounded-xl border border-gray-200 bg-white p-4">
      <label className="block text-sm font-medium text-gray-700">
        Order unit
      </label>

      <select
        value={unit}
        onChange={(event) => {
          setUnit(event.target.value as "packets" | "litres");
          setQuantity(1);
        }}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-600"
      >
        <option value="packets">Packets</option>
        <option value="litres">Litres (for shop vendors)</option>
      </select>

      <label className="block text-sm font-medium text-gray-700">
        Quantity ({unit === "litres" ? "litres" : "packets"})
      </label>

      <input
        type="number"
        min="1"
        step="1"
        value={quantity}
        onChange={(event) => {
          const value = event.target.value;
          setQuantity(value === "" ? 0 : Math.max(0, Number(value)));
        }}
        onBlur={() => {
          if (quantity < 1) setQuantity(1);
        }}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-600"
      />

      {unit === "litres" && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
          Equivalent quantity: <strong>{details.packets} packets</strong>
        </div>
      )}

      <div className="flex items-center justify-between border-t pt-3">
        <span className="text-gray-600">Total price</span>
        <span className="text-xl font-bold text-green-700">
          ₹{details.totalPrice.toLocaleString("en-IN")}
        </span>
      </div>

      <button
        type="button"
        disabled={quantity < 1 || !Number.isInteger(quantity)}
        onClick={() =>
          onAddToCart?.({
            productName,
            unit,
            quantity,
            packets: details.packets,
            totalPrice: details.totalPrice,
          })
        }
        className="w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Add to Cart
      </button>
    </div>
  );
}