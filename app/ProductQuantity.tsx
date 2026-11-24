"use client";

import { useId, useMemo, useState } from "react";
import { litresToPackets, packetsToLitres, round2 } from "@/lib/units";

type ProductQuantityProps = {
  productName: string;
  pricePerPacket: number;
  pricePerLitre?: number | null;
  litresPerPacket: number | null;
  allowLitres?: boolean;
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
  pricePerLitre,
  litresPerPacket,
  allowLitres = true,
  onAddToCart,
}: ProductQuantityProps) {
  const uid = useId();

  const canUseLitres =
    allowLitres && !!litresPerPacket && litresPerPacket > 0;

  const [unit, setUnit] = useState<"packets" | "litres">("packets");
  const [rawQty, setRawQty] = useState("1");

  const quantity = Number(rawQty);

  const validQty = rawQty !== "" && !isNaN(quantity) && quantity > 0;

  const details = useMemo(() => {
    if (!validQty) {
      return { packets: 0, litres: 0, totalPrice: 0 };
    }

    // PACKET BILLING
    if (unit === "packets") {
      const packets = Math.floor(quantity);

      return {
        packets,
        litres: litresPerPacket
          ? packetsToLitres(packets, litresPerPacket)
          : 0,
        totalPrice: round2(packets * pricePerPacket),
      };
    }

    // LITRE BILLING
    const packets =
      litresPerPacket && litresPerPacket > 0
        ? litresToPackets(quantity, litresPerPacket)
        : 0;

    // Litres actually delivered (whole packets only)
    const litres = litresPerPacket
      ? packetsToLitres(packets, litresPerPacket)
      : quantity;

    return {
      packets,
      litres,
      // Use litre price when available, on the litres actually delivered
      totalPrice:
        pricePerLitre != null && pricePerLitre > 0
          ? round2(litres * pricePerLitre)
          : round2(packets * pricePerPacket),
    };
  }, [
    unit,
    quantity,
    validQty,
    litresPerPacket,
    pricePerPacket,
    pricePerLitre,
  ]);

  // Need at least 1 whole packet in both modes
  const canAdd =
    validQty &&
    details.packets >= 1 &&
    (unit === "litres" ? canUseLitres : true);

  return (
    <div className="mt-4 space-y-3 rounded-xl border border-gray-200 bg-white p-4">
      {canUseLitres && (
        <>
          <label
            htmlFor={`${uid}-unit`}
            className="block text-sm font-medium text-gray-700"
          >
            Order unit
          </label>

          <select
            id={`${uid}-unit`}
            value={unit}
            onChange={(e) => {
              setUnit(e.target.value as "packets" | "litres");
              setRawQty("1");
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-600"
          >
            <option value="packets">Packets</option>
            <option value="litres">Litres (for shop vendors)</option>
          </select>
        </>
      )}

      <label
        htmlFor={`${uid}-qty`}
        className="block text-sm font-medium text-gray-700"
      >
        Quantity ({unit === "litres" ? "litres" : "packets"})
      </label>

      <input
        id={`${uid}-qty`}
        type="number"
        inputMode="decimal"
        min="0"
        step={unit === "litres" ? "0.1" : "1"}
        value={rawQty}
        onChange={(e) => setRawQty(e.target.value)}
        onBlur={() => {
          if (!validQty) setRawQty("1");
        }}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-600"
      />

      {unit === "litres" && litresPerPacket && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
          = <strong>{details.packets} packets</strong>
          <p className="mt-0.5 text-xs text-green-700">
            1 packet = {litresPerPacket} L
          </p>

          {pricePerLitre != null && pricePerLitre > 0 && (
            <p className="mt-1 text-xs text-green-700">
              Price per litre: ₹{pricePerLitre}
            </p>
          )}
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
        disabled={!canAdd}
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