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


// Explicit product.litres_per_packet wins. Unit-text parsing is only a fallback.
export const parseLitresFromUnit = (unit: string): number | null => {
  const u = (unit || "").toLowerCase().replace(/\s+/g, "");

  const m = u.match(/(\d+(?:\.\d+)?)(ml|millilitres?|milliliters?|litres?|liters?|l)/);

  if (!m) return null;

  const n = parseFloat(m[1]);

  return /ml|millilitres?|milliliters?/.test(m[2]) ? n / 1000 : n;
};
