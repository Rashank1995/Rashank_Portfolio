# Rashank R — Portfolio

Static site. No build step, no framework, no JS libraries. Open `index.html` through any
static server and it runs.

```bash
cd /Users/radhevr/Project/rashank-portfolio && python3 -m http.server 4321
```

## Structure

```
index.html                     Home — hero, intro, work, experience, process, toolkit, contact
about/index.html               About — story, principles
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
`rashank.vercel.app`, 26 references across the pages plus `sitemap.xml` and `robots.txt`.

`.nojekyll` is present in case the site is ever served from GitHub Pages instead.

## Where the content came from

Every fact, figure, project, date and link is taken from **https://rashank.framer.website/**
(about, portfolio, the three case studies and contact pages). Nothing was invented.
Sentences were rewritten for clarity; facts were not changed.

Two places where the source was thin, both marked visibly on the page so they can't ship
by accident:

- **Design-system sections** on the BMW and Cipla case studies — the portfolio publishes no
  component/typography/colour boards for these, so each carries a tinted
  “Placeholder — ready for your assets” block.
- **Reflection (section 08)** on all three case studies — not present in the source at all.
  Same tinted block, with prompts to write against.

Fujifilm Instax has no documented quantitative outcome, so the Impact section says so
explicitly rather than showing numbers.

> The live Framer site's about page opens with a paragraph about "Stream AI" post-production
> workflows on the **Fujifilm Instax** case study — unrelated to Instax and almost certainly
> leftover template text. It was not carried over.

## Two things worth your decision

1. **Years of experience.** Your brief says *5+ years*; your live site says *7 years*, and the
   timeline (Feb 2020 → present) works out to ~6.5. The site uses **5+** as you specified.
   It appears in exactly three places — search `5+` in `index.html` (hero eyebrow, stats row)
   and the meta description in each page `<head>`.
2. **Process stages.** Your brief sketched five stages; your own about page documents **eight**,
   with tools per phase. The eight real ones are used — they're stronger and they're yours.
   They live in `index.html` under `<!-- ===== How I work ===== -->`.

## Things you'll want to edit

| What | Where |
| --- | --- |
| Availability line | Search `Available for selected opportunities` — nav, contact and mobile menu on every page |
| Resume link | Search `drive.google.com/file/d/148x5` |
| Case-study PDF links | In each `work/*/index.html`, search `Explore the full story` |
| Contact details | Search `rrashank@yahoo.com` / `8129434432` |
| Canonical + OG URLs | Search `rashank1995.github.io/Rashank_Portfolio` — swap if the domain changes (also in `sitemap.xml` and `robots.txt`) |
| Accent colour | `--accent` in `assets/css/main.css` §1 for light, §1b for dark (plus `--accent-dark-surface`, the tint used on the inverted panels) |
| Theme palettes | `assets/css/main.css` §1 (light) and §1b (dark) |
| Typeface | `--sans` in `assets/css/main.css` §1, plus the Google Fonts `<link>` in each page `<head>` |
| Local time / timezone | `Asia/Kolkata` in `assets/js/main.js` §13 |

Copyright year and the local clock update themselves.

## Theme

Light and dark, with a toggle in the nav on every page (sun/moon, left of **Let's Talk**;
it stays visible on mobile next to the menu button).

How it resolves, in order:

1. An explicit choice, stored in `localStorage` under `rr:theme` — survives reloads and
   page navigation, and beats the OS setting in both directions.
2. Otherwise the OS setting, via `prefers-color-scheme` — and it keeps following the OS
   live, for as long as nobody has touched the toggle.

The stored choice is applied by a tiny inline script in `<head>`, before first paint, so
there's no white flash on a dark-mode load. The palettes are two token blocks in
`assets/css/main.css` — §1 light, §1b dark — and the dark one is written twice on purpose:
once in a `@media (prefers-color-scheme: dark)` query so the site still themes correctly
with JavaScript disabled, once on `[data-theme="dark"]` for the toggle. Keep the two in
sync when editing; there's a comment saying so.

A few details worth knowing:

- The dramatic black sections (contact, footer, case-study impact) don't become white in
  dark mode — they shift to a slightly raised near-black panel, so the inversion still
  reads as a deliberate break rather than a flashbang.
- `<meta name="theme-color">` is updated live, so mobile browser chrome matches.
- Switching cross-fades over 320ms; under `prefers-reduced-motion: reduce` it's instant.
- Project screenshots are bright; in dark mode they sit at `brightness(0.94)` and lift to
  full on hover, via `--img-dim`. Set it to `1` in §1b if you'd rather never touch them.

To go back to "follow my system", clear the key from the console:
`localStorage.removeItem('rr:theme')`.

## Type

**Host Grotesk** (variable, 300–700) for everything, with **Instrument Serif** italic used
sparingly for the emphasised word in display headlines (`.em`).

Host Grotesk sets noticeably narrower than a neutral grotesque, so the display scale is
tuned to it rather than to a generic ramp — `--fs-display` runs 2.9rem → 6.25rem, with a
separate step for the tablet band (561–860px, where the hero has stacked and the headline
gets the full column) and for phones. The hero's four headline lines are hard-coded breaks,
so those clamps are what keeps them from wrapping; the longest line sits at 82–96% of its
column across the whole range. If you change the typeface or the headline copy, re-check
that — it's the one place where type metrics and layout are coupled.

## Interaction notes

Page-load intro (once per browser session), line-by-line headline reveals, clip-path image
reveals, custom cursor with `View case` / `Open` states, magnetic CTAs, subtle parallax,
hover-to-pause marquees, sticky `01 → 08` process counter, expanding experience rows,
scroll progress bar, cross-page fade.

**Further work** is placed as a spread rather than a list: explicit grid placement drops
the five entries across three rows with deliberate gaps, two of them sitting lower than
their neighbour, and each drifts up to 14px horizontally as the page scrolls (`data-drift`,
handled by the parallax loop in `main.js` §9). Drift is off below 940px, where the gutter
is too narrow to absorb it and the layout is a single column anyway.

**Selected work** is a sequence of immersive project sections rather than a card grid.
Each sits at roughly 78–93vh on desktop, alternating composition: a browser-chromed
featured project, a layered shot with a floating cropped detail, a full-bleed band, and a
typographic panel. A fixed rail on the left tracks the active project; it is deliberately
narrow (numbers only, rotated label, names on hover) because at 1440px the container leaves
only ~72px of gutter and anything wider lands on the copy. Stacked layouts reorder to
number → image → title → description → meta → CTA.

Only three projects have published visuals. **Growth Rudder has no screenshots anywhere in
the source portfolio**, so its frame carries documented outcomes as type instead. To swap
in a real image, replace `.frame--figures` in `index.html` with the same `.frame__shot`
markup the other projects use.

**Working across teams** is five panels sharing one row: names stand vertically until a
panel is hovered or focused, then it takes ~40% of the row and its copy rises into place
while the others give way. It runs on CSS `:hover` / `:focus-within` alone — no JS — and the
first panel stays open while nothing is engaged, so the section never reads as a row of
unexplained labels. It only applies at `min-width: 1024px` **and** `hover: hover`, so touch
devices get a plain stacked list with every panel already open rather than depending on a
hover state they can't produce. Easing is `cubic-bezier(0.22, 1, 0.36, 1)` throughout.

Reveals are driven by `getBoundingClientRect` on a shared scroll tick rather than
`IntersectionObserver`, and the hidden-until-revealed CSS is gated behind `html.js`. Both
deliberate: content that is invisible by default must never depend on an observer firing or
on JS running at all.

## Accessibility

- Every text/background pair meets WCAG AA (`--ink-3` and `--accent` were darkened from the
  first draft to clear 4.5:1; the black sections use a lighter accent tint for the same reason).
- Semantic landmarks, one `h1` per page, no skipped heading levels, skip link, visible focus
  rings, real `<button>`/`<a>` elements, `aria-expanded` on the accordion and menu.
- `prefers-reduced-motion: reduce` disables the intro, every transition, the marquees, the
  custom cursor, parallax and the theme cross-fade, and forces all content visible.
- Both themes were contrast-checked; every text/background pair clears AA in light and dark.
- The theme toggle is a real `<button>` whose accessible name states the action it performs
  ("Switch to dark theme") and updates after each press.
- The collaboration panels carry `tabindex="0"` so keyboard users can open them, since
  there is no link or action to hang a real control on. All five bodies stay in the
  accessibility tree at every width (hidden with `opacity`, never `display:none`), so
  screen readers get the full text whether a panel is open or not.
- Works with JavaScript disabled.

## Performance

Two font families from Google Fonts, one stylesheet, one deferred script, no libraries.
All images are lazy-loaded below the fold with `srcset`/`sizes` and explicit dimensions;
total image weight is ~2.9 MB across 20 files.

If you want the last few points of Lighthouse: convert `assets/img/*.jpg` to WebP or AVIF
(this machine had no `cwebp`/ImageMagick/Pillow, so they're JPEG at quality 78) and
self-host Host Grotesk + Instrument Serif instead of calling Google Fonts.
