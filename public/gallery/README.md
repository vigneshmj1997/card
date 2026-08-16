# Gallery

Drop your photographs here as `01.jpg`, `02.jpg`, … and list them in
`gallery` in [`src/data/wedding.ts`](../../src/data/wedding.ts).

Each entry needs a `src` and an `alt`. The `alt` is not optional filler
— it is read out by screen readers *and* printed as the visible caption
under each photograph, so write it as a real sentence:

```ts
{ src: "/gallery/01.jpg", alt: "The couple at the temple corridor" }
```

Any file that is missing falls back to an illustrated placeholder rather
than a broken image, so the carousel keeps working while you collect
them.

**Recommended:** 4:3 landscape, around 1600 × 1200, under 500 KB each.
Add or remove entries freely — the 3D ring recalculates its radius from
the number of photographs, so it stays evenly spaced at any count.
