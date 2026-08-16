/**
 * Resolves a path from `public/` against the deployed base URL.
 *
 * Vite rewrites asset URLs it can see — imports, and the references in
 * index.html — but the photograph paths in `wedding.ts` are plain strings
 * that only become URLs at runtime, so it cannot touch them. On a
 * GitHub Pages project site (served from /<repo>/) an unprefixed
 * "/gallery/01.jpg" resolves against the domain root and 404s.
 *
 * Paths stay written as "/gallery/01.jpg" in the data file — the leading
 * slash is what everyone expects to type — and are rebased here.
 */
export function asset(path: string): string {
  // import.meta.env.BASE_URL always has a trailing slash.
  return import.meta.env.BASE_URL + path.replace(/^\//, "");
}
