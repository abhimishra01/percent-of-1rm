// Percent of 1RM logic. Pure functions, no DOM. Plate math runs in hundredths so 1.25 and 2.5 stay exact.
// Rep max formulas:
//   Epley, B. (1985). Poundage Chart. Lincoln, NE: Body Enterprises.   1RM = w * (1 + reps / 30)
//   Brzycki, M. (1993). Strength testing: predicting a one-rep max from reps-to-fatigue.
//   Journal of Physical Education, Recreation & Dance, 64(1), 88-90.   1RM = w * 36 / (37 - reps)
export const PLATES = {
  lb: [45, 35, 25, 10, 5, 2.5, 1.25],
  kg: [25, 20, 15, 10, 5, 2.5, 1.25, 0.5],
};
// Smallest plate choices. The jump between loads is twice the smallest plate (one on each side).
export const SMALLEST = { lb: [1.25, 2.5, 5], kg: [0.5, 1.25, 2.5] };
export const DEFAULT_SMALLEST = { lb: 2.5, kg: 1.25 };
export const BARS = { lb: [45, 35], kg: [20, 15] };
export const MAX_WEIGHT = 2500;
export const REPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const fmt = (n) => String(+Number(n).toFixed(2));
export const fmt1 = (n) => String(+Number(n).toFixed(1));
const H = (w) => Math.round(w * 100);

// Accepts "225", "225.5", "1,200", " 225 lb ". Returns NaN for anything else, 0 for blank.
export function parseNumber(text) {
  const s = String(text ?? '').trim().replace(/,/g, '').replace(/\s*(lb|lbs|kg|%)\s*$/i, '');
  if (s === '') return 0;
  if (!/^\d*\.?\d+$|^\d+\.$/.test(s)) return NaN;
  return Number(s);
}

export const LB_PER_KG = 2.20462262185;
export const convertWeight = (w, from, to) => (from === to ? w : from === 'kg' ? w * LB_PER_KG : w / LB_PER_KG);
// Convert and snap to a sensible jump (5 lb or 2.5 kg) so the new number looks like a real lifting number.
export const convertTarget = (w, from, to) => {
  const step = to === 'lb' ? 5 : 2.5;
  return Math.max(step, Math.round(convertWeight(w, from, to) / step) * step);
};

export const percentOf = (oneRm, pct) => (oneRm * pct) / 100;
export const percentFromWeight = (oneRm, weight) => (oneRm > 0 ? (weight / oneRm) * 100 : NaN);

// Round a weight to a load the bar can make: bar + k * step, k >= 0, nearest, halves go up.
export function loadable(weight, bar, smallest) {
  const step = H(smallest) * 2;
  const b = H(bar);
  const w = H(weight);
  if (w <= b) return { load: bar, below: w < b };
  const k = Math.floor((w - b) / step + 0.5 + 1e-9);
  return { load: (b + k * step) / 100, below: false };
}

// Fewest plates per side for a total load. Larger plates win ties. Returns [{w, n}] or null if not makeable.
export function platesPerSide(load, bar, plates) {
  const side = (H(load) - H(bar)) / 2;
  if (side < 0 || !Number.isInteger(side)) return null;
  const coins = [...new Set(plates.map(H))].filter((c) => c > 0).sort((a, b) => b - a);
  const count = new Int32Array(side + 1).fill(-1);
  const last = new Int32Array(side + 1);
  count[0] = 0;
  for (let s = 1; s <= side; s++) {
    for (const c of coins) {
      if (c > s || count[s - c] < 0) continue;
      const n = count[s - c] + 1;
      if (count[s] < 0 || n < count[s]) { count[s] = n; last[s] = c; }
    }
  }
  if (count[side] < 0) return null;
  const map = new Map();
  for (let s = side; s > 0; s -= last[s]) map.set(last[s], (map.get(last[s]) || 0) + 1);
  return [...map.entries()].sort((a, b) => b[0] - a[0]).map(([c, n]) => ({ w: c / 100, n }));
}

export const describeSide = (list) =>
  !list ? '' : list.length === 0 ? 'Bar only' : list.map((p) => (p.n > 1 ? `${fmt(p.w)} x ${p.n}` : fmt(p.w))).join(' + ');

// Plates a person has: the standard set, from the smallest plate up.
export const platesFor = (unit, smallest) => PLATES[unit].filter((p) => p >= smallest);

// One row: exact weight, loadable weight, plates per side.
export function row({ oneRm, pct, bar, smallest, plates }) {
  const exact = percentOf(oneRm, pct);
  const { load, below } = loadable(exact, bar, smallest);
  return { pct, exact, load, below, side: platesPerSide(load, bar, plates) };
}

export function chart({ oneRm, from = 50, to = 100, step = 5, bar, smallest, plates }) {
  const rows = [];
  for (let p = to * 10; p >= from * 10; p -= step * 10) rows.push(row({ oneRm, pct: p / 10, bar, smallest, plates }));
  return rows;
}

// Rep max estimates. Returns the fraction of 1RM that can be lifted for the given reps.
export const epleyFraction = (reps) => (reps <= 1 ? 1 : 1 / (1 + reps / 30));
export const brzyckiFraction = (reps) => (reps <= 1 ? 1 : (37 - reps) / 36);
export const epley1RM = (weight, reps) => (reps <= 1 ? weight : weight * (1 + reps / 30));
export const brzycki1RM = (weight, reps) => (reps <= 1 ? weight : (weight * 36) / (37 - reps));

export function repTable({ oneRm, bar, smallest, plates, reps = REPS }) {
  return reps.map((r) => {
    const e = epleyFraction(r), b = brzyckiFraction(r);
    return {
      reps: r,
      epley: { pct: e * 100, load: loadable(oneRm * e, bar, smallest).load },
      brzycki: { pct: b * 100, load: loadable(oneRm * b, bar, smallest).load },
    };
  });
}

// Reverse: how many reps a weight is worth, as a percent of the 1RM. Estimates only.
export function repsAtFraction(p) {
  if (!(p > 0)) return null;
  return { epley: Math.max(1, Math.round(30 * (1 / p - 1))), brzycki: Math.max(1, Math.round(37 - 36 * p)) };
}
