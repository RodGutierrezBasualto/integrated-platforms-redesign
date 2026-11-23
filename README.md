# Integrated Platforms — website redesign

A redesign of integratedplatforms.com.au built from the brand itself: Inter Tight, the IP palette, rounded cards, the lime-chip pill buttons and the diamond mark. All content comes from the live site.

**Live preview:** https://rodgutierrezbasualto.github.io/integrated-platforms-redesign/
It is hosted on GitHub Pages from `main` in `RodGutierrezBasualto/integrated-platforms-redesign`. The pages are `noindex`, so this copy won't compete with the real site in search. To update it, push to `main`; Pages rebuilds in about a minute.

```bash
cd ~/Desktop/Website/integrated-platforms
python3 -m http.server 8820        # → http://localhost:8820
```
All paths are relative, so the site works at a domain root or in a subfolder. `tools/preview.html?w=390&h=844` shows it at phone size, or at any other size, inside a normal window.

## Pages
- `index.html`, in this order:
  - hero, with the live workflow
  - our approach
  - six services
  - our work
  - how we work, as interactive stages
  - governance (TRACE)
  - about
  - field notes
  - FAQ
  - next step
  - footer
- `contact/index.html` is the enquiry form. It checks the fields in the browser and **sends nothing**, because this is a prototype.
- Case studies, service pages and field notes link to the live site.

## The design system (`css/site.css`)
| Part | What it is |
|---|---|
| Type | Inter Tight, the brand font, in sentence case. Second phrases are softened in grey ("Six services, *one connected approach.*"). |
| Colour | The IP palette: page `#f2f5fa`, white cards, ink `#1a1a1c` / `#0d0d12`, lime `#bfee67` (gradient from `#daff95`), purple `#864ffe` for labels and accents. |
| Shape | Cards with 20px and 28px corners, pill buttons with the lime chip and pixel chevron, and dark badge pills. All are taken from the live site's components. |
| Motif | The **diamond** from the logo: bullets, stage nodes, the image reveal (pictures open out of a diamond), the page transition (the next page opens out of a diamond) and the CTA graphic. |
| Motion | `--glide` / `--pop` easing. Reveals rise 24px with a 70ms stagger, controlled by `data-anim` in `js/anim.js`. |

## Interactive pieces (`js/anim.js`)
- **Workflow** (hero): requests come in, the AI drafts, a person approves (or returns the item with notes) and the result syncs to your systems. The counters and log are generated in the browser. It's labelled as an illustration and pauses when off screen.
- **Stages** (How we work): the five stages advance on their own until someone picks one. Arrow keys work too.
- **TRACE** (governance): five tiles that open to show each vendor question from the field note.
- **Quick answers** bar: three questions answered from the FAQ, with nothing sent anywhere. It appears after the hero and steps aside at the footer.

## Personalising
- Colours, corners and easing are the tokens at the top of `css/site.css`.
- Workflow item types and systems are the `kinds` list in `js/anim.js`.
- Stage text and tags are in the `data-stage-data` list in `index.html`. The page shows it as a plain list if JavaScript is off.

## Rights
- Content, photos, screenshots and the logo belong to Integrated Platforms.
- The font is Inter Tight, under the SIL OFL licence.
- All code is original to this project.
