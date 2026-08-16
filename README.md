# Wedding site

A South Indian wedding invitation site — Ghibli-styled illustration, a
WebGL hero, and scroll-driven motion throughout.

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

## Sections

| Section | What it does |
|---|---|
| Hero | WebGL valley, gopuram, drifting clouds and petals; camera scrubs on scroll. Countdown to the muhurtham. |
| Our Story | Alternating timeline; illustrated vignette per chapter, parallaxed against the copy. |
| The Couple | Portrait cards that tilt in 3D toward the pointer, a turning marigold garland, and a WebGL brass lamp with five lit wicks. |
| Celebrations | The five ceremonies, each with date, time, venue and dress code. |
| Moments | Photographs on a rotating 3D ring, with prev/next, pause and arrow-key control. |
| Travel & Stay | Venue, directions, where to stay. |
| RSVP | Validated form with an error summary and focus management. |

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

Two routes are set up. Pick one — running both means two places serving
the same domain.

### GitHub Pages (no server to run)

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds and
publishes on every push to `main`. Once:

1. Push the repo to GitHub.
2. **Settings → Pages → Source: GitHub Actions.**
3. Point DNS at GitHub — a `CNAME` record for `marriage` →
   `<user>.github.io`.
4. **Settings → Pages → Custom domain:** `marriage.automatebrains.com`,
   then tick **Enforce HTTPS** once the check passes.

The domain lives in [`public/CNAME`](public/CNAME); delete that file to
serve from the `github.io` URL instead. Pages issues and renews its own
certificate, so nothing else is needed for HTTPS.

For a project site served from `https://<user>.github.io/<repo>/`, add a
repository variable `VITE_BASE` = `/<repo>/` (Settings → Secrets and
variables → Actions → Variables). Every asset path is resolved against
it, photographs included.

### Docker, on your own server

[`Dockerfile`](Dockerfile) builds the site and serves it from nginx;
[`docker-compose.yml`](docker-compose.yml) adds certbot, which gets a
Let's Encrypt certificate for the domain and renews it. On the server,
with the DNS A record already pointing at it and ports 80 and 443 open:

```bash
docker compose build
CERTBOT_EMAIL=you@example.com ./scripts/init-letsencrypt.sh
docker compose up -d
```

The init script exists because of a deadlock: nginx will not start
without a certificate, and certbot cannot get one until nginx is
answering on port 80. It issues a throwaway self-signed certificate,
starts nginx, swaps in the real one and reloads. Run it once. After that,
certbot re-checks twice a day and nginx reloads twice a day to pick up
anything renewed. Set `STAGING=1` for a dry run against Let's Encrypt's
staging environment — its rate limits are far more forgiving than the
five-failures-an-hour of the real one.

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
