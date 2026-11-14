# GM Modulars — website

A fast, multi-page website built to the GM Modulars Brand Guidelines 2.0.
No framework or server needed: it builds to plain HTML, CSS and JS that can be hosted anywhere.

## Quick start

```bash
node build.mjs          # builds src/ → docs/   (Node 18+, no npm install needed)
npx serve docs          # or any static server, then open http://localhost:3000
```

**GitHub Pages:** Settings → Pages → Deploy from a branch → `main` / `/docs`. Commit after running the build and the site updates.

Other hosts: upload the contents of `docs/` (Netlify, Vercel, Cloudflare Pages, or cPanel `public_html`).

## Before going live — checklist

1. **Domain** — set `company.siteUrl` in `src/data/site.json` (used for SEO, canonical links, sitemap).
2. **Real photographs** — replace the illustrative images in `src/assets/img/` (keep the names, or add new ones).
   Export each at 1600 px and 800 px wide as `.webp`: `name-1600.webp`, `name-800.webp`.
   Then set `showPlaceholderLabels: false` in `src/assets/js/config.js`.
3. **Real projects** — edit `projects` in `src/data/site.json`: title, category, location, year, scope,
   cover image and gallery. Set `"placeholder": false`. Fill in the brief / approach / result text in
   `projectPage()` in `build.mjs` (or move it into the JSON — see CMS notes).
4. **Enquiry form** — by default the form validates and opens WhatsApp with the enquiry pre-filled.
   To receive enquiries by email instead, create a free form endpoint (Formspree, Web3Forms, Basin…) and
   paste its URL into `formEndpoint` in `src/assets/js/config.js`.
5. **Check the copy** — service wording ("fitted on site by our own team", capability lists) should be
   confirmed by GM Modulars.

## Where things live

| What | File |
|---|---|
| Company details, services, projects, finishes | `src/data/site.json` |
| Service page copy | `src/data/services-copy.json` |
| Page templates | `src/pages/*.html` (service pages are generated from data) |
| Shared header, footer, cards, finish explorer, case-study template | `build.mjs` |
| Design tokens + all styles | `src/assets/css/site.css` (top of file) |
| Interactions & motion | `src/assets/js/site.js` |
| Settings (form endpoint, WhatsApp, placeholder labels) | `src/assets/js/config.js` |

## Design system (from Brand Guidelines 2.0)

- **Type**: Newsreader Medium (display), Geist Medium (text), Geist Mono Medium (labels). Self-hosted, nothing below 500.
- **Colour**: Ivory #F4F0E9, Travertine #E8E1D5, Stone #C9C1B6, Walnut #624B3C, Charcoal #171717, Graphite #262320, Bronze #A58869 (+ Bronze Light #C8AE8C / Deep #7A5F44 for text).
- **Spacing**: 8 × Fibonacci — 8, 16, 24, 40, 64, 104, 168 px.
- **Devices**: the Corner (G radius on the top-left of images), the Joint (45° chamfer on buttons), the Edge (bronze band marking active states), the Dimension.

## Motion system

| Token | Value | Use |
|---|---|---|
| `--settle` | cubic-bezier(.16,1,.3,1) | entrances, reveals |
| `--glide` | cubic-bezier(.65,0,.35,1) | transitions, wipes, panels |
| `--d-quick` / `--d-base` / `--d-reveal` / `--d-scene` | 200 / 400 / 800 / 1400 ms | hover / UI / reveals / scenes |

Signature transitions:
1. **Opening** (home, once per session, ≤1.5 s, skippable): brushed-bronze GM wipes in, two charcoal panels part like cabinet doors.
2. **Room → frame**: scrolling contracts the full-screen interior into the framed image (G corner) — it *becomes* the services showcase. Same crop, same edges, no cut.
3. **Services**: each category swaps the frame image with a wipe and shifts the material tone of the section.
4. **Every layer**: the laminate stack (carcass, laminate, edge band, finish) separates as you scroll; the process bar fills like an edge band.
5. **Projects**: drag/scroll track → case study via cross-document View Transitions (the cover image carries over in Chrome/Edge/Safari 18+).
6. **Reveals**: headlines rise line-by-line from masks; images open with a curtain.

No scroll-jacking: the only sticky area is the home hero (one screen of normal scrolling). Everything uses `transform`/`opacity`/`clip-path` in a single `requestAnimationFrame` loop.
`prefers-reduced-motion` turns off the intro, sticky transitions and animations; all content stays available. On screens ≤900 px the
continuity effects are replaced with simple stacked layouts and inline images.

## Accessibility & SEO

Skip link, semantic landmarks, visible focus rings, focus-trapped menu and lightbox (Esc closes), keyboard-operable finish explorer
(arrow keys), blur-first form validation with clear error text, alt text on all images. Per-page titles and descriptions, Open Graph
image, canonical URLs, `LocalBusiness` structured data, `sitemap.xml` and `robots.txt`.

## CMS notes

All content is already data-driven (`src/data/*.json`). To let non-developers edit it, connect a Git-based CMS such as
Decap CMS or TinaCMS to those JSON files and run `node build.mjs` on deploy (Netlify/Vercel build command: `node build.mjs`,
publish directory: `docs`).
