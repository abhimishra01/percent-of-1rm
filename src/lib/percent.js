// Percent of 1RM logic. Pure functions, no DOM. Plate math runs in hundredths so 1.25 and 2.5 stay exact.
// Rep max formulas:
//   Epley, B. (1985). Poundage chart. In Boyd Epley Workout. Lincoln, NE: Body Enterprises.   1RM = w * (1 + reps / 30)
//   Brzycki, M. (1993). Strength testing: predicting a one-rep max from reps-to-fatigue.
//   Journal of Physical Education, Recreation & Dance, 64(1), 88-90.   1RM = w * 36 / (37 - reps)
// Plates a person can tick, and the set that starts ticked. Not every gym owns 35 lb, 1.25 lb or 0.5 kg plates.
export const PLATES = {
  lb: [45, 35, 25, 10, 5, 2.5, 1.25],
  kg: [25, 20, 15, 10, 5, 2.5, 1.25, 0.5],
};
export const DEFAULT_PLATES = {
  lb: [45, 25, 10, 5, 2.5],
  kg: [25, 20, 15, 10, 5, 2.5, 1.25],
};
// Bars in menu order: the first is the standard bar, the second is the women's bar (Tool.astro labels them by position).
export const BARS = { lb: [45, 35], kg: [20, 15] };
export const MAX_WEIGHT = 2500;
export const REPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const fmt = (n) => String(+Number(n).toFixed(2));
export const fmt1 = (n) => String(+Number(n).toFixed(1));
const H = (w) => Math.round(w * 100);

// Accepts "225", "225.5", "1,200", "102,5" (decimal comma) and " 225 lb ". Returns NaN for anything else, 0 for blank.
// A comma followed by exactly three digits is a thousands separator. A comma followed by one or two digits is a decimal comma.
export function parseNumber(text) {
  let s = String(text ?? '').trim().replace(/\s*(lb|lbs|kg|%)\s*$/i, '');
  if (s === '') return 0;
  if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replace(/,/g, '');
  else if (/^\d+,\d{1,2}$/.test(s)) s = s.replace(',', '.');
  if (!/^\d*\.?\d+$|^\d+\.$/.test(s)) return NaN;
  return Number(s);
}

// A field read: what the person typed, checked against a maximum. Used by every number box on the page.
// value: the number to use (0 when blank or bad). bad: text that is not a number. clamped: the number was above max.
export function readField(text, max) {
  const v = parseNumber(text);
  if (Number.isNaN(v)) return { value: 0, bad: true, clamped: false };
  if (v > max) return { value: max, bad: false, clamped: true };
  return { value: v, bad: false, clamped: false };
}

// A custom bar weight must be a real number above 0. Blank, 0 and text all give NaN, so the page asks for a bar weight.
export function parseBar(text, max = MAX_WEIGHT) {
  const v = parseNumber(text);
  return Number.isFinite(v) && v > 0 && v <= max ? v : NaN;
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

// Fewest-plates table for one plate set: count[s] and last[s] for every side weight s up to size (in hundredths).
// Built once per plate set and reused by every row of a render. It grows only when a bigger side weight is asked for.
const tables = new Map();
function plateTable(coins, side) {
  const key = coins.join(',');
  let t = tables.get(key);
  if (t && t.size >= side) return t;
  const size = Math.max(side, t ? t.size * 2 : 0);
  const count = new Int32Array(size + 1).fill(-1);
  const last = new Int32Array(size + 1);
  count[0] = 0;
  for (let s = 1; s <= size; s++) {
    for (const c of coins) {
      if (c > s || count[s - c] < 0) continue;
      const n = count[s - c] + 1;
      if (count[s] < 0 || n < count[s]) { count[s] = n; last[s] = c; }
    }
  }
  t = { size, count, last };
  tables.set(key, t);
  return t;
}

// Fewest plates per side for a total load. Larger plates win ties. Returns [{w, n}] or null if not makeable.
export function platesPerSide(load, bar, plates) {
  const side = (H(load) - H(bar)) / 2;
  if (side < 0 || !Number.isInteger(side)) return null;
  const coins = [...new Set(plates.map(H))].filter((c) => c > 0).sort((a, b) => b - a);
  const { count, last } = plateTable(coins, side);
  if (count[side] < 0) return null;
  const map = new Map();
  for (let s = side; s > 0; s -= last[s]) map.set(last[s], (map.get(last[s]) || 0) + 1);
  return [...map.entries()].sort((a, b) => b[0] - a[0]).map(([c, n]) => ({ w: c / 100, n }));
}

export const describeSide = (list) =>
  !list ? '' : list.length === 0 ? 'Bar only' : list.map((p) => (p.n > 1 ? `${p.n} x ${fmt(p.w)}` : fmt(p.w))).join(' + ');

// The smallest step a plate set can add to one side: the greatest common divisor of its plates.
// The jump between loads is twice this (one plate on each side). An empty set gives 0.
export function smallestOf(plates) {
  const g = (a, b) => (b ? g(b, a % b) : a);
  return plates.map(H).reduce(g, 0) / 100;
}

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

export function repTable({ oneRm, bar, smallest, plates, reps = REPS }) {
  const cell = (fraction) => {
    const { load } = loadable(oneRm * fraction, bar, smallest);
    return { pct: fraction * 100, load, side: platesPerSide(load, bar, plates) };
  };
  return reps.map((r) => ({ reps: r, epley: cell(epleyFraction(r)), brzycki: cell(brzyckiFraction(r)) }));
}

// Reverse: how many reps a weight is worth, as a percent of the 1RM. Estimates only.
export function repsAtFraction(p) {
  if (!(p > 0)) return null;
  return { epley: Math.max(1, Math.round(30 * (1 / p - 1))), brzycki: Math.max(1, Math.round(37 - 36 * p)) };
}

// The sentence about reps for a weight that is p (0 to 1) of the 1RM. The formulas stop making sense far above 12 reps.
export function repEstimateText(p) {
  const reps = repsAtFraction(p);
  if (!reps) return '';
  if (reps.epley > 30) return 'Rep estimate: more than 30 reps. The formulas do not reach that far.';
  const rough = reps.epley > 12 || reps.brzycki > 12 ? ' Estimates above 12 reps are rough.' : '';
  return `Rep estimate: about ${reps.epley} reps (Epley) or ${reps.brzycki} reps (Brzycki).${rough}`;
}
