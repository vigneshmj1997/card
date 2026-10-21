# Wedding site

A Tamil wedding invitation you walk into. The page opens on a temple
gopuram; scrolling swings its doors open and carries you through them
into the lamp-lit hall, where the invitation card is hanging — mango
leaves across the top, the date under scratch-off gold foil, and the
venue with a Google Maps link at the bottom.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # → dist/
npm run preview  # serve the production build
```

## Everything you need to edit is in one file

[`src/data/wedding.ts`](src/data/wedding.ts) holds every name, date,
venue, ritual, story beat and RSVP setting on the site. **The content
currently in it is sample content** — replace it. No component hardcodes
wedding copy, so nothing else needs touching for a content change.

Photographs go in [`public/portraits/`](public/portraits/) and
[`public/gallery/`](public/gallery/) — each has a README with the
expected filenames and sizes. Missing images fall back to illustrated
placeholders instead of breaking, so the site is shareable before the
photos are ready.

## The page

| Section | What it does |
|---|---|
| Temple entrance ([`TempleEntrance.tsx`](src/sections/TempleEntrance.tsx)) | A seven-tier gopuram at dawn, between kaavi-striped walls, with banana trees and a thoranam at the door and a kolam on the ground. The section is pinned for three screens of scroll: the teak doors swing in, the view zooms through the doorway toward the sanctum lamp, a flash of lamplight, then the dim hall. |
| Invitation ([`Invitation.tsx`](src/sections/Invitation.tsx)) | The card, hung between carved pillars and swinging bells: a swaying mango-leaf thoranam, turmeric and kumkum on the corners, a purna kumbham between two lamps, *Vignesh weds Shalini*, the date under scratch-off foil, and the venue with an *Open in Google Maps* button. |

The date under the foil is formatted from `wedding.muhurthamISO`, in
India time, so guests abroad see the date printed on the paper card.
The time is shown only once `wedding.muhurthamTimeFixed` is `true`, and
the venue address only once `venue.addressLines` has lines in it.
The foil ([`ScratchReveal.tsx`](src/components/ScratchReveal.tsx))
clears once about half of it is scratched; it is also a button, so
Enter, Space or a screen reader's activate gesture reveals it outright.

The earlier sections (story, couple, events, gallery, travel, RSVP) are
still in [`src/sections/`](src/sections/) but are not rendered. Import
one into [`App.tsx`](src/App.tsx) below `<Invitation />` to bring it back.

## The artwork

All of it is drawn in code — SVG for the flat scenes and ornaments
(kolam, gopuram, banana leaf, marigold, thaali, oil lamp), geometry and
procedural canvas textures for the 3D scenes. There are no image assets
and no external asset requests, so nothing pixelates, everything themes
off CSS variables, and the whole site works offline.

Depth comes in two grades. The ornaments in
[`Ornaments3D.tsx`](src/components/art/Ornaments3D.tsx) — purna kumbham,
mandapam, lotus, thamboolam tray, temple bell, marigold garland — are
SVG solids, drawn with a lit face, a shaded face and a cast shadow under
one fixed light, then placed in CSS 3D space and actually rotated: swayed
on a timer, tilted by scroll, or hung and swung like a pendulum. The two
`three.js` scenes are real geometry — the hero valley, and the
kuthuvilakku in *The Couple*, whose body is a lathe turned from the same
profile a real lamp is, lit by a small environment map painted onto a
canvas at runtime so the brass has something to reflect without shipping
an HDRI.

Design tokens — colour, type scale, spacing, motion, z-index — live at
the top of [`src/index.css`](src/index.css). The palette is Ghibli
pastoral (sky blue, cream paper, forest green) crossed with a South
Indian wedding (kanjeevaram purple, temple gold, marigold).

## Deploying

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds and
publishes to GitHub Pages on every push to `main` — `npm ci`, `tsc -b`,
`vite build`, then the `dist/` output is uploaded and deployed. A type
error fails the run and leaves the live site on the previous version
rather than publishing a broken one.

Three one-time steps:

1. Push the repo to GitHub, on a branch named `main`.
2. **Settings → Pages → Source: GitHub Actions.** Without this the build
   succeeds and the deploy step fails.
3. **DNS:** a `CNAME` record for `marriage` → `<user>.github.io`, then
   **Settings → Pages → Custom domain:** `marriage.automatebrains.com`,
   and tick **Enforce HTTPS** once the check passes.

The domain lives in [`public/CNAME`](public/CNAME); delete that file to
serve from the `github.io` URL instead. Pages issues and renews the
certificate itself.

For a project site served from `https://<user>.github.io/<repo>/`, add a
repository variable `VITE_BASE` = `/<repo>/` (Settings → Secrets and
variables → Actions → Variables). Every asset path is resolved against
it, photographs included — see [`src/lib/asset.ts`](src/lib/asset.ts).

Pages needs a paid plan if the repository is private; public repos are
fine on the free tier.

## Wiring up the RSVP

The form validates and shows a success state out of the box, but does
not send anywhere. Set `rsvp.endpoint` in `src/data/wedding.ts` to any
URL that accepts a JSON `POST` — Formspree, Getform, a Google Apps
Script, your own API — and it will submit there, with error and retry
handling already in place.

## Motion and accessibility

- `prefers-reduced-motion` is honoured throughout: petals and clouds
  freeze, parallax and card tilt are skipped, ornaments stop swaying, the
  lamp settles on a single still frame, and gallery autoplay stops —
  including when the setting is changed mid-visit.
- The lamp canvas renders only while it is on screen, and releases its
  geometry and textures when the section unmounts.
- The gallery has visible pause/play, prev/next buttons and arrow-key
  support; it stops on hover and on focus, and dragging is never the
  only way to reach a slide.
- The RSVP form validates on blur, puts each error beside its field,
  and on a failed submit renders a focusable summary linking to every
  invalid field.
- Skip link, visible focus rings, 44px+ touch targets, labelled icon
  buttons, and text contrast at 4.5:1 or better.

## Stack

React 19 · TypeScript · Vite 8 · framer-motion · three.js /
react-three-fiber · Phosphor Icons

three.js is lazy-loaded as a separate chunk shared by both scenes, so the
text, countdown and navigation are interactive well before WebGL finishes
loading, and the second scene costs no extra download.
