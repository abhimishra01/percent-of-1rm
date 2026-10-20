// Table rows as HTML strings. The page builds the default tables with these at build time (so the layout does not jump)
// and the browser script rebuilds them when the person changes a setting.
import { describeSide, fmt, fmt1 } from './percent.js';

const td = (html, cls = '') => `<td class="px-3 py-2.5 tabular-nums ${cls}">${html}</td>`;
const th = (html) => `<th scope="row" class="px-3 py-2.5 font-semibold tabular-nums">${html}</th>`;

// Plates for one side of the bar, as text.
export const sideText = (side, load, bar) => (side === null ? 'Not loadable' : load <= bar ? 'Bar only' : describeSide(side));

// Chart rows. hitPct marks the row that matches the "own percent" box.
export function chartRowsHtml(rows, bar, hitPct) {
  return rows.map((r) => {
    const hit = Math.abs(r.pct - hitPct) < 1e-9 ? ' class="hit"' : '';
    return `<tr${hit}>${th(`${fmt(r.pct)}%`)}${td(fmt(+r.exact.toFixed(2)), 'text-muted')}${td(fmt(r.load), 'load')}${td(sideText(r.side, r.load, bar))}</tr>`;
  }).join('');
}

// Rep table rows. Each cell shows the load, the percent and the plates for each side.
export function repRowsHtml(table, bar) {
  const cell = (c) => {
    const plates = c.side === null ? '' : ` &middot; each side: ${sideText(c.side, c.load, bar).toLowerCase()}`;
    return td(`<span class="load">${fmt(c.load)}</span><span class="sub">${fmt1(c.pct)}%${plates}</span>`);
  };
  return table.map((r) => `<tr>${th(r.reps)}${cell(r.epley)}${cell(r.brzycki)}</tr>`).join('');
}
