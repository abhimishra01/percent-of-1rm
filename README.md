# Percent of 1RM Calculator

Static site (Astro 7 and Tailwind 4) for percentof1rm.com. You enter a 1RM and get 50% to 100% as loadable weights with plates per side, in lb or kg. It also finds the percent of any weight and shows rep max estimates (Epley and Brzycki, labeled as estimates). No backend; settings stay in the browser.

## Where the logic lives
- `src/lib/percent.js`: all math and input rules (percent, rounding to loadable weights, fewest plates per side, rep formulas, number parsing). No DOM.
- `src/lib/render.js`: table rows as HTML, shared by the build and the browser.
- `src/components/Tool.astro`: the page UI and its script (state, events, saved settings).
- `src/components/Article.astro`, `src/data/faq.ts`: the text, sources and FAQ (FAQ also becomes JSON-LD).
- `src/site.config.ts`: name, domain, description, brand color, skin (`retro`).

## Commands
- `npm run dev`: work locally.
- `npm test`: unit tests for `percent.js` (`tests/percent.test.mjs`).
- `npm run build`: build to `dist/`.
- `npm run deploy`: test, build, then upload to Cloudflare Pages (needs `wrangler login` first).

## GitHub Pages preview
`.github/workflows/pages.yml` builds on every push to `main` with `PAGES_BASE=/percent-of-1rm/` and `PAGES_SITE=https://abhimishra01.github.io`. Pages builds get `noindex`; the canonical link always points to https://percentof1rm.com/. Test locally with `PAGES_BASE=/percent-of-1rm/ npx astro build --outDir dist-pages`.

## Sources
Epley, B. (1985). Poundage chart. In Boyd Epley Workout. Brzycki, M. (1993). J Phys Educ Recreat Dance 64(1):88-90.
