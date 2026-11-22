# Integrated Platforms × endcap.design

This is a version of the Integrated Platforms website built in the style of **endcap.design**. It uses Endcap's editorial grid, type pairing, lime accent and motion, but every word and image is Integrated Platforms' own. The code is new; nothing was copied from Endcap.

**Live preview:** https://rodgutierrezbasualto.github.io/integrated-platforms-endcap/
It is hosted on GitHub Pages from `main` in `RodGutierrezBasualto/integrated-platforms-endcap`, a public repo. The pages carry a `noindex` tag, so search engines won't list this copy next to the real site. To update it, push to `main` and Pages rebuilds in about a minute.

```bash
cd ~/Desktop/Website/integrated-platforms
python3 -m http.server 8820        # → http://localhost:8820
```
All paths are relative, so the site works at a domain root, in a subfolder (as on GitHub Pages) or with `http.server`. `tools/preview.html?w=390&h=844` shows the site at phone size, or at any other size, inside a normal window.

## Pages
- `index.html` is the homepage. Its sections, in order:
  - hero
  - featured project
  - animated Sydney line drawing
  - selected work
  - "In our *words.*"
  - statement and photos
  - services
  - who we work with
  - how we work
  - "Meet *Rodrigo.*"
  - field notes
  - world map
  - FAQ
  - leadership questions
  - "Let's *talk.*"
  - footer
- `contact/index.html` is the enquiry form. It checks the fields in the browser and **sends nothing**, because this is a prototype.
- Links to case studies, service pages and field notes open the **live** integratedplatforms.com.au pages in a new tab.

## Where the content came from
- The live site, and its source in `~/Documents/Australian Migration Practice Technology Report/`:
  - `functions/knowledge.md`
  - `public/*.html`
  - the work screenshots and the workshop photos
- I followed the site's current positioning (six services, "Build AI Teams Trust"), not the older `copy-plan.md`.
- Endcap's testimonial and statistics sections were swapped for things that are true:
  - Your own field-note words ("In our *words.*").
  - The four field notes, as "1 task / 3 steps / 4 parts / TRACE".
  - The published facts only: 14+ years and 4 markets.
  - No invented quotes or numbers.
- **Casen is not included.** `copy-plan.md` suggested adding it, but the live site doesn't show it. Add it as a fifth work card if you want it.

## How the endcap feel is made
| Effect | Where |
|---|---|
| Heavy uppercase word plus Fraunces italic word ("SELECTED *work.*") | `.title` / `.title em` in `css/site.css` |
| Hero: each line rises out of a mask, then the full stop drops in with a spring | `.mo-word`, `.mo-dot` (CSS only) |
| Scroll reveals: rise and un-blur, with siblings staggered 90 ms apart | `data-reveal` + `js/motion.js` |
| Image wipes: a clip-path opens upward while the photo settles from 118% | `data-reveal="wipe"` |
| Sydney drawing: every line draws itself (`pathLength="1"` + `stroke-dashoffset`). The BUILD tower fills with lime, the crane's "AI" sign swings, a ferry crosses the harbour, the sun turns and the clouds drift. | `.strip` in `index.html` and `css/site.css` |
| Statement words light up one by one as you scroll | `data-split-words` |
| Map: Natural Earth land turned into a dot grid, with a ripple from Sydney, arcs to Canada, the US and Chile, and comets travelling along them | `tools/make_map.py` → `js/map-data.js`, drawn by `initMap()` |
| Giant footer word: letters rise in, tilt as the pointer passes, and the IP diamond hops | `.signoff` |
| "View" bubble that follows the pointer over project images | `.cursor` |
| Magnetic "Let's talk" button, and a header that hides on scroll down and returns on scroll up | `js/motion.js`, `js/site.js` |
| Page change between home and contact: a cross-document View Transition | `@view-transition` in CSS |

## Personalising
- **Colours:** the palette matches integratedplatforms.com.au:

  | Token | Value | Used for |
  |---|---|---|
  | `--paper` | `#f2f5fa` | Page |
  | `--surface` | `#fff` | Alternating sections and card hovers |
  | `--ink` | `#1a1a1c` | Text |
  | `--night` | `#0d0d12` | Dark sections and buttons |
  | `--line` | `#d7dde5` | Lines |
  | `--acid` | `#bfee67` | IP lime. With `--acid-soft` `#daff95` it makes the hero, call to action and contact gradient |
  | `--accent` | `#864ffe` | IP purple: service labels, the founder underline, the logo diamond and the footer mark |

  Change them at the top of `css/site.css`. The map reads the same tokens.
- **Fonts:** Hanken Grotesk and Fraunces (both OFL) are in `assets/fonts/`.
- **Map markets:** edit the `markets` array in `js/motion.js`, using longitude and latitude. The visible area is set at the top of `tools/make_map.py`. To regenerate the dots:
  ```bash
  curl -o land-110m.json https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-110m.json
  python3 tools/make_map.py land-110m.json
  ```
- **Skyline labels:** the six towers carry the six services (01 ASSESS … 06 LEAD). They are plain `<text>` inside the SVG.

## Rights
- Design inspiration: endcap.design. Only the layout and motion ideas are borrowed; no code or assets.
- Content, photos and screenshots: Integrated Platforms.
- Fonts: SIL OFL.
- Map: Natural Earth, public domain.
