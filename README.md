# Rashank R — Portfolio

Static site. No build step, no framework, no JS libraries. Open `index.html` through any
static server and it runs.

```bash
cd /Users/radhevr/Project/Rashank_Portfolio && python3 -m http.server 4321
```

## Structure

```
index.html                     Home — hero, about + toolkit, work, experience, teams, numbers, process, contact
about/index.html               About — story, principles, resume
work/bmw-dubai/index.html      Case study 01
work/cipla-breathfree/         Case study 02
work/fujifilm-instax/          Case study 03
assets/css/main.css            Design tokens + every component (one file, numbered sections)
assets/js/main.js              All interactions (one file, numbered sections)
assets/img/                    Images at 800w and 1600w; portrait at 480w and 900w
favicon.svg  robots.txt  sitemap.xml
```

## Deploying

Live at **https://rashank.vercel.app/** — Vercel, auto-deploying from `main` on
`Rashank1995/Rashank_Portfolio`. Push to `main` and it redeploys; there is no build step.

Internal paths are **relative, not root-absolute** — `assets/…` from the home page,
`../assets/…` from `/about/`, `../../assets/…` from a case study. Vercel serves from a
domain root, so absolute paths would also work there, but relative keeps the site portable:
it runs unchanged from a subdirectory (a GitHub Pages project site, a staging folder) with
no rework. If you add or move a page, keep its paths relative to its own depth.

Moving to a custom domain later means changing only the canonical/OG URLs — search
`rashank.vercel.app` across the pages plus `sitemap.xml` and `robots.txt`.

`.nojekyll` is present in case the site is ever served from GitHub Pages instead.

## Design

The layout and look follow a reference personal-portfolio theme (Aleric): white and
near-black sections in turn, one lime accent, very large uppercase display type, pill-shaped
buttons and tags, numbers in outlined circles, and a giant "Let's work together" sign-off
above the footer. Everything is written from scratch for this site — no theme code, images
or text were copied.

- **Type** — **Host Grotesk** for everything, from Google Fonts, kept deliberately light: headings
  and titles at 500, everything else (body, buttons, tags, labels) at 400. Nothing on the site
  is heavier than 500, so the font link requests only `wght@400..500`. If you ever want a
  heavier weight, widen that range in each page `<head>` too.
- **Type scale** — every font size is one of twelve steps: **14, 16, 18, 24, 28, 32, 40, 48,
  56, 64, 72, 80 px** (`--t14` … `--t80` in `main.css` §1, written in rem). Components never
  use a raw size: they use a role (`--fs-display`, `--fs-h2`, `--fs-title`, `--fs-lg` …) or a
  fixed step. Each role steps down at ≤1023px and ≤599px — e.g. the display size is 80 on
  desktop, 64 on tablet, 48 on phones — so text stays on the scale at every width. To resize
  something, move its role to another step; don't add a new size.
- **Spacing scale** — every margin, padding and gap is one of fourteen steps: **4, 8, 12, 16,
  24, 32, 40, 48, 56, 64, 72, 80, 88, 94 px** (`--s4` … `--s94` in `main.css` §1). Spacing that
  changes with screen size uses tokens named `--sp-DESKTOP-TABLET-PHONE` — e.g.
  `--sp-94-80-80` (section padding) is 94px on desktop, 80px at ≤1023px and 80px at ≤599px —
  so it is always on the scale. To change a gap, point it at another step; don't add a new
  value. Left outside the scale on purpose: `auto` margins (centring, pushing items apart),
  the stat circles' inner padding (a % of the circle so the text always fits), the team
  slider's centring padding, and decorative-shape offsets.
- **Descriptions** — every subtitle, intro and paragraph is **18px** on desktop and tablet
  (`--fs-lg`, also `--fs-lead`) and **16px** on phones; list items, rows and step text are 16px.
- **Colour** — `--ink #0e0f11` on white, white on `--black #030303`, one accent
  `--lime #c4ee18`. Lime is only ever a fill (with black text on it) or text on black — never
  text on white, where it would be unreadable.
- **Dark sections** — any block with the `.dark` class flips the contextual tokens
  (`--fg`, `--fg-2`, `--line`, `--card`, `--tag`, `--focus`), so every component inside it
  adapts without a dark variant of its own. See `main.css` §3.
- **Logo** — Rashank's own R mark, kept as supplied in `assets/img/logo.svg`. Its path is
  inlined (`fill="currentColor"`) in the header, menu and footer of every page and coloured by
  context — `--black` on white, `--lime` inside `.dark` (`.brand__mark` in `main.css` §6) — so it
  never disappears on the black sections. `favicon.svg` is the same path, black on light browser
  tabs and lime on dark ones. To change the logo, replace `assets/img/logo.svg` and re-inline its
  path in the five pages and the favicon.
- **No theme toggle.** The site is a single, fixed palette — the black/white alternation *is*
  the design. The old light/dark toggle and its `rr:theme` storage key are gone.

### Home, section by section

| Section | What it holds |
| --- | --- |
| Hero (white) | “I’m Rashank R, Senior UI/UX Designer.” with an image pill that cycles through the three project covers, subtitle, social circles, resume pill, portrait with lime/black shapes. On desktop (≥901px) the whole hero fits the first screen under the header — height `clamp(560px, 100svh − header, 880px)`, portrait stretching to fill it |
| About (dark) | Centred statement that lights up word by word on scroll, two paragraphs, skills, three toolkit cards |
| Industries band (lime) | Scrolling list of domains |
| Work (white) | Sticky “WORK” title on the left, three case-study cards on the right, five further engagements below |
| Experience (dark) | Seven role cards that stack over each other as you scroll (wide, tall screens only) |
| Working across teams (white) | A centred slider of the five groups — swipe/scroll works on its own; the arrows and counter are an enhancement |
| Numbers (white) | Four real figures in circles; they count up once when they come into view |
| Process (dark, grid) | The eight phases, with tools per phase |
| Skills band (white) | Scrolling list of skills |
| Contact + footer (dark) | “Let’s work together”, contact pills, quick links |

The reference also has testimonials, a blog and skill-percentage bars. They are **left out on
purpose** — there is no real content for them, and nothing on this site is invented. Add them
when real material exists.

## Where the content came from

Every fact, figure, project, date and link is taken from **https://rashank.framer.website/**
(about, portfolio, the three case studies and contact pages). Nothing was invented.
Sentences were rewritten for clarity; facts were not changed.

Fujifilm Instax has no documented quantitative outcome, so its Outcome section says so
explicitly rather than showing numbers.

## Things you'll want to edit

| What | Where |
| --- | --- |
| Availability line | Search `Available for selected opportunities` — menu and contact section on every page |
| Resume link | Search `drive.google.com/file/d/148x5` |
| Case-study PDF links | In each `work/*/index.html`, search `Explore the full story` |
| Contact details | Search `rrashank@yahoo.com` / `8129434432` |
| Canonical + OG URLs | Search `rashank.vercel.app` (also in `sitemap.xml` and `robots.txt`) |
| Accent colour | `--lime` in `assets/css/main.css` §1 |
| Palette | `assets/css/main.css` §1 (light) and §3 (`.dark`) |
| Typeface | `--sans` in `assets/css/main.css` §1, plus the Google Fonts `<link>` in each page `<head>` |
| Local time / timezone | `Asia/Kolkata` in `assets/js/main.js` §8 |

Copyright year and the local clock update themselves.

The header, menu, contact block and footer are repeated in every page (there is no build
step to share them). When you change one, change all five — search for the text you edited.

## Interaction notes

Line-by-line headline reveals, fade-up reveals, image reveals, counters, the word-by-word
statement, the role-card stack, the teams slider, scrolling bands, a full-screen menu and a
floating back-to-top button.

- Reveals are driven by `getBoundingClientRect` on a shared scroll tick rather than
  `IntersectionObserver`, and the hidden-until-revealed CSS is gated behind `html.js` and
  `prefers-reduced-motion: no-preference`. Content that is invisible by default must never
  depend on an observer firing or on JS running at all.
- The role cards only stack at `min-width:1024px` **and** `min-height:760px`; a card taller
  than the viewport would otherwise have its end covered by the next one. While stacking,
  the script gives every card the tallest card's height so none peeks out from underneath.
- The menu makes the rest of the page `inert` while open, moves focus to its close button,
  closes on Escape, and returns focus to the menu button.

## Accessibility

- Every text/background pair meets WCAG AA: `--ink-2 #5a5a5e` is 7:1 on white; `--fg-2
  #9d9da3` is 7.6:1 on black; black on lime is ~15:1.
- Semantic landmarks, one `h1` per page, no skipped heading levels, skip link, visible focus
  rings (dark on white, lime on black), real `<button>`/`<a>` elements.
- Counters keep the real figure in a visually hidden copy, so screen readers never hear the
  count-up.
- `prefers-reduced-motion: reduce` turns off every reveal, the marquees, the counters, the
  statement effect and smooth scrolling, and shows all content immediately.
- Works with JavaScript disabled (the menu needs JS; the footer's quick links cover
  navigation without it).

## Performance

One font family from Google Fonts, one stylesheet, one deferred script, no libraries.
Images below the fold are lazy-loaded with `srcset`/`sizes` and explicit dimensions.

If you want the last few points of Lighthouse: convert `assets/img/*.jpg` to WebP or AVIF
and self-host Host Grotesk instead of calling Google Fonts.
