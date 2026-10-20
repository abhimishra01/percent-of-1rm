# Fix summary (percent-of-1rm), 2026-10-20, Kamala

## Fixed
- must: decimal comma ("102,5") was read as 1025. Now a comma plus 1 or 2 digits is a decimal; plus 3 digits is thousands. Tests added.
- Blank, 0 or text custom bar now asks for a bar weight instead of using a 0 bar (`parseBar`). Tests added.
- Plates: "Smallest plate" replaced by "Plates you have" (tick each size). 35 lb, 1.25 lb and 0.5 kg start unticked. The load step is derived from the ticked plates (`smallestOf`). Saved under a new key (pct1rm-v2).
- Speed: fewest-plates table is built once per plate set and reused (cache); the rep table returns its plates, so no second search. Chart and rep table default HTML is pre-rendered (fixes CLS, gives Google real rows).
- Layout: chart sits beside the inputs on desktop (starts at y about 300 at 1280x720); each result sits under its own input; Bar and plates folded in a details block. H1 is one line at 48 px. Touch targets: FAQ rows, logo and footer links are 44 px.
- Text: "each side" in rep cells; plates read "2 x 10" (count first); note when the 100% row sits above the 1RM; note when a value is clamped or not a number; reps above 30 say "more than 30 reps".
- Sources: Epley book title added, Brzycki DOI added, Epley 1-rep rule stated, "12 to 13 reps", 5/3/1 named. Contact copy fixed. Privacy cookie text depends on ga4/adsense. Category now UtilitiesApplication. H2 renamed "Percent of 1RM chart".
- Cleanup: removed duplicate skin CSS and the eyebrow rule, unused `keywords`, unused import, one-item BreadcrumbList, `epley1RM`/`brzycki1RM`.
- Template items: README rewritten; new-tool.sh already gone; deploy runs tests first; screenshots/ and .playwright-cli/ ignored and untracked; Tailwind scans src only (CSS 28,715 to 28,261 bytes, JS 8,639 to 9,997 bytes after the new features); legal "Last updated" fixed; no duplicate link block on home; US spelling checked.

## Rejected or deferred
- Sticky result bar on phones: deferred. Results now sit under their inputs, which removes the main complaint; a sticky bar would cost screen space.
- Print/copy chart, sibling-tool links, round-down option: out of scope (single-purpose); sibling links wait until those sites are live. A note explains the 100% row instead.
- Round-trip drift of the weight box (187 to 187.5): rejected, tiny.
- Playwright smoke test for DOM glue: rejected; the field rules moved into tested functions (`readField`, `parseBar`, `repEstimateText`).
- Pale-blue tint change, barbell logo: owner taste, left.

## Status
npm test: 46 pass. Build OK. Pages build checked under /percent-of-1rm/ (home, about, privacy, terms, icons, manifest, og all 200; noindex on; canonical is the real domain). Lighthouse not re-run after the changes (before: 99/100/100/100 mobile); worth one run.

## Phase 2 SEO pages (candidates)
Percent of 1RM pages: 50, 55, 60, 65, 70, 75, 80, 85, 90, 95 percent of 1RM; 1RM percentage chart; 80 percent of 1RM for squat; 5/3/1 percentages; training max calculator (90 percent); 70 percent of 225; 85 percent of 315; 75 percent of 100 kg; 1RM kg to lb percentages.
