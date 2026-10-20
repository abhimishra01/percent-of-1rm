import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseNumber, percentOf, percentFromWeight, loadable, platesPerSide, describeSide, platesFor, row, chart,
  epleyFraction, brzyckiFraction, epley1RM, brzycki1RM, repTable, repsAtFraction, convertTarget, convertWeight,
} from '../src/lib/percent.js';

const L = platesFor('lb', 2.5), K = platesFor('kg', 1.25);
const side = (l) => l.map((p) => [p.w, p.n]);
const near = (a, b, e = 1e-9) => assert.ok(Math.abs(a - b) < e, `${a} != ${b}`);

test('percentOf: 85% of 225 is 191.25', () => near(percentOf(225, 85), 191.25));
test('percentOf: 100% is the 1RM and 50% is half', () => { assert.equal(percentOf(300, 100), 300); assert.equal(percentOf(300, 50), 150); });
test('percentFromWeight: 185 of 225 is 82.2%', () => near(percentFromWeight(225, 185), 82.2222222222, 1e-6));
test('percentFromWeight: zero 1RM gives NaN', () => assert.ok(Number.isNaN(percentFromWeight(0, 100))));

test('parseNumber handles commas, units and bad input', () => {
  assert.equal(parseNumber('225'), 225);
  assert.equal(parseNumber('1,200'), 1200);
  assert.equal(parseNumber(' 102.5 kg '), 102.5);
  assert.equal(parseNumber('85%'), 85);
  assert.equal(parseNumber('.5'), 0.5);
  assert.equal(parseNumber(''), 0);
  assert.ok(Number.isNaN(parseNumber('abc')));
  assert.ok(Number.isNaN(parseNumber('1e5')));
  assert.ok(Number.isNaN(parseNumber('-5')));
});

test('loadable lb: 191.25 on a 45 bar with 2.5 plates rounds to 190', () => assert.equal(loadable(191.25, 45, 2.5).load, 190));
test('loadable lb: 192.5 rounds up to 195 (halves go up)', () => assert.equal(loadable(192.5, 45, 2.5).load, 195));
test('loadable lb: 177.75 rounds to 180', () => assert.equal(loadable(177.75, 45, 2.5).load, 180));
test('loadable kg: 87.4 on a 20 bar with 1.25 plates rounds to 87.5', () => assert.equal(loadable(87.4, 20, 1.25).load, 87.5));
test('loadable kg: 91.3 rounds to 92.5 with 1.25 plates', () => assert.equal(loadable(91.3, 20, 1.25).load, 92.5));
test('loadable with 5 lb plates steps by 10', () => assert.equal(loadable(192, 45, 5).load, 195));
test('loadable below the bar returns the bar', () => {
  const r = loadable(30, 45, 2.5);
  assert.equal(r.load, 45); assert.equal(r.below, true);
});
test('loadable custom bar 33 lb', () => assert.equal(loadable(100, 33, 2.5).load, 98));

test('plates: 225 lb on 45 is 45 x 2', () => assert.deepEqual(side(platesPerSide(225, 45, L)), [[45, 2]]));
test('plates: 190 lb is 45 + 25 + 2.5 per side', () => {
  // (190 - 45) / 2 = 72.5 per side: 45 + 25 + 2.5
  assert.deepEqual(side(platesPerSide(190, 45, L)), [[45, 1], [25, 1], [2.5, 1]]);
});
test('plates: uses fewest plates (60 per side is 35 + 25, not 45 + 10 + 5)', () => {
  assert.deepEqual(side(platesPerSide(165, 45, platesFor('lb', 2.5))), [[35, 1], [25, 1]]);
});
test('plates: kg 100 on 20 is 25 + 15 per side', () => assert.deepEqual(side(platesPerSide(100, 20, K)), [[25, 1], [15, 1]]));
test('plates: kg 102.5 is 25 + 15 + 1.25', () => assert.deepEqual(side(platesPerSide(102.5, 20, K)), [[25, 1], [15, 1], [1.25, 1]]));
test('plates: bar only gives an empty list', () => { assert.deepEqual(platesPerSide(45, 45, L), []); assert.equal(describeSide([]), 'Bar only'); });
test('plates: unreachable load returns null', () => assert.equal(platesPerSide(46, 45, L), null));
test('describeSide formats counts', () => assert.equal(describeSide([{ w: 45, n: 2 }, { w: 2.5, n: 1 }]), '45 x 2 + 2.5'));
test('platesFor drops plates under the smallest', () => assert.deepEqual(platesFor('lb', 5), [45, 35, 25, 10, 5]));

test('row: 85% of 225 lb loads 190 lb', () => {
  const r = row({ oneRm: 225, pct: 85, bar: 45, smallest: 2.5, plates: L });
  near(r.exact, 191.25); assert.equal(r.load, 190);
  assert.deepEqual(side(r.side), [[45, 1], [25, 1], [2.5, 1]]);
});

test('chart: 50 to 100 in 5% steps has 11 rows, highest first', () => {
  const c = chart({ oneRm: 300, bar: 45, smallest: 2.5, plates: L });
  assert.equal(c.length, 11);
  assert.equal(c[0].pct, 100); assert.equal(c[10].pct, 50);
  assert.equal(c[0].load, 300);
  assert.equal(c[10].load, 150);
});
test('chart: 300 lb known values', () => {
  const c = Object.fromEntries(chart({ oneRm: 300, bar: 45, smallest: 2.5, plates: L }).map((r) => [r.pct, r.load]));
  assert.equal(c[95], 285); assert.equal(c[90], 270); assert.equal(c[85], 255); assert.equal(c[80], 240);
  assert.equal(c[75], 225); assert.equal(c[70], 210); assert.equal(c[65], 195); assert.equal(c[60], 180); assert.equal(c[55], 165);
});
test('chart: 2.5% steps give 21 rows, 10% gives 6', () => {
  assert.equal(chart({ oneRm: 300, step: 2.5, bar: 45, smallest: 2.5, plates: L }).length, 21);
  assert.equal(chart({ oneRm: 300, step: 10, bar: 45, smallest: 2.5, plates: L }).length, 6);
});
test('chart: every loadable row can be built from the plates', () => {
  for (const oneRm of [135, 227, 315, 402.5]) {
    for (const r of chart({ oneRm, step: 2.5, bar: 45, smallest: 2.5, plates: L })) assert.ok(r.side, `${oneRm} @ ${r.pct}`);
  }
  for (const oneRm of [60, 102.5, 143, 200]) {
    for (const r of chart({ oneRm, step: 2.5, bar: 20, smallest: 1.25, plates: K })) assert.ok(r.side, `${oneRm}kg @ ${r.pct}`);
  }
});

test('Epley fractions: 5 reps is 85.7%, 10 reps is 75%', () => { near(epleyFraction(5), 1 / (1 + 5 / 30)); near(epleyFraction(10) * 100, 75); });
test('Epley and Brzycki: 1 rep is 100%', () => { assert.equal(epleyFraction(1), 1); assert.equal(brzyckiFraction(1), 1); });
test('Brzycki fractions: 5 reps is 88.9%, 10 reps is 75%', () => { near(brzyckiFraction(5) * 100, 88.8888888889, 1e-6); near(brzyckiFraction(10) * 100, 75, 1e-9); });
test('Epley 1RM: 200 x 5 is 233.3', () => near(epley1RM(200, 5), 233.3333333, 1e-6));
test('Brzycki 1RM: 200 x 5 is 225', () => near(brzycki1RM(200, 5), 225, 1e-9));
test('rep fractions fall as reps rise', () => {
  for (let r = 2; r <= 12; r++) { assert.ok(epleyFraction(r) < epleyFraction(r - 1)); assert.ok(brzyckiFraction(r) < brzyckiFraction(r - 1)); }
});
test('repTable has 12 rows and rounds loads to loadable weights', () => {
  const t = repTable({ oneRm: 300, bar: 45, smallest: 2.5, plates: L });
  assert.equal(t.length, 12);
  assert.equal(t[0].epley.load, 300); assert.equal(t[0].brzycki.load, 300);
  // 5 reps: Epley 85.714% of 300 = 257.14 -> 255; Brzycki 88.889% = 266.67 -> 265
  assert.equal(t[4].epley.load, 255); assert.equal(t[4].brzycki.load, 265);
  near(t[4].epley.pct, 85.7142857, 1e-5);
});
test('repsAtFraction: 75% is about 10 reps in both formulas', () => assert.deepEqual(repsAtFraction(0.75), { epley: 10, brzycki: 10 }));
test('repsAtFraction: 100% is 1 rep', () => assert.deepEqual(repsAtFraction(1), { epley: 1, brzycki: 1 }));
test('repsAtFraction: bad input is null', () => assert.equal(repsAtFraction(0), null));

test('convertWeight: 100 kg is 220.46 lb', () => near(convertWeight(100, 'kg', 'lb'), 220.462262, 1e-5));
test('convertTarget: 225 lb is 102.5 kg, 100 kg is 220 lb', () => { assert.equal(convertTarget(225, 'lb', 'kg'), 102.5); assert.equal(convertTarget(100, 'kg', 'lb'), 220); });
