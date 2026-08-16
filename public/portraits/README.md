# Portraits

Drop two files here:

- `bride.jpg`
- `groom.jpg`

Until they exist, the site shows an illustrated stand-in instead of a
broken image — nothing errors, so you can build and share the site
before the photos are ready.

**Recommended:** portrait crop, roughly 4:5 (e.g. 1040 × 1300), under
400 KB each. WebP is smaller than JPEG at the same quality; if you use
it, change the filename in `src/data/wedding.ts` to match.

The filenames are set in [`src/data/wedding.ts`](../../src/data/wedding.ts)
under `couple.bride.portrait` and `couple.groom.portrait`. Update the
`portraitAlt` text there too — it is what a screen reader announces.

## Making them Ghibli-style

The site's own artwork (hills, temple, clouds, story vignettes) is drawn
in SVG and already in that register. To have the photographs match, run
them through an illustration/style-transfer tool of your choice before
dropping them here, and keep both portraits processed the same way so
the pair reads as one set.
