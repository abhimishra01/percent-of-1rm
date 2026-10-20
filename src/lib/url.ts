// Build a link that works at the site root and under a sub-path (GitHub Pages). Pass a path without a leading slash.
export const BASE = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
export const url = (path = '') => BASE + path.replace(/^\//, '');
// The page path without the base, for canonical links: "/privacy/" at the root and under /slug/.
export const pathInSite = (pathname: string) => (BASE !== '/' && pathname.startsWith(BASE) ? `/${pathname.slice(BASE.length)}` : pathname);
