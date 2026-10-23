// ONE config file. Change values here; every page reads from it.
// Keep this file plain (no type-only syntax): scripts/deploy.mjs imports it directly.
const config = {
  name: 'Percent of 1RM Calculator',                 // shown in header, title, footer
  domain: 'percentof1rm.com',                        // no https://, no www. Used for canonical, sitemap, robots
  cloudflareProject: 'percent-of-1rm',               // Cloudflare Pages project name (used by npm run deploy)
  keyword: 'percent of 1rm calculator',              // main keyword (search phrase)
  h1: 'Percent of 1RM calculator',                   // visible page heading
  title: 'Percent of 1RM Calculator: RM Calculator and Plates', // home page title, under 60 chars
  tagline: 'Free and fast',
  description:
    'Enter your 1RM and get 50% to 100% as loadable weights with plates per side. lb and kg. Also finds the percent of any weight, plus rep max estimates.',
  email: 'hello@percentof1rm.com',                   // contact email (shown on Contact and Privacy pages)
  owner: 'Percent of 1RM Calculator',                // named as the owner on the Terms page
  ga4: '',                                           // GA4 measurement ID, e.g. 'G-XXXXXXXXXX'. Empty = Google Analytics off
  adsense: '',                                       // AdSense publisher ID, e.g. 'ca-pub-1234567890123456'. Empty = ads off
  brand: '#1e40af',                                  // brand color (hex)
  skin: 'retro',                                     // visual skin: minimal, swiss, clay or retro
  locale: 'en-US',                                   // BCP 47 language tag
  ogImage: '/og.png',
  category: 'UtilitiesApplication',                   // schema.org applicationCategory
};

// Bingemind build (SITE_MODE=bingemind): the tool lives at https://bingemind.com/<slug>/.
// Canonical URLs point there in every build, including the GitHub Pages preview.
const bingemind = typeof process !== 'undefined' && process.env.SITE_MODE === 'bingemind';
const slug = config.cloudflareProject;
export default {
  ...config,
  bingemind,
  slug,
  canonicalBase: `https://bingemind.com/${slug}`,
  host: bingemind ? `bingemind.com/${slug}/` : config.domain,
  owner: bingemind ? 'Bingemind (Abhishek Mishra)' : config.owner,
  // No invented mailbox: Bingemind builds link to the Bingemind contact section.
  contactHref: bingemind ? 'https://bingemind.com/#contact' : `mailto:${config.email}`,
  contactLabel: bingemind ? 'bingemind.com/#contact' : config.email,
};
