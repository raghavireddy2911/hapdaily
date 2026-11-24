export const round2 = (n: number) => Math.round(n * 100) / 100;

// Local (IST) date as YYYY-MM-DD. Avoids the UTC bug of toISOString().
export const toLocalDateStr = (d: Date = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const todayLocal = () => toLocalDateStr(new Date());

export const daysAgoLocal = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toLocalDateStr(d);
};

export const monthStartLocal = () => {
  const d = new Date();
  return toLocalDateStr(new Date(d.getFullYear(), d.getMonth(), 1));
};

// Reads pack size from unit text: 10ml, 500 ml, 1L, 1 Litres, 200g, 400 gm, 1 kg ...
// Returns litres per packet, or null if it can't be understood.
// Reads pack size from unit text: 10ml, 500 ml, 1L, 1 Litres, 200g, 400 gm, 1 kg,
// "500 ml packet", "500 grams cup" ...
// Returns litres per packet, or null if it can't be understood.
// Grams are treated like ml (1000 g = 1 L).
export const parseLitresFromUnit = (unit: string): number | null => {
  const u = (unit || '').toLowerCase();
  const m = u.match(
    /(\d+(?:\.\d+)?)\s*(millilitres?|milliliters?|ml|litres?|liters?|ltrs?|l|kilograms?|kilos?|kgs?|grams?|gms?|g)\b/
  );
  if (!m) return null;
  const n = parseFloat(m[1]);
  const name = m[2];

  if (/^(kilograms?|kilos?|kgs?)$/.test(name)) return n; // 1 kg = 1 L
  if (/^(millilitres?|milliliters?|ml|grams?|gms?|g)$/.test(name)) return n / 1000;
  return n; // litres
};

// Explicit product.litres_per_packet wins. Unit-text parsing is only a fallback.
export const getLitresPerPacket = (p: {
  litres_per_packet?: number | string | null;
  unit: string;
}): number | null => {
  const explicit = Number(p.litres_per_packet);
  return explicit > 0 ? explicit : parseLitresFromUnit(p.unit);
};

// Always whole packets. The tiny epsilon stops 2.9999999 becoming 2.
export const litresToPackets = (litres: number, litresPerPacket: number) => {
  if (!litresPerPacket || litresPerPacket <= 0) return 0;
  return Math.max(0, Math.round(litres / litresPerPacket + 1e-9));
};

// 3 decimals so 0.125 L is not rounded to 0.13
export const packetsToLitres = (packets: number, litresPerPacket: number) => {
  if (!litresPerPacket || litresPerPacket <= 0) return 0;
  return Math.round(packets * litresPerPacket * 1000) / 1000;
};